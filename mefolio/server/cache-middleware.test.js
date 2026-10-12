import { expect } from "chai";
import {
  shouldCachePortfolioView,
  applyCacheHeaders,
} from "./cache-middleware";

describe("cache middleware", function () {
  describe("shouldCachePortfolioView", function () {
    it("returns true for GET requests to /u/<username>", function () {
      expect(
        shouldCachePortfolioView({
          method: "GET",
          url: "/u/din",
        }),
      ).to.equal(true);
    });

    it("returns true for GET requests to /<17-char-id>/view", function () {
      expect(
        shouldCachePortfolioView({
          method: "GET",
          url: "/abc123def456ghi78/view",
        }),
      ).to.equal(true);
    });

    it("returns false for non-GET requests", function () {
      expect(
        shouldCachePortfolioView({
          method: "POST",
          url: "/u/din",
        }),
      ).to.equal(false);
    });

    it("returns false for the dashboard route", function () {
      expect(
        shouldCachePortfolioView({
          method: "GET",
          url: "/",
        }),
      ).to.equal(false);
    });

    it("returns false for the preview route", function () {
      expect(
        shouldCachePortfolioView({
          method: "GET",
          url: "/preview",
        }),
      ).to.equal(false);
    });
  });

  describe("applyCacheHeaders", function () {
    it("sets the correct Cache-Control header", function () {
      const headers = {};
      const mockRes = {
        setHeader: (key, value) => {
          headers[key] = value;
        },
      };

      applyCacheHeaders(mockRes);

      expect(headers["Cache-Control"]).to.equal(
        "public, max-age=0, must-revalidate",
      );
      expect(headers["Vary"]).to.equal("Accept-Encoding");
    });
  });
});
