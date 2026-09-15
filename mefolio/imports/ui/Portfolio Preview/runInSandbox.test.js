import { expect } from "chai";
import { Meteor } from "meteor/meteor";
import {
  buildWorkerSource,
  normalizeOutput,
  runInSandbox,
} from "./runInSandbox.js";

// Pure helpers — run on both client and server.
describe("runInSandbox helpers", function () {
  describe("normalizeOutput", function () {
    it("trims surrounding whitespace so 4 and 4\\n compare equal", function () {
      expect(normalizeOutput("4\n")).to.equal("4");
      expect(normalizeOutput("  hello  ")).to.equal("hello");
    });

    it("coerces null/undefined to an empty string", function () {
      expect(normalizeOutput(undefined)).to.equal("");
      expect(normalizeOutput(null)).to.equal("");
    });
  });

  describe("buildWorkerSource", function () {
    it("embeds the code as a JSON-encoded string (injection-safe)", function () {
      const src = buildWorkerSource('console.log("hi");');
      expect(src).to.contain(JSON.stringify('console.log("hi");'));
    });

    it("removes the worker's network/script escape hatches", function () {
      const src = buildWorkerSource("");
      expect(src).to.contain("self.fetch = undefined");
      expect(src).to.contain("self.XMLHttpRequest = undefined");
      expect(src).to.contain("self.importScripts = undefined");
    });
  });
});

// Real Web Worker execution — client only. Each call terminates its own worker,
// so these cannot leave anything running to hang the test runner.
if (Meteor.isClient) {
  describe("runInSandbox (Web Worker execution)", function () {
    it("returns the console output of a passing snippet", async function () {
      const result = await runInSandbox("console.log(2 + 2);");
      expect(result.timedOut).to.equal(false);
      expect(result.error).to.equal("");
      expect(result.output).to.equal("4");
    });

    it("captures the last expression's value when nothing is logged", async function () {
      const result = await runInSandbox(
        "const add = (a, b) => a + b;\nadd(2, 2);",
      );
      expect(result.error).to.equal("");
      expect(result.output).to.equal("4");
    });

    it("prefers console.log output over the expression value", async function () {
      const result = await runInSandbox("console.log('logged');\n99;");
      expect(result.output).to.equal("logged");
    });

    it("reports an error thrown by the snippet", async function () {
      const result = await runInSandbox("throw new Error('boom');");
      expect(result.timedOut).to.equal(false);
      expect(result.output).to.equal("");
      expect(result.error).to.contain("boom");
    });

    it("times out an infinite loop instead of hanging", async function () {
      const result = await runInSandbox("while (true) {}", { timeoutMs: 200 });
      expect(result.timedOut).to.equal(true);
    });
  });
}
