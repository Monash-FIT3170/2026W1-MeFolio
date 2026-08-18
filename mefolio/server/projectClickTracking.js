import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import { PortfolioCollection } from "/imports/api/portfolio";
import {
  ProjectEngagement,
  PROJECT_CLICK_METHOD,
  PROJECT_ENGAGEMENT_PUBLICATION,
} from "/imports/api/projectEngagement";
import { recordProjectClick } from "/imports/api/projectClickRecording";

Meteor.methods({
  [PROJECT_CLICK_METHOD](event) {
    return recordProjectClick(event);
  },
});

Meteor.publish(PROJECT_ENGAGEMENT_PUBLICATION, async function (portfolioId) {
  check(portfolioId, String);

  if (!this.userId) return this.ready();

  const portfolio = await PortfolioCollection.findOneAsync(portfolioId, {
    fields: { userId: 1 },
  });

  if (portfolio?.userId !== this.userId) return this.ready();

  return ProjectEngagement.find(
    { portfolioId },
    {
      fields: {
        eventId: 1,
        portfolioId: 1,
        project_id: 1,
        target: 1,
        clicks: 1,
        date: 1,
      },
      sort: { date: 1 },
    },
  );
});

Meteor.startup(async () => {
  await ProjectEngagement.rawCollection().createIndex(
    { portfolioId: 1, date: -1 },
    {
      name: "project_engagement_portfolio_date",
      partialFilterExpression: { portfolioId: { $type: "string" } },
    },
  );
});

DDPRateLimiter.addRule(
  {
    type: "method",
    name: PROJECT_CLICK_METHOD,
    connectionId: () => true,
  },
  120,
  60 * 1000,
);
