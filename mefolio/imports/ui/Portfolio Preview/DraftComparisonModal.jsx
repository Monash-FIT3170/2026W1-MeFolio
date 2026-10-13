import PropTypes from "prop-types";
import { useEffect } from "react";
import { formatDiffValue } from "./portfolioDraftDiff";

const DraftComparisonModal = ({
  isOpen,
  onClose,
  status,
  onPublish,
  portfolioTitle,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) {
    return null;
  }

  const { fieldChanges, projectChanges, neverPublished } = status;
  const hasAnyChange =
    fieldChanges.length > 0 ||
    projectChanges.added.length > 0 ||
    projectChanges.removed.length > 0 ||
    projectChanges.modified.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-confirm-title"
      data-testid="publish-confirm-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface-fill border border-line shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="publish-confirm-title"
            className="text-xl font-extrabold text-primary"
          >
            Review changes before publishing
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-primary text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <p
          data-testid="publish-confirm-target"
          className="mb-2 text-sm font-semibold text-primary"
        >
          {portfolioTitle}
        </p>
        <p className="mb-5 text-sm text-muted">
          {neverPublished
            ? "This draft will become your published portfolio."
            : "Publishing will replace your live portfolio with the changes below."}
        </p>

        {!hasAnyChange && !neverPublished ? (
          <p className="text-sm text-muted">
            Your draft matches the live portfolio, nothing has changed.
          </p>
        ) : (
          <div className="space-y-5">
            {fieldChanges.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-primary mb-2">
                  Field changes
                </h3>
                <ul className="space-y-2">
                  {fieldChanges.map((change) => (
                    <li
                      key={change.path}
                      className="text-sm rounded-lg border border-line px-3 py-2"
                    >
                      <span className="font-semibold text-primary">
                        {change.label}
                      </span>
                      <div className="text-muted mt-1">
                        <span className="line-through opacity-70">
                          {formatDiffValue(change.from)}
                        </span>
                        {" -> "}
                        <span className="text-alt font-semibold">
                          {formatDiffValue(change.to)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(projectChanges.added.length > 0 ||
              projectChanges.removed.length > 0 ||
              projectChanges.modified.length > 0) && (
              <div>
                <h3 className="text-sm font-bold text-primary mb-2">
                  Project changes
                </h3>
                <ul className="space-y-1 text-sm">
                  {projectChanges.added.map((p) => (
                    <li key={`added-${p._id || p.id}`} className="text-accent1">
                      + Added &quot;{p.title}&quot;
                    </li>
                  ))}
                  {projectChanges.removed.map((p) => (
                    <li key={`removed-${p._id}`} className="text-red-600">
                      - Removed &quot;{p.title}&quot;
                    </li>
                  ))}
                  {projectChanges.modified.map((p) => (
                    <li key={`modified-${p._id || p.id}`} className="text-alt">
                      ~ Updated &quot;{p.title}&quot;
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t border-line bg-surface-fill pt-4">
          <button
            type="button"
            data-testid="publish-confirm-cancel"
            onClick={onClose}
            className="rounded-lg border border-line px-5 py-2 text-sm font-medium text-primary hover:bg-selected"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="publish-confirm-accept"
            onClick={onPublish}
            className="rounded-lg bg-button px-5 py-2 text-sm font-semibold text-secondary hover:bg-accent1"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

DraftComparisonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  status: PropTypes.object.isRequired,
  onPublish: PropTypes.func.isRequired,
  portfolioTitle: PropTypes.string.isRequired,
};

export default DraftComparisonModal;
