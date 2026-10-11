import { Meteor } from "meteor/meteor";
import { normalizeCertification } from "../imports/api/certifications.js";

const CREDLY_API_BASE = "https://www.credly.com/users";
const CREDLY_BADGE_BASE = "https://www.credly.com/badges";
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Fetch a Credly user's public badges and map them to the portfolio
 * certification shape. The returned items can be passed through
 * normalizeCertification safely by the caller.
 */
export async function fetchCredlyBadges(username) {
  if (typeof username !== "string" || !/^[A-Za-z0-9._-]+$/.test(username)) {
    throw new Meteor.Error(
      "invalid-credly-username",
      "A valid Credly username is required.",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${CREDLY_API_BASE}/${encodeURIComponent(username)}/badges.json`,
      { headers: { Accept: "application/json" }, signal: controller.signal },
    );

    if (response.status === 404) {
      throw new Meteor.Error("credly-user-not-found", "Credly user not found.");
    }

    if (!response.ok) {
      throw new Meteor.Error(
        "credly-request-failed",
        "Credly could not return badge data.",
      );
    }

    const payload = await response.json();
    if (!Array.isArray(payload?.data)) {
      throw new Meteor.Error(
        "credly-invalid-response",
        "Credly returned an unexpected badge response.",
      );
    }

    const lastSyncedAt = new Date();
    return payload.data
      .filter((badge) => badge?.id && badge?.badge_template?.name)
      .map((badge) =>
        normalizeCertification({
          title: badge.badge_template.name,
          issuer: badge.issuer?.entities?.[0]?.entity?.name,
          issueDate: badge.issued_at_date,
          imageUrl: badge.badge_template.image_url,
          verificationUrl: `${CREDLY_BADGE_BASE}/${encodeURIComponent(badge.id)}`,
          source: "credly",
          verified: true,
          lastSyncedAt,
        }),
      );
  } catch (error) {
    if (error instanceof Meteor.Error) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new Meteor.Error(
        "credly-timeout",
        "Credly did not respond in time.",
      );
    }

    throw new Meteor.Error(
      "credly-request-failed",
      "Unable to fetch Credly badge data.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
