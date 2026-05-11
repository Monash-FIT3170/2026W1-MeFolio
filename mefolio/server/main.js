import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { ProjectCollection } from "/imports/api/projects";
import { PortfolioCollection } from "/imports/api/portfolio";
import './oauth-login/oauth.js';

Accounts.config({
  loginExpirationInDays: 1
});

Meteor.startup(async () => {
  // Insert sample user data if no Meteor account exists yet
  let sampleUserId;
  if ((await Meteor.users.find().countAsync()) === 0) {
    sampleUserId = await Meteor.users.insertAsync({
      createdAt: new Date(),
      emails: [{ address: "superuser@example.com", verified: false }],
      profile: {
        name: "Superuser"
      }
    });
    Accounts.setPassword(sampleUserId, "superuser");
  } else {
    // If user already exists, get the first user's _id
    const existingUser = await Meteor.users.findOneAsync();
    sampleUserId = existingUser._id;
  }

  // Insert sample project data if collections are empty
  let sampleProjectId;
  if ((await ProjectCollection.find().countAsync()) === 0) {
    sampleProjectId = await ProjectCollection.insertAsync({
      title: "Sample Project",
      description: "This is a sample project.",
      createdAt: new Date(),
      technologies: ["React", "Node.js"],
      githubLink: "https://github.com/sample/project",
      liveDemoLink: "https://sampleproject.com",
      media: "" // Placeholder for media type
    });
  } else {
    // If project already exists, get the first project's _id
    const existingProject = await ProjectCollection.findOneAsync();
    sampleProjectId = existingProject._id;
  }

  // Insert sample portfolio data if collections are empty
  if ((await PortfolioCollection.find().countAsync()) === 0) {
    await PortfolioCollection.insertAsync({
      userId: sampleUserId,
      portfolioNumber: 1, //Allows for multiple portfolios per user in the future
      title: "Sample Portfolio",
      bio: "This is a sample portfolio.",
      createdAt: new Date(),
      projects: [sampleProjectId], // Array to hold project IDs
      theme: "minimal",
      badges: [
        {
          title: "Sample Badge",
          issuer: "Sample Issuer",
          issueDate: new Date(),
          badgeImageUrl: "https://example.com/badge.png",
          verificationUrl: "https://example.com/verify-badge"
        }
      ],
      recruiterInfo: {
        salaryExpectation: "$70,000 - $90,000",
        phoneNumber: "123-456-7890",
        currentLocation: "Sydney NSW",
        availability: "Immediate",
        personalNote: "Looking for opportunities in full-stack development.",
        resumeLink: "https://example.com/resume.pdf",
        allowAccess: true
      }
    });
  }
});

Meteor.publish("projects.all", function () {
  return ProjectCollection.find({}, { sort: { createdAt: -1 } });
});

Meteor.publish("portfolios.all", function () {
  return PortfolioCollection.find({}, { sort: { createdAt: -1 } });
});

Meteor.publish("users.current", function () {
  return Meteor.users.find(this.userId);
});

Meteor.methods({
  // User methods
  async "users.update"(userId, updates) {
    if (this.userId !== userId) {
      throw new Meteor.Error("not-authorized", "You may only update your own account.");
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
      const currentUser = await Meteor.users.findOneAsync(userId, { fields: { emails: 1 } });
      const currentEmail = currentUser?.emails?.[0]?.address;
      if (currentEmail && currentEmail !== updates.email) {
        await Meteor.users.updateAsync(userId, { $pull: { emails: { address: currentEmail } } });
        await Meteor.users.updateAsync(userId, { $push: { emails: { address: updates.email, verified: false } } });
      } else if (!currentEmail) {
        await Meteor.users.updateAsync(userId, { $push: { emails: { address: updates.email, verified: false } } });
      }
    }
  },

  // Project methods
  async "projects.insert"(projectData) {
    return await ProjectCollection.insertAsync(projectData);
  },

  async "projects.update"(projectId, updates) {
    return await ProjectCollection.updateAsync(projectId, { $set: updates });
  },

  async "projects.delete"(projectId) {
    return await ProjectCollection.removeAsync(projectId);
  },

  // Portfolio methods
  async "portfolios.insert"(portfolioData) {
    // Ensure userId is set to the current user's _id
    portfolioData.userId = this.userId;
    return await PortfolioCollection.insertAsync(portfolioData);
  },

  async "portfolios.update"(portfolioId, updates) {
    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: updates
    });
  },

  async "portfolios.delete"(portfolioId) {
    return await PortfolioCollection.removeAsync(portfolioId);
  }
});
