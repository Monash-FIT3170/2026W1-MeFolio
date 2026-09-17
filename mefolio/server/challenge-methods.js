import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ProjectCollection } from "/imports/api/projects";

const CHALLENGE_FIELDS = ["title", "language", "starterCode", "expectedOutput"];
const OPTIONAL_CHALLENGE_FIELDS = ["hint"];

export const validateChallenge = (challenge) => {
  if (challenge === undefined || challenge === null) return undefined;
  check(challenge, Object);

  const normalizedChallenge = {};
  for (const field of CHALLENGE_FIELDS) {
    if (typeof challenge[field] !== "string") {
      throw new Meteor.Error(
        "projects.invalid-challenge",
        `Challenge ${field} must be a string.`,
      );
    }
    normalizedChallenge[field] = challenge[field];
  }

  // Optional fields default to "" and are only rejected if present but non-string.
  for (const field of OPTIONAL_CHALLENGE_FIELDS) {
    if (challenge[field] === undefined || challenge[field] === null) {
      normalizedChallenge[field] = "";
    } else if (typeof challenge[field] !== "string") {
      throw new Meteor.Error(
        "projects.invalid-challenge",
        `Challenge ${field} must be a string.`,
      );
    } else {
      normalizedChallenge[field] = challenge[field];
    }
  }

  return normalizedChallenge;
};

Meteor.methods({
  async validate_challenge_completion(projectId, providedOutput) {
    check(projectId, String);
    check(providedOutput, String);

    const project = await ProjectCollection.findOneAsync(projectId, {
      fields: { challenge: 1 },
    });

    if (!project) {
      throw new Meteor.Error("projects.not-found", "Project not found.");
    }

    if (!project.challenge) {
      throw new Meteor.Error(
        "projects.challenge-not-found",
        "This project does not have a challenge.",
      );
    }

    // Compare trimmed so trailing newlines / surrounding spaces don't fail an
    // otherwise-correct answer. The client sends the sandbox's captured output.
    return {
      completed:
        providedOutput.trim() ===
        (project.challenge.expectedOutput || "").trim(),
    };
  },
});
