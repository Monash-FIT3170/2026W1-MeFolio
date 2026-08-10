/* global afterEach, describe, it */

import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { ProjectEngagement } from "/imports/api/projectEngagement";

const startOfDay = (date = new Date()) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

if (Meteor.isServer) {
  describe("Project Engagement", function () {
    const testProjectIds = new Set();

    const createProjectId = (label) => {
      const projectId = `test-${label}-${Date.now()}-${Math.random()}`;
      testProjectIds.add(projectId);
      return projectId;
    };

    afterEach(async function () {
      await ProjectEngagement.removeAsync({
        project_id: { $in: [...testProjectIds] },
      });
      testProjectIds.clear();
    });

    it("accumulates clicks for a project", async function () {
      // Start with a known zero-click record for today so the test measures only
      // the effect of one call to the increment method.
      const projectId = createProjectId("increment");
      const today = startOfDay();

      await ProjectEngagement.insertAsync({
        project_id: projectId,
        date: today,
        clicks: 0,
      });

      // Simulate two clicks on the same project.
      await Meteor.callAsync("projectEngagement.incrementClick", {
        projectId,
      });
      await Meteor.callAsync("projectEngagement.incrementClick", {
        projectId,
      });

      const engagement = await ProjectEngagement.findOneAsync({
        project_id: projectId,
        date: today,
      });

      expect(engagement.clicks).to.equal(2);
    });

    it("keeps click counts separate for each project", async function () {
      // Give two different projects independent records for the same day.
      const projectAId = createProjectId("project-a");
      const projectBId = createProjectId("project-b");
      const today = startOfDay();

      await ProjectEngagement.insertAsync({
        project_id: projectAId,
        date: today,
        clicks: 0,
      });
      await ProjectEngagement.insertAsync({
        project_id: projectBId,
        date: today,
        clicks: 0,
      });

      // Only project A receives a click.
      await Meteor.callAsync("projectEngagement.incrementClick", {
        projectId: projectAId,
      });

      const projectAEngagement = await ProjectEngagement.findOneAsync({
        project_id: projectAId,
        date: today,
      });
      const projectBEngagement = await ProjectEngagement.findOneAsync({
        project_id: projectBId,
        date: today,
      });

      // Project A should change while project B remains untouched, proving the
      // update is scoped by project ID rather than only by date.
      expect(projectAEngagement.clicks).to.equal(1);
      expect(projectBEngagement.clicks).to.equal(0);
    });

    it("creates a new engagement record each day", async function () {
      // Seed only yesterday's activity to represent a project being clicked on
      // a later calendar day for the first time.
      const projectId = createProjectId("daily-record");
      const today = startOfDay();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await ProjectEngagement.insertAsync({
        project_id: projectId,
        date: yesterday,
        clicks: 3,
      });

      // Today's click should create a new daily record instead of modifying the
      // historical record from yesterday.
      await Meteor.callAsync("projectEngagement.incrementClick", {
        projectId,
      });

      const engagements = await ProjectEngagement.find(
        { project_id: projectId },
        { sort: { date: 1 } },
      ).fetchAsync();

      // Both days must remain available for daily and weekly graph aggregation.
      expect(engagements).to.have.lengthOf(2);
      expect(engagements[0].date.getTime()).to.equal(yesterday.getTime());
      expect(engagements[0].clicks).to.equal(3);
      expect(engagements[1].date.getTime()).to.equal(today.getTime());
      expect(engagements[1].clicks).to.equal(1);
    });
  });
}
