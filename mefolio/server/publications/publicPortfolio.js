// Publishes a portfolio's published snapshot to anyone holding its id.
//
// This is the only publication an unauthenticated visitor uses, so it is
// deliberately narrow: unpublished portfolios never match, and the field list
// withholds the editable draft along with everything else on the record.
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";

if (Meteor.isServer) {
  Meteor.publish("portfolios.publicView", function (portfolioId) {
    check(portfolioId, String);
    return PortfolioCollection.find(
      { _id: portfolioId, isPublished: true },
      { fields: { publishedContent: 1, isPublished: 1, publishedAt: 1 } },
    );
  });
}
