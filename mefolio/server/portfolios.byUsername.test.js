import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { expect } from "chai";
import { PortfolioCollection } from "/imports/api/portfolio";

// Register the publications under test. Importing this lightweight module
// populates Meteor.server.publish_handlers without pulling in main.js's seed
// and OAuth config, which need Meteor.settings to be present.
import "./portfolio-publications.js";

if (Meteor.isServer) {
  describe("portfolios.byUsername publication", function () {
    let ownerId;
    let otherUserId;
    const username = `pub-username-test-${Date.now()}`;

    before(async function () {
      const unique = `${Date.now()}-${Math.random()}`;

      ownerId = await Accounts.createUserAsync({
        email: `byusername-owner-${unique}@mefolio.com`,
        password: "password123",
      });

      otherUserId = await Accounts.createUserAsync({
        email: `byusername-other-${unique}@mefolio.com`,
        password: "password123",
      });

      await PortfolioCollection.insertAsync({
        userId: ownerId,
        username,
        title: "By-Username Test Portfolio",
        bio: "A public-facing bio",
        publishedContent: { title: "Published Title" },
        recruiterInfo: {
          salaryExpectation: "$150k",
          phoneNumber: "555-0100",
          personalNote: "Please don't leak this",
          accessCode: "should-not-leak",
        },
        createdAt: new Date(),
      });
    });

    const runHandler = async (userId) => {
      const handler = Meteor.server.publish_handlers["portfolios.byUsername"];
      let readyCalled = false;
      const result = await handler.call(
        {
          userId,
          ready: () => {
            readyCalled = true;
          },
        },
        username,
      );
      return { result, readyCalled };
    };

    const fetchDocs = async (result) => {
      // The publication returns a single cursor for a logged-out/other-user
      // caller, or an array of two cursors [own, others] when logged in.
      const cursors = Array.isArray(result) ? result : [result];
      const docSets = await Promise.all(
        cursors.map((cursor) => cursor.fetchAsync()),
      );
      return docSets.flat();
    };

    it("excludes recruiterInfo for a logged-out visitor", async function () {
      const { result } = await runHandler(null);
      const docs = await fetchDocs(result);

      expect(docs).to.have.lengthOf(1);
      expect(docs[0].recruiterInfo).to.be.undefined;

      // Sanity check: this isn't just an empty publish — other fields on the
      // same doc are still present, only recruiterInfo is stripped.
      expect(docs[0].title).to.equal("By-Username Test Portfolio");
    });

    it("excludes recruiterInfo for a different logged-in user (not the owner)", async function () {
      const { result } = await runHandler(otherUserId);
      const docs = await fetchDocs(result);

      expect(docs).to.have.lengthOf(1);
      expect(docs[0].recruiterInfo).to.be.undefined;
      expect(docs[0].title).to.equal("By-Username Test Portfolio");
    });

    it("includes recruiterInfo when the owner views their own portfolio", async function () {
      const { result } = await runHandler(ownerId);
      const docs = await fetchDocs(result);

      expect(docs).to.have.lengthOf(1);
      expect(docs[0].recruiterInfo).to.exist;
      expect(docs[0].recruiterInfo.salaryExpectation).to.equal("$150k");
    });

    it("returns no documents for a username that does not exist", async function () {
      const handler = Meteor.server.publish_handlers["portfolios.byUsername"];
      const emptyResult = await handler.call(
        { userId: null, ready: () => {} },
        "no-such-username-at-all",
      );
      const docs = await fetchDocs(emptyResult);

      expect(docs).to.have.lengthOf(0);
    });
  });
}
