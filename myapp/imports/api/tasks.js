import {Mongo} from 'meteor/mongo';

// Define a new collection to hold the tasks: a MongoDB collection named "tasks".
// Stored in memory on the client and persisted in MongoDB on the server.
export const TaskCollection = new Mongo.Collection('tasks');