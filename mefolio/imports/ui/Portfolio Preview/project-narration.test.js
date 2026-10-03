import assert from "assert";
import sinon from "sinon";
import {
  generateProjectNarration,
  stopProjectNarration,
} from "./project-narration.js";

describe("project narration", function () {
  let originalSpeech;
  let originalUtterance;
  let speech;

  beforeEach(function () {
    originalSpeech = Object.getOwnPropertyDescriptor(
      globalThis,
      "speechSynthesis",
    );
    originalUtterance = Object.getOwnPropertyDescriptor(
      globalThis,
      "SpeechSynthesisUtterance",
    );
    speech = { speak: sinon.spy(), cancel: sinon.spy() };
    Object.defineProperty(globalThis, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: speech,
    });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
      configurable: true,
      writable: true,
      value: class {
        constructor(text) {
          this.text = text;
        }
      },
    });
  });

  afterEach(function () {
    if (originalSpeech) {
      Object.defineProperty(globalThis, "speechSynthesis", originalSpeech);
    } else {
      delete globalThis.speechSynthesis;
    }
    if (originalUtterance) {
      Object.defineProperty(
        globalThis,
        "SpeechSynthesisUtterance",
        originalUtterance,
      );
    } else {
      delete globalThis.SpeechSynthesisUtterance;
    }
  });

  it("speaks project text using the browser and returns the utterance", function () {
    const utterance = generateProjectNarration("  My project case study.  ");

    assert.strictEqual(utterance.text, "My project case study.");
    assert.ok(utterance instanceof globalThis.SpeechSynthesisUtterance);
    sinon.assert.calledOnceWithExactly(speech.speak, utterance);
    sinon.assert.callOrder(speech.cancel, speech.speak);
  });

  for (const text of [null, 42, "", "   ", "a".repeat(5001)]) {
    it(`rejects invalid text (${typeof text}, length ${text?.length ?? 0})`, function () {
      assert.throws(
        () => generateProjectNarration(text),
        /1 and 5,000 characters/,
      );
      sinon.assert.notCalled(speech.speak);
      sinon.assert.notCalled(speech.cancel);
    });
  }

  it("accepts text at the character limit", function () {
    const utterance = generateProjectNarration("a".repeat(5000));
    assert.strictEqual(utterance.text.length, 5000);
    sinon.assert.calledOnce(speech.speak);
  });

  for (const missingApi of ["speechSynthesis", "SpeechSynthesisUtterance"]) {
    it(`reports unsupported browsers without ${missingApi}`, function () {
      globalThis[missingApi] = undefined;
      assert.throws(
        () => generateProjectNarration("Project text"),
        /does not support/,
      );
      sinon.assert.notCalled(speech.speak);
    });
  }

  it("stops narration", function () {
    stopProjectNarration();
    sinon.assert.calledOnce(speech.cancel);
  });

  it("can safely stop when speech synthesis is unavailable", function () {
    globalThis.speechSynthesis = undefined;
    assert.doesNotThrow(() => stopProjectNarration());
  });
});
