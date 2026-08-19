import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { PortfolioCollection } from "/imports/api/portfolio";
import { expect } from "chai";

// Register the server methods under test. `portfolios.update` is defined in
// main.js, so importing it populates Meteor.server.method_handlers under a
// plain `meteor test` run (which does not load the app's main.js by default).
import "./main.js";

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
  });
}
