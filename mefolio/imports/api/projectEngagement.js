import { Mongo } from "meteor/mongo";

export const ProjectEngagement = new Mongo.Collection("projectEngagements");

export const PROJECT_CLICK_METHOD = "projectEngagement.recordClick";
export const PROJECT_ENGAGEMENT_PUBLICATION = "projectEngagements.forPortfolio";
export const PROJECT_CLICK_TARGETS = Object.freeze(["code", "demo"]);
