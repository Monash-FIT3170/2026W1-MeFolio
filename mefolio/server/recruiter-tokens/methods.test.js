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
  });
}
