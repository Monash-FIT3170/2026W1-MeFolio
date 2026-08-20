import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";

// Portfolio publications kept in their own module (rather than main.js) so
// tests can import them without pulling in the app seed and OAuth config,
// which need Meteor.settings to be present. Mirrors the pattern used for
// portfolio-methods.js.

// Private portfolio fields that must never reach a client that does not own
// the portfolio. `recruiterInfo` holds private recruiter details (salary,
// phone, personal note) and the access code itself, so it is only sent to
// the owner. Recruiters receive it through the token-gated
// `portfolio.recruiterView` publication instead.
const NON_OWNER_PORTFOLIO_FIELDS = { recruiterInfo: 0 };

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
