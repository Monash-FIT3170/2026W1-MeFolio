import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { expect } from "chai";
import { PortfolioCollection } from "/imports/api/portfolio";
import { PortfolioProjectsCollection } from "/imports/api/portfolioProjects";
import { ProjectEngagement } from "/imports/api/projectEngagement";
import { recordProjectClick } from "/imports/api/projectClickRecording";
import { createProjectClickTracker } from "/imports/api//projectClickTracking";
import { ProjectCollection } from "/imports/api//projects";

if (Meteor.isServer) {
  describe("Project click recording", function () {
    let portfolioId;
    let projectId;
    let portfolioProjectId;
    let extraPortfolioId;
    let eventIds;

    // create random IDs for a portfolio and project before each test.
    beforeEach(async function () {
      eventIds = [];
      projectId = await ProjectCollection.insertAsync({
        title: `Click tracking test ${Random.id()}`,
        createdAt: new Date(),
      });
      portfolioId = await PortfolioCollection.insertAsync({
        userId: Random.id(),
        title: "Click tracking test portfolio",
        projects: [projectId],
        isPublished: true,
        publishedContent: {
          projects: [{ _id: projectId }],
        },
        createdAt: new Date(),
      });
      portfolioProjectId = await PortfolioProjectsCollection.insertAsync({
        portfolioId,
        projectId,
        orderIndex: 0,
        createdAt: new Date(),
      });
    });

    // remove test IDs after each test.
    afterEach(async function () {
      if (eventIds.length) {
        await ProjectEngagement.removeAsync({ _id: { $in: eventIds } });
      }
      if (portfolioProjectId) {
        await PortfolioProjectsCollection.removeAsync(portfolioProjectId);
      }
      if (extraPortfolioId) {
        await PortfolioCollection.removeAsync(extraPortfolioId);
      }
      if (portfolioId) {
        await PortfolioCollection.removeAsync(portfolioId);
      }
      if (projectId) {
        await ProjectCollection.removeAsync(projectId);
      }
    });

    const createEvent = (overrides = {}) => ({
      eventId: Random.id(24),
      portfolioId,
      projectId,
      target: "code",
      ...overrides,
    });

    it("stores one server-timestamped event for a valid click", async function () {
      const event = createEvent({ target: "demo" });
      eventIds.push(event.eventId);
      const earliestRecordedAt = Date.now();

      const result = await recordProjectClick(event);
      const latestRecordedAt = Date.now();
      const savedEvent = await ProjectEngagement.findOneAsync(event.eventId);

      expect(result.recorded).to.equal(true);
      expect(result.duplicate).to.equal(false);
      expect(savedEvent).to.include({
        eventId: event.eventId,
        portfolioId,
        project_id: projectId,
        target: "demo",
        clicks: 1,
        schemaVersion: 1,
      });
      expect(savedEvent.date).to.be.instanceOf(Date);
      expect(savedEvent.date.getTime()).to.be.at.least(earliestRecordedAt);
      expect(savedEvent.date.getTime()).to.be.at.most(latestRecordedAt);
    });

    it("records concurrent retries with the same event ID only once", async function () {
      const event = createEvent();
      eventIds.push(event.eventId);

      const results = await Promise.all(
        Array.from({ length: 10 }, () => recordProjectClick(event)),
      );

      expect(results.filter((result) => result.recorded)).to.have.length(1);
      expect(results.filter((result) => result.duplicate)).to.have.length(9);
      expect(
        await ProjectEngagement.find({ _id: event.eventId }).countAsync(),
      ).to.equal(1);
    });

    it("records separate genuine clicks as separate events", async function () {
      const firstEvent = createEvent();
      const secondEvent = createEvent();
      eventIds.push(firstEvent.eventId, secondEvent.eventId);

      await recordProjectClick(firstEvent);
      await recordProjectClick(secondEvent);

      expect(
        await ProjectEngagement.find({
          _id: { $in: eventIds },
        }).countAsync(),
      ).to.equal(2);
    });

    it("records clicks for a project in the published snapshot", async function () {
      const event = createEvent({ target: "demo" });
      eventIds.push(event.eventId);

      await PortfolioCollection.updateAsync(portfolioId, {
        $set: {
          projects: [],
          isPublished: true,
          publishedContent: {
            projects: [{ _id: projectId }],
          },
        },
      });
      await PortfolioProjectsCollection.removeAsync(portfolioProjectId);
      await ProjectCollection.removeAsync(projectId);

      const result = await recordProjectClick(event);
      const savedEvent = await ProjectEngagement.findOneAsync(event.eventId);

      expect(result.recorded).to.equal(true);
      expect(savedEvent).to.include({
        portfolioId,
        project_id: projectId,
        target: "demo",
        clicks: 1,
      });
    });

    it("rejects clicks for a project that exists only in the draft", async function () {
      const event = createEvent();
      eventIds.push(event.eventId);

      await PortfolioCollection.updateAsync(portfolioId, {
        $set: {
          isPublished: true,
          publishedContent: { projects: [] },
        },
      });

      let error;
      try {
        await recordProjectClick(event);
      } catch (caughtError) {
        error = caughtError;
      }

      expect(error?.error).to.equal("project-click.not-available");
      expect(await ProjectEngagement.findOneAsync(event.eventId)).to.not.exist;
    });

    it("rejects a project that does not belong to the portfolio", async function () {
      extraPortfolioId = await PortfolioCollection.insertAsync({
        userId: Random.id(),
        title: "Unrelated portfolio",
        projects: [],
        createdAt: new Date(),
      });
      const event = createEvent({ portfolioId: extraPortfolioId });
      eventIds.push(event.eventId);

      let error;
      try {
        await recordProjectClick(event);
      } catch (caughtError) {
        error = caughtError;
      }

      expect(error?.error).to.equal("project-click.not-available");
      expect(await ProjectEngagement.findOneAsync(event.eventId)).to.not.exist;
    });

    it("rejects malformed IDs, targets, and unexpected client fields", async function () {
      const invalidEvents = [
        createEvent({ eventId: "too-short" }),
        createEvent({ target: "card" }),
        { ...createEvent(), clicks: 500 },
        { ...createEvent(), date: new Date(0) },
      ];

      for (const event of invalidEvents) {
        let rejected = false;
        try {
          await recordProjectClick(event);
        } catch {
          rejected = true;
        }
        expect(rejected).to.equal(true);
      }
    });
  });
}

describe("Project click tracker", function () {
  it("creates one event and passes it through the configured transport", async function () {
    const sentEvents = [];
    const tracker = createProjectClickTracker({
      createEventId: () => "client-event-id-000001",
      transport: async (event) => {
        sentEvents.push(event);
        return { recorded: true };
      },
    });

    const result = await tracker({
      portfolioId: "portfolio-id",
      projectId: "project-id",
      target: "code",
    });

    expect(result.recorded).to.equal(true);
    expect(sentEvents).to.deep.equal([
      {
        eventId: "client-event-id-000001",
        portfolioId: "portfolio-id",
        projectId: "project-id",
        target: "code",
      },
    ]);
  });

  it("uses a fresh event ID for each genuine click", async function () {
    let sequence = 0;
    const sentEvents = [];
    const tracker = createProjectClickTracker({
      createEventId: () =>
        `client-event-${String(++sequence).padStart(6, "0")}`,
      transport: (event) => {
        sentEvents.push(event);
      },
    });

    await tracker({
      portfolioId: "portfolio-id",
      projectId: "project-id",
      target: "demo",
    });
    await tracker({
      portfolioId: "portfolio-id",
      projectId: "project-id",
      target: "demo",
    });

    expect(sentEvents[0].eventId).to.not.equal(sentEvents[1].eventId);
  });
});
