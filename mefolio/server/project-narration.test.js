import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "/imports/api/portfolio";
import { Buffer } from "buffer";
import assert from "assert";
import sinon from "sinon";
import { generateProjectNarration } from "./project-narration.js";

if (Meteor.isServer) {
  describe("project narration", function () {
    let sandbox;
    let fetchStub;
    let portfolioStub;
    let originalPrivateSettings;
    let audio;

    const callMethod = (
      userId,
      portfolioId = "owner-portfolio",
      text = "Private case study.",
    ) =>
      Meteor.server.method_handlers["projects.generateNarration"].call(
        { userId },
        portfolioId,
        text,
      );

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      originalPrivateSettings = Meteor.settings.private;
      Meteor.settings.private = { ...originalPrivateSettings, piper: {} };
      audio = Buffer.alloc(46);
      audio.write("RIFF", 0);
      audio.write("WAVE", 8);
      fetchStub = sandbox.stub(globalThis, "fetch").resolves({
        ok: true,
        arrayBuffer: async () => audio,
      });
      portfolioStub = sandbox
        .stub(PortfolioCollection, "findOneAsync")
        .callsFake(async (selector) =>
          selector._id === "owner-portfolio" && selector.userId === "owner"
            ? { _id: "owner-portfolio", userId: "owner" }
            : undefined,
        );
    });

    afterEach(function () {
      sandbox.restore();
      Meteor.settings.private = originalPrivateSettings;
    });

    it("returns WAV audio only after checking portfolio ownership", async function () {
      const result = await callMethod("owner");
      assert.strictEqual(
        result,
        `data:audio/wav;base64,${audio.toString("base64")}`,
      );
      sinon.assert.calledOnceWithExactly(portfolioStub, {
        _id: "owner-portfolio",
        userId: "owner",
      });
      sinon.assert.callOrder(portfolioStub, fetchStub);
      const [url, options] = fetchStub.firstCall.args;
      assert.strictEqual(url, "http://127.0.0.1:5000/synthesize");
      assert.strictEqual(options.method, "POST");
      assert.strictEqual(options.headers.Accept, "audio/wav");
      assert.deepStrictEqual(JSON.parse(options.body), {
        text: "Private case study.",
      });
      assert.ok(options.signal instanceof AbortSignal);
    });

    for (const userId of [null, "other-user"]) {
      it(`rejects ${userId || "public visitors"} without contacting Piper`, async function () {
        await assert.rejects(callMethod(userId), { error: "not-authorized" });
        sinon.assert.notCalled(fetchStub);
        if (!userId) sinon.assert.notCalled(portfolioStub);
      });
    }

    it("rejects a missing or different portfolio without contacting Piper", async function () {
      await assert.rejects(callMethod("owner", "another-portfolio"), {
        error: "not-authorized",
      });
      sinon.assert.notCalled(fetchStub);
    });

    for (const text of [null, "", "   ", "a".repeat(5001)]) {
      it(`rejects invalid text (${typeof text}, length ${text?.length ?? 0})`, async function () {
        await assert.rejects(callMethod("owner", "owner-portfolio", text));
        sinon.assert.notCalled(fetchStub);
      });
    }

    it("trims text and accepts the character limit", async function () {
      await generateProjectNarration(`  ${"a".repeat(5000)}  `);
      assert.strictEqual(
        JSON.parse(fetchStub.firstCall.args[1].body).text.length,
        5000,
      );
    });

    it("uses the private server endpoint setting", async function () {
      Meteor.settings.private.piper.url = "http://piper:5000/synthesize";
      await callMethod("owner");
      assert.strictEqual(
        fetchStub.firstCall.args[0],
        "http://piper:5000/synthesize",
      );
    });

    it("does not return provider errors containing private text", async function () {
      fetchStub.resolves({
        ok: false,
        status: 500,
        body: "Private case study.",
      });
      await assert.rejects(callMethod("owner"), {
        error: "narration-request-failed",
        reason: "Piper could not generate project audio.",
      });
    });

    it("handles an unavailable Piper service", async function () {
      fetchStub.rejects(new TypeError("Connection refused"));
      await assert.rejects(callMethod("owner"), {
        error: "narration-request-failed",
      });
    });

    for (const body of [
      Buffer.alloc(0),
      Buffer.from("Not WAV audio"),
      Buffer.alloc(46),
    ]) {
      it(`rejects invalid audio of length ${body.length}`, async function () {
        fetchStub.resolves({ ok: true, arrayBuffer: async () => body });
        await assert.rejects(callMethod("owner"), {
          error: "narration-request-failed",
        });
      });
    }

    it("aborts timed-out requests and clears the timer", async function () {
      const timeoutSpy = sandbox.spy(globalThis, "setTimeout");
      const clearTimeoutSpy = sandbox.spy(globalThis, "clearTimeout");
      fetchStub.callsFake(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            options.signal.addEventListener("abort", () => {
              const error = new Error("Aborted");
              error.name = "AbortError";
              reject(error);
            });
          }),
      );
      const rejection = assert.rejects(
        generateProjectNarration("Private case study."),
        {
          error: "narration-timeout",
        },
      );
      assert.strictEqual(timeoutSpy.firstCall.args[1], 60000);
      timeoutSpy.firstCall.args[0]();
      await rejection;
      sinon.assert.calledWithExactly(
        clearTimeoutSpy,
        timeoutSpy.firstCall.returnValue,
      );
    });
  });
}
