import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
import DraftComparisonModal from "./DraftComparisonModal";
import { getDraftStatus } from "./portfolioDraftDiff";

// Friendly names for the fields the publish method requires.
const REQUIRED_FIELD_LABELS = {
  title: "Portfolio title",
  bio: "Bio",
  "profile.fullName": "Your full name",
  projects: "At least one project",
};

// Mirrors the checks inside the portfolios.publish Meteor method so the owner
// is told what is missing before a request goes out. The server stays the
// authority - anything that slips past this is still rejected there.
const getMissingFields = (portfolio) => {
  if (!portfolio) return [];

  const missingFields = [];

  if (!portfolio.title || !String(portfolio.title).trim()) {
    missingFields.push("title");
  }

  if (!portfolio.bio || !String(portfolio.bio).trim()) {
    missingFields.push("bio");
  }

  const profileName =
    portfolio.profile?.fullName || portfolio.profile?.name || "";
  if (!String(profileName).trim()) {
    missingFields.push("profile.fullName");
  }

  if (!Array.isArray(portfolio.projects) || portfolio.projects.length === 0) {
    missingFields.push("projects");
  }

  return missingFields;
};

// Explains why publishing is unavailable and points the owner back to the
// dashboard to fill in what is missing. Publishing is blocked here - there is
// deliberately no way to continue past this dialog.
const MissingContentDialog = ({ missingFields, onClose, onGoToDashboard }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      data-testid="publish-blocked-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-blocked-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-5 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-fill shadow-2xl">
        <div className="border-b border-line px-6 py-5">
          <h2
            id="publish-blocked-title"
            className="text-lg font-bold text-primary"
          >
            Not ready to publish
          </h2>
          <p className="mt-1 text-sm text-muted">
            Your portfolio is missing content that visitors need to see. Add the
            following, then publish again.
          </p>

          <ul
            data-testid="publish-missing-list"
            className="mt-4 flex flex-col gap-2"
          >
            {missingFields.map((field) => (
              <li
                key={field}
                className="flex items-start gap-2 text-sm font-medium text-primary"
              >
                <span aria-hidden="true" className="text-accent1">
                  •
                </span>
                {REQUIRED_FIELD_LABELS[field] || field}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2.5 rounded-b-2xl border-t border-line bg-background px-6 py-4">
          <button
            type="button"
            data-testid="publish-blocked-close"
            onClick={onClose}
            className="rounded-lg border border-line bg-surface-fill px-5 py-2 text-sm font-medium text-muted transition hover:bg-selected"
          >
            Close
          </button>
          <button
            type="button"
            data-testid="publish-blocked-dashboard"
            onClick={onGoToDashboard}
            className="rounded-lg bg-button px-5 py-2 text-sm font-semibold text-secondary transition hover:bg-accent1"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

MissingContentDialog.propTypes = {
  missingFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onGoToDashboard: PropTypes.func.isRequired,
};

// Publishes the draft portfolio to the live site. Required content is checked
// first, and publishing is blocked with an explanation when anything is
// missing.
const PublishButton = ({
  portfolio,
  projects = [],
  sidebar = false,
  onGoToDashboard,
}) => {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBlockedDialogOpen, setIsBlockedDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const portfolioId = portfolio?._id;
  const missingFields = getMissingFields(portfolio);
  const isPublishing = status === "publishing";

  const handleClick = () => {
    if (!portfolioId || isPublishing) return;

    if (missingFields.length) {
      setIsBlockedDialogOpen(true);
      return;
    }

    setIsConfirmOpen(true);
  };

  const runPublish = () => {
    setIsConfirmOpen(false);
    setStatus("publishing");
    setErrorMessage("");

    Meteor.call("portfolios.publish", portfolioId, (error) => {
      if (error) {
        // Covers anything the client check cannot see, such as a project
        // record that has since been deleted.
        setErrorMessage(error.reason || "Could not publish. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("published");
    });
  };

  return (
    <>
      <div
        className={sidebar ? "flex flex-col gap-2" : "flex items-center gap-3"}
      >
        {!sidebar && portfolio?.isPublished && (
          <button
            type="button"
            data-testid="view-published-link"
            onClick={() => navigate("/published")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-surface-fill text-alt text-xs font-semibold rounded-lg border border-alt transition-colors duration-150 cursor-pointer"
          >
            View published portfolio
          </button>
        )}

        {status === "error" && (
          <span
            data-testid="publish-error-message"
            className="text-xs font-medium text-accent1"
          >
            {errorMessage}
          </span>
        )}

        <button
          type="button"
          data-testid="publish-btn"
          onClick={handleClick}
          disabled={!portfolioId || isPublishing}
          className={`rounded-lg bg-button px-4 text-sm font-bold text-secondary shadow-sm transition-colors hover:bg-accent1 disabled:cursor-not-allowed disabled:opacity-60 ${sidebar ? "w-full py-3" : "py-2"}`}
        >
          {isPublishing ? "Publishing..." : "Publish"}
        </button>
      </div>

      {isConfirmOpen && (
        <DraftComparisonModal
          isOpen={isConfirmOpen}
          portfolioTitle={portfolio?.title || "Untitled portfolio"}
          status={getDraftStatus({ portfolio, projects })}
          onClose={() => setIsConfirmOpen(false)}
          onPublish={runPublish}
        />
      )}

      {isBlockedDialogOpen && (
        <MissingContentDialog
          missingFields={missingFields}
          onClose={() => setIsBlockedDialogOpen(false)}
          onGoToDashboard={() => {
            setIsBlockedDialogOpen(false);
            if (onGoToDashboard) onGoToDashboard();
            else navigate("/");
          }}
        />
      )}
    </>
  );
};

PublishButton.propTypes = {
  portfolio: PropTypes.object,
  projects: PropTypes.arrayOf(PropTypes.object),
  sidebar: PropTypes.bool,
  onGoToDashboard: PropTypes.func,
};

export default PublishButton;
