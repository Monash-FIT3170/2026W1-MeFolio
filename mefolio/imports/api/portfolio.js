import { Mongo } from "meteor/mongo";

export const PortfolioCollection = new Mongo.Collection("portfolios");

/**
 * Returns the default publication state for a new portfolio.
 *
 * The portfolio's existing top-level content remains the editable draft.
 * publishedContent stores the live snapshot after the portfolio is published.
 */
export const createDefaultPortfolioPublishingState = () => ({
  isPublished: false,
  publishedContent: null,
});