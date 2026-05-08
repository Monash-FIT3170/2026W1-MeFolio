import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { ProjectCollection } from "/imports/api/projects";
import { PortfolioCollection } from "/imports/api/portfolio";
import { UsersCollection } from "/imports/api/users";
import './oauth-login/oauth.js';

Accounts.config({
  loginExpirationInDays: 1
});

Meteor.startup(async () => {

  // Insert sample user data if collections are empty
  let sampleUserId;
  if ((await UsersCollection.find().countAsync()) === 0) {
    sampleUserId = await UsersCollection.insertAsync({
      createdAt: new Date(),
      services: {
        password: "",
        resume: ""
      },
      email: "superuser@example.com",
      profile: {
        name: "Superuser",
        initials: "SU"
      }
    });
  } else {
    // If user already exists, get the first user's _id
    const existingUser = await UsersCollection.findOneAsync();
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
      badges: [{
        title: "Sample Badge",
        issuer: "Sample Issuer",
        issueDate: new Date(),
        badgeImageUrl: "https://example.com/badge.png",
        verificationUrl: "https://example.com/verify-badge"

      }],
      recruiterInfo: {
        salaryExpectation: "$70,000 - $90,000",
        phoneNumber: "123-456-7890",
        currentLocation: "Sydney NSW",
        availability: "Immediate",
        personalNote: "Looking for opportunities in full-stack development.",
        resumeLink: "https://example.com/resume.pdf",
        allowAccess: true,
      }
    });
  }
});

Meteor.publish('users1.all', function(){
  return UsersCollection.find({}, {sort: {createdAt: -1}});
});

Meteor.publish('projects.all', function(){
  return ProjectCollection.find({}, {sort: {createdAt: -1}});
});

Meteor.publish('portfolios.all', function(){
  return PortfolioCollection.find({}, {sort: {createdAt: -1}});
});

Meteor.methods({
  // User methods
  async "users1.insert"(userData) {
    return await UsersCollection.insertAsync(userData);
  },

  async "users1.update"(userId, updates) {
    return await UsersCollection.updateAsync(userId, { $set: updates });
  },

  async "users1.delete"(userId) {
    return await UsersCollection.removeAsync(userId);
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
    return await PortfolioCollection.updateAsync(portfolioId, { $set: updates });
  },

  async "portfolios.delete"(portfolioId) {
    return await PortfolioCollection.removeAsync(portfolioId);
  },
});