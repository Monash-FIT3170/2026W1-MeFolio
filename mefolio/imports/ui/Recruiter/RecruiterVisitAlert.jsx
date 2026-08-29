import { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Bell, X } from "lucide-react";
import { RecruiterVisits } from "../../api/recruiterVisits";

const AUTO_DISMISS_MS = 6000;

// FEAT-17 (AC2): shows a transient in-app alert whenever a recruiter opens one
// of the owner's links while the dashboard is open. Backed by the reactive
// recruiterVisits.forOwner publication, so no polling is needed.
export default function RecruiterVisitAlert() {
  // Only visits that arrive after mount should alert; earlier visits belong to
  // the visit-history view, not a live notification. Track which ones we have
  // already shown so a reactive re-render never re-toasts the same visit.
  const mountedAt = useRef(new Date());
  const seenVisitIds = useRef(new Set());
  const [toasts, setToasts] = useState([]);

  const visits = useTracker(() => {
    if (!Meteor.userId() || !RecruiterVisits) return [];
    const handle = Meteor.subscribe("recruiterVisits.forOwner");
    if (!handle.ready()) return [];
    return RecruiterVisits.find(
      {},
      { sort: { createdAt: -1 }, limit: 50 },
    ).fetch();
  }, []);

  useEffect(() => {
    const fresh = visits.filter(
      (visit) =>
        visit.createdAt &&
        new Date(visit.createdAt) > mountedAt.current &&
        !seenVisitIds.current.has(visit._id),
    );
    if (fresh.length === 0) return;

    fresh.forEach((visit) => seenVisitIds.current.add(visit._id));
    setToasts((prev) => [
      ...fresh.map((visit) => ({
        id: visit._id,
        company: visit.recruiterCompany || "A recruiter",
      })),
      ...prev,
    ]);

    // Auto-dismiss each toast; removal by id is idempotent, so no cleanup is
    // needed and a later visit never cancels an earlier toast's timer.
    fresh.forEach((visit) =>
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== visit._id)),
        AUTO_DISMISS_MS,
      ),
    );
  }, [visits]);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="flex max-w-sm items-start gap-3 rounded-xl border border-line bg-surface-fill px-4 py-3 shadow-lg"
        >
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-accent1" />
          <div className="flex-1">
            <p className="text-sm font-bold text-primary">
              New portfolio visit
            </p>
            <p className="text-sm text-muted">
              {toast.company} just viewed your portfolio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-muted transition-colors hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
