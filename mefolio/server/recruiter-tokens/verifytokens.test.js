import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { expect } from "chai";
import { PortfolioCollection } from "/imports/api/portfolio";
import { RecruiterTokens } from "./collection";

// Register the publication under test. Without this, plain `meteor test` (which
// does not load server/main.js) leaves Meteor.server.publish_handlers empty.
import "./verifytokens";

if (Meteor.isServer) {
  describe("portfolio.recruiterView publication", function () {
    let portfolioId;
    let userId;
    const validToken = `pub-test-${Date.now()}`;

    before(async function () {
      userId = await Accounts.createUserAsync({
        email: `recruiter-pub-test-${Date.now()}@mefolio.com`,
        password: "password123",
        profile: { name: "Pub Tester" },
      });

      portfolioId = await PortfolioCollection.insertAsync({
        userId,
        title: "Pub Test Portfolio",
        // A draft-only top-level field that must NOT reach the recruiter.
        profile: { fullName: "Secret Draft Name" },
        publishedContent: { title: "Published Title" },
        recruiterInfo: { salaryExpectation: "$100k", accessCode: validToken },
        createdAt: new Date(),
      });

      await RecruiterTokens.insertAsync({
        portfolioId,
        token: validToken,
        recruiterName: "Pub Tester",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
      });
    });

    const runHandler = async (pid, token) => {
      const handler = Meteor.server.publish_handlers["portfolio.recruiterView"];
      let readyCalled = false;
      const cursors = await handler.call(
        {
          userId: null,
          ready: () => {
            readyCalled = true;
          },
        },
        pid,
        token,
      );
      return { cursors, readyCalled };
    };

    it("publishes nothing for an invalid token", async function () {
      const { cursors, readyCalled } = await runHandler(
        portfolioId,
        "wrong-token",
      );
      expect(readyCalled).to.equal(true);
      expect(cursors).to.not.be.an("array");
    });

    it("publishes nothing for an expired token", async function () {
      const expiredToken = `expired-${Date.now()}`;
      await RecruiterTokens.insertAsync({
        portfolioId,
        token: expiredToken,
        recruiterName: "Pub Tester",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 1000),
      });

      const { cursors, readyCalled } = await runHandler(
        portfolioId,
        expiredToken,
      );
      expect(readyCalled).to.equal(true);
      expect(cursors).to.not.be.an("array");
    });

    it("publishes nothing for a revoked token even if expiresAt is in the future", async function () {
      const revokedToken = `revoked-pub-${Date.now()}`;
      await RecruiterTokens.insertAsync({
        portfolioId,
        token: revokedToken,
        recruiterName: "Pub Tester",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60000),
        isRevoked: true,
      });

      const { cursors, readyCalled } = await runHandler(
        portfolioId,
        revokedToken,
      );
      expect(readyCalled).to.equal(true);
      expect(cursors).to.not.be.an("array");
    });

    it("publishes only published content and recruiter info for a valid token", async function () {
      const { cursors } = await runHandler(portfolioId, validToken);
      expect(cursors).to.be.an("array").with.lengthOf(1);

      const docs = await cursors[0].fetchAsync();
      expect(docs).to.have.lengthOf(1);

      const doc = docs[0];
      expect(doc.publishedContent).to.exist;
      expect(doc.recruiterInfo).to.exist;
      // The unpublished draft fields must be stripped.
      expect(doc.profile).to.be.undefined;
      expect(doc.title).to.be.undefined;
    });
  });
}
