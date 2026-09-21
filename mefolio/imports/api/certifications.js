// A portfolio certification (FEAT-26). Certifications are a separate concept
// from the existing `badges` field: they can be added manually by the owner or
// imported from an external provider (e.g. Credly), and provider-imported ones
// are marked verified.
//
// normalizeCertifications is pure so it can be unit-tested, and is shared by the
// update method and the publish snapshot so both store the exact same shape.

export const CERTIFICATION_SOURCES = ["manual", "credly"];

const asString = (value) => (typeof value === "string" ? value : "");

const asDateString = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  }
  return asString(value);
};

// Keep a valid Date, otherwise null (an Invalid Date is not usable data).
const asValidDateOrNull = (value) =>
  value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;

/**
 * Coerce one certification into the canonical stored shape. Missing or
 * wrong-typed fields fall back to safe defaults rather than throwing, so a
 * partial form submission or an external import can't corrupt the document.
 */
export const normalizeCertification = (certification = {}) => {
  const { issueDate, lastSyncedAt } = certification;

  return {
    title: asString(certification.title),
    issuer: asString(certification.issuer),
    // Stored as a string (ISO for Dates) so it serialises cleanly to the client.
    issueDate: asDateString(issueDate),
    imageUrl: asString(certification.imageUrl),
    verificationUrl: asString(certification.verificationUrl),
    source: CERTIFICATION_SOURCES.includes(certification.source)
      ? certification.source
      : "manual",
    verified: certification.verified === true,
    // Only set by an external sync; null for manual entries.
    lastSyncedAt: asValidDateOrNull(lastSyncedAt),
  };
};

/**
 * Normalise a list of certifications; a non-array becomes an empty list.
 */
export const normalizeCertifications = (certifications) =>
  Array.isArray(certifications)
    ? certifications.map(normalizeCertification)
    : [];
