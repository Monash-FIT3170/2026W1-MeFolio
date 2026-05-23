import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { ProjectCollection } from "/imports/api/projects";
import { PortfolioCollection } from "/imports/api/portfolio";
import { PortfolioProjectsCollection } from "/imports/api/portfolioProjects";
import "./oauth-login/oauth.js";

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
    await PortfolioCollection.findOneAsync({ title: "Sample Portfolio" }) ||
    await PortfolioCollection.findOneAsync({ userId: sampleUserId });

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
        $set: samplePortfolioUpdates
      });
    }
  } else {
    samplePortfolioId = await PortfolioCollection.insertAsync({
      userId: sampleUserId,
      portfolioNumber: 1,
      title: "Sample Portfolio",
      bio: "This is a sample portfolio.",
      createdAt: new Date(),
      projects: projectIds,
      theme: "minimal",
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
        resumeLink: "https://example.com/resume.pdf",
        allowAccess: true,
      },
    });
  }

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

Meteor.publish("portfolios.all", function () {
  return PortfolioCollection.find({}, { sort: { createdAt: -1 } });
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

  async "projects.insert"(projectData) {
    return await ProjectCollection.insertAsync(projectData);
  },

  async "projects.update"(projectId, updates) {
    return await ProjectCollection.updateAsync(projectId, { $set: updates });
  },

  async "projects.delete"(projectId) {
    return await ProjectCollection.removeAsync(projectId);
  },

  async "portfolios.insert"(portfolioData) {
    portfolioData.userId = this.userId;
    return await PortfolioCollection.insertAsync(portfolioData);
  },

  async "portfolios.update"(portfolioId, updates) {
    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: updates,
    });
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
