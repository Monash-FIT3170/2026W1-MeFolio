import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { ProjectCollection } from "./projects.js";

if (Meteor.isServer) {
  // Confirms Mongo preserves the cached object and Date value used by GitHub sync.
  describe("ProjectCollection GitHub cache", function () {
    let projectId;

    afterEach(async function () {
      if (projectId) {
        await ProjectCollection.removeAsync(projectId);
      }
    });

    it("stores and retrieves githubStats and lastSyncedAt", async function () {
      const githubStats = {
        name: "widget",
        fullName: "acme/widget",
        stars: 42,
        commits: 10,
        forks: 3,
        openIssues: 1,
        language: "JavaScript",
        updatedAt: "2026-08-01T00:00:00Z",
        htmlUrl: "https://github.com/acme/widget",
      };
      const lastSyncedAt = new Date("2026-08-02T00:00:00Z");

      projectId = await ProjectCollection.insertAsync({
        title: "Cached GitHub project",
        githubLink: "https://github.com/acme/widget",
        githubStats,
        lastSyncedAt,
      });

      const storedProject = await ProjectCollection.findOneAsync(projectId);

      expect(storedProject.githubStats).to.deep.equal(githubStats);
      expect(storedProject.lastSyncedAt).to.be.instanceOf(Date);
      expect(storedProject.lastSyncedAt.getTime()).to.equal(
        lastSyncedAt.getTime(),
      );
    });
  });
}
