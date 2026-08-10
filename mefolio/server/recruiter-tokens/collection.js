import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const RecruiterTokens = new Mongo.Collection("recruiter_tokens");

// Delete tokens when they pass their 'expiresAt' date
if (Meteor.isServer) {
  Meteor.startup(async () => {
    await RecruiterTokens.rawCollection().createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    );
  });
}
