import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { expect } from "chai";
import { PortfolioCollection } from "/imports/api/portfolio";
import { RecruiterVisits } from "./collection";

// Register the publication under test. Without this, plain `meteor test` (which
// does not load server/main.js) leaves Meteor.server.publish_handlers empty.
import "./visit-notifications";

if (Meteor.isServer) {
  describe("recruiterVisits.forOwner publication", function () {
    let ownerId;
    let otherId;
    let ownerPortfolioId;
    let otherPortfolioId;
    const stamp = `${Date.now()}-${Math.random()}`;

    before(async function () {
      ownerId = await Accounts.createUserAsync({
        email: `visit-owner-${stamp}@mefolio.com`,
        password: "password123",
      });
      otherId = await Accounts.createUserAsync({
        email: `visit-other-${stamp}@mefolio.com`,
        password: "password123",
      });

      ownerPortfolioId = await PortfolioCollection.insertAsync({
        userId: ownerId,
        title: "Owner Portfolio",
        createdAt: new Date(),
      });
      otherPortfolioId = await PortfolioCollection.insertAsync({
        userId: otherId,
        title: "Other Portfolio",
        createdAt: new Date(),
      });

      await RecruiterVisits.insertAsync({
        portfolioId: ownerPortfolioId,
        token: "OWNER-CODE",
        recruiterCompany: "Acme",
        createdAt: new Date(),
      });
      await RecruiterVisits.insertAsync({
        portfolioId: otherPortfolioId,
        token: "OTHER-CODE",
        recruiterCompany: "Globex",
        createdAt: new Date(),
      });
    });

    const runHandler = async (userId) => {
      const handler =
        Meteor.server.publish_handlers["recruiterVisits.forOwner"];
      let readyCalled = false;
      const result = await handler.call({
        userId,
        ready: () => {
          readyCalled = true;
        },
      });
      return { result, readyCalled };
    };

    it("publishes the owner's own recruiter visits", async function () {
      const { result } = await runHandler(ownerId);
      const visits = await result.fetchAsync();
      const portfolioIds = visits.map((v) => v.portfolioId);
      expect(portfolioIds).to.include(ownerPortfolioId);
    });

    it("does not expose another owner's visits", async function () {
      const { result } = await runHandler(ownerId);
      const visits = await result.fetchAsync();
      const portfolioIds = visits.map((v) => v.portfolioId);
      expect(portfolioIds).to.not.include(otherPortfolioId);
    });

    it("publishes nothing when not logged in", async function () {
      const { result, readyCalled } = await runHandler(null);
      expect(readyCalled).to.equal(true);
      expect(result).to.equal(undefined);
    });
  });
}
