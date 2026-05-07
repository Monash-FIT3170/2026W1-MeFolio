import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { ProjectCollection } from "/imports/api/projects";
import { PortfolioCollection } from "/imports/api/portfolio";

Accounts.config({
  loginExpirationInDays: 1
});

Meteor.startup(async () => {

  if ((await ProjectCollection.find().countAsync()) === 0) {
    await ProjectCollection.insertAsync({
      title: "Sample Project",
      description: "This is a sample project.",
      createdAt: new Date(),
      technologies: ["React", "Node.js"],
      githubLink: "https://github.com/sample/project",
      liveDemoLink: "https://sampleproject.com",
      media: "" // Placeholder for media type
    });
  }

  if ((await PortfolioCollection.find().countAsync()) === 0) {
    await PortfolioCollection.insertAsync({
      userId: "Superuser", // TODO: Replace with actual user ID once user collection is set up
      portfolioNumber: 1, //Allows for multiple portfolios per user in the future
      title: "Sample Portfolio",
      bio: "This is a sample portfolio.", 
      createdAt: new Date(),
      projects: [], // Array to hold project IDs
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

Meteor.publish('projects.all', function(){
  return ProjectCollection.find({}, {sort: {createdAt: -1}});
});

Meteor.publish('portfolios.all', function(){
  return PortfolioCollection.find({}, {sort: {createdAt: -1}});
});

Meteor.methods({
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
    return await PortfolioCollection.insertAsync(portfolioData);
  },

  async "portfolios.update"(portfolioId, updates) {
    return await PortfolioCollection.updateAsync(portfolioId, { $set: updates });
  },

  async "portfolios.delete"(portfolioId) {
    return await PortfolioCollection.removeAsync(portfolioId);
  },
});