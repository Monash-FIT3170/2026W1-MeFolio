import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check } from "meteor/check";
import { RecruiterTokens } from "./collection";

Meteor.methods({
  "tokens.generate"({ portfolioId, recruiterName }) {
    if (!this.userId) throw new Meteor.Error("Not authorized");

    // Generates a random, secure 10-character alphanumeric string
    const token = Random.secret(10);

    // Set expiry (set to 3 months)
    const expiresAt = new Date(); // Can be changed to hours/days for testing
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    RecruiterTokens.insert({
      userId: this.userId,
      portfolioId, // changed from portfolio number to portfolio mongo _id
      recruiterName: recruiterName,
      token,
      createdAt: new Date(),
      expiresAt,
    });

    return token;
  },

  "recruiter.verifyAccess"({ portfolioId, accessCode }) {
    check(portfolioId, String);
    check(accessCode, String);

    // Query db collection for an active mathcing token
    const validToken = RecruiterTokens.findOne({
      portfolioId: portfolioId,
      token: accessCode,
      expiresAt: { $gt: new Date() },
    });

    // Throw error if no valid token found
    if (!validToken) {
      throw new Meteor.Error(
        "invalid-access",
        "Incorrect or expired access code. Please try again.",
      );
    }

    // Valid token found
    return true;
  },
});
