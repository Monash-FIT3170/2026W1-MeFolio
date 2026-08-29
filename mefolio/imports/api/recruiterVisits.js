import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

// Client-side handle to the recruiter_visits collection.
//
// The authoritative definition (and indexes) live server-side in
// server/recruiter-tokens/collection.js. Meteor links minimongo to the
// documents delivered by the recruiterVisits.forOwner publication purely by
// collection name, so the client only needs its own handle to read them.
//
// Guarded to the client so the server, where the real collection already
// exists, never redefines it (which would throw a duplicate-collection error).
export const RecruiterVisits = Meteor.isServer
  ? null
  : new Mongo.Collection("recruiter_visits");
