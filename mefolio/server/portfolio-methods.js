import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";

// Portfolio methods kept in their own module (rather than main.js) so tests can
// import them without pulling in the app seed and OAuth config, which need
// Meteor.settings to be present.
Meteor.methods({
  async "portfolios.update"(portfolioId, updates) {
    check(portfolioId, String);
    check(updates, Object);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to update a portfolio.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
    if (!portfolio) {
      throw new Meteor.Error("not-found", "Portfolio not found.");
    }

    if (portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only update your own portfolio.",
      );
    }

    const safeUpdates = { ...updates };
    delete safeUpdates.userId;
    delete safeUpdates._id;
    delete safeUpdates.username;

    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: safeUpdates,
    });
  },

  async "portfolios.setUsername"(portfolioId, username) {
    check(portfolioId, String);
    check(username, String);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to customise your portfolio URL.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync(portfolioId);

    if (!portfolio) {
      throw new Meteor.Error("not-found", "Portfolio not found.");
    }

    if (portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can only customise the URL for your own portfolio.",
      );
    }

    const slugPattern = /^[a-z0-9-]+$/;

    if (
      username.length < 3 ||
      username.length > 40 ||
      !slugPattern.test(username) ||
      username.startsWith("-") ||
      username.endsWith("-")
    ) {
      throw new Meteor.Error(
        "invalid-username",
        "Custom URL must be 3–40 characters and contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.",
      );
    }

    const existingPortfolio = await PortfolioCollection.findOneAsync({
      username,
      _id: { $ne: portfolioId },
    });

    if (existingPortfolio) {
      throw new Meteor.Error(
        "username-taken",
        "This custom URL is already taken.",
      );
    }

    try {
      return await PortfolioCollection.updateAsync(portfolioId, {
        $set: { username },
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw new Meteor.Error(
          "username-taken",
          "This custom URL is already taken.",
        );
      }

      throw error;
    }
  },
});
