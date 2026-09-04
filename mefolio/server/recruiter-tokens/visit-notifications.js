// Reactive owner-notification feed (FEAT-17, AC2).
//
// Publishes every recruiter visit to a portfolio the logged-in user owns.
// Meteor publications are reactive, so when a visit is recorded (via
// recruiterVisits.record) the new document reaches the owner's client live,
// which the dashboard turns into an in-app alert. No polling required.
import { Meteor } from "meteor/meteor";
import { RecruiterVisits } from "./collection";
import { PortfolioCollection } from "/imports/api/portfolio";

// How many recent visits to keep on the client. The alert only cares about
// new arrivals, and the visit-history view pages separately, so a modest cap
// keeps the owner's minimongo small.
const OWNER_VISIT_LIMIT = 50;

if (Meteor.isServer) {
  Meteor.publish("recruiterVisits.forOwner", async function () {
    if (!this.userId) return this.ready();

    // Scope strictly to portfolios this user owns, so one owner never sees
    // another's recruiter visits. Resolved once at subscription time; a
    // portfolio created later in the same session is picked up on resubscribe.
    const ownedPortfolioIds = (
      await PortfolioCollection.find(
        { userId: this.userId },
        { fields: { _id: 1 } },
      ).fetchAsync()
    ).map((portfolio) => portfolio._id);

    if (ownedPortfolioIds.length === 0) return this.ready();

    return RecruiterVisits.find(
      { portfolioId: { $in: ownedPortfolioIds } },
      { sort: { createdAt: -1 }, limit: OWNER_VISIT_LIMIT },
    );
  });
}
