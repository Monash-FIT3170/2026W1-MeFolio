// Runs a visitor's JavaScript for a project challenge inside a throwaway Web
// Worker, so the snippet can prove itself by actually executing — without any
// access to the page (no DOM, cookies, or navigation) and without being able to
// hang the tab. The worker captures console output; the caller sends that output
// to the server to compare against the (never-shipped) expected result.
//
// buildWorkerSource and normalizeOutput are pure and exported so the comparison
// contract can be unit-tested without spinning up a real Worker.

const DEFAULT_TIMEOUT_MS = 1500;

// The program that runs inside the worker: it captures console output, removes
// the network/script escape hatches a worker would otherwise have, runs the
// visitor's code, and posts back the captured output (or the error).
export const buildWorkerSource = (code) => `
  self.onmessage = function () {
    var logs = [];
    var capture = function () {
      var parts = Array.prototype.slice.call(arguments).map(function (value) {
        try {
          return typeof value === "string" ? value : JSON.stringify(value);
        } catch (e) {
          return String(value);
        }
      });
      logs.push(parts.join(" "));
    };
    self.console = { log: capture, info: capture, warn: capture, error: capture };

    // Take away the ways worker code could reach the network or load scripts.
    self.fetch = undefined;
    self.XMLHttpRequest = undefined;
    self.importScripts = undefined;
    self.WebSocket = undefined;

    try {
      // Indirect eval runs the code in the worker's global scope, not this
      // closure, and returns the value of the final expression.
      var result = (0, eval)(${JSON.stringify(code)});
      var output = logs.join("\\n");
      // If the visitor logged nothing, fall back to whatever their code
      // evaluated to — so a bare expression like "2 + 2" or "sum([1,2,3])"
      // is captured automatically without an explicit console.log.
      if (output === "" && result !== undefined) {
        output = typeof result === "string" ? result : JSON.stringify(result);
      }
      self.postMessage({ ok: true, output: output });
    } catch (error) {
      self.postMessage({
        ok: false,
        error: String(error && error.message ? error.message : error),
      });
    }
  };
`;

// Trim surrounding whitespace so "4", " 4 " and "4\n" all compare equal. The
// server trims the expected output the same way.
export const normalizeOutput = (value) => String(value ?? "").trim();

/**
 * Run visitor code in a sandboxed Web Worker.
 * @returns {Promise<{ output: string, error: string, timedOut: boolean }>}
 */
export const runInSandbox = (code, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) =>
  new Promise((resolve) => {
    // No Worker/Blob (SSR or an unsupported host) — fail closed, don't throw.
    if (typeof Worker === "undefined" || typeof Blob === "undefined") {
      resolve({
        output: "",
        error: "Code execution is not supported in this browser.",
        timedOut: false,
      });
      return;
    }

    let settled = false;
    let worker;
    let blobUrl;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (worker) worker.terminate();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      resolve(result);
    };

    const timer = setTimeout(
      () => finish({ output: "", error: "", timedOut: true }),
      timeoutMs,
    );

    try {
      blobUrl = URL.createObjectURL(
        new Blob([buildWorkerSource(code)], {
          type: "application/javascript",
        }),
      );
      worker = new Worker(blobUrl);
      worker.onmessage = (event) => {
        const data = event.data || {};
        finish({
          output: data.ok ? normalizeOutput(data.output) : "",
          error: data.ok ? "" : data.error || "Your code threw an error.",
          timedOut: false,
        });
      };
      worker.onerror = (event) => {
        finish({
          output: "",
          error: event.message || "Your code failed to run.",
          timedOut: false,
        });
      };
      worker.postMessage("run");
    } catch (error) {
      finish({
        output: "",
        error: String(error?.message || error),
        timedOut: false,
      });
    }
  });
