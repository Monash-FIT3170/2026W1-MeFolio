import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "/imports/api/portfolio";
import { Buffer } from "buffer";
import assert from "assert";
import sinon from "sinon";
import { clearNarrationCache } from "./project-narration.js";

if (Meteor.isServer) {
  describe("public project narration", function () {
    let sandbox;
    let fetchStub;
    let portfolio;
    let audio;

    const callMethod = (portfolioId = "portfolio-1", projectId = "project-1") =>
      Meteor.server.method_handlers["projects.getNarrationAudio"].call(
        { userId: null },
        portfolioId,
        projectId,
      );

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      clearNarrationCache();
      audio = Buffer.alloc(46);
      audio.write("RIFF", 0);
      audio.write("WAVE", 8);
      fetchStub = sandbox.stub(globalThis, "fetch").resolves({
        ok: true,
        arrayBuffer: async () => audio,
      });
      portfolio = {
        _id: "portfolio-1",
        isPublished: true,
        publishedContent: {
          projects: [
            {
              _id: "project-1",
              title: "MeFolio",
              description: "A portfolio builder.",
            },
          ],
        },
      };
      sandbox
        .stub(PortfolioCollection, "findOneAsync")
        .callsFake(async (id) => (id === portfolio._id ? portfolio : null));
    });

    afterEach(function () {
      sandbox.restore();
      clearNarrationCache();
    });

    it("lets a visitor play audio for a published project", async function () {
      const result = await callMethod();
      assert.strictEqual(
        result,
        `data:audio/wav;base64,${audio.toString("base64")}`,
      );
      assert.deepStrictEqual(JSON.parse(fetchStub.firstCall.args[1].body), {
        text: "MeFolio. A portfolio builder.",
      });
    });

    it("rejects unpublished portfolios without contacting Piper", async function () {
      portfolio.isPublished = false;
      await assert.rejects(callMethod(), { error: "narration-not-available" });
      sinon.assert.notCalled(fetchStub);
    });

    it("rejects unknown portfolios and projects without contacting Piper", async function () {
      await assert.rejects(callMethod("missing"), {
        error: "narration-not-available",
      });
      await assert.rejects(callMethod("portfolio-1", "missing"), {
        error: "narration-not-available",
      });
      sinon.assert.notCalled(fetchStub);
    });

    it("rejects projects with no text to narrate", async function () {
      portfolio.publishedContent.projects[0] = {
        _id: "project-1",
        title: "  ",
      };
      await assert.rejects(callMethod(), { error: "narration-not-available" });
      sinon.assert.notCalled(fetchStub);
    });

    it("reuses cached audio until the project text changes", async function () {
      await callMethod();
      await callMethod();
      sinon.assert.calledOnce(fetchStub);

      portfolio.publishedContent.projects[0].description = "Edited story.";
      await callMethod();
      sinon.assert.calledTwice(fetchStub);
    });

    it("does not cache failed generations", async function () {
      fetchStub.onFirstCall().rejects(new TypeError("Connection refused"));
      await assert.rejects(callMethod(), {
        error: "narration-request-failed",
      });
      await callMethod();
      sinon.assert.calledTwice(fetchStub);
    });
  });
}
