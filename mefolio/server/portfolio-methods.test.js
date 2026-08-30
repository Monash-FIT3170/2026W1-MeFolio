import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { PortfolioCollection } from "/imports/api/portfolio";
import { expect } from "chai";

// Register the methods under test. Importing this lightweight module populates
// Meteor.server.method_handlers without pulling in main.js's seed and OAuth
import "./portfolio-methods.js";

if (Meteor.isServer) {
  describe("portfolios.update method", function () {
    let ownerId;
    let otherUserId;
    let portfolioId;

    const runUpdate = (context, ...args) =>
      Meteor.server.method_handlers["portfolios.update"].call(
        { isSimulation: false, unblock() {}, ...context },
        ...args,
      );

    beforeEach(async function () {
      const unique = `${Date.now()}-${Math.random()}`;
      ownerId = await Accounts.createUserAsync({
        email: `portfolio-owner-${unique}@mefolio.com`,
        password: "password123",
      });
      otherUserId = await Accounts.createUserAsync({
        email: `portfolio-other-${unique}@mefolio.com`,
        password: "password123",
      });
      portfolioId = await PortfolioCollection.insertAsync({
        userId: ownerId,
        title: "Owner Portfolio",
        createdAt: new Date(),
      });
    });

    it("persists recruiterInfo for the owner and reads it back", async function () {
      await runUpdate({ userId: ownerId }, portfolioId, {
        recruiterInfo: { companyName: "Acme", salaryExpectation: "100k" },
      });

      const updated = await PortfolioCollection.findOneAsync(portfolioId);
      expect(updated.recruiterInfo.companyName).to.equal("Acme");
      expect(updated.recruiterInfo.salaryExpectation).to.equal("100k");
    });

    it("rejects an update from a non-owner", async function () {
      try {
        await runUpdate({ userId: otherUserId }, portfolioId, {
          recruiterInfo: { companyName: "Hacker" },
        });
        expect.fail("Expected portfolios.update to throw for a non-owner");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("not-authorized");
      }

      const unchanged = await PortfolioCollection.findOneAsync(portfolioId);
      expect(unchanged.recruiterInfo?.companyName).to.not.equal("Hacker");
    });

    it("rejects an update from a logged-out caller", async function () {
      try {
        await runUpdate({ userId: null }, portfolioId, { title: "X" });
        expect.fail("Expected portfolios.update to throw when not logged in");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("not-authorized");
      }
    });

    it("does not let a client reassign userId or _id", async function () {
      await runUpdate({ userId: ownerId }, portfolioId, {
        userId: otherUserId,
        _id: "some-other-id",
        title: "Renamed",
      });

      const updated = await PortfolioCollection.findOneAsync(portfolioId);
      expect(updated.userId).to.equal(ownerId);
      expect(updated._id).to.equal(portfolioId);
      expect(updated.title).to.equal("Renamed");
    });

    it("does not let the generic update method change username", async function () {
      await PortfolioCollection.updateAsync(portfolioId, {
        $set: { username: "original-name" },
      });

      await runUpdate({ userId: ownerId }, portfolioId, {
        username: "bypass-name",
        title: "Updated Title",
      });

      const updated = await PortfolioCollection.findOneAsync(portfolioId);

      expect(updated.username).to.equal("original-name");
      expect(updated.title).to.equal("Updated Title");
    });
  });

  describe("portfolios.setUsername method", function () {
    let ownerId;
    let otherUserId;
    let portfolioId;

    const runSetUsername = (context, ...args) =>
      Meteor.server.method_handlers["portfolios.setUsername"].call(
        { isSimulation: false, unblock() {}, ...context },
        ...args,
      );

    beforeEach(async function () {
      const unique = `${Date.now()}-${Math.random()}`;

      ownerId = await Accounts.createUserAsync({
        email: `username-owner-${unique}@mefolio.com`,
        password: "password123",
      });

      otherUserId = await Accounts.createUserAsync({
        email: `username-other-${unique}@mefolio.com`,
        password: "password123",
      });

      portfolioId = await PortfolioCollection.insertAsync({
        userId: ownerId,
        title: "Owner Portfolio",
        createdAt: new Date(),
      });
    });

    it("sets a valid username for the portfolio owner", async function () {
      await runSetUsername({ userId: ownerId }, portfolioId, "jane-doe");

      const updated = await PortfolioCollection.findOneAsync(portfolioId);

      expect(updated.username).to.equal("jane-doe");
    });

    it("rejects an invalid username format", async function () {
      try {
        await runSetUsername({ userId: ownerId }, portfolioId, "Jane_Doe!");
        expect.fail("Expected an invalid username to be rejected");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("invalid-username");
      }
    });

    it("rejects a username that is already used by another portfolio", async function () {
      await PortfolioCollection.insertAsync({
        userId: otherUserId,
        title: "Other Portfolio",
        username: "already-taken",
        createdAt: new Date(),
      });

      try {
        await runSetUsername(
          { userId: ownerId },
          portfolioId,
          "already-taken",
        );
        expect.fail("Expected a duplicate username to be rejected");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("username-taken");
        expect(error.reason).to.equal("This custom URL is already taken.");
      }
    });

    it("allows a portfolio to keep its existing username", async function () {
      await PortfolioCollection.updateAsync(portfolioId, {
        $set: { username: "same-name" },
      });

      await runSetUsername({ userId: ownerId }, portfolioId, "same-name");

      const updated = await PortfolioCollection.findOneAsync(portfolioId);

      expect(updated.username).to.equal("same-name");
    });

    it("rejects a username change from a non-owner", async function () {
      try {
        await runSetUsername(
          { userId: otherUserId },
          portfolioId,
          "stolen-name",
        );
        expect.fail("Expected a non-owner to be rejected");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("not-authorized");
      }
    });

    it("rejects a username change from a logged-out caller", async function () {
      try {
        await runSetUsername({ userId: null }, portfolioId, "logged-out");
        expect.fail("Expected a logged-out caller to be rejected");
      } catch (error) {
        expect(error).to.be.instanceOf(Meteor.Error);
        expect(error.error).to.equal("not-authorized");
      }
    });
  });
}
