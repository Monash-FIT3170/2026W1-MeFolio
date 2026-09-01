/**
 * Server tests for the unique portfolio username index (FEAT-13).
 *
 * `portfolios.setUsername` checks for a taken username before it writes, but
 * the check and the write are separate round trips, so two concurrent requests
 * can both pass the check. These tests cover the database-level constraint
 * that actually closes that gap, and — just as importantly — that it does not
 * penalise the many portfolios which never claim a username at all.
 */

import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "/imports/api/portfolio";
import { expect } from "chai";

import {
  PORTFOLIO_USERNAME_INDEX,
  ensurePortfolioUsernameIndex,
  findDuplicateUsernames,
} from "./portfolio-indexes.js";

// Registers portfolios.setUsername without pulling in main.js's seed and OAuth
// config, the same way portfolio-methods.test.js does.
import "./portfolio-methods.js";

if (Meteor.isServer) {
  describe("portfolios username index", function () {
    const OWNER_ID = "username-index-test-owner";

    const uniqueSlug = (label) =>
      `${label}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const insertPortfolio = (fields = {}) =>
      PortfolioCollection.insertAsync({
        userId: OWNER_ID,
        title: "Index Test Portfolio",
        createdAt: new Date(),
        ...fields,
      });

    const isDuplicateKeyError = (error) =>
      error?.code === 11000 || /duplicate key/i.test(error?.message ?? "");

    before(async function () {
      // A database carrying duplicate usernames cannot take the index, and the
      // resulting failure is far easier to act on when it names the culprits.
      const duplicates = await findDuplicateUsernames();

      if (duplicates.length) {
        const summary = duplicates
          .map(({ username, count }) => `"${username}" (${count})`)
          .join(", ");

        throw new Error(
          `The test database already contains duplicate portfolio usernames: ` +
            `${summary}. Remove the duplicates before running this suite.`,
        );
      }

      await ensurePortfolioUsernameIndex();
    });

    afterEach(async function () {
      await PortfolioCollection.removeAsync({ userId: OWNER_ID });
    });

    it("creates a unique index on username", async function () {
      const indexes = await PortfolioCollection.rawCollection().indexes();
      const usernameIndex = indexes.find(
        (index) => index.name === PORTFOLIO_USERNAME_INDEX,
      );

      expect(usernameIndex, "expected the username index to exist").to.exist;
      expect(usernameIndex.unique).to.equal(true);
      expect(usernameIndex.key).to.deep.equal({ username: 1 });
    });

    it("can be created repeatedly without error", async function () {
      // Every server boot runs this, so it has to be idempotent.
      await ensurePortfolioUsernameIndex();
      await ensurePortfolioUsernameIndex();
    });

    it("rejects a second portfolio claiming the same username", async function () {
      const username = uniqueSlug("taken");

      await insertPortfolio({ username });

      try {
        await insertPortfolio({ username });
        expect.fail("Expected a duplicate username to be rejected by Mongo");
      } catch (error) {
        expect(
          isDuplicateKeyError(error),
          `Expected a duplicate key error, got: ${error?.message}`,
        ).to.equal(true);
      }

      const stored = await PortfolioCollection.find({ username }).countAsync();
      expect(stored).to.equal(1);
    });

    it("still rejects a duplicate when it arrives through an update", async function () {
      const username = uniqueSlug("taken-by-update");

      await insertPortfolio({ username });
      const secondId = await insertPortfolio();

      try {
        await PortfolioCollection.updateAsync(secondId, { $set: { username } });
        expect.fail("Expected a duplicate username update to be rejected");
      } catch (error) {
        expect(
          isDuplicateKeyError(error),
          `Expected a duplicate key error, got: ${error?.message}`,
        ).to.equal(true);
      }
    });

    it("allows many portfolios with no username", async function () {
      // The reason the index is partial: most portfolios never claim a custom
      // URL, and a plain unique index would read every missing field as the
      // same null key and reject all but the first.
      await insertPortfolio();
      await insertPortfolio();
      await insertPortfolio();

      const stored = await PortfolioCollection.find({
        userId: OWNER_ID,
      }).countAsync();

      expect(stored).to.equal(3);
    });

    it("allows many portfolios with an empty username", async function () {
      // Legacy rows can carry "" rather than no field at all; those are not
      // claimed usernames either, so they must not collide.
      await insertPortfolio({ username: "" });
      await insertPortfolio({ username: "" });

      const stored = await PortfolioCollection.find({
        userId: OWNER_ID,
      }).countAsync();

      expect(stored).to.equal(2);
    });

    it("lets a portfolio keep its own username on a no-op update", async function () {
      const username = uniqueSlug("unchanged");
      const portfolioId = await insertPortfolio({ username });

      await PortfolioCollection.updateAsync(portfolioId, {
        $set: { username },
      });

      const updated = await PortfolioCollection.findOneAsync(portfolioId);
      expect(updated.username).to.equal(username);
    });
  });

  describe("portfolios.setUsername with the unique index in place", function () {
    const OWNER_ID = "username-index-method-owner";
    const OTHER_ID = "username-index-method-other";

    const runSetUsername = (context, ...args) =>
      Meteor.server.method_handlers["portfolios.setUsername"].call(
        { isSimulation: false, unblock() {}, ...context },
        ...args,
      );

    before(async function () {
      await ensurePortfolioUsernameIndex();
    });

    afterEach(async function () {
      await PortfolioCollection.removeAsync({
        userId: { $in: [OWNER_ID, OTHER_ID] },
      });
    });

    it("reports a taken username rather than leaking a Mongo error", async function () {
      const username = `method-taken-${Date.now().toString(36)}`;

      await PortfolioCollection.insertAsync({
        userId: OTHER_ID,
        title: "Other Portfolio",
        username,
        createdAt: new Date(),
      });

      const portfolioId = await PortfolioCollection.insertAsync({
        userId: OWNER_ID,
        title: "Owner Portfolio",
        createdAt: new Date(),
      });

      try {
        await runSetUsername({ userId: OWNER_ID }, portfolioId, username);
        expect.fail("Expected a duplicate username to be rejected");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("username-taken");
        expect(error.reason).to.equal("This custom URL is already taken.");
      }
    });
  });
}
