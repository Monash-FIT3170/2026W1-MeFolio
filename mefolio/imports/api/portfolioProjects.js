import { Mongo } from "meteor/mongo";

export const PortfolioProjectsCollection = new Mongo.Collection(
  "portfolioProjects",
);
