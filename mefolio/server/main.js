import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { ProjectCollection } from "/imports/api/projects";
import {
  PortfolioCollection,
  createDefaultPortfolioPublishingState,
} from "/imports/api/portfolio";
import { PortfolioProjectsCollection } from "/imports/api/portfolioProjects";
import "/imports/api/files/resumeFiles";

// oauth login
import "./oauth-login/oauth.js";
import "./projectClickTracking.js";

// recruiter access token
import "./recruiter-tokens/collection.js";
import "./recruiter-tokens/methods.js";
import "./recruiter-tokens/verifytokens.js";

// public portfolio view
import "./publications/publicPortfolio.js";
import "./publications/publicPortfolioMeta.js";
// portfolio methods (in their own module so tests can load them without the
// app seed and OAuth config)
import "./portfolio-methods.js";

Accounts.config({
  loginExpirationInDays: 1,
});

Meteor.startup(async () => {
  let sampleUserId;
  const existingSampleUser =
    (await Meteor.users.findOneAsync({
      "emails.address": "superuser@example.com",
    })) || (await Meteor.users.findOneAsync({ "profile.name": "Superuser" }));

  if (existingSampleUser) {
    sampleUserId = existingSampleUser._id;
  } else {
    sampleUserId = await Accounts.createUser({
      email: "superuser@example.com",
      password: "superuser",
      profile: { name: "Superuser" },
    });
  }

  let projectIds = [];
  if ((await ProjectCollection.find().countAsync()) === 0) {
    const project1Id = await ProjectCollection.insertAsync({
      title: "Personal Portfolio Website",
      description:
        "A responsive portfolio website used to showcase projects, skills, and contact details.",
      createdAt: new Date(),
      technologies: ["React", "CSS", "Meteor"],
      githubLink: "https://github.com/example/portfolio",
      liveDemoLink: "https://example-portfolio.com",
      media:
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
    });

    const project2Id = await ProjectCollection.insertAsync({
      title: "Task Management App",
      description:
        "A simple task tracking app with project cards, status updates, and basic filtering.",
      createdAt: new Date(),
      technologies: ["JavaScript", "MongoDB", "Meteor"],
      githubLink: "https://github.com/example/task-app",
      liveDemoLink: "https://example-task-app.com",
      media:
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
    });

    const project3Id = await ProjectCollection.insertAsync({
      title: "Developer Blog Platform",
      description:
        "A blog-style project used to share technical writeups and software engineering reflections.",
      createdAt: new Date(),
      technologies: ["React", "Node.js", "CSS"],
      githubLink: "https://github.com/example/blog-platform",
      liveDemoLink: "https://example-blog.com",
      media:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    });

    const project4Id = await ProjectCollection.insertAsync({
      title: "E-Commerce Storefront",
      description:
        "A full-stack online store with product listings, cart, and checkout flow.",
      createdAt: new Date(),
      technologies: ["React", "Node.js", "Stripe"],
      githubLink: "https://github.com/example/ecommerce",
      liveDemoLink: "https://example-store.com",
      media:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    });

    const project5Id = await ProjectCollection.insertAsync({
      title: "Real-Time Chat App",
      description:
        "A websocket-powered chat application with rooms, presence indicators, and message history.",
      createdAt: new Date(),
      technologies: ["Meteor", "React", "MongoDB"],
      githubLink: "https://github.com/example/chat-app",
      liveDemoLink: "https://example-chat.com",
      media:
        "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&q=80",
    });

    const project6Id = await ProjectCollection.insertAsync({
      title: "Data Visualisation Dashboard",
      description:
        "An analytics dashboard with interactive charts, filters, and CSV export built for internal reporting.",
      createdAt: new Date(),
      technologies: ["React", "D3.js", "Python"],
      githubLink: "https://github.com/example/dashboard",
      liveDemoLink: "https://example-dashboard.com",
      media:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    });

    projectIds = [
      project1Id,
      project2Id,
      project3Id,
      project4Id,
      project5Id,
      project6Id,
    ];
  } else {
    const existingProjects = await ProjectCollection.find(
      {},
      { sort: { createdAt: 1 } },
    ).fetchAsync();
    projectIds = existingProjects.map((project) => project._id);
  }

  let samplePortfolioId;
  const existingSamplePortfolio =
    (await PortfolioCollection.findOneAsync({ title: "Sample Portfolio" })) ||
    (await PortfolioCollection.findOneAsync({ userId: sampleUserId }));

  if (existingSamplePortfolio) {
    samplePortfolioId = existingSamplePortfolio._id;
    const samplePortfolioUpdates = {};

    if (existingSamplePortfolio.userId !== sampleUserId) {
      samplePortfolioUpdates.userId = sampleUserId;
    }

    if (!existingSamplePortfolio.projects?.length && projectIds.length) {
      samplePortfolioUpdates.projects = projectIds;
    }

    if (Object.keys(samplePortfolioUpdates).length) {
      await PortfolioCollection.updateAsync(samplePortfolioId, {
        $set: samplePortfolioUpdates,
      });
    }
  } else {
    samplePortfolioId = await PortfolioCollection.insertAsync({
      userId: sampleUserId,
      portfolioNumber: 1,
      title: "Sample Portfolio",
      bio: "This is a sample portfolio.",

      ...createDefaultPortfolioPublishingState(),

      // Agreed FEAT-05 structure
      profile: {
        fullName: "John Doe",
        headline: "Product Designer and Frontend Developer",
        avatarUrl: "",
        location: "Sydney, NSW",
        availability: {
          isAvailable: true,
          label: "Available for hire",
        },
      },

      about: {
        summary:
          "Product designer and frontend developer focused on building clean, user-friendly digital experiences.",
        highlights: ["React", "UI Design", "Frontend Development"],
        yearsOfExperience: 3,
      },

      contact: {
        email: "john@example.com",
        phone: "",
        website: "",
      },

      socials: {
        github: "https://github.com/johndoe",
        linkedin: "https://www.linkedin.com/in/johndoe",
        twitter: "",
        other: [],
      },

      cta: {
        contactEnabled: true,
      },

      createdAt: new Date(),
      projects: projectIds,
      theme: "minimalist",
      badges: [
        {
          title: "Sample Badge",
          issuer: "Sample Issuer",
          issueDate: new Date(),
          badgeImageUrl: "https://example.com/badge.png",
          verificationUrl: "https://example.com/verify-badge",
        },
      ],
      recruiterInfo: {
        salaryExpectation: "$70,000 - $90,000",
        phoneNumber: "123-456-7890",
        currentLocation: "Sydney NSW",
        availability: "Immediate",
        personalNote: "Looking for opportunities in full-stack development.",
        allowAccess: true,
      },
    });
  }

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
    const existingOrderCount = await PortfolioProjectsCollection.find({
      portfolioId: portfolio._id,
    }).countAsync();
    if (existingOrderCount > 0) continue;

    const savedProjectIds = portfolio.projects?.length
      ? portfolio.projects
      : portfolio._id === samplePortfolioId
        ? projectIds
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
});

Meteor.publish("projects.all", function () {
  return ProjectCollection.find({}, { sort: { createdAt: -1 } });
});

// Private portfolio fields that must never reach a client that does not own
// the portfolio. `recruiterInfo` holds private recruiter details (salary,
// phone, personal note) and the access code itself, so it is only sent to the
// owner. Recruiters receive it through the token-gated `portfolio.recruiterView`
// publication instead.
const NON_OWNER_PORTFOLIO_FIELDS = { recruiterInfo: 0 };
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

  await PortfolioCollection.updateAsync(portfolioId, {
    $pull: { viewers: { connectionId: viewer.connectionId } },
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
      technologies: projectData.technologies ?? projectData.stack ?? [],
      githubLink: projectData.githubLink ?? projectData.github ?? "",
      liveDemoLink: projectData.liveDemoLink ?? projectData.demo ?? "",
      media: typeof projectData.media === "string" ? projectData.media : "",
      status: projectData.status ?? "live",
      createdAt: projectData.createdAt
        ? new Date(projectData.createdAt)
        : new Date(),
    };

    if (!this.userId) throw new Meteor.Error("not-authorized");

    const projectId = await ProjectCollection.insertAsync(normalized);

    // Use the portfolioId passed from the client if provided (e.g. test user
    // viewing the superuser portfolio), otherwise find or create the current
    // user's own portfolio.
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
    return await ProjectCollection.updateAsync(projectId, { $set: updates });
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
    const newPortfolio = {
      ...portfolioData,
      ...createDefaultPortfolioPublishingState(),
      userId: this.userId,
    };

    return await PortfolioCollection.insertAsync(newPortfolio);
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
      }));

    if (orderedProjects.length !== projectIds.length) {
      throw new Meteor.Error(
        "portfolios.publish.projectsNotFound",
        "One or more portfolio projects could not be found. Please review your projects before publishing.",
      );
    }

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
    };

    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: {
        publishedContent,
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
