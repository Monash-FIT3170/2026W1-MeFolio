import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { expect } from "chai";

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

      mockPortfolioId = "Token Tester portfolio id";
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
            expireAt: testDate,
          },
        );

        expect(token).to.exist;
        expect(token).to.be.a("string");
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
    });
  });
}
