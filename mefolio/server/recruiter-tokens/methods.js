import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check, Match } from "meteor/check";
import { RecruiterTokens, RecruiterVisits } from "./collection";
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

    // Query db collection for an active matching token
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

    // Capture the connection details here, where verifyAccess still holds the
    // recruiter's DDP connection. record() runs via a server-side Meteor.call,
    // where this.connection is null, so it cannot read these itself.
    const ip = this.connection?.clientAddress || null;
    const headers = this.connection?.httpHeaders || {};
    await Meteor.call("recruiterVisits.record", {
      portfolioId,
      accessCode,
      ip,
      metadata: {
        userAgent: headers["user-agent"] || null,
        referrer: headers["referer"] || null,
      },
    });

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
        "You must be logged in to view recruiter links.",
      );
    }

    check(portfolioId, String);

    // Verify the user owns this portfolio
    const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
    if (!portfolio) {
      throw new Meteor.Error("not-found", "Portfolio not found.");
    }

    if (portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only view recruiter links for your own portfolio.",
      );
    }

    // Return all tokens for this portfolio, sorted by creation date (newest first)
    return await RecruiterTokens.find(
      { portfolioId: portfolioId },
      { sort: { createdAt: -1 } },
    ).fetch();
  },

  /**
   * Records a visit event when a recruiter accesses a portfolio
   * This method should be called after token validation
   * @param {string} portfolioId The portfolio being accessed
   * @param {string} token The token used to access
   * @param {string} ip The server-side IP address (optional, will use connection if not provided)
   * @param {Object} metadata Additional visit metadata (userAgent, referrer, etc.)
   * @returns {string} The ID of the created visit record
   */
  async "recruiterVisits.record"({
    portfolioId,
    accessCode,
    ip = null,
    metadata = {},
  }) {
    check(portfolioId, String);
    check(accessCode, String);
    check(ip, Match.OneOf(String, null));
    check(metadata, Object);

    // Find the token to get recruiter info + ensure valid (not expired, not revoked)
    const tokenDoc = await RecruiterTokens.findOneAsync({
      portfolioId: portfolioId,
      token: accessCode,
      isRevoked: { $ne: true },
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new Meteor.Error(
        "invalid-token",
        "Token not found, expired, or revoked.",
      );
    }

    // Get connection details
    const clientIp = ip || this.connection?.clientAddress || null;
    const userAgent = this.connection?.httpHeaders?.["user-agent"] || null;
    const referrer = this.connection?.httpHeaders?.["referer"] || null;

    // Record the visit
    const visitId = await RecruiterVisits.insertAsync({
      portfolioId: portfolioId,
      token: accessCode,
      recruiterCompany: tokenDoc.recruiterName || "Unknown Company",
      tokenId: tokenDoc._id,
      createdAt: new Date(),
      // Store metadata to ensure nothing is overwritten, defaults to null
      // IP address, browser/device user agent, and referrer
      metadata: {
        ip: clientIp, // Server-side IP (from parameter or connection)
        userAgent: userAgent || metadata.userAgent || null,
        referrer: referrer || metadata.referrer || null,
        ...metadata,
      },
    });

    return visitId;
  },

  /**
   * Get visit statistics for a portfolio
   * Only the portfolio owner can view this
   * @param {string} portfolioId The portfolio to get stats for
   * @returns {Object} Statistics including total visits, unique recruiters, etc.
   */
  async "recruiterVisits.getStats"({ portfolioId }) {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to view visit statistics.",
      );
    }

    check(portfolioId, String);

    // Verify the user owns this portfolio
    const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
    if (!portfolio) {
      throw new Meteor.Error("not-found", "Portfolio not found.");
    }

    if (portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only view statistics for your own portfolio.",
      );
    }

    // Get all visits for this portfolio
    const visits = await RecruiterVisits.find(
      { portfolioId: portfolioId },
      { sort: { createdAt: -1 } },
    ).fetch();

    // Calculate statistics
    const totalVisits = visits.length;
    const uniqueRecruiters = new Set(visits.map((v) => v.token)).size;

    // OPTIONAL: Get visits in last 7 days (can be removed if unecessary)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentVisits = visits.filter((v) => v.createdAt > sevenDaysAgo);

    // Get top companies
    const companyStats = visits.reduce((acc, visit) => {
      const company = visit.recruiterCompany || "Unknown";
      acc[company] = (acc[company] || 0) + 1;
      return acc;
    }, {});

    const topCompanies = Object.entries(companyStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([company, count]) => ({ company, count }));

    return {
      totalVisits,
      uniqueRecruiters,
      recentVisits: recentVisits.length,
      topCompanies,
      visits: visits.slice(0, 50), // Return last 50 visits for easier viewing
    };
  },

  /**
   * Get visits for a specific token
   * Only the portfolio owner can view this
   * @param {string} token The token to get visits for
   * @returns {Array} Array of visit records
   */
  async "recruiterVisits.getTokenVisits"({ token }) {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to view visit information.",
      );
    }

    check(token, String);

    // Find the token to verify ownership
    const tokenDoc = await RecruiterTokens.findOneAsync({ token });
    if (!tokenDoc) {
      throw new Meteor.Error("not-found", "Token not found.");
    }

    // Verify the user owns the portfolio this token belongs to
    const portfolio = await PortfolioCollection.findOneAsync(
      tokenDoc.portfolioId,
    );
    if (!portfolio || portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only view visits for your own tokens.",
      );
    }

    // Get visits for this token
    return await RecruiterVisits.find(
      { tokenId: tokenDoc._id },
      { sort: { createdAt: -1 } },
    ).fetch();
  },

  /**
   * Clear all visit history for a portfolio
   * Only the portfolio owner can do this
   * OPTIONAL: can be removed if unecessary
   * @param {string} portfolioId The portfolio to clear history for
   * @returns {number} Number of records deleted
   */
  async "recruiterVisits.clearHistory"({ portfolioId }) {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to clear visit history.",
      );
    }

    check(portfolioId, String);

    // Verify the user owns this portfolio
    const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
    if (!portfolio) {
      throw new Meteor.Error("not-found", "Portfolio not found.");
    }

    if (portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only clear history for your own portfolio.",
      );
    }

    const count = await RecruiterVisits.removeAsync({
      portfolioId: portfolioId,
    });
    return count;
  },
});
