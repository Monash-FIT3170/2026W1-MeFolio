// Publishes a portfolio's published content and recruiter-only details to a
// recruiter holding a valid, unexpired access token.
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { RecruiterTokens } from "./collection";
import { PortfolioCollection } from "/imports/api/portfolio";

if (Meteor.isServer) {
  Meteor.publish(
    "portfolio.recruiterView",
    async function (portfolioId, token) {
      check(portfolioId, String);
      check(token, String);

      // Verify the token exists and is valid for this specific portfolio
      const validToken = await RecruiterTokens.findOneAsync({
        portfolioId: portfolioId,
        token: token,
        isRevoked: { $ne: true },
        expiresAt: { $gt: new Date() }, // Double check it hasn't expired
      });

      // Return nothing if token is invalid
      if (!validToken) {
        return this.ready();
      }

      // Only expose the published snapshot and the recruiter-only details — never
      // the unpublished draft content that lives on the top-level portfolio fields.
      return [
        PortfolioCollection.find(
          { _id: portfolioId },
          { fields: { publishedContent: 1, recruiterInfo: 1 } },
        ),
      ];
    },
  );
}
