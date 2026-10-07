import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";
import { Buffer } from "buffer";
import { env } from "process";
import { PortfolioCollection } from "/imports/api/portfolio";
import { buildNarrationText } from "/imports/api/projectNarration";

export async function generateProjectNarration(text) {
  check(text, String);
  const narrationText = text.trim();
  if (!narrationText || narrationText.length > 5000) {
    throw new Meteor.Error(
      "invalid-narration-text",
      "Project text must contain between 1 and 5,000 characters.",
    );
  }

  const url =
    Meteor.settings?.private?.piper?.url ||
    env.PIPER_URL ||
    "http://127.0.0.1:5000/synthesize";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "audio/wav" },
      body: JSON.stringify({ text: narrationText }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Meteor.Error(
        "narration-request-failed",
        "Piper could not generate project audio.",
      );
    }

    const audio = Buffer.from(await response.arrayBuffer());
    if (
      audio.length <= 44 ||
      audio.toString("ascii", 0, 4) !== "RIFF" ||
      audio.toString("ascii", 8, 12) !== "WAVE"
    ) {
      throw new Meteor.Error(
        "narration-request-failed",
        "Piper did not return WAV audio.",
      );
    }

    return `data:audio/wav;base64,${audio.toString("base64")}`;
  } catch (error) {
    if (error instanceof Meteor.Error) {
      throw error;
    }
    throw new Meteor.Error(
      error?.name === "AbortError"
        ? "narration-timeout"
        : "narration-request-failed",
      error?.name === "AbortError"
        ? "Piper did not respond in time."
        : "Unable to generate project audio. Check that Piper is running.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

const MAX_CACHED_NARRATIONS = 50;
const narrationCache = new Map();

export function clearNarrationCache() {
  narrationCache.clear();
}

// Keyed by the narrated text, so editing the project produces fresh audio.
function getCachedNarration(text) {
  if (!narrationCache.has(text)) {
    if (narrationCache.size >= MAX_CACHED_NARRATIONS) {
      narrationCache.delete(narrationCache.keys().next().value);
    }
    const pending = generateProjectNarration(text).catch((error) => {
      narrationCache.delete(text);
      throw error;
    });
    narrationCache.set(text, pending);
  }
  return narrationCache.get(text);
}

export async function getPublishedNarrationAudio(portfolioId, projectId) {
  check(portfolioId, String);
  check(projectId, String);

  const portfolio = await PortfolioCollection.findOneAsync(portfolioId, {
    fields: { isPublished: 1, "publishedContent.projects": 1 },
  });
  const project =
    portfolio?.isPublished === true &&
    Array.isArray(portfolio.publishedContent?.projects)
      ? portfolio.publishedContent.projects.find(
          (publishedProject) => publishedProject?._id === projectId,
        )
      : undefined;

  if (!project) {
    throw new Meteor.Error(
      "narration-not-available",
      "This project does not have audio available.",
    );
  }

  const text = buildNarrationText(project);
  if (!text) {
    throw new Meteor.Error(
      "narration-not-available",
      "This project does not have audio available.",
    );
  }

  return getCachedNarration(text);
}

if (Meteor.isServer) {
  DDPRateLimiter.addRule(
    {
      type: "method",
      name: "projects.getNarrationAudio",
      connectionId: () => true,
    },
    10,
    60 * 1000,
  );

  Meteor.methods({
    async "projects.getNarrationAudio"(portfolioId, projectId) {
      return getPublishedNarrationAudio(portfolioId, projectId);
    },

    async "projects.generateNarration"(portfolioId, text) {
      if (!this.userId) {
        throw new Meteor.Error(
          "not-authorized",
          "Log in to generate project audio.",
        );
      }
      check(portfolioId, String);
      check(text, String);

      const portfolio = await PortfolioCollection.findOneAsync({
        _id: portfolioId,
        userId: this.userId,
      });
      if (!portfolio) {
        throw new Meteor.Error(
          "not-authorized",
          "You can only generate audio for your own portfolio.",
        );
      }

      return generateProjectNarration(text);
    },
  });
}
