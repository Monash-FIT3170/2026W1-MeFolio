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
      portfolioId: "abc",
      priority: 1,
      title: "Jonah Rudzki",
      description: "Advanced optimisation on orthagonal implementations",
      createdAt: new Date(),
      technologies: ["Orthol", "Node.js"],
      githubLink: "https://github.com/sample/project",
      media: "https://media.licdn.com/dms/image/v2/D5603AQG6P3oRpewbnw/profile-displayphoto-crop_800_800/B56Z0yItb7K8AI-/0/1774662641268?e=1779926400&v=beta&t=FnM8thWl_NJk7pqsRkQ76gIEnqX3ROorcjFoidYbyMk"
    });
    
    await ProjectCollection.insertAsync({
      portfolioId: "abc",
      priority: 2,
      title: "Sponge bob is cool",
      description: "This is the second sample project.",
      createdAt: new Date(),
      technologies: ["Vue", "Firebase"],
      githubLink: "https://github.com/sample/project2",
      liveDemoLink: "https://sampleproject2.com",
      media: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-bgekrhZkDbpZ5gdHfDclh3T_PhALym5BwQ&s"
    });
  }

  if ((await PortfolioCollection.find().countAsync()) === 0) {
    await PortfolioCollection.insertAsync({
      mock_id: "abc",
      userId: "Superuser", // TODO: Replace this and all references with actual user ID once user collection is set up
      portfolioNumber: 1, //Allows for multiple portfolios per user in the future
      title: "Sample Portfolio",
      bio: "This is a sample portfolio.", 
      createdAt: new Date(),
      // projects: [1, 2], // Array to hold project IDs
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