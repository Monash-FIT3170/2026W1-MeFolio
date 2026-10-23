/**
 * @file portfolio.test.js
 * @description Integration tests for portfolio startup maintenance and visitor presence.
 */

import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import sinon from "sinon";
import { PortfolioCollection } from "./portfolio.js";
import { ProjectCollection } from "./projects.js";
import { PortfolioProjectsCollection } from "./portfolioProjects.js";

if (Meteor.isServer) {
  describe("Portfolio Presence & Cleanup (BUG-02)", () => {
    let testPortfolioId;

    beforeEach(async () => {
      await PortfolioCollection.removeAsync({});

      testPortfolioId = await PortfolioCollection.insertAsync({
        title: "Test Portfolio",
        isPublished: true,
        viewers: [],
      });
    });

    afterEach(async () => {
      await PortfolioCollection.removeAsync({});
    });

    it("flushes lingering viewers on startup/reset", async () => {
      // 1. Simulate lingering viewers prior to server restart
      await PortfolioCollection.updateAsync(testPortfolioId, {
        $set: {
          viewers: [
            {
              connectionId: "ghost-conn-1",
              name: "Anonymous Viewer",
              lastSeenAt: new Date(),
            },
            {
              connectionId: "ghost-conn-2",
              name: "Anonymous Viewer",
              lastSeenAt: new Date(),
            },
          ],
        },
      });

      let doc = await PortfolioCollection.findOneAsync(testPortfolioId);
      expect(doc.viewers).to.have.lengthOf(2);

      // 2. Execute startup reset query
      await PortfolioCollection.updateAsync(
        { viewers: { $exists: true, $not: { $size: 0 } } },
        { $set: { viewers: [] } },
        { multi: true },
      );

      // 3. Verify viewers array is flushed
      doc = await PortfolioCollection.findOneAsync(testPortfolioId);
      expect(doc.viewers).to.be.an("array").that.is.empty;
    });

    it("prunes viewers with expired heartbeats and keeps active ones", async () => {
      const now = Date.now();
      const activeTime = new Date(now - 5 * 1000); // 5s ago (active)
      const staleTime = new Date(now - 45 * 1000); // 45s ago (stale > 30s)

      await PortfolioCollection.updateAsync(testPortfolioId, {
        $set: {
          viewers: [
            {
              connectionId: "active-conn",
              name: "Active User",
              lastSeenAt: activeTime,
            },
            {
              connectionId: "stale-conn",
              name: "Stale User",
              lastSeenAt: staleTime,
            },
          ],
        },
      });

      // Heartbeat pruner query
      const expirationThreshold = new Date(Date.now() - 30 * 1000);
      await PortfolioCollection.updateAsync(
        { "viewers.lastSeenAt": { $lt: expirationThreshold } },
        {
          $pull: {
            viewers: { lastSeenAt: { $lt: expirationThreshold } },
          },
        },
        { multi: true },
      );

      const doc = await PortfolioCollection.findOneAsync(testPortfolioId);
      expect(doc.viewers).to.have.lengthOf(1);
      expect(doc.viewers[0].connectionId).to.equal("active-conn");
    });
  });

  describe("portfolio startup maintenance", function () {
    let initializePortfolioData;
    const ownerId = "portfolio-startup-test-owner";
    let portfolioIds;
    let projectIds;

    const insertPortfolio = async (fields = {}) => {
      const id = await PortfolioCollection.insertAsync({
        userId: ownerId,
        title: "Startup Test Portfolio",
        createdAt: new Date(),
        ...fields,
      });
      portfolioIds.push(id);
      return id;
    };

    const insertProject = async (title) => {
      const id = await ProjectCollection.insertAsync({
        userId: ownerId,
        title,
        createdAt: new Date(),
      });
      projectIds.push(id);
      return id;
    };

    const findIds = (collection) =>
      collection
        .find({}, { fields: { _id: 1 }, sort: { _id: 1 } })
        .fetchAsync();

    const findProjectOrder = (portfolioId) =>
      PortfolioProjectsCollection.find(
        { portfolioId },
        { sort: { orderIndex: 1 } },
      ).fetchAsync();

    before(async function () {
      // Load the maintenance function from the server entrypoint without
      // starting timers or changing the test app's methods and publications.
      const importSandbox = sinon.createSandbox();
      try {
        importSandbox.stub(Meteor, "startup");
        importSandbox.stub(Meteor, "methods");
        importSandbox.stub(Meteor, "publish");
        ({ initializePortfolioData } = await import("/server/main.js"));
      } finally {
        importSandbox.restore();
      }

      // Meteor's test runner uses its isolated test database. Other suites
      // leave portfolios behind, so reset only the portfolio stores once to
      // exercise a fresh installation without deleting users or projects.
      await PortfolioProjectsCollection.removeAsync({});
      await PortfolioCollection.removeAsync({});
    });

    beforeEach(function () {
      portfolioIds = [];
      projectIds = [];
    });

    afterEach(async function () {
      await PortfolioProjectsCollection.removeAsync({
        portfolioId: { $in: portfolioIds },
      });
      await PortfolioCollection.removeAsync({ _id: { $in: portfolioIds } });
      await ProjectCollection.removeAsync({ _id: { $in: projectIds } });
    });

    it("leaves empty portfolio stores empty and creates no users or projects", async function () {
      const usersBefore = await findIds(Meteor.users);
      const projectsBefore = await findIds(ProjectCollection);

      await initializePortfolioData();
      await initializePortfolioData();

      expect(await PortfolioCollection.find().countAsync()).to.equal(0);
      expect(await PortfolioProjectsCollection.find().countAsync()).to.equal(0);
      expect(await findIds(Meteor.users)).to.deep.equal(usersBefore);
      expect(await findIds(ProjectCollection)).to.deep.equal(projectsBefore);
    });

    it("preserves a user's Sample Portfolio and backfills its publishing state and saved project order", async function () {
      const firstProjectId = await insertProject("User's first project");
      const secondProjectId = await insertProject("User's second project");
      const savedProjects = [secondProjectId, firstProjectId];
      const bio = "This portfolio and its content belong to the existing user.";
      const profile = { fullName: "Existing Owner", avatarUrl: "/avatar.png" };
      const aiTwinConfiguration = {
        documents: [{ name: "draft-notes.txt", text: "Private draft notes" }],
      };
      const portfolioId = await insertPortfolio({
        title: "Sample Portfolio",
        bio,
        profile,
        projects: savedProjects,
        aiTwinConfiguration,
      });
      const projectsBefore = await ProjectCollection.find({
        _id: { $in: savedProjects },
      }).fetchAsync();

      await initializePortfolioData();

      const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
      expect(portfolio.userId).to.equal(ownerId);
      expect(portfolio.title).to.equal("Sample Portfolio");
      expect(portfolio.bio).to.equal(bio);
      expect(portfolio.profile).to.deep.equal(profile);
      expect(portfolio.projects).to.deep.equal(savedProjects);
      expect(portfolio.aiTwinConfiguration).to.deep.equal(aiTwinConfiguration);
      expect(portfolio.isPublished).to.equal(false);
      expect(portfolio.publishedContent).to.equal(null);
      expect(portfolio).not.to.have.property("publishedAiTwinConfiguration");
      expect(
        await ProjectCollection.find({
          _id: { $in: savedProjects },
        }).fetchAsync(),
      ).to.deep.equal(projectsBefore);

      const order = await findProjectOrder(portfolioId);
      expect(order.map(({ projectId }) => projectId)).to.deep.equal(
        savedProjects,
      );
      expect(order.map(({ orderIndex }) => orderIndex)).to.deep.equal([0, 1]);

      await initializePortfolioData();

      expect(await PortfolioCollection.findOneAsync(portfolioId)).to.deep.equal(
        portfolio,
      );
      expect(await findProjectOrder(portfolioId)).to.deep.equal(order);
    });

    it("backfills published AI documents while preserving the published content snapshot", async function () {
      const publishedContent = {
        title: "Live title",
        bio: "Live biography",
        projects: ["live-project"],
      };
      const documents = [{ name: "resume.txt", text: "Saved resume content" }];
      const portfolioId = await insertPortfolio({
        title: "Unpublished draft title",
        isPublished: true,
        publishedContent,
        aiTwinConfiguration: { documents },
      });

      await initializePortfolioData();

      const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
      expect(portfolio.isPublished).to.equal(true);
      expect(portfolio.title).to.equal("Unpublished draft title");
      expect(portfolio.publishedContent).to.deep.equal(publishedContent);
      expect(portfolio.publishedAiTwinConfiguration).to.deep.equal({
        documents,
      });
    });

    it("preserves an existing published AI snapshot when the draft documents differ", async function () {
      const publishedContent = { title: "Published portfolio" };
      const publishedAiTwinConfiguration = {
        documents: [{ name: "live.txt", text: "Published information" }],
      };
      const portfolioId = await insertPortfolio({
        isPublished: true,
        publishedContent,
        publishedAiTwinConfiguration,
        aiTwinConfiguration: {
          documents: [{ name: "draft.txt", text: "Unpublished information" }],
        },
      });

      await initializePortfolioData();

      const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
      expect(portfolio.publishedContent).to.deep.equal(publishedContent);
      expect(portfolio.publishedAiTwinConfiguration).to.deep.equal(
        publishedAiTwinConfiguration,
      );
    });

    it("uses an empty published AI document list for legacy portfolios without saved documents", async function () {
      const missingDocumentsId = await insertPortfolio({ isPublished: true });
      const invalidDocumentsId = await insertPortfolio({
        isPublished: true,
        aiTwinConfiguration: { documents: "legacy value" },
      });

      await initializePortfolioData();

      for (const portfolioId of [missingDocumentsId, invalidDocumentsId]) {
        const portfolio = await PortfolioCollection.findOneAsync(portfolioId);
        expect(portfolio.publishedAiTwinConfiguration).to.deep.equal({
          documents: [],
        });
      }
    });

    it("retains existing project ordering across repeated startup runs", async function () {
      const portfolioId = await insertPortfolio({
        projects: ["saved-first", "saved-second"],
      });
      // An existing saved order takes precedence over the legacy projects array,
      // including when only one project has an ordering record.
      await PortfolioProjectsCollection.insertAsync({
        portfolioId,
        projectId: "saved-second",
        orderIndex: 7,
        createdAt: new Date("2025-01-01T00:00:00Z"),
      });
      const orderBefore = await findProjectOrder(portfolioId);

      await initializePortfolioData();
      const portfolioAfter =
        await PortfolioCollection.findOneAsync(portfolioId);
      await initializePortfolioData();

      expect(await findProjectOrder(portfolioId)).to.deep.equal(orderBefore);
      expect(await PortfolioCollection.findOneAsync(portfolioId)).to.deep.equal(
        portfolioAfter,
      );
    });

    it("clears lingering viewers and preserves portfolios without viewer state", async function () {
      const portfolioId = await insertPortfolio({
        viewers: [
          { connectionId: "old-connection", lastSeenAt: new Date() },
          { connectionId: "another-old-connection", lastSeenAt: new Date() },
        ],
      });
      const emptyViewersId = await insertPortfolio({ viewers: [] });
      const missingViewersId = await insertPortfolio();

      await initializePortfolioData();

      expect(
        (await PortfolioCollection.findOneAsync(portfolioId)).viewers,
      ).to.deep.equal([]);
      expect(
        (await PortfolioCollection.findOneAsync(emptyViewersId)).viewers,
      ).to.deep.equal([]);
      expect(
        await PortfolioCollection.findOneAsync(missingViewersId),
      ).not.to.have.property("viewers");
    });
  });
}
