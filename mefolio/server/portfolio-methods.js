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

    // Never let a client reassign ownership or the document id through this
    // generic setter.
    const safeUpdates = { ...updates };
    delete safeUpdates.userId;
    delete safeUpdates._id;

    return await PortfolioCollection.updateAsync(portfolioId, {
      $set: safeUpdates,
    });
  },
});
