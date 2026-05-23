import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { ProjectCollection } from "/imports/api/projects";
import { PortfolioCollection } from "/imports/api/portfolio";
import '/imports/api/files/resumeFiles';
import { UsersCollection } from "/imports/api/users";
import "./oauth-login/oauth.js";

Accounts.config({
  loginExpirationInDays: 1,
});

Meteor.startup(async () => {
  // Insert sample user data if collections are empty
  let sampleUserId;
  if ((await UsersCollection.find().countAsync()) === 0) {
    sampleUserId = await UsersCollection.insertAsync({
      createdAt: new Date(),
      services: {
        password: "",
        resume: "",
      },
      email: "superuser@example.com",
      profile: {
        name: "Superuser",
      },
    });
  } else {
    const existingUser = await UsersCollection.findOneAsync();
    sampleUserId = existingUser._id;
  }

  // Insert sample project data if collections are empty
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
    projectIds = existingProjects.map((p) => p._id);
  }

  // Insert sample portfolio data if collections are empty
  if ((await PortfolioCollection.find().countAsync()) === 0) {
    await PortfolioCollection.insertAsync({
      userId: sampleUserId,
      portfolioNumber: 1,
      title: "Sample Portfolio",
      bio: "This is a sample portfolio.",

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
        resumeUrl: "https://example.com/resume.pdf",
        contactEnabled: true,
      },

      createdAt: new Date(),
      projects: projectIds,
      theme: "minimal",
      username: "me",
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
        resumeLink: "",
        resumeLinks: [],
        allowAccess: true,
      }
    });
  }
});

Meteor.publish("users1.all", function () {
  return UsersCollection.find({}, { sort: { createdAt: -1 } });
});

Meteor.publish("projects.all", function () {
  return ProjectCollection.find({}, { sort: { createdAt: -1 } });
});

Meteor.publish("portfolios.all", function () {
  return PortfolioCollection.find({}, { sort: { createdAt: -1 } });
});

Meteor.publish('portfolios.byUsername', function(username){
  check(username, String);
  return PortfolioCollection.find({ username }, { sort: { createdAt: -1 } });
});

Meteor.publish('portfolios.byUsername', function(username){
  check(username, String);
  return PortfolioCollection.find({ username }, { sort: { createdAt: -1 } });
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
});
