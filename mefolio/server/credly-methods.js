/**
 * Credly account linking and sync helpers.
 *
 * This module stores the public Credly handle for the signed-in user without
 * requiring Credly authentication. The value is intentionally kept private on
 * the Meteor user document so it is not copied into the published portfolio
 * payload.
 *
 * A Credly username is treated as a handle for public badge syncing, not proof
 * that the signed-in user owns the linked account. The sync keeps the profile
 * field server-side and validates it before writing.
 */
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";
import { fetchCredlyBadges } from "./credly-api.js";

/**
 * Normalise and validate a Credly handle before storing it on the user profile.
 * We only allow the characters Credly usernames typically use in public URLs.
 */
const normalizeCredlyUsername = (value) => {
  if (value === undefined || value === null) return null;

  if (typeof value !== "string") {
    throw new Meteor.Error(
      "invalid-credly-username",
      "Credly username must be a string.",
    );
  }

  const trimmed = value.trim();

  if (trimmed === "") return "";

  if (!/^[A-Za-z0-9._-]+$/.test(trimmed)) {
    throw new Meteor.Error(
      "invalid-credly-username",
      "Credly username may only contain letters, numbers, dots, underscores, and hyphens.",
    );
  }

  return trimmed;
};

Meteor.methods({
  /**
   * Save a Credly handle for the current user. This is the dedicated account
   * linking method for the later badge-sync flow; it persists the handle and
   * returns the cleaned username for the client.
   */
  async "users.setCredlyUsername"(username) {
    check(username, String);

    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to link a Credly account.",
      );
    }

    const normalized = normalizeCredlyUsername(username);

    if (normalized === null) {
      throw new Meteor.Error(
        "invalid-credly-username",
        "Credly username is required.",
      );
    }

    await Meteor.users.updateAsync(this.userId, {
      $set: { "profile.credlyUsername": normalized },
    });

    return normalized;
  },

  /**
   * Import public Credly badges into the current user's portfolio
   * certifications, preserving manual entries and avoiding duplicate imports.
   */
  async "users.syncCredlyCertifications"() {
    if (!this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You must be logged in to sync Credly certifications.",
      );
    }

    const user = await Meteor.users.findOneAsync(this.userId, {
      fields: { "profile.credlyUsername": 1 },
    });
    const username = user?.profile?.credlyUsername;

    if (!username) {
      throw new Meteor.Error(
        "credly-username-not-set",
        "Link a Credly username before syncing certifications.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync({
      userId: this.userId,
    });

    if (!portfolio) {
      throw new Meteor.Error(
        "portfolio-not-found",
        "Create a portfolio before syncing Credly certifications.",
      );
    }

    const importedCertifications = await fetchCredlyBadges(username);
    const existingCertifications = Array.isArray(portfolio.certifications)
      ? portfolio.certifications
      : [];
    const remainingImports = new Map(
      importedCertifications.map((certification) => [
        certification.verificationUrl,
        certification,
      ]),
    );

    const certifications = existingCertifications.map((certification) => {
      const verificationUrl = certification?.verificationUrl;
      if (
        certification?.source !== "credly" ||
        !remainingImports.has(verificationUrl)
      ) {
        return certification;
      }

      const refreshedCertification = remainingImports.get(verificationUrl);
      remainingImports.delete(verificationUrl);
      return refreshedCertification;
    });

    certifications.push(...remainingImports.values());

    await PortfolioCollection.updateAsync(portfolio._id, {
      $set: { certifications },
    });

    return importedCertifications.length;
  },
});
