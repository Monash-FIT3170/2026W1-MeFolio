import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { WebApp } from "meteor/webapp";
import { Accounts } from "meteor/accounts-base";
import { ProjectCollection } from "/imports/api/projects";
import {
  PortfolioCollection,
  createDefaultPortfolioPublishingState,
} from "/imports/api/portfolio";
import {
  DEFAULT_CHATBOT_PERSONA,
  isChatbotPersona,
} from "/imports/api/chatbotPersonas";
import { PortfolioProjectsCollection } from "/imports/api/portfolioProjects";
import {
  buildNarrationText,
  isPortfolioNarrationEnabled,
} from "/imports/api/projectNarration";
import "/imports/api/files/resumeFiles";

// oauth login
import "./oauth-login/oauth.js";
import "./projectClickTracking.js";

// register AI Twin methods
import "./ai/chatMethods.js";
import "./ai/aiTwinMethods.js";

// recruiter access token
import "./recruiter-tokens/collection.js";
import "./recruiter-tokens/methods.js";
import "./recruiter-tokens/verifytokens.js";
import "./recruiter-tokens/visit-notifications.js";

// public portfolio view
import "./publications/publicPortfolio.js";
import "./publications/publicPortfolioMeta.js";
// portfolio methods (in their own module so tests can load them without the
// app startup and OAuth config)
import "./portfolio-methods.js";
// portfolio indexes (unique custom URL / username)
import "./portfolio-indexes.js";

// register github methods for sync
import "./github-methods.js";
import "./project-narration.js";
// register AI Twin methods
import "./ai/chatMethods.js";
import "./credly-methods.js";
import { validateChallenge } from "./challenge-methods.js";

// cache middleware
import {
  shouldCachePortfolioView,
  applyCacheHeaders,
} from "./cache-middleware.js";
// certifications
import {
  normalizeCertification,
  normalizeCertifications,
} from "/imports/api/certifications";

Accounts.config({
  loginExpirationInDays: 1,
});

/* global process */
// BUG-01: real password-reset email delivery.
// Meteor sends mail through its built-in SMTP transport when MAIL_URL is set;
// with no MAIL_URL it only logs the email, which is why resets previously did
// nothing. Keep the real MAIL_URL out of VCS (an env var in staging, or private
// settings locally) — only a placeholder lives in oauth.settings.example.json.
if (!process.env.MAIL_URL && Meteor.settings.private?.MAIL_URL) {
  process.env.MAIL_URL = Meteor.settings.private.MAIL_URL;
}

Accounts.emailTemplates.siteName = "MeFolio";
// The sender must match the provider's authenticated/verified address or real
// mail will be rejected or spam-filtered, so read it from settings and fall
// back to a generic address only when none is configured.
Accounts.emailTemplates.from =
  Meteor.settings.private?.MAIL_FROM || "MeFolio <no-reply@mefolio.app>";

// Point the reset link at our in-app react-router route (not Meteor's default
// hash URL) so /reset-password/:token renders the ResetPasswordPage.
Accounts.urls.resetPassword = (token) =>
  Meteor.absoluteUrl(`reset-password/${token}`);

Accounts.emailTemplates.resetPassword = {
  subject: () => "Reset your MeFolio password",
  text: (user, url) =>
    "Hello,\n\n" +
    "We received a request to reset your MeFolio password. Click the link " +
    `below to choose a new one:\n\n${url}\n\n` +
    "If you didn't request this, you can safely ignore this email.\n\n— MeFolio",
};

// Maintain existing portfolios without creating accounts or sample content.
export async function initializePortfolioData() {
  // FEAT-11: Backfill publication fields for portfolios created before
  // draft/live separation was introduced.
  await PortfolioCollection.updateAsync(
    { isPublished: { $exists: false } },
    {
      $set: {
        isPublished: false,
      },
    },
    { multi: true },
  );

  await PortfolioCollection.updateAsync(
    { publishedContent: { $exists: false } },
    {
      $set: {
        publishedContent: null,
      },
    },
    { multi: true },
  );

  const portfolios = await PortfolioCollection.find().fetchAsync();
  for (const portfolio of portfolios) {
    if (
      portfolio.isPublished &&
      !Object.hasOwn(portfolio, "publishedAiTwinConfiguration")
    ) {
      await PortfolioCollection.updateAsync(portfolio._id, {
        $set: {
          publishedAiTwinConfiguration: {
            documents: Array.isArray(portfolio.aiTwinConfiguration?.documents)
              ? portfolio.aiTwinConfiguration.documents
              : [],
          },
        },
      });
    }

    const existingOrderCount = await PortfolioProjectsCollection.find({
      portfolioId: portfolio._id,
    }).countAsync();
    if (existingOrderCount > 0) continue;

    const savedProjectIds = Array.isArray(portfolio.projects)
      ? portfolio.projects
      : [];

    await Promise.all(
      savedProjectIds.map((projectId, index) =>
        PortfolioProjectsCollection.insertAsync({
          portfolioId: portfolio._id,
          projectId,
          orderIndex: index,
          createdAt: new Date(),
        }),
      ),
    );
  }

  // BUG-02: Flush lingering visitor presence state from prior container
  // sessions or abrupt restarts. When the server boots, no active client connections exist.
  await PortfolioCollection.updateAsync(
    { viewers: { $exists: true, $not: { $size: 0 } } },
    { $set: { viewers: [] } },
    { multi: true },
  );
}

Meteor.startup(async () => {
  await initializePortfolioData();

  // Periodically sweep visitors who missed heartbeats (e.g. abrupt disconnects, sleep, crashes)
  // Heartbeats occur every 10s from PublicPortfolioPage; expire after 30s of inactivity.
  Meteor.setInterval(async () => {
    try {
      const expirationThreshold = new Date(Date.now() - 30 * 1000);
      await PortfolioCollection.updateAsync(
        { "viewers.lastSeenAt": { $lt: expirationThreshold } },
        {
          $pull: {
            viewers: { lastSeenAt: { $lt: expirationThreshold } },
          },
        },
        { multi: true },
      );
    } catch (err) {
      console.error("Failed to prune stale live visitors:", err);
    }
  }, 15 * 1000);

  // FEAT-28: Performance Hardening -- Cache Headers
  if (Meteor.isProduction) {
    WebApp.rawConnectHandlers.use((req, res, next) => {
      if (shouldCachePortfolioView(req)) {
        applyCacheHeaders(res);
      }
      next();
    });
  }
});

Meteor.publish("projects.all", async function () {
  if (!this.userId) return this.ready();

  const portfolios = await PortfolioCollection.find(
    { userId: this.userId },
    { fields: { projects: 1 } },
  ).fetchAsync();

  const projectIds = [
    ...new Set(
      portfolios.flatMap((portfolio) =>
        Array.isArray(portfolio.projects) ? portfolio.projects : [],
      ),
    ),
  ];

  if (!projectIds.length) return this.ready();

  return ProjectCollection.find(
    { _id: { $in: projectIds } },
    { sort: { createdAt: -1 } },
  );
});

// Private portfolio fields withheld from clients that do not own the portfolio.
// Recruiters receive authorized details through the token-gated
// `portfolio.recruiterView` publication instead.
const NON_OWNER_PORTFOLIO_FIELDS = {
  recruiterInfo: 0,
  publishedNarrations: 0,
  aiTwinConfiguration: 0,
  publishedAiTwinConfiguration: 0,
};
const activeViewerConnections = new Map();

const getViewerData = async (publication) => {
  const connectionId = publication.connection?.id;
  if (!connectionId) return null;

  const user = publication.userId
    ? await Meteor.users.findOneAsync(publication.userId, {
        fields: {
          emails: 1,
          profile: 1,
          "services.google.email": 1,
          "services.google.name": 1,
          "services.github.email": 1,
          "services.github.username": 1,
        },
      })
    : null;

  const email =
    user?.emails?.[0]?.address ||
    user?.services?.google?.email ||
    user?.services?.github?.email ||
    "";
  const name =
    user?.profile?.name ||
    user?.profile?.username ||
    user?.services?.google?.name ||
    user?.services?.github?.username ||
    "Anonymous Viewer";

  const viewer = {
    connectionId,
    name,
    email,
    connectedAt: new Date(),
    lastSeenAt: new Date(),
    location: null,
  };

  if (publication.userId) {
    viewer.userId = publication.userId;
  }

  return viewer;
};

const addPortfolioViewer = async (portfolioId, viewer) => {
  if (!viewer) return;

  activeViewerConnections.set(viewer.connectionId, {
    portfolioId,
    viewer,
  });

  // Pull existing session by connectionId, or by userId if logged in, to prevent duplicates
  const pullFilter = viewer.userId
    ? {
        $or: [{ connectionId: viewer.connectionId }, { userId: viewer.userId }],
      }
    : { connectionId: viewer.connectionId };

  await PortfolioCollection.updateAsync(portfolioId, {
    $pull: { viewers: pullFilter },
  });

  await PortfolioCollection.updateAsync(portfolioId, {
    $addToSet: { viewers: viewer },
  });
};

const removePortfolioViewer = async (connectionId) => {
  const entry = activeViewerConnections.get(connectionId);
  if (!entry) return;

  await PortfolioCollection.updateAsync(entry.portfolioId, {
    $pull: { viewers: { connectionId } },
  });

  activeViewerConnections.delete(connectionId);
};

Meteor.publish("portfolios.all", function () {
  const sort = { createdAt: -1 };

  // Not logged in: nobody owns these, so strip private fields from all.
  if (!this.userId) {
    return PortfolioCollection.find(
      {},
      { sort, fields: { ...NON_OWNER_PORTFOLIO_FIELDS, viewers: 0 } },
    );
  }

  // Logged in: only your own portfolios. Nothing on the dashboard needs other
  // users' portfolios, and a publish function cannot return two cursors for the
  // same collection. The recruiter view reads its portfolio from the
  // token-gated `portfolio.recruiterView` publication instead.
  return PortfolioCollection.find(
    { userId: this.userId },
    { sort, fields: { viewers: 0 } },
  );
});

Meteor.publish("portfolios.liveVisitors", function (portfolioId) {
  check(portfolioId, String);

  if (!this.userId) return this.ready();

  return PortfolioCollection.find(
    { _id: portfolioId, userId: this.userId },
    { fields: { _id: 1, viewers: 1 } },
  );
});

Meteor.publish("portfolios.viewer", function (portfolioId) {
  check(portfolioId, String);

  const publication = this;
  const connectionId = publication.connection?.id;

  PortfolioCollection.findOneAsync({ _id: portfolioId, isPublished: true })
    .then((portfolio) => {
      if (!portfolio) return null;
      return getViewerData(publication);
    })
    .then((viewer) => {
      if (!viewer) return null;
      return addPortfolioViewer(portfolioId, viewer);
    })
    .catch(console.error);

  this.onStop(() => {
    if (connectionId) {
      removePortfolioViewer(connectionId).catch(console.error);
    }
  });

  return PortfolioCollection.find(
    { _id: portfolioId, isPublished: true },
    { fields: { publishedContent: 1, isPublished: 1, publishedAt: 1 } },
  );
});

Meteor.publish("users.current", function () {
  if (!this.userId) return this.ready();
  return Meteor.users.find(this.userId);
});

Meteor.publish("currentUser.profile", function () {
  if (!this.userId) return this.ready();

  return Meteor.users.find(
    { _id: this.userId },
    {
      fields: {
        emails: 1,
        profile: 1,
        "services.google.email": 1,
        "services.google.name": 1,
        "services.github.email": 1,
        "services.github.username": 1,
      },
    },
  );
});

Meteor.publish("portfolioProjects.all", function () {
  return PortfolioProjectsCollection.find({}, { sort: { orderIndex: 1 } });
});

Meteor.publish("portfolios.byUsername", function (username) {
  check(username, String);
  const sort = { createdAt: -1 };

  if (!this.userId) {
    return PortfolioCollection.find(
      { username },
      { sort, fields: NON_OWNER_PORTFOLIO_FIELDS },
    );
  }

  return [
    PortfolioCollection.find({ username, userId: this.userId }, { sort }),
    PortfolioCollection.find(
      { username, userId: { $ne: this.userId } },
      { sort, fields: NON_OWNER_PORTFOLIO_FIELDS },
    ),
  ];
});

Meteor.methods({
  async "users.update"(userId, updates) {
    if (this.userId !== userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You may only update your own account.",
      );
    }

    check(userId, String);
    check(updates, Object);

    const updateDoc = {};
    if (updates.profile) {
      updateDoc.profile = updates.profile;
    }

    if (Object.keys(updateDoc).length > 0) {
      await Meteor.users.updateAsync(userId, { $set: updateDoc });
    }

    if (updates.email) {
      const currentUser = await Meteor.users.findOneAsync(userId, {
        fields: { emails: 1 },
      });
      const currentEmail = currentUser?.emails?.[0]?.address;
      if (currentEmail && currentEmail !== updates.email) {
        await Meteor.users.updateAsync(userId, {
          $pull: { emails: { address: currentEmail } },
        });
        await Meteor.users.updateAsync(userId, {
          $push: { emails: { address: updates.email, verified: false } },
        });
      } else if (!currentEmail) {
        await Meteor.users.updateAsync(userId, {
          $push: { emails: { address: updates.email, verified: false } },
        });
      }
    }
  },

  async "users.updateCurrentProfile"(updates) {
    if (!this.userId) {
      throw new Meteor.Error(
        "users.updateCurrentProfile.notLoggedIn",
        "You must be logged in to update your profile.",
      );
    }

    check(updates, Object);

    const safeUpdates = {};
    if (updates?.profile?.name) {
      safeUpdates["profile.name"] = updates.profile.name;
    }
    if (updates?.email) {
      safeUpdates["emails.0.address"] = updates.email;
    }

    if (!Object.keys(safeUpdates).length) return 0;

    return await Meteor.users.updateAsync(this.userId, { $set: safeUpdates });
  },

  // Project methods
  async "projects.insert"(projectData = {}) {
    // Normalise field names (the Add Project modal historically sent
    // stack/github/demo) and guarantee a createdAt so newest-first ordering works.
    const normalized = {
      title: projectData.title ?? "",
      description: projectData.description ?? "",
      caseStudyNarrative:
        typeof projectData.caseStudyNarrative === "string"
          ? projectData.caseStudyNarrative.trim()
          : "",
      technologies: projectData.technologies ?? projectData.stack ?? [],
      githubLink: projectData.githubLink ?? projectData.github ?? "",
      liveDemoLink: projectData.liveDemoLink ?? projectData.demo ?? "",
      media: typeof projectData.media === "string" ? projectData.media : "",
      status: projectData.status ?? "live",
      githubStats: null,
      lastSyncedAt: null,
      proofOfWorkMode:
        projectData.proofOfWorkMode === "interactive"
          ? "interactive"
          : "standard",
      ...(projectData.challenge === undefined
        ? {}
        : { challenge: validateChallenge(projectData.challenge) }),
      createdAt: projectData.createdAt
        ? new Date(projectData.createdAt)
        : new Date(),
    };

    if (!this.userId) throw new Meteor.Error("not-authorized");

    const projectId = await ProjectCollection.insertAsync(normalized);

    // Use the selected portfolio when provided; otherwise find or create the
    // current user's portfolio.
    let portfolio = projectData.portfolioId
      ? await PortfolioCollection.findOneAsync(projectData.portfolioId)
      : await PortfolioCollection.findOneAsync({ userId: this.userId });

    if (!portfolio) {
      const newPortfolioId = await PortfolioCollection.insertAsync({
        userId: this.userId,
        title: "My Portfolio",
        projects: [],
        ...createDefaultPortfolioPublishingState(),
        createdAt: new Date(),
      });
      portfolio = await PortfolioCollection.findOneAsync(newPortfolioId);
    }

    if (portfolio) {
      await PortfolioCollection.updateAsync(portfolio._id, {
        $push: { projects: { $each: [projectId], $position: 0 } },
      });

      // Shift existing entries down to make room at the front
      await PortfolioProjectsCollection.updateAsync(
        { portfolioId: portfolio._id },
        { $inc: { orderIndex: 1 } },
        { multi: true },
      );

      // Insert new project at the front (orderIndex 0)
      await PortfolioProjectsCollection.insertAsync({
        portfolioId: portfolio._id,
        projectId,
        orderIndex: 0,
        createdAt: new Date(),
      });
    }

    return projectId;
  },

  async "projects.update"(projectId, updates) {
    const normalizedUpdates = { ...updates };
    const unset = {};

    if (
      Object.prototype.hasOwnProperty.call(
        normalizedUpdates,
        "caseStudyNarrative",
      )
    ) {
      normalizedUpdates.caseStudyNarrative =
        typeof normalizedUpdates.caseStudyNarrative === "string"
          ? normalizedUpdates.caseStudyNarrative.trim()
          : "";
    }

    if (
      Object.prototype.hasOwnProperty.call(
        normalizedUpdates,
        "useCustomNarration",
      )
    ) {
      normalizedUpdates.useCustomNarration =
        normalizedUpdates.useCustomNarration === true;
    }

    if (
      Object.prototype.hasOwnProperty.call(normalizedUpdates, "proofOfWorkMode")
    ) {
      normalizedUpdates.proofOfWorkMode =
        normalizedUpdates.proofOfWorkMode === "interactive"
          ? "interactive"
          : "standard";
    }

    if (Object.prototype.hasOwnProperty.call(normalizedUpdates, "challenge")) {
      if (normalizedUpdates.challenge === null) {
        delete normalizedUpdates.challenge;
        unset.challenge = "";
      } else {
        normalizedUpdates.challenge = validateChallenge(
          normalizedUpdates.challenge,
        );
      }
    }

    const update = { $set: normalizedUpdates };
    if (Object.keys(unset).length) update.$unset = unset;

    return await ProjectCollection.updateAsync(projectId, update);
  },

  async "projects.delete"(projectId) {
    await PortfolioCollection.updateAsync(
      { projects: projectId },
      { $pull: { projects: projectId } },
      { multi: true },
    );
    await PortfolioProjectsCollection.removeAsync({ projectId });
    return await ProjectCollection.removeAsync(projectId);
  },

  async "portfolios.insert"(portfolioData) {
    const safePortfolioData = { ...portfolioData };
    delete safePortfolioData.username;

    if (
      Object.hasOwn(safePortfolioData, "chatbotPersona") &&
      !isChatbotPersona(safePortfolioData.chatbotPersona)
    ) {
      throw new Meteor.Error(
        "invalid-chatbot-persona",
        "Choose one of the available chatbot personalities.",
      );
    }

    const newPortfolio = {
      ...safePortfolioData,
      chatbotPersona:
        safePortfolioData.chatbotPersona || DEFAULT_CHATBOT_PERSONA,
      ...createDefaultPortfolioPublishingState(),
      userId: this.userId,
    };

    return await PortfolioCollection.insertAsync(newPortfolio);
  },

  // Certification methods
  async "portfolios.addCertification"(portfolioId, certification) {
    check(portfolioId, String);
    check(certification, Object);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to add a certification.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync({
      _id: portfolioId,
      userId: this.userId,
    });

    if (!portfolio) {
      throw new Meteor.Error(
        "portfolios.addCertification.notFound",
        "Portfolio not found or not owned by the current user.",
      );
    }

    const normalized = normalizeCertification({
      ...certification,
      source: "manual",
      verified: false,
      lastSyncedAt: null,
    });

    if (!normalized.title.trim()) {
      throw new Meteor.Error(
        "portfolios.addCertification.invalidTitle",
        "Certification title is required.",
      );
    }

    const existing = Array.isArray(portfolio.certifications)
      ? portfolio.certifications
      : [];

    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: { certifications: [...existing, normalized] },
    });
  },

  async "portfolios.updateCertification"(portfolioId, index, certification) {
    check(portfolioId, String);
    check(index, Number);
    check(certification, Object);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to update a certification.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync({
      _id: portfolioId,
      userId: this.userId,
    });

    if (!portfolio) {
      throw new Meteor.Error(
        "portfolios.updateCertification.notFound",
        "Portfolio not found or not owned by the current user.",
      );
    }

    const existing = Array.isArray(portfolio.certifications)
      ? [...portfolio.certifications]
      : [];

    if (index < 0 || index >= existing.length) {
      throw new Meteor.Error(
        "portfolios.updateCertification.invalidIndex",
        "Certification not found.",
      );
    }

    const original = existing[index];

    // Preserve server-owned fields
    const normalized = normalizeCertification({
      ...certification,
      source: original.source,
      verified: original.verified,
      lastSyncedAt: original.lastSyncedAt,
    });

    if (!normalized.title.trim()) {
      throw new Meteor.Error(
        "portfolios.updateCertification.invalidTitle",
        "Certification title is required.",
      );
    }

    existing[index] = normalized;

    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: { certifications: existing },
    });
  },

  async "portfolios.removeCertification"(portfolioId, index) {
    check(portfolioId, String);
    check(index, Number);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to remove a certification.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync({
      _id: portfolioId,
      userId: this.userId,
    });

    if (!portfolio) {
      throw new Meteor.Error(
        "portfolios.removeCertification.notFound",
        "Portfolio not found or not owned by the current user.",
      );
    }

    const existing = Array.isArray(portfolio.certifications)
      ? [...portfolio.certifications]
      : [];

    if (index < 0 || index >= existing.length) {
      throw new Meteor.Error(
        "portfolios.removeCertification.invalidIndex",
        "Certification not found.",
      );
    }

    existing.splice(index, 1);

    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: { certifications: existing },
    });
  },

  async "portfolios.publish"(portfolioId) {
    check(portfolioId, String);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to publish a portfolio.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync({
      _id: portfolioId,
      userId: this.userId,
    });

    if (!portfolio) {
      throw new Meteor.Error(
        "portfolios.publish.notFound",
        "Portfolio not found or not owned by the current user.",
      );
    }

    const missingFields = [];
    if (!portfolio.title || !String(portfolio.title).trim()) {
      missingFields.push("title");
    }

    if (!portfolio.bio || !String(portfolio.bio).trim()) {
      missingFields.push("bio");
    }

    const profileName =
      portfolio.profile?.fullName || portfolio.profile?.name || "";
    if (!profileName.trim()) {
      missingFields.push("profile.fullName");
    }

    if (!Array.isArray(portfolio.projects) || portfolio.projects.length === 0) {
      missingFields.push("projects");
    }

    if (missingFields.length) {
      throw new Meteor.Error(
        "portfolios.publish.validationFailed",
        `Required portfolio content missing: ${missingFields.join(", ")}`,
      );
    }

    const projectIds = Array.isArray(portfolio.projects)
      ? portfolio.projects
      : [];

    const projectRecords = await ProjectCollection.find({
      _id: { $in: projectIds },
    }).fetchAsync();

    const narrationEnabled = isPortfolioNarrationEnabled(portfolio);

    const orderedProjects = projectIds
      .map((projectId) =>
        projectRecords.find((project) => project._id === projectId),
      )
      .filter(Boolean)
      .map((project) => ({
        _id: project._id,
        title: project.title || "",
        description: project.description || "",
        technologies: Array.isArray(project.technologies)
          ? project.technologies
          : [],
        githubLink: project.githubLink || "",
        liveDemoLink: project.liveDemoLink || "",
        media: project.media || "",
        status: project.status || "",
        narrationAvailable:
          narrationEnabled && Boolean(buildNarrationText(project)),
        proofOfWorkMode: project.proofOfWorkMode || "standard",
        ...(project.challenge
          ? {
              challenge: {
                title: project.challenge.title || "",
                language: project.challenge.language || "",
                hint: project.challenge.hint || "",
                starterCode: project.challenge.starterCode || "",
              },
            }
          : {}),
        githubStats: project.githubStats || null,
        lastSyncedAt: project.lastSyncedAt || null,
      }));

    if (orderedProjects.length !== projectIds.length) {
      throw new Meteor.Error(
        "portfolios.publish.projectsNotFound",
        "One or more portfolio projects could not be found. Please review your projects before publishing.",
      );
    }

    const publishedNarrations = narrationEnabled
      ? projectIds
          .map((projectId) =>
            projectRecords.find((project) => project._id === projectId),
          )
          .filter(Boolean)
          .map((project) => ({
            projectId: project._id,
            text: buildNarrationText(project),
          }))
          .filter((narration) => narration.text)
      : [];

    const publishedContent = {
      title: portfolio.title,
      bio: portfolio.bio,
      profile: portfolio.profile || {},
      about: portfolio.about || {},
      contact: portfolio.contact || {},
      socials: portfolio.socials || {},
      cta: portfolio.cta || {},
      projects: orderedProjects,
      theme: portfolio.theme || "minimal",
      badges: Array.isArray(portfolio.badges) ? portfolio.badges : [],
      narrationEnabled,
      chatbotPersona: portfolio.chatbotPersona || DEFAULT_CHATBOT_PERSONA,
      certifications: normalizeCertifications(portfolio.certifications),
    };

    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: {
        publishedContent,
        publishedNarrations,
        publishedAiTwinConfiguration: {
          documents: Array.isArray(portfolio.aiTwinConfiguration?.documents)
            ? portfolio.aiTwinConfiguration.documents
            : [],
        },
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  },

  async "portfolios.viewerHeartbeat"(portfolioId) {
    check(portfolioId, String);

    const connectionId = this.connection?.id;

    if (!connectionId) {
      return 0;
    }

    const lastSeenAt = new Date();

    const updatedCount = await PortfolioCollection.updateAsync(
      {
        _id: portfolioId,
        "viewers.connectionId": connectionId,
      },
      {
        $set: {
          "viewers.$.lastSeenAt": lastSeenAt,
        },
      },
    );

    const activeViewer = activeViewerConnections.get(connectionId);

    if (activeViewer?.portfolioId === portfolioId) {
      activeViewer.viewer.lastSeenAt = lastSeenAt;
      activeViewerConnections.set(connectionId, activeViewer);
    }

    return updatedCount;
  },

  async "portfolios.recordViewerLocation"(portfolioId, location) {
    check(portfolioId, String);
    check(location, {
      lat: Number,
      lng: Number,
      city: String,
      countryCode: String,
    });

    const connectionId = this.connection?.id;
    if (!connectionId) return 0;

    // Reject nonsensical coordinates
    if (
      location.lat < -90 ||
      location.lat > 90 ||
      location.lng < -180 ||
      location.lng > 180
    ) {
      throw new Meteor.Error(
        "portfolios.recordViewerLocation.invalidCoords",
        "Coordinates out of range.",
      );
    }

    const locationEntry = {
      lat: location.lat,
      lng: location.lng,
      city: String(location.city).slice(0, 100),
      countryCode: String(location.countryCode).slice(0, 8),
      capturedAt: new Date(),
    };

    let updatedCount = await PortfolioCollection.updateAsync(
      { _id: portfolioId, "viewers.connectionId": connectionId },
      { $set: { "viewers.$.location": locationEntry } },
    );

    if (!updatedCount) {
      const published = await PortfolioCollection.findOneAsync({
        _id: portfolioId,
        isPublished: true,
      });
      if (!published) {
        throw new Meteor.Error(
          "portfolios.recordViewerLocation.notFound",
          "Portfolio not found.",
        );
      }

      const viewer = await getViewerData(this);
      if (!viewer) return 0;
      viewer.location = locationEntry;
      await addPortfolioViewer(portfolioId, viewer);
      return 1;
    }

    const activeViewer = activeViewerConnections.get(connectionId);
    if (activeViewer?.portfolioId === portfolioId) {
      activeViewer.viewer.location = locationEntry;
      activeViewerConnections.set(connectionId, activeViewer);
    }

    return updatedCount;
  },

  async "portfolios.delete"(portfolioId) {
    return await PortfolioCollection.removeAsync(portfolioId);
  },

  async "portfolioProjects.reorder"({ portfolioId, projectIds }) {
    if (!portfolioId || !Array.isArray(projectIds)) {
      throw new Meteor.Error(
        "portfolioProjects.reorder.invalid",
        "A portfolio ID and ordered project IDs are required.",
      );
    }

    const uniqueProjectIds = [...new Set(projectIds.filter(Boolean))];

    await PortfolioCollection.updateAsync(portfolioId, {
      $set: { projects: uniqueProjectIds },
    });

    await Promise.all(
      uniqueProjectIds.map((projectId, index) =>
        PortfolioProjectsCollection.upsertAsync(
          { portfolioId, projectId },
          {
            $set: {
              portfolioId,
              projectId,
              orderIndex: index,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
        ),
      ),
    );

    await PortfolioProjectsCollection.removeAsync({
      portfolioId,
      projectId: { $nin: uniqueProjectIds },
    });

    return uniqueProjectIds;
  },
});
