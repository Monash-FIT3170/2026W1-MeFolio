import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ProjectCollection } from "/imports/api/projects";
import { fetchGitHubRepoStats } from "./github-api.js";

const DAILY_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

async function refreshProjectGithubStats(project) {
  try {
    const githubStats = await fetchGitHubRepoStats(project.githubLink);
    const lastSyncedAt = new Date();

    await ProjectCollection.updateAsync(project._id, {
      $set: {
        githubStats,
        lastSyncedAt,
      },
    });

    return { githubStats, lastSyncedAt };
  } catch (error) {
    console.error(
      `Failed to refresh GitHub stats for project ${project._id}:`,
      error,
    );

    return null;
  }
}

async function refreshAllGithubStats() {
  const projects = await ProjectCollection.find({
    githubLink: { $exists: true, $ne: "" },
  }).fetchAsync();

  for (const project of projects) {
    await refreshProjectGithubStats(project);
  }
}

Meteor.methods({
  async "projects.syncGithubStats"(projectId) {
    check(projectId, String);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to sync project stats.",
      );
    }

    const project = await ProjectCollection.findOneAsync(projectId);

    if (!project) {
      throw new Meteor.Error("not-found", "Project not found.");
    }

    const result = await refreshProjectGithubStats(project);

    if (!result) {
      throw new Meteor.Error(
        "github-sync-failed",
        "Unable to refresh GitHub repository stats.",
      );
    }

    return result;
  },
});

Meteor.startup(() => {
  refreshAllGithubStats().catch((error) => {
    console.error("Initial GitHub stats refresh failed:", error);
  });

  setInterval(() => {
    refreshAllGithubStats().catch((error) => {
      console.error("Scheduled GitHub stats refresh failed:", error);
    });
  }, DAILY_REFRESH_INTERVAL);
});