import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { Random } from "meteor/random";
import { ProjectCollection } from "/imports/api/projects";
import { validateChallenge } from "./challenge-methods.js";

if (Meteor.isServer) {
  describe("validateChallenge", function () {
    it("normalizes the required fields, defaults the optional hint, and drops extras", function () {
      expect(
        validateChallenge({
          title: "Reverse text",
          language: "python",
          starterCode: 'value = "hello"',
          expectedOutput: "olleh",
          ignoredField: "not persisted",
        }),
      ).to.deep.equal({
        title: "Reverse text",
        language: "python",
        hint: "",
        starterCode: 'value = "hello"',
        expectedOutput: "olleh",
      });
    });

    it("keeps a provided hint", function () {
      expect(
        validateChallenge({
          title: "Add",
          language: "javascript",
          hint: "Use +",
          starterCode: "console.log(1 + 1);",
          expectedOutput: "2",
        }).hint,
      ).to.equal("Use +");
    });

    it("allows a project to omit its challenge", function () {
      expect(validateChallenge(undefined)).to.equal(undefined);
      expect(validateChallenge(null)).to.equal(undefined);
    });
  });

  describe("validate_challenge_completion", function () {
    let projectId;

    afterEach(async function () {
      if (projectId) {
        await ProjectCollection.removeAsync(projectId);
        projectId = null;
      }
    });

    const callValidation = (providedOutput) =>
      Meteor.server.method_handlers.validate_challenge_completion.call(
        { userId: null },
        projectId,
        providedOutput,
      );

    const insertChallengeProject = (expectedOutput) =>
      ProjectCollection.insertAsync({
        title: `Challenge ${Random.id()}`,
        challenge: {
          title: "Add two numbers",
          language: "javascript",
          hint: "",
          starterCode: "console.log(2 + 2);",
          expectedOutput,
        },
      });

    it("returns completed for an exact expected output match", async function () {
      projectId = await insertChallengeProject("4");
      expect(await callValidation("4")).to.deep.equal({ completed: true });
    });

    it("ignores surrounding whitespace when comparing", async function () {
      projectId = await insertChallengeProject("4");
      expect(await callValidation("4\n")).to.deep.equal({ completed: true });
    });

    it("returns incomplete when the provided output does not match", async function () {
      projectId = await insertChallengeProject("4");
      expect(await callValidation("5")).to.deep.equal({ completed: false });
    });

    it("rejects projects without a challenge", async function () {
      projectId = await ProjectCollection.insertAsync({
        title: `No challenge ${Random.id()}`,
      });

      let error;
      try {
        await callValidation("anything");
      } catch (caughtError) {
        error = caughtError;
      }

      expect(error.error).to.equal("projects.challenge-not-found");
    });

    it("rejects unknown projects", async function () {
      projectId = Random.id();

      let error;
      try {
        await callValidation("anything");
      } catch (caughtError) {
        error = caughtError;
      }

      expect(error.error).to.equal("projects.not-found");
    });
  });
}
