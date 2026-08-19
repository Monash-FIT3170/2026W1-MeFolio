import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check } from "meteor/check";
import { RecruiterTokens } from "./collection";
import { PortfolioCollection } from "/imports/api/portfolio";

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

    check(portfolioId, String);
    check(recruiterName, String);

    // Only the portfolio owner may issue access tokens for it.
    const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
    if (!portfolio || portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You may only generate access codes for your own portfolio.",
      );
    }

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
      isRevoked: false,
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
      isRevoked: { $ne: true },
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

  /**
   * Immediately revokes and invalidates a recruiter access token.
   * Accepts either { tokenId } or { token }.
   */
  async "recruiterLinks.revoke"({ tokenId, token } = {}) {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to revoke a link.",
      );
    }

    const query = { userId: this.userId };
    if (tokenId) {
      check(tokenId, String);
      query._id = tokenId;
    } else if (token) {
      check(token, String);
      query.token = token;
    } else {
      throw new Meteor.Error(
        "invalid-arguments",
        "Either tokenId or token must be provided.",
      );
    }

    const existingToken = await RecruiterTokens.findOneAsync(query);
    if (!existingToken) {
      throw new Meteor.Error(
        "not-found",
        "Token not found or you do not have permission to revoke it.",
      );
    }

    // Invalidate immediately by setting expiresAt to the past
    await RecruiterTokens.updateAsync(existingToken._id, {
      $set: {
        expiresAt: new Date(),
        isRevoked: true,
      },
    });

    return true;
  },

  /**
   * Lists all recruiter access tokens for a given portfolio.
   * Only the portfolio owner can view the list.
   */
  async "recruiterLinks.list"({ portfolioId }) {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to view recruiter links."
      );
    }

    check(portfolioId, String);

    // Verify the user owns this portfolio
    const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
    if (!portfolio) {
      throw new Meteor.Error(
        "not-found",
        "Portfolio not found."
      );
    }

    if (portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only view recruiter links for your own portfolio."
      );
    }

    // Return all tokens for this portfolio, sorted by creation date (newest first)
    return await RecruiterTokens.find(
      { portfolioId: portfolioId },
      { sort: { createdAt: -1 } }
    ).fetch();
  },
});
