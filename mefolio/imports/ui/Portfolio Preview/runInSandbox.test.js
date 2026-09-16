import { expect } from "chai";
import sinon from "sinon";
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

    it("a thrown error never resolves with a truthy output alongside it", async function () {
      const result = await runInSandbox("throw new Error('boom');");
      expect(result.output).to.equal("");
      expect(result.error).to.contain("boom");
    });

    /**
     * QA: Verify the sandbox is safe — infinite loops time out; no
     * DOM/network/cookie access.
     */
    describe("QA: infinite loops time out", function () {
      it("times out a tight `while (true) {}` loop", async function () {
        const result = await runInSandbox("while (true) {}", {
          timeoutMs: 200,
        });
        expect(result.timedOut).to.equal(true);
        expect(result.error).to.equal("");
        expect(result.output).to.equal("");
      });

      it("catches a stack overflow from unbounded recursion instead of hanging", async function () {
        // Unlike while(true), recursion with no base case throws a stack
        // overflow almost instantly — it doesn't hang, so no timeout here.
        const result = await runInSandbox(
          "function loop() { return loop(); }\nloop();",
          { timeoutMs: 200 },
        );
        expect(result.timedOut).to.equal(false);
        expect(result.error).to.not.equal("");
      });

      it("times out a busy-spin loop that never yields", async function () {
        const result = await runInSandbox(
          "var i = 0;\nwhile (i >= 0) { i++; }",
          { timeoutMs: 200 },
        );
        expect(result.timedOut).to.equal(true);
      });

      it("does not time out ordinary fast-running code", async function () {
        // Sanity check: normal code shouldn't get killed too.
        const result = await runInSandbox("console.log(1 + 1);", {
          timeoutMs: 200,
        });
        expect(result.timedOut).to.equal(false);
        expect(result.output).to.equal("2");
      });

      it("actually terminates the worker on timeout instead of leaving it running", async function () {
        // A timed-out worker left running is a resource leak. Confirm
        // terminate() is actually called, not just that the promise resolves.
        const terminateSpy = sinon.spy(Worker.prototype, "terminate");
        try {
          await runInSandbox("while (true) {}", { timeoutMs: 150 });
          expect(terminateSpy.called).to.equal(true);
        } finally {
          terminateSpy.restore();
        }
      });
    });

    describe("QA: no DOM access", function () {
      it("has no access to `document`", async function () {
        const result = await runInSandbox("typeof document;");
        // Workers never have `document` — this is a platform guarantee, but
        // worth asserting so a future refactor can't silently break it.
        expect(result.error).to.equal("");
        expect(result.output).to.equal("undefined");
      });

      it("has no access to `window`", async function () {
        const result = await runInSandbox("typeof window;");
        expect(result.output).to.equal("undefined");
      });

      it("cannot manipulate the page via `document.write` or similar", async function () {
        const result = await runInSandbox(
          "typeof document !== 'undefined' && document.write('x');",
        );
        expect(result.error).to.equal("");
        expect(result.output).to.equal("false");
      });
    });

    describe("QA: no cookie access", function () {
      it("has no access to `document.cookie`", async function () {
        const result = await runInSandbox(
          "typeof document !== 'undefined' ? document.cookie : 'no-document';",
        );
        expect(result.error).to.equal("");
        expect(result.output).to.equal("no-document");
      });
    });

    describe("QA: no network access", function () {
      it("cannot use fetch", async function () {
        const result = await runInSandbox("typeof self.fetch;");
        expect(result.output).to.equal("undefined");
      });

      it("actually attempting fetch throws rather than silently succeeding", async function () {
        const result = await runInSandbox("fetch('https://example.com');");
        expect(result.error).to.not.equal("");
        expect(result.output).to.equal("");
      });

      it("cannot use XMLHttpRequest", async function () {
        const result = await runInSandbox("typeof self.XMLHttpRequest;");
        expect(result.output).to.equal("undefined");
      });

      it("actually attempting XMLHttpRequest throws", async function () {
        const result = await runInSandbox("new XMLHttpRequest();");
        expect(result.error).to.not.equal("");
      });

      it("cannot use WebSocket", async function () {
        const result = await runInSandbox("typeof self.WebSocket;");
        expect(result.output).to.equal("undefined");
      });

      it("actually attempting a WebSocket connection throws", async function () {
        const result = await runInSandbox("new WebSocket('wss://example.com');");
        expect(result.error).to.not.equal("");
      });

      it("cannot import external scripts", async function () {
        const result = await runInSandbox("typeof self.importScripts;");
        expect(result.output).to.equal("undefined");
      });

      it("actually attempting importScripts throws", async function () {
        const result = await runInSandbox(
          "importScripts('https://example.com/evil.js');",
        );
        expect(result.error).to.not.equal("");
      });
    });
  });
}