import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ProjectCollection } from "/imports/api/projects";
import { fetchGitHubRepoStats } from "./github-api.js";

Meteor.methods({
  // Scheduled and manual sync flows should call this method.
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

    const githubStats = await fetchGitHubRepoStats(project.githubLink);
    const lastSyncedAt = new Date();

    await ProjectCollection.updateAsync(projectId, {
      $set: {
        githubStats,
        lastSyncedAt,
      },
    });

    return { githubStats, lastSyncedAt };
  },
});
