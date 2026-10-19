import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";

// Portfolio publications kept in their own module (rather than main.js) so
// tests can import them without pulling in the app seed and OAuth config,
// which need Meteor.settings to be present. Mirrors the pattern used for
// portfolio-methods.js.

// Private portfolio fields withheld from clients that do not own the portfolio.
// Recruiters receive authorized details through the token-gated
// `portfolio.recruiterView` publication instead.
const NON_OWNER_PORTFOLIO_FIELDS = {
  recruiterInfo: 0,
  aiTwinConfiguration: 0,
  publishedAiTwinConfiguration: 0,
};

if (Meteor.isServer) {
  Meteor.publish("portfolios.all", function () {
    const sort = { createdAt: -1 };

    // Not logged in: nobody owns these, so strip private fields from all.
    if (!this.userId) {
      return PortfolioCollection.find(
        {},
        { sort, fields: NON_OWNER_PORTFOLIO_FIELDS },
      );
    }

    // Logged in: only your own portfolios.
    return PortfolioCollection.find({ userId: this.userId }, { sort });
  });

  Meteor.publish("portfolios.byUsername", function (username) {
    check(username, String);
    const sort = { createdAt: -1 };

    if (!this.userId) {
      return PortfolioCollection.find(
        { username },
        { sort, fields: NON_OWNER_PORTFOLIO_FIELDS },
      );
    }

    return [
      PortfolioCollection.find({ username, userId: this.userId }, { sort }),
      PortfolioCollection.find(
        { username, userId: { $ne: this.userId } },
        { sort, fields: NON_OWNER_PORTFOLIO_FIELDS },
      ),
    ];
  });
}
