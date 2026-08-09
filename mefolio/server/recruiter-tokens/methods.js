import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check } from "meteor/check";
import { RecruiterTokens } from "./collection";

Meteor.methods({
  /**
   * @param {string} portfolioId
   * @param {string} recruiterName
   * @param {Date|null|string} expiresAt
   * the string for expiresAt has to be a valid string for js' Date().
   * we shoulda used type script
   */
  async "tokens.generate"({
    portfolioId,
    recruiterName,
    expiresAt: provExpiresAt,
  }) {
    //Defining default values
    const DEFAULT_MONTHS_TILL_EXPIRY = 3;
    const DEFAULT_TOKEN_LENGTH = 10;

    if (!this.userId) throw new Meteor.Error("Not authorized");

    const token = Random.secret(DEFAULT_TOKEN_LENGTH);

    const defaultExpiry = new Date();
    defaultExpiry.setMonth(
      defaultExpiry.getMonth() + DEFAULT_MONTHS_TILL_EXPIRY,
    );

    const expiresAt = provExpiresAt ? new Date(provExpiresAt) : defaultExpiry;

    if (expiresAt < new Date())
      throw new Meteor.Error(
        "invalid-expiry",
        "Entered expiry date has passed. Please try again",
      );

    await RecruiterTokens.insertAsync({
      userId: this.userId,
      portfolioId,
      recruiterName: recruiterName,
      token,
      createdAt: new Date(),
      expiresAt,
    });

    return token;
  },

  async "recruiter.verifyAccess"({ portfolioId, accessCode }) {
    check(portfolioId, String);
    check(accessCode, String);

    // Query db collection for an active mathcing token
    const validToken = await RecruiterTokens.findOneAsync({
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
