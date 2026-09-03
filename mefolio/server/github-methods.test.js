import { Meteor } from "meteor/meteor";
<<<<<<< HEAD
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
=======
import { expect } from "chai";
import { ProjectCollection } from "/imports/api/projects";

// Importing the module registers projects.syncGithubStats with Meteor.
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

    // Invoke the registered method with an authenticated server context so the
    // test covers the real method, API adapter, and Mongo collection together.
    const invokeSync = () =>
      Meteor.server.method_handlers["projects.syncGithubStats"].call(
        {
          userId,
          isSimulation: false,
          unblock() {},
        },
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
>>>>>>> ff2502d (Server side github API test commit.)
      });
    });

    afterEach(async function () {
      globalThis.fetch = originalFetch;
      await ProjectCollection.removeAsync(projectId);
    });

<<<<<<< HEAD
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
=======
    it("retains last-known stats when the GitHub API is unavailable", async function () {
      globalThis.fetch = async () => {
        throw new TypeError("Simulated network outage");
      };

      const error = await captureError(invokeSync);

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-request-failed");
      await expectCacheUnchanged();
    });

    it("retains last-known stats when GitHub rate-limits the sync", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({ body: [{ sha: "commit" }] })
          : makeResponse({ status: 429 });

      const error = await captureError(invokeSync);

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-rate-limit");
      await expectCacheUnchanged();
    });

    it("retains last-known stats when the commits request fails", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({ status: 503 })
          : makeResponse({ body: {} });

      const error = await captureError(invokeSync);

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-request-failed");
      await expectCacheUnchanged();
    });

    it("replaces cached stats only after a successful GitHub sync", async function () {
      globalThis.fetch = async (url) => {
        if (String(url).includes("/commits?")) {
          return makeResponse({
            body: [{ sha: "latest-commit" }],
            // per_page=1 makes the last page number the total commit count.
            link: '<https://api.github.com/repos/acme/widget/commits?per_page=1&page=23>; rel="last"',
          });
        }

        return makeResponse({
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
      };

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
>>>>>>> ff2502d (Server side github API test commit.)
    });
  });
}
