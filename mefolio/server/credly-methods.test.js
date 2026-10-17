import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { PortfolioCollection } from "/imports/api/portfolio";
import "./credly-methods.js";

if (Meteor.isServer) {
  describe("users.syncCredlyCertifications", function () {
    const userId = `credly-sync-${Date.now()}`;
    let originalFetch;
    let portfolioId;

    const sync = () =>
      Meteor.server.method_handlers["users.syncCredlyCertifications"].call({
        userId,
        isSimulation: false,
        unblock() {},
      });

    beforeEach(async function () {
      originalFetch = globalThis.fetch;
      await Meteor.users.insertAsync({
        _id: userId,
        profile: { credlyUsername: "test-user" },
      });
      portfolioId = await PortfolioCollection.insertAsync({
        userId,
        badges: [{ title: "Existing Badge" }],
        certifications: [{ title: "Manual Certification", source: "manual" }],
      });
    });

    afterEach(async function () {
      globalThis.fetch = originalFetch;
      await PortfolioCollection.removeAsync(portfolioId);
      await Meteor.users.removeAsync(userId);
    });

    it("adds Credly certifications without duplicating or changing badges", async function () {
      globalThis.fetch = async () => ({
        status: 200,
        ok: true,
        json: async () => ({
          data: [
            {
              id: "badge-123",
              badge_template: { name: "Example Badge" },
            },
          ],
        }),
      });

      await sync();
      await sync();

      const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
      expect(portfolio.certifications).to.have.lengthOf(2);
      expect(portfolio.certifications[0].title).to.equal(
        "Manual Certification",
      );
      expect(portfolio.certifications[1]).to.include({
        title: "Example Badge",
        verificationUrl: "https://www.credly.com/badges/badge-123",
        source: "credly",
      });
      expect(portfolio.badges).to.deep.equal([{ title: "Existing Badge" }]);
    });
  });
}
