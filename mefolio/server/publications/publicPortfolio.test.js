/**
 * Server tests for the portfolios.publicView publication (FEAT-12).
 *
 * This is the one publication an unauthenticated visitor subscribes to, so the
 * tests are mostly about what it refuses to send: unpublished portfolios, and
 * the editable draft that sits alongside the published snapshot.
 */

import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "/imports/api/portfolio";
import { expect } from "chai";

// Register the publication under test. Without this, plain `meteor test`
// (which does not load server/main.js) leaves publish_handlers empty.
import "./publicPortfolio";

if (Meteor.isServer) {
  describe("portfolios.publicView", function () {
    const OWNER_ID = "public-view-test-owner";
    let publishedPortfolioId;
    let unpublishedPortfolioId;

    // Publish handlers run with `this` bound to a subscription. This one only
    // ever returns a cursor, so a stub context is enough.
    const runPublication = (identifier) =>
      Meteor.server.publish_handlers["portfolios.publicView"].call(
        { userId: null, ready() {} },
        identifier,
      );

    const fetchPublished = async (identifier) => {
      const cursor = runPublication(identifier);
      return cursor ? await cursor.fetchAsync() : [];
    };

    before(async function () {
      publishedPortfolioId = await PortfolioCollection.insertAsync({
        userId: OWNER_ID,
        username: "publicowner",
        title: "Draft title a visitor must never see",
        bio: "Draft bio a visitor must never see",
        isPublished: true,
        publishedAt: new Date(),
        publishedContent: {
          title: "Published title",
          bio: "Published bio",
          profile: { fullName: "Public Owner" },
          projects: [],
          theme: "default",
        },
      });

      unpublishedPortfolioId = await PortfolioCollection.insertAsync({
        userId: OWNER_ID,
        title: "Never published",
        bio: "Still a draft",
        isPublished: false,
        publishedContent: null,
      });
    });

    after(async function () {
      await PortfolioCollection.removeAsync({ userId: OWNER_ID });
    });

    it("publishes the snapshot for a published portfolio", async function () {
      const documents = await fetchPublished(publishedPortfolioId);

      expect(documents).to.have.lengthOf(1);
      expect(documents[0]._id).to.equal(publishedPortfolioId);
      expect(documents[0].publishedContent.title).to.equal("Published title");
    });

    it("publishes the snapshot for a published portfolio username slug", async function () {
      const documents = await fetchPublished("publicowner");

      expect(documents).to.have.lengthOf(1);
      expect(documents[0].username).to.equal("publicowner");
      expect(documents[0].publishedContent.title).to.equal("Published title");
    });

    it("publishes nothing for an unpublished portfolio", async function () {
      const documents = await fetchPublished(unpublishedPortfolioId);
      expect(documents).to.have.lengthOf(0);
    });

    it("publishes nothing for an id that does not exist", async function () {
      const documents = await fetchPublished("no-such-portfolio-id");
      expect(documents).to.have.lengthOf(0);
    });

    it("withholds the editable draft and the owner id", async function () {
      const [document] = await fetchPublished(publishedPortfolioId);

      expect(Object.keys(document).sort()).to.deep.equal([
        "_id",
        "isPublished",
        "publishedAt",
        "publishedContent",
        "username",
      ]);
      expect(document.title).to.equal(undefined);
      expect(document.bio).to.equal(undefined);
      expect(document.userId).to.equal(undefined);
    });

    it("rejects a portfolio id that is not a string", function () {
      expect(() => runPublication(12345)).to.throw();
      expect(() => runPublication({ _id: publishedPortfolioId })).to.throw();
    });
  });
}
