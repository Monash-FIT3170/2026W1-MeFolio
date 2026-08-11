import PropTypes from "prop-types";
import { formatDiffValue } from "./portfolioDraftDiff";

const DraftComparisonModal = ({ isOpen, onClose, status }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 px-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface-fill border border-line shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-primary">
            {neverPublished
              ? "Draft not published yet"
              : "Draft vs live changes"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary text-sm font-semibold"
          >
            Close
          </button>
        </div>

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
                    <li
                      key={`added-${p._id || p.id}`}
                      className="text-accent1"
                    >
                      + Added &quot;{p.title}&quot;
                    </li>
                  ))}
                  {projectChanges.removed.map((p) => (
                    <li key={`removed-${p._id}`} className="text-secondary">
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
      </div>
    </div>
  );
};

DraftComparisonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  status: PropTypes.object.isRequired,
};

export default DraftComparisonModal;
