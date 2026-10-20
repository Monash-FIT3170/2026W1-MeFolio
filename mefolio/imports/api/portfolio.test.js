/**
 * @file portfolio.test.js
 * @description Unit/Integration tests for portfolio presence cleanup and heartbeat pruning (BUG-02).
 */

import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { PortfolioCollection } from "./portfolio.js";

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
}
