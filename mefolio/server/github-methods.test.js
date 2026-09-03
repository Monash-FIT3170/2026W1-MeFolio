import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { ProjectCollection } from "/imports/api/projects";
import { expect } from "chai";

import "./github-methods.js";

if (Meteor.isServer) {
  describe("projects.syncGithubStats method", function () {
    let userId;
    let projectId;
    const originalFetch = globalThis.fetch;

    beforeEach(async function () {
      userId = await Accounts.createUserAsync({
        email: `github-sync-${Date.now()}-${Math.random()}@mefolio.com`,
        password: "password123",
      });

      projectId = await ProjectCollection.insertAsync({
        title: "GitHub Sync Test Project",
        githubLink: "https://github.com/example/project",
        githubStats: null,
        lastSyncedAt: null,
      });
    });

    afterEach(async function () {
      globalThis.fetch = originalFetch;
      await ProjectCollection.removeAsync(projectId);
    });

    it("fetches and persists repository stats", async function () {
      const repository = {
        name: "project",
        full_name: "example/project",
        description: "A test repository",
        stargazers_count: 12,
        forks_count: 4,
        open_issues_count: 2,
        language: "JavaScript",
        updated_at: "2026-09-03T10:00:00Z",
        html_url: "https://github.com/example/project",
      };

      globalThis.fetch = async (url) => {
        if (url.endsWith("/commits?per_page=1")) {
          return {
            ok: true,
            status: 200,
            headers: {
              get: () =>
                '<https://api.github.com/repos/example/project/commits?page=7>; rel="last"',
            },
            json: async () => [{ sha: "latest-commit" }],
          };
        }

        return {
          ok: true,
          status: 200,
          headers: { get: () => "" },
          json: async () => repository,
        };
      };

      const result = await Meteor.server.method_handlers[
        "projects.syncGithubStats"
      ].call({ userId, isSimulation: false, unblock() {} }, projectId);

      const updatedProject = await ProjectCollection.findOneAsync(projectId);

      expect(result.githubStats).to.deep.equal({
        name: "project",
        fullName: "example/project",
        description: "A test repository",
        stars: 12,
        commits: 7,
        forks: 4,
        openIssues: 2,
        language: "JavaScript",
        updatedAt: "2026-09-03T10:00:00Z",
        htmlUrl: "https://github.com/example/project",
      });
      expect(result.lastSyncedAt).to.be.instanceOf(Date);
      expect(updatedProject.githubStats).to.deep.equal(result.githubStats);
      expect(updatedProject.lastSyncedAt).to.deep.equal(result.lastSyncedAt);
    });

    it("rejects unauthenticated callers", async function () {
      try {
        await Meteor.server.method_handlers["projects.syncGithubStats"].call(
          { userId: null, isSimulation: false, unblock() {} },
          projectId,
        );
        expect.fail("Expected projects.syncGithubStats to throw");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("not-authorized");
      }
    });
  });
}
