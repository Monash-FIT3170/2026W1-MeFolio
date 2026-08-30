import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import { mapLiveVisitors } from "../../models/portfolioBuilderViewModel.js";

// Displays one visitor row inside the live visitors list.
const VisitorCard = ({ visitor }) => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line bg-surface-fill px-1 py-4 last:border-b-0">
      <div
        className={
          visitor.active
            ? "h-2.5 w-2.5 rounded-full bg-accent1"
            : "h-2.5 w-2.5 rounded-full bg-muted/40"
        }
      />

      <div className="min-w-0">
        <h3 className="m-0 text-sm font-semibold text-primary">
          {visitor.name ? visitor.name : "Anonymous Viewer"}
        </h3>
        <p className="mt-0.5 truncate text-sm text-primary">{visitor.email}</p>
        <p className="mt-1 text-sm font-medium text-primary">
          {visitor.activity}
        </p>
        <span className="mt-1 block text-xs text-primary">
          {visitor.location}
        </span>
      </div>

      <div className="text-sm font-semibold text-primary">
        {visitor.duration}
      </div>
    </div>
  );
};

const LiveVisitorsPage = ({ portfolioId }) => {
  const visitors = useTracker(() => {
    if (!portfolioId) return [];

    const handle = Meteor.subscribe("portfolios.liveVisitors", portfolioId);
    if (!handle.ready()) return [];

    const portfolio = PortfolioCollection.findOne(
      { _id: portfolioId },
      { fields: { viewers: 1 } },
    );

    return mapLiveVisitors(portfolio ? [portfolio] : []);
  }, [portfolioId]);

  return (
    <div className="mx-auto max-w-8xl px-6 py-10">
      <section className="rounded-lg border border-line bg-surface-fill p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold text-primary">
            Live Visitors ({visitors.length})
          </h2>
        </div>

        <div>
          {visitors.length > 0 ? (
            visitors.map((visitor) => (
              <VisitorCard key={visitor.id} visitor={visitor} />
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted">
              No visitors yet
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

VisitorCard.propTypes = {
  visitor: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    activity: PropTypes.string,
    location: PropTypes.string,
    duration: PropTypes.string,
    active: PropTypes.bool,
  }).isRequired,
};

LiveVisitorsPage.propTypes = {
  portfolioId: PropTypes.string,
};

export default LiveVisitorsPage;
