import React, { useState } from "react";
import PropTypes from "prop-types";

// Formats an ISO issueDate string for display. Certifications store dates as
// strings (see normalizeCertification), so an empty string means "no date
// given" rather than an error.
const formatIssueDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const CertificationCard = ({ certification }) => {
  const [imageError, setImageError] = useState(false);
  const dateLabel = formatIssueDate(certification.issueDate);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-line bg-surface-fill p-4 shadow-sm transition hover:border-accent1/40">
      <div>
        {/* Header row: Source label & Verified Badge */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {certification.source === "credly" ? "Credly" : "Certification"}
          </span>
          {certification.verified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* Content: Icon + Title + Issuer */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-background p-1">
            {certification.imageUrl && !imageError ? (
              <img
                src={certification.imageUrl}
                alt=""
                onError={() => setImageError(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <svg
                className="h-5 w-5 text-accent1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-sm font-semibold leading-snug text-primary">
              {certification.title || "Untitled certification"}
            </h3>
            {certification.issuer && (
              <p className="mt-0.5 text-xs text-muted truncate">
                {certification.issuer}
              </p>
            )}
          </div>
        </div>

        {/* Issued date */}
        {dateLabel && (
          <p className="mt-3 text-xs text-muted">
            <span className="font-medium text-text">Issued:</span> {dateLabel}
          </p>
        )}
      </div>

      {/* Footer verification link */}
      {certification.verificationUrl && (
        <div className="mt-3 pt-2.5 border-t border-line/50">
          <a
            href={certification.verificationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent1 hover:underline"
          >
            <span>View credential</span>
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

CertificationCard.propTypes = {
  certification: PropTypes.shape({
    title: PropTypes.string,
    issuer: PropTypes.string,
    issueDate: PropTypes.string,
    imageUrl: PropTypes.string,
    verificationUrl: PropTypes.string,
    source: PropTypes.string,
    verified: PropTypes.bool,
  }).isRequired,
};

export const CertificationsSection = ({
  certifications = [],
  viewportMode = "desktop",
}) => {
  if (!certifications || !certifications.length) return null;

  return (
    <section
      id="certifications"
      className={`w-full border-b border-line bg-background ${
        viewportMode === "mobile" ? "px-5 pt-8 pb-10" : "px-20 pt-10 pb-16"
      }`}
    >
      {/* Centered header matching Featured Projects */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-primary">Certifications</h1>
        <p className="mt-2 text-sm text-muted">
          Verified credentials and industry achievements
        </p>
      </header>

      {/* Grid container */}
      <div
        className={`grid gap-5 ${
          viewportMode === "mobile"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {certifications.map((certification, index) => (
          <CertificationCard
            key={
              certification.verificationUrl ||
              `${certification.title}-${index}`
            }
            certification={certification}
          />
        ))}
      </div>
    </section>
  );
};

CertificationsSection.propTypes = {
  certifications: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      issuer: PropTypes.string,
      issueDate: PropTypes.string,
      imageUrl: PropTypes.string,
      verificationUrl: PropTypes.string,
      source: PropTypes.string,
      verified: PropTypes.bool,
    }),
  ),
  viewportMode: PropTypes.oneOf(["desktop", "mobile"]),
};

export default CertificationsSection;