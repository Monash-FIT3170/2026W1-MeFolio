import PropTypes from "prop-types";

const DraftStatusIndicator = ({ status, onReview }) => {
  const { neverPublished, hasUnpublishedChanges } = status;
  const needsAttention = neverPublished || hasUnpublishedChanges;

  const label = neverPublished
    ? "Not published yet"
    : hasUnpublishedChanges
      ? "Unpublished changes"
      : "All changes published";

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-line bg-surface-fill px-3 py-1.5">
        <span
          className={`h-2 w-2 rounded-full ${needsAttention ? "bg-alt" : "bg-green-500"}`}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold text-primary">{label}</span>
      </div>
      {needsAttention && (
        <button
          onClick={onReview}
          className="px-4 py-2 rounded-lg border border-alt/50 text-alt text-sm font-semibold hover:bg-alt/10 transition"
        >
          Review & Publish
        </button>
      )}
    </div>
  );
};

DraftStatusIndicator.propTypes = {
  status: PropTypes.shape({
    neverPublished: PropTypes.bool,
    hasUnpublishedChanges: PropTypes.bool,
  }).isRequired,
  onReview: PropTypes.func.isRequired,
};

export default DraftStatusIndicator;
