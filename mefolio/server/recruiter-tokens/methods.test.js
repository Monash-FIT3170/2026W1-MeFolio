import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { PortfolioCollection } from "/imports/api/portfolio";
import { RecruiterTokens, RecruiterVisits } from "./collection";
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

      it("denies access immediately after a token expires", async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        const verifyHandler =
          Meteor.server.method_handlers["recruiter.verifyAccess"];

        //expire in 200ms
        const expiresAt = new Date(Date.now() + 200);

        const accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: mockRecruiterName,
            expiresAt,
          },
        );

        // Confirm the token is valid before it expires.
        const beforeExpiry = await verifyHandler.call(
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

        expect(beforeExpiry).to.equal(true);

        // Wait until the expiry time has passed.
        const waitUntil = expiresAt.getTime() - Date.now();

        if (waitUntil > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitUntil + 20));
        }

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

          expect.fail("Expected expired token to be rejected");
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

    describe("recruiterVisits.record", function () {
      let accessCode;
      let tokenDoc;

      beforeEach(async function () {
        // Generate a token for testing
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: "Test Recruiter Company",
          },
        );
        tokenDoc = await RecruiterTokens.findOneAsync({ token: accessCode });
      });

      afterEach(async function () {
        // Clean up visits created during tests
        await RecruiterVisits.removeAsync({ portfolioId: mockPortfolioId });
      });

      it("records a visit successfully", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        const visitId = await recordHandler.call(
          {
            userId: null,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            accessCode: accessCode,
          },
        );

        expect(visitId).to.exist;
        expect(visitId).to.be.a("string");

        // Verify the visit was inserted
        const visit = await RecruiterVisits.findOneAsync(visitId);
        expect(visit).to.exist;
        expect(visit.portfolioId).to.equal(mockPortfolioId);
        expect(visit.token).to.equal(accessCode);
        expect(visit.recruiterCompany).to.equal("Test Recruiter Company");
        expect(visit.tokenId).to.equal(tokenDoc._id);
        expect(visit.createdAt).to.exist;
        expect(visit.metadata).to.exist;
      });

      it("records a visit with metadata", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        const metadata = {
          ip: "192.168.1.1",
          userAgent: "Mozilla/5.0 (Test Browser)",
          referrer: "https://linkedin.com",
          customField: "custom-value",
        };

        const visitId = await recordHandler.call(
          {
            userId: null,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            accessCode: accessCode,
            metadata: metadata,
          },
        );

        expect(visitId).to.exist;

        const visit = await RecruiterVisits.findOneAsync(visitId);
        expect(visit.metadata.ip).to.equal("192.168.1.1");
        expect(visit.metadata.userAgent).to.equal("Mozilla/5.0 (Test Browser)");
        expect(visit.metadata.referrer).to.equal("https://linkedin.com");
        expect(visit.metadata.customField).to.equal("custom-value");
      });

      it("records visit with server-side IP from connection", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        const mockConnection = {
          clientAddress: "192.168.1.100",
          httpHeaders: {
            "user-agent": "Mozilla/5.0 (Test Browser)",
            referer: "https://example.com",
          },
        };

        // Mock the connection
        const originalConnection = this.connection;
        this.connection = mockConnection;

        try {
          const visitId = await recordHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
              connection: mockConnection,
            },
            {
              portfolioId: mockPortfolioId,
              accessCode: accessCode,
            },
          );

          expect(visitId).to.exist;

          const visit = await RecruiterVisits.findOneAsync(visitId);
          expect(visit.metadata.ip).to.equal("192.168.1.100");
          expect(visit.metadata.userAgent).to.equal(
            "Mozilla/5.0 (Test Browser)",
          );
          expect(visit.metadata.referrer).to.equal("https://example.com");
        } finally {
          // Restore original connection
          this.connection = originalConnection;
        }
      });

      it("uses provided IP when connection is not available", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        const visitId = await recordHandler.call(
          {
            userId: null,
            isSimulation: false,
            unblock() {},
            connection: null, // No connection
          },
          {
            portfolioId: mockPortfolioId,
            accessCode: accessCode,
            ip: "203.0.113.1",
          },
        );

        expect(visitId).to.exist;

        const visit = await RecruiterVisits.findOneAsync(visitId);
        expect(visit.metadata.ip).to.equal("203.0.113.1");
      });

      it("throws error when token is not found", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        try {
          await recordHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            {
              portfolioId: mockPortfolioId,
              accessCode: "invalid-token",
            },
          );
          expect.fail("Expected recruiterVisits.record to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-token");
        }
      });

      it("throws error when token belongs to different portfolio", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        try {
          await recordHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            {
              portfolioId: "different-portfolio-id",
              accessCode: accessCode,
            },
          );
          expect.fail("Expected recruiterVisits.record to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-token");
        }
      });

      it("throws error when token is expired", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        // Create an expired token
        const expiredCode = `expired-${Date.now()}`;
        const past = new Date();
        past.setDate(past.getDate() - 1);

        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: "Expired Recruiter",
          token: expiredCode,
          createdAt: new Date(),
          expiresAt: past,
          isRevoked: false,
        });

        try {
          await recordHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            {
              portfolioId: mockPortfolioId,
              accessCode: expiredCode,
            },
          );
          expect.fail("Expected recruiterVisits.record to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-token");
        }

        // Verify no visit was recorded
        const visits = await RecruiterVisits.find({
          portfolioId: mockPortfolioId,
        }).fetch();
        expect(visits.length).to.equal(0);
      });

      it("throws error when token is revoked", async function () {
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        // Create a revoked token
        const revokedCode = `revoked-${Date.now()}`;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);

        await RecruiterTokens.insertAsync({
          userId: mockUserId,
          portfolioId: mockPortfolioId,
          recruiterName: "Revoked Recruiter",
          token: revokedCode,
          createdAt: new Date(),
          expiresAt: futureDate,
          isRevoked: true,
        });

        try {
          await recordHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            {
              portfolioId: mockPortfolioId,
              accessCode: revokedCode,
            },
          );
          expect.fail("Expected recruiterVisits.record to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("invalid-token");
        }

        // Verify no visit was recorded
        const visits = await RecruiterVisits.find({
          portfolioId: mockPortfolioId,
        }).fetch();
        expect(visits.length).to.equal(0);
      });
    });

    describe("recruiterVisits.getStats", function () {
      let accessCode1, accessCode2;

      beforeEach(async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];

        // Create two tokens
        accessCode1 = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: "Google",
          },
        );

        accessCode2 = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: "Atlassian",
          },
        );

        // Create some visits
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        await recordHandler.call(
          { userId: null, isSimulation: false, unblock() {} },
          { portfolioId: mockPortfolioId, accessCode: accessCode1 },
        );

        await recordHandler.call(
          { userId: null, isSimulation: false, unblock() {} },
          { portfolioId: mockPortfolioId, accessCode: accessCode1 },
        );

        await recordHandler.call(
          { userId: null, isSimulation: false, unblock() {} },
          { portfolioId: mockPortfolioId, accessCode: accessCode2 },
        );
      });

      afterEach(async function () {
        await RecruiterVisits.removeAsync({ portfolioId: mockPortfolioId });
      });

      it("returns visit statistics for a portfolio the user owns", async function () {
        const statsHandler =
          Meteor.server.method_handlers["recruiterVisits.getStats"];

        const stats = await statsHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { portfolioId: mockPortfolioId },
        );

        expect(stats).to.exist;
        expect(stats.totalVisits).to.equal(3);
        expect(stats.uniqueRecruiters).to.equal(2);
        expect(stats.recentVisits).to.be.a("number");
        expect(stats.topCompanies).to.be.an("array");
        expect(stats.visits).to.be.an("array");
        expect(stats.visits.length).to.equal(3);
      });

      it("returns top companies sorted by visit count", async function () {
        const statsHandler =
          Meteor.server.method_handlers["recruiterVisits.getStats"];

        const stats = await statsHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { portfolioId: mockPortfolioId },
        );

        expect(stats.topCompanies).to.be.an("array");
        expect(stats.topCompanies.length).to.be.at.least(2);
        // Google should be first with 2 visits
        expect(stats.topCompanies[0].company).to.equal("Google");
        expect(stats.topCompanies[0].count).to.equal(2);
      });

      it("throws not-authorized error when user is not logged in", async function () {
        const statsHandler =
          Meteor.server.method_handlers["recruiterVisits.getStats"];

        try {
          await statsHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: mockPortfolioId },
          );
          expect.fail("Expected recruiterVisits.getStats to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("throws not-authorized error when user does not own the portfolio", async function () {
        const statsHandler =
          Meteor.server.method_handlers["recruiterVisits.getStats"];

        const otherUserId = await Accounts.createUserAsync({
          email: `other-stats-user-${Date.now()}@mefolio.com`,
          password: "password123",
        });

        try {
          await statsHandler.call(
            {
              userId: otherUserId,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: mockPortfolioId },
          );
          expect.fail("Expected recruiterVisits.getStats to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("throws not-found error when portfolio does not exist", async function () {
        const statsHandler =
          Meteor.server.method_handlers["recruiterVisits.getStats"];

        try {
          await statsHandler.call(
            {
              userId: mockUserId,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: "non-existent-portfolio" },
          );
          expect.fail("Expected recruiterVisits.getStats to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-found");
        }
      });
    });

    describe("recruiterVisits.getTokenVisits", function () {
      let accessCode;

      beforeEach(async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];

        accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: "Microsoft",
          },
        );

        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        // Create multiple visits for the same token
        await recordHandler.call(
          { userId: null, isSimulation: false, unblock() {} },
          { portfolioId: mockPortfolioId, accessCode: accessCode },
        );

        await recordHandler.call(
          { userId: null, isSimulation: false, unblock() {} },
          { portfolioId: mockPortfolioId, accessCode: accessCode },
        );
      });

      afterEach(async function () {
        await RecruiterVisits.removeAsync({ portfolioId: mockPortfolioId });
      });

      it("returns visits for a specific token the user owns", async function () {
        const tokenVisitsHandler =
          Meteor.server.method_handlers["recruiterVisits.getTokenVisits"];

        const visits = await tokenVisitsHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { token: accessCode },
        );

        expect(visits).to.be.an("array");
        expect(visits.length).to.equal(2);
        expect(visits[0].token).to.equal(accessCode);
        expect(visits[0].recruiterCompany).to.equal("Microsoft");
      });

      it("throws not-authorized error when user is not logged in", async function () {
        const tokenVisitsHandler =
          Meteor.server.method_handlers["recruiterVisits.getTokenVisits"];

        try {
          await tokenVisitsHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            { token: accessCode },
          );
          expect.fail("Expected recruiterVisits.getTokenVisits to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("throws not-found error when token does not exist", async function () {
        const tokenVisitsHandler =
          Meteor.server.method_handlers["recruiterVisits.getTokenVisits"];

        try {
          await tokenVisitsHandler.call(
            {
              userId: mockUserId,
              isSimulation: false,
              unblock() {},
            },
            { token: "non-existent-token" },
          );
          expect.fail("Expected recruiterVisits.getTokenVisits to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-found");
        }
      });

      it("throws not-authorized error when token belongs to another user", async function () {
        const tokenVisitsHandler =
          Meteor.server.method_handlers["recruiterVisits.getTokenVisits"];

        const otherUserId = await Accounts.createUserAsync({
          email: `other-token-user-${Date.now()}@mefolio.com`,
          password: "password123",
        });

        try {
          await tokenVisitsHandler.call(
            {
              userId: otherUserId,
              isSimulation: false,
              unblock() {},
            },
            { token: accessCode },
          );
          expect.fail("Expected recruiterVisits.getTokenVisits to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });
    });

    describe("recruiterVisits.clearHistory", function () {
      beforeEach(async function () {
        const generateHandler =
          Meteor.server.method_handlers["tokens.generate"];
        const recordHandler =
          Meteor.server.method_handlers["recruiterVisits.record"];

        const accessCode = await generateHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          {
            portfolioId: mockPortfolioId,
            recruiterName: "Test Company",
          },
        );

        // Create some visits
        await recordHandler.call(
          { userId: null, isSimulation: false, unblock() {} },
          { portfolioId: mockPortfolioId, accessCode: accessCode },
        );

        await recordHandler.call(
          { userId: null, isSimulation: false, unblock() {} },
          { portfolioId: mockPortfolioId, accessCode: accessCode },
        );
      });

      afterEach(async function () {
        await RecruiterVisits.removeAsync({ portfolioId: mockPortfolioId });
      });

      it("clears all visit history for a portfolio the user owns", async function () {
        const clearHandler =
          Meteor.server.method_handlers["recruiterVisits.clearHistory"];

        // Verify visits exist
        const visitsBefore = await RecruiterVisits.find({
          portfolioId: mockPortfolioId,
        }).fetch();
        expect(visitsBefore.length).to.equal(2);

        // Clear history
        const count = await clearHandler.call(
          {
            userId: mockUserId,
            isSimulation: false,
            unblock() {},
          },
          { portfolioId: mockPortfolioId },
        );

        expect(count).to.equal(2);

        // Verify visits are gone
        const visitsAfter = await RecruiterVisits.find({
          portfolioId: mockPortfolioId,
        }).fetch();
        expect(visitsAfter.length).to.equal(0);
      });

      it("throws not-authorized error when user is not logged in", async function () {
        const clearHandler =
          Meteor.server.method_handlers["recruiterVisits.clearHistory"];

        try {
          await clearHandler.call(
            {
              userId: null,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: mockPortfolioId },
          );
          expect.fail("Expected recruiterVisits.clearHistory to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("throws not-authorized error when user does not own the portfolio", async function () {
        const clearHandler =
          Meteor.server.method_handlers["recruiterVisits.clearHistory"];

        const otherUserId = await Accounts.createUserAsync({
          email: `other-clear-user-${Date.now()}@mefolio.com`,
          password: "password123",
        });

        try {
          await clearHandler.call(
            {
              userId: otherUserId,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: mockPortfolioId },
          );
          expect.fail("Expected recruiterVisits.clearHistory to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-authorized");
        }
      });

      it("throws not-found error when portfolio does not exist", async function () {
        const clearHandler =
          Meteor.server.method_handlers["recruiterVisits.clearHistory"];

        try {
          await clearHandler.call(
            {
              userId: mockUserId,
              isSimulation: false,
              unblock() {},
            },
            { portfolioId: "non-existent-portfolio" },
          );
          expect.fail("Expected recruiterVisits.clearHistory to throw");
        } catch (error) {
          expect(error).to.be.instanceOf(Meteor.Error);
          expect(error.error).to.equal("not-found");
        }
      });
    });
  });
}
