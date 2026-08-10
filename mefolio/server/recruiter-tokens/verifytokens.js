// Publishes a portfolio's full recruiter-only view, gated on a valid token.
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { RecruiterTokens } from "./collection";
import { PortfolioCollection } from "/imports/api/portfolio";

Meteor.publish("portfolio.recruiterView", async function (portfolioId, token) {
  check(portfolioId, String);
  check(token, String);

  // Verify the token exists and is valid for this specific portfolio
  const validToken = await RecruiterTokens.findOneAsync({
    portfolioId: portfolioId,
    token: token,
    expiresAt: { $gt: new Date() }, // Double check it hasn't expired
  });

  // Return nothing if token is invalid
  if (!validToken) {
    return this.ready();
  }

  return [
    PortfolioCollection.find({ _id: portfolioId }), // Return the full hidden recruiter portfolio
  ];
});
