import { Meteor } from "meteor/meteor";
import { LinksCollection } from "/imports/api/links";
import { Random } from "meteor/random";
import { TaskCollection } from "/imports/api/tasks"; 

// A publication that allows the client to subscribe to the data/collection of tasks. 
// It returns all tasks sorted by creation date in descending order.
Meteor.publish('tasks.all', function(){
  return TaskCollection.find({}, {sort: {createdAt: -1}});
})

// Meteor methods are used to perform database operations, and can add various methods inside the object passed to Meteor.methods(). 
Meteor.methods({
  async 'tasks.insert'(text) {
    return await TaskCollection.insertAsync({
      text:text,
      createdAt: new Date(),
    });
  },
  async 'tasks.remove'(taskId) {
    return await TaskCollection.removeAsync(taskId);
  }
});
