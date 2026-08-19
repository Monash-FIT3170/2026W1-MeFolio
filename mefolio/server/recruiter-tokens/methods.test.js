import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { PortfolioCollection } from "/imports/api/portfolio";
import { RecruiterTokens } from "./collection";
import { expect } from "chai";

// Register the methods under test. Without this, plain `meteor test` (which
// does not load server/main.js) leaves Meteor.server.method_handlers empty.
import "./methods";

if (Meteor.isServer) {
  describe("Recruiter token methods", function () {
    let mockUserId;
    let mockPortfolioId;
    let mockRecruiterName;

    before(async function () {
      mockUserId = await Accounts.createUserAsync({
        email: `recruiter-token-test-${Date.now()}@mefolio.com`,
        password: "password123",
        profile: { name: "Token Tester" },
      });

      // A real portfolio owned by the mock user, so the ownership check passes.
      mockPortfolioId = await PortfolioCollection.insertAsync({
        userId: mockUserId,
        title: "Token Tester Portfolio",
        createdAt: new Date(),
      });
      mockRecruiterName = "Token Tester Recruiter";
    });

    describe("tokens.generate", function () {
      it("generates a token", async function () {
        const handler = Meteor.server.method_handlers["tokens.generate"];

        const token = await handler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
          },
        );

        expect(token).to.exist;
        expect(token).to.be.a("string");
      });

      it("generates a token with a custom expiry date", async function () {
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + 5);

        const handler = Meteor.server.method_handlers["tokens.generate"];

        const token = await handler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
            expiresAt: testDate,
          },
        );

        expect(token).to.exist;
        expect(token).to.be.a("string");
      });

      it("throws when the caller is not logged in", async function () {
        const handler = Meteor.server.method_handlers["tokens.generate"];

        try {
          await handler.call(
            { userId: null, isSimulation: false, unblock() {} },
            {
              portfolioId: mockPortfolioId,
              recruiterName: mockRecruiterName,
            },
          );
          expect.fail("Expected tokens.generate to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
        }
      });

      it("rejects generating a token for a portfolio the user does not own", async function () {
        const handler = Meteor.server.method_handlers["tokens.generate"];

        try {
          await handler.call(
            { userId: mockUserId, isSimulation: false, unblock() {} },
            {
              portfolioId: "a-portfolio-that-does-not-belong-to-this-user",
              recruiterName: mockRecruiterName,
            },
          );
          expect.fail("Expected tokens.generate to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });
    });

    describe("recruiter.verifyAccess", function () {
      it("returns true for a valid token", async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        const verifyHandler =
          Meteor.server.method_handlers["recruiter.verifyAccess"];

        const accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
          },
        );

        const result = await verifyHandler.call(
          {
            userId: null,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            accessCode,
          },
        );

        expect(result).to.equal(true);
      });

      it("rejects an existing token for a different portfolio", async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        const verifyHandler =
          Meteor.server.method_handlers["recruiter.verifyAccess"];

        const accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
          },
        );

        const verifyPromise = verifyHandler.call(
          {
            userId: null,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: "different-portfolio-id",
            accessCode,
          },
        );

        try {
          await verifyPromise;
          expect.fail("Expected verifyAccess to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-access");
        }
      });

      it("rejects an expired token", async function () {
        const verifyHandler =
          Meteor.server.method_handlers["recruiter.verifyAccess"];

        const expiredCode = `expired-${Date.now()}`;
        const past = new Date();
        past.setDate(past.getDate() - 1);

        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: mockRecruiterName,
          token: expiredCode,
          createdAt: new Date(),
          expiresAt: past,
        });

        try {
          await verifyHandler.call(
            { userId: null, isSimulation: false, unblock() {} },
            { portfolioId: mockPortfolioId, accessCode: expiredCode },
          );
          expect.fail("Expected verifyAccess to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-access");
        }
      });

      it("rejects a token marked as isRevoked even if expiresAt is in the future", async function () {
        const verifyHandler =
          Meteor.server.method_handlers["recruiter.verifyAccess"];

        const revokedCode = `revoked-future-${Date.now()}`;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);

        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: mockRecruiterName,
          token: revokedCode,
          createdAt: new Date(),
          expiresAt: futureDate,
          isRevoked: true,
        });

        try {
          await verifyHandler.call(
            { userId: null, isSimulation: false, unblock() {} },
            { portfolioId: mockPortfolioId, accessCode: revokedCode },
          );
          expect.fail("Expected verifyAccess to reject a revoked token");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-access");
        }
      });
    });

    describe("recruiterLinks.revoke", function () {
      it("revokes an active token and invalidates it immediately", async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        const verifyHandler =
          Meteor.server.method_handlers["recruiter.verifyAccess"];
        const revokeHandler =
          Meteor.server.method_handlers["recruiterLinks.revoke"];

        const accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
          },
        );

        const initialVerification = await verifyHandler.call(
          {
            userId: null,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            accessCode,
          },
        );
        expect(initialVerification).to.equal(true);

        const revokeResult = await revokeHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { token: accessCode },
        );
        expect(revokeResult).to.equal(true);

        try {
          await verifyHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            {
              portfolioId: mockPortfolioId,
              accessCode,
            },
          );
          expect.fail("Expected verifyAccess to throw after token revocation");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-access");
        }
      });

      it("successfully revokes an active token using tokenId instead of token string", async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        const revokeHandler =
          Meteor.server.method_handlers["recruiterLinks.revoke"];

        const accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
          },
        );

        const tokenDoc = await RecruiterTokens.findOneAsync({
          token: accessCode,
        });
        expect(tokenDoc).to.exist;

        const revokeResult = await revokeHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { tokenId: tokenDoc._id },
        );
        expect(revokeResult).to.equal(true);

        const updatedDoc = await RecruiterTokens.findOneAsync(tokenDoc._id);
        expect(updatedDoc.isRevoked).to.equal(true);
      });

      it("throws invalid-arguments error if neither tokenId nor token is passed", async function () {
        const revokeHandler =
          Meteor.server.method_handlers["recruiterLinks.revoke"];

        try {
          await revokeHandler.call(
            { userId: mockUserId, isSimulation: false, unblock() {} },
            {},
          );
          expect.fail(
            "Expected recruiterLinks.revoke to throw invalid-arguments",
          );
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-arguments");
        }
      });

      it("throws when the caller is not logged in", async function () {
        const revokeHandler =
          Meteor.server.method_handlers["recruiterLinks.revoke"];

        try {
          await revokeHandler.call(
            { userId: null, isSimulation: false, unblock() {} },
            { token: "some-token" },
          );
          expect.fail(
            "Expected recruiterLinks.revoke to throw for unauthenticated user",
          );
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("rejects revoking a token that belongs to another user", async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        const revokeHandler =
          Meteor.server.method_handlers["recruiterLinks.revoke"];

        const accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
          },
        );

        try {
          await revokeHandler.call(
            {
              userId: "unauthorized-user-id",
              isSimulation: false,
              unblock() {},
            },
            { token: accessCode },
          );
          expect.fail(
            "Expected recruiterLinks.revoke to throw when trying to revoke another user's token",
          );
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-found");
        }
      });
    });

    describe("recruiterLinks.list", function () {
      it("returns all tokens for a portfolio the user owns", async function () {
        const handler = Meteor.server.method_handlers["recruiterLinks.list"];

        // Create some test tokens
        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: "Recruiter 1",
          token: "TEST-TOKEN-1",
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60000),
          isRevoked: false,
        });

        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: "Recruiter 2",
          token: "TEST-TOKEN-2",
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60000),
          isRevoked: false,
        });

        const result = await handler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { portfolioId: mockPortfolioId },
        );

        expect(result).to.be.an("array");
        expect(result.length).to.be.at.least(2);

        // Verify the tokens are in the result
        const tokenStrings = result.map((t) => t.token);
        expect(tokenStrings).to.include("TEST-TOKEN-1");
        expect(tokenStrings).to.include("TEST-TOKEN-2");
      });

      it("returns empty array for a portfolio with no tokens", async function () {
        const handler = Meteor.server.method_handlers["recruiterLinks.list"];

        // Create a new portfolio with no tokens
        const emptyPortfolioId = await PortfolioCollection.insertAsync({
          userId: mockUserId,
          title: "Empty Portfolio",
          createdAt: new Date(),
        });

        const result = await handler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { portfolioId: emptyPortfolioId },
        );

        expect(result).to.be.an("array");
        expect(result.length).to.equal(0);
      });

      it("includes revoked tokens in the list", async function () {
        const handler = Meteor.server.method_handlers["recruiterLinks.list"];

        // Create a revoked token
        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: "Revoked Recruiter",
          token: "REVOKED-TOKEN-1",
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60000),
          isRevoked: true,
          revokedAt: new Date(),
        });

        const result = await handler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { portfolioId: mockPortfolioId },
        );

        const revokedTokens = result.filter((t) => t.isRevoked === true);
        expect(revokedTokens.length).to.be.at.least(1);
        expect(revokedTokens[0].token).to.equal("REVOKED-TOKEN-1");
      });

      it("returns tokens sorted by createdAt descending (newest first)", async function () {
        const handler = Meteor.server.method_handlers["recruiterLinks.list"];

        // Clear existing tokens for this portfolio
        await RecruiterTokens.removeAsync({ portfolioId: mockPortfolioId });

        // Create tokens with different dates
        const oldDate = new Date(Date.now() - 86400000 * 2); // 2 days ago
        const recentDate = new Date(Date.now() - 3600000); // 1 hour ago

        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: "Old Recruiter",
          token: "OLD-TOKEN",
          createdAt: oldDate,
          expiresAt: new Date(Date.now() + 60000),
          isRevoked: false,
        });

        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: "New Recruiter",
          token: "NEW-TOKEN",
          createdAt: recentDate,
          expiresAt: new Date(Date.now() + 60000),
          isRevoked: false,
        });

        const result = await handler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { portfolioId: mockPortfolioId },
        );

        expect(result).to.be.an("array");
        expect(result.length).to.be.at.least(2);

        // The first token should be the newest (NEW-TOKEN)
        expect(result[0].token).to.equal("NEW-TOKEN");
      });

      it("throws not-authorized error when user is not logged in", async function () {
        const handler = Meteor.server.method_handlers["recruiterLinks.list"];

        try {
          await handler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: mockPortfolioId },
          );
          expect.fail("Expected recruiterLinks.list to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("throws not-authorized error when user does not own the portfolio", async function () {
        const handler = Meteor.server.method_handlers["recruiterLinks.list"];

        // Create a portfolio owned by another user
        const otherUserId = await Accounts.createUserAsync({
          email: `other-user-${Date.now()}@mefolio.com`,
          password: "password123",
        });

        const otherPortfolioId = await PortfolioCollection.insertAsync({
          userId: otherUserId,
          title: "Other User Portfolio",
          createdAt: new Date(),
        });

        try {
          await handler.call(
            {
              userId: mockUserId,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: otherPortfolioId },
          );
          expect.fail("Expected recruiterLinks.list to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("throws not-found error when portfolio does not exist", async function () {
        const handler = Meteor.server.method_handlers["recruiterLinks.list"];

        try {
          await handler.call(
            {
              userId: mockUserId,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: "non-existent-portfolio-id" },
          );
          expect.fail("Expected recruiterLinks.list to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-found");
        }
      });
    });
  });
}
