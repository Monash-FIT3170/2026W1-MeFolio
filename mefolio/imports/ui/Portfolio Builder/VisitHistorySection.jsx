import { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";

// Formats a createdAt Date into a short relative string, matching the
// "2 min ago" language already used elsewhere on the dashboard (see
// VisitorCard in OverviewSection.jsx).
const formatRelativeTime = (date) => {
  if (!date) return "";

  const timestamp = date instanceof Date ? date : new Date(date);
  const diffMs = Date.now() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(timestamp);
};

// Shows the last 4 characters of a token so an owner can distinguish which
// link a visit came from without the full access code being displayed.
const formatTokenSuffix = (token) => {
  if (!token || token.length < 4) return "";
  return token.slice(-4);
};

// Single row in the visit-history log.
const VisitLogRow = ({ visit }) => {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line bg-surface-fill px-1 py-4 last:border-b-0">
      <div className="min-w-0">
        <h3 className="m-0 truncate text-sm font-semibold text-primary">
          {visit.recruiterCompany || "Unknown company"}
        </h3>

        {formatTokenSuffix(visit.token) && (
          <p className="mt-0.5 truncate text-xs text-muted">
            Link ending in ...{formatTokenSuffix(visit.token)}
          </p>
        )}

        {visit.metadata?.referrer && (
          <p className="mt-0.5 truncate text-xs text-muted">
            Referred from {visit.metadata.referrer}
          </p>
        )}
      </div>

      <div className="text-right">
        <span className="block text-sm font-semibold text-primary">
          {formatRelativeTime(visit.createdAt)}
        </span>
      </div>
    </div>
  );
};

VisitLogRow.propTypes = {
  visit: PropTypes.shape({
    _id: PropTypes.string,
    recruiterCompany: PropTypes.string,
    token: PropTypes.string,
    createdAt: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string,
    ]),
    metadata: PropTypes.shape({
      referrer: PropTypes.string,
    }),
  }).isRequired,
};

// Displays a chronological (newest-first) log of recruiter visits for a
// portfolio, backed by the recruiterVisits.getStats method.
export const VisitHistorySection = ({ portfolioId }) => {
  const [visits, setVisits] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  const loadVisits = useCallback(() => {
    if (!portfolioId) return;

    setIsLoading(true);
    setError(null);

    Meteor.call("recruiterVisits.getStats", { portfolioId }, (err, result) => {
      setIsLoading(false);

      if (err) {
        setError(err.reason || "Could not load visit history.");
        return;
      }

      setVisits(result?.visits || []);
      setTotalVisits(result?.totalVisits || 0);
    });
  }, [portfolioId]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all recorded visit history? This cannot be undone.",
    );
    if (!confirmed) return;

    setIsClearing(true);

    Meteor.call("recruiterVisits.clearHistory", { portfolioId }, (err) => {
      setIsClearing(false);

      if (err) {
        setError(err.reason || "Could not clear visit history.");
        return;
      }

      setVisits([]);
      setTotalVisits(0);
    });
  };

  return (
    <section className="rounded-lg border border-line bg-surface-fill p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h2 className="m-0 text-lg font-bold text-primary">Visit History</h2>
          <p className="mt-1 text-sm text-muted">
            {totalVisits > 0
              ? `${totalVisits} recorded ${totalVisits === 1 ? "visit" : "visits"}, newest first.`
              : "A log of recruiter link access."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadVisits}
            disabled={isLoading}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-primary hover:bg-selected disabled:opacity-50"
          >
            Refresh
          </button>

          {visits.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={isClearing}
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-primary hover:bg-selected disabled:opacity-50"
            >
              {isClearing ? "Clearing..." : "Clear history"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-line bg-background p-4 text-sm font-medium text-primary">
          {error}
        </div>
      )}

      {isLoading && !error && (
        <p className="mt-6 text-sm text-muted">Loading visit history...</p>
      )}

      {!isLoading && !error && visits.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          No recruiter visits recorded yet. Once a recruiter opens one of your
          access links, it will show up here.
        </p>
      )}

      {!isLoading && !error && visits.length > 0 && (
        <div className="mt-4">
          {visits.map((visit) => (
            <VisitLogRow key={visit._id} visit={visit} />
          ))}
        </div>
      )}
    </section>
  );
};

VisitHistorySection.propTypes = {
  portfolioId: PropTypes.string.isRequired,
};
