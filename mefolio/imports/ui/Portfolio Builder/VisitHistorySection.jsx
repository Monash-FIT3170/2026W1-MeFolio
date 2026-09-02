import { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { RecruiterVisits } from "/imports/api/recruiterVisits";
import { formatRelativeTime } from "/imports/ui/Portfolio Builder/visitHistoryFormat";

const VisitLogRow = ({ visit }) => {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line bg-surface-fill px-1 py-4 last:border-b-0">
      <div className="min-w-0">
        <h3 className="m-0 truncate text-sm font-semibold text-primary">
          {visit.recruiterCompany || "Unknown company"}
        </h3>

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
    createdAt: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string,
    ]),
    metadata: PropTypes.shape({
      referrer: PropTypes.string,
    }),
  }).isRequired,
};

export const VisitHistorySection = ({ portfolioId }) => {
  const [error, setError] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  // Reactive subscription: live updates arrive instantly without polling
  const { visits, isLoading } = useTracker(() => {
    if (!portfolioId || !Meteor.userId() || !RecruiterVisits) {
      return { visits: [], isLoading: false };
    }

    const sub = Meteor.subscribe("recruiterVisits.forOwner");
    const ready = sub.ready();

    const fetchedVisits = RecruiterVisits.find(
      { portfolioId },
      { sort: { createdAt: -1 } },
    ).fetch();

    return {
      visits: fetchedVisits,
      isLoading: !ready,
    };
  }, [portfolioId]);

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all recorded visit history? This cannot be undone.",
    );
    if (!confirmed) return;

    setIsClearing(true);
    setError(null);

    Meteor.call("recruiterVisits.clearHistory", { portfolioId }, (err) => {
      setIsClearing(false);

      if (err) {
        setError(err.reason || "Could not clear visit history.");
      }
    });
  };

  const totalVisits = visits.length;

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

        {visits.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={isClearing}
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-primary hover:bg-selected disabled:opacity-50"
            >
              {isClearing ? "Clearing..." : "Clear history"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-line bg-background p-4 text-sm font-medium text-primary">
          {error}
        </div>
      )}

      {!portfolioId && (
        <p className="mt-6 text-sm text-muted">
          Select a portfolio to view its visit history.
        </p>
      )}

      {portfolioId && isLoading && !error && (
        <p className="mt-6 text-sm text-muted">Loading visit history...</p>
      )}

      {portfolioId && !isLoading && !error && visits.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          No recruiter visits recorded yet. Once a recruiter opens one of your
          access links, it will show up here.
        </p>
      )}

      {portfolioId && !isLoading && !error && visits.length > 0 && (
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
  portfolioId: PropTypes.string,
};
