import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { fetchGitHubRepoStats } from "./github-api.js";

// Builds the small part of a Fetch Response used by github-api.js, keeping
// these tests deterministic and preventing requests to the real GitHub API.
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

  expect(caughtError, "Expected the GitHub request to fail").to.exist;
  return caughtError;
};

if (Meteor.isServer) {
  describe("fetchGitHubRepoStats", function () {
    let originalFetch;

    beforeEach(function () {
      originalFetch = globalThis.fetch;
    });

    afterEach(function () {
      globalThis.fetch = originalFetch;
    });

    it("returns repository statistics after both GitHub requests succeed", async function () {
      const fetchCalls = [];

      globalThis.fetch = async (url, options) => {
        const href = String(url);
        fetchCalls.push({ href, options });

        if (href.includes("/commits?")) {
          return makeResponse({
            body: [{ sha: "latest-commit" }],
            // With one commit per page, the last page is the commit count.
            link: '<https://api.github.com/repos/acme/widget/commits?per_page=1&page=31>; rel="last"',
          });
        }

        return makeResponse({
          body: {
            name: "widget",
            full_name: "acme/widget",
            description: "A test repository",
            stargazers_count: 42,
            forks_count: 5,
            open_issues_count: 3,
            language: "JavaScript",
            updated_at: "2026-08-01T00:00:00Z",
            html_url: "https://github.com/acme/widget",
          },
        });
      };

      const result = await fetchGitHubRepoStats(
        "https://github.com/acme/widget",
      );

      expect(fetchCalls).to.have.lengthOf(2);
      expect(fetchCalls[0].href).to.equal(
        "https://api.github.com/repos/acme/widget",
      );
      expect(fetchCalls[1].href).to.equal(
        "https://api.github.com/repos/acme/widget/commits?per_page=1",
      );
      expect(fetchCalls[0].options.signal).to.exist;
      expect(result).to.deep.equal({
        name: "widget",
        fullName: "acme/widget",
        description: "A test repository",
        stars: 42,
        commits: 31,
        forks: 5,
        openIssues: 3,
        language: "JavaScript",
        updatedAt: "2026-08-01T00:00:00Z",
        htmlUrl: "https://github.com/acme/widget",
      });
    });

    it("translates a network failure into github-request-failed", async function () {
      globalThis.fetch = async () => {
        throw new TypeError("Simulated network outage");
      };

      const error = await captureError(() =>
        fetchGitHubRepoStats("https://github.com/acme/widget"),
      );

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-request-failed");
    });

    for (const status of [403, 429]) {
      it(`translates a ${status} repository response into github-rate-limit`, async function () {
        globalThis.fetch = async (url) =>
          String(url).includes("/commits?")
            ? makeResponse({ body: [{ sha: "commit" }] })
            : makeResponse({
                status,
                body: { message: "API rate limit exceeded" },
              });

        const error = await captureError(() =>
          fetchGitHubRepoStats("https://github.com/acme/widget"),
        );

        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("github-rate-limit");
      });
    }

    it("translates a failed repository response into github-request-failed", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({ body: [{ sha: "commit" }] })
          : makeResponse({ status: 503 });

      const error = await captureError(() =>
        fetchGitHubRepoStats("https://github.com/acme/widget"),
      );

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-request-failed");
    });

    it("translates a failed commits response into github-request-failed", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({ status: 503 })
          : makeResponse({ body: {} });

      const error = await captureError(() =>
        fetchGitHubRepoStats("https://github.com/acme/widget"),
      );

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-request-failed");
    });

    it("translates an aborted request into github-timeout", async function () {
      // Exercise timeout error translation without waiting for the real 5s timer.
      const abortError = new Error("The operation was aborted");
      abortError.name = "AbortError";
      globalThis.fetch = async () => {
        throw abortError;
      };

      const error = await captureError(() =>
        fetchGitHubRepoStats("https://github.com/acme/widget"),
      );

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-timeout");
    });

    it("reports a missing repository without returning partial data", async function () {
      globalThis.fetch = async (url) =>
        String(url).includes("/commits?")
          ? makeResponse({ body: [] })
          : makeResponse({ status: 404 });

      const error = await captureError(() =>
        fetchGitHubRepoStats("https://github.com/acme/missing"),
      );

      expect(error).to.be.instanceOf(Meteor.Error);
      expect(error.error).to.equal("github-repository-not-found");
    });
  });
}
