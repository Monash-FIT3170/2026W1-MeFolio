import { Meteor } from "meteor/meteor";
import { ProjectCollection } from "/imports/api/projects";
import { expect } from "chai";

import "./github-methods.js";

const makeResponse = ({ status = 200, body = {}, link = null } = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  headers: {
    get: (name) => (name.toLowerCase() === "link" ? link : null),
  },
  json: async () => body,
});

const captureError = async (operation) => {
  let caughtError;

  try {
    await operation();
  } catch (error) {
    caughtError = error;
  }

  expect(caughtError, "Expected GitHub sync to fail").to.exist;
  return caughtError;
};

if (Meteor.isServer) {
  describe("projects.syncGithubStats", function () {
    const userId = "github-sync-test-user";
    const cachedStats = {
      name: "widget",
      fullName: "acme/widget",
      description: "Cached repository data",
      stars: 12,
      commits: 7,
      forks: 2,
      openIssues: 1,
      language: "JavaScript",
      updatedAt: "2026-07-01T00:00:00Z",
      htmlUrl: "https://github.com/acme/widget",
    };
    const cachedSyncTime = new Date("2026-07-02T00:00:00Z");

    let originalFetch;
    let projectId;

    const invokeSync = () =>
      Meteor.server.method_handlers["projects.syncGithubStats"].call(
        { userId, isSimulation: false, unblock() {} },
        projectId,
      );

    const expectCacheUnchanged = async () => {
      const project = await ProjectCollection.findOneAsync(projectId);

      expect(project.githubStats).to.deep.equal(cachedStats);
      expect(project.lastSyncedAt.getTime()).to.equal(cachedSyncTime.getTime());
    };

    beforeEach(async function () {
      originalFetch = globalThis.fetch;
      projectId = await ProjectCollection.insertAsync({
        userId,
        title: "Cached GitHub project",
        githubLink: "https://github.com/acme/widget",
        githubStats: cachedStats,
        lastSyncedAt: cachedSyncTime,
        createdAt: new Date(),
      });
    });

    afterEach(async function () {
      globalThis.fetch = originalFetch;
      await ProjectCollection.removeAsync(projectId);
    });

    it("fetches and persists repository stats", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({
              body: [{ sha: "latest-commit" }],
              link: '<https://api.github.com/repos/acme/widget/commits?page=7>; rel="last"',
            })
          : makeResponse({
              body: {
                name: "widget",
                full_name: "acme/widget",
                description: "Fresh repository data",
                stargazers_count: 99,
                forks_count: 8,
                open_issues_count: 4,
                language: "TypeScript",
                updated_at: "2026-09-03T00:00:00Z",
                html_url: "https://github.com/acme/widget",
              },
            });

      const result = await invokeSync();
      const project = await ProjectCollection.findOneAsync(projectId);

      expect(result.githubStats).to.deep.equal({
        name: "widget",
        fullName: "acme/widget",
        description: "Fresh repository data",
        stars: 99,
        commits: 7,
        forks: 8,
        openIssues: 4,
        language: "TypeScript",
        updatedAt: "2026-09-03T00:00:00Z",
        htmlUrl: "https://github.com/acme/widget",
      });
      expect(result.lastSyncedAt).to.be.instanceOf(Date);
      expect(project.githubStats).to.deep.equal(result.githubStats);
      expect(project.lastSyncedAt.getTime()).to.equal(
        result.lastSyncedAt.getTime(),
      );
    });

    it("rejects unauthenticated callers", async function () {
      const error = await captureError(() =>
        Meteor.server.method_handlers["projects.syncGithubStats"].call(
          { userId: null, isSimulation: false, unblock() {} },
          projectId,
        ),
      );

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("not-authorized");
    });

    it("retains last-known stats when the GitHub API is unavailable", async function () {
      globalThis.fetch = async () => {
        throw new TypeError("Simulated network outage");
      };

      const error = await captureError(invokeSync);

      expect(error.error).to.equal("github-sync-failed");
      await expectCacheUnchanged();
    });

    it("retains last-known stats when GitHub rate-limits the sync", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({ body: [{ sha: "commit" }] })
          : makeResponse({ status: 429 });

      const error = await captureError(invokeSync);

      expect(error.error).to.equal("github-sync-failed");
      await expectCacheUnchanged();
    });

    it("retains last-known stats when the commits request fails", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({ status: 503 })
          : makeResponse({ body: {} });

      const error = await captureError(invokeSync);

      expect(error.error).to.equal("github-sync-failed");
      await expectCacheUnchanged();
    });

    it("replaces cached stats only after a successful GitHub sync", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({
              body: [{ sha: "latest-commit" }],
              link: '<https://api.github.com/repos/acme/widget/commits?per_page=1&page=23>; rel="last"',
            })
          : makeResponse({
              body: {
                name: "widget",
                full_name: "acme/widget",
                description: "Fresh repository data",
                stargazers_count: 99,
                forks_count: 8,
                open_issues_count: 4,
                language: "TypeScript",
                updated_at: "2026-09-03T00:00:00Z",
                html_url: "https://github.com/acme/widget",
              },
            });

      const result = await invokeSync();
      const project = await ProjectCollection.findOneAsync(projectId);

      expect(result.githubStats).to.deep.equal({
        name: "widget",
        fullName: "acme/widget",
        description: "Fresh repository data",
        stars: 99,
        commits: 23,
        forks: 8,
        openIssues: 4,
        language: "TypeScript",
        updatedAt: "2026-09-03T00:00:00Z",
        htmlUrl: "https://github.com/acme/widget",
      });
      expect(project.githubStats).to.deep.equal(result.githubStats);
      expect(project.lastSyncedAt.getTime()).to.equal(
        result.lastSyncedAt.getTime(),
      );
      expect(project.lastSyncedAt.getTime()).to.be.greaterThan(
        cachedSyncTime.getTime(),
      );
    });
  });
}
