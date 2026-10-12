import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import {
  ProjectEngagement,
  PROJECT_ENGAGEMENT_PUBLICATION,
} from "../../api/projectEngagement.js";
import { mapLiveVisitors } from "../../models/portfolioBuilderViewModel.js";

// Reusable card for a single dashboard statistic.
const StatCard = ({ stat }) => {
  return (
    <div className="rounded-lg border border-line bg-surface-fill p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-accent1/20 px-2.5 py-1 text-xs font-semibold text-accent1">
          {"\u2197"} {stat.change}
        </span>
      </div>

      <h2 className="m-0 text-3xl font-space-mono font-bold text-primary">
        {stat.value}
      </h2>
      <p className="mt-1 text-sm font-medium text-primary">{stat.label}</p>
    </div>
  );
};

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

// Overview tab content that displays summary stats and recent visitor activity.
const OverviewSection = ({ portfolioId, onViewAllVisitors }) => {
  const { visitors, totalViews, interactions } = useTracker(() => {
    if (!portfolioId) {
      return { visitors: [], totalViews: 0, interactions: 0 };
    }

    const visitorsHandle = Meteor.subscribe(
      "portfolios.liveVisitors",
      portfolioId,
    );
    const engagementsHandle = Meteor.subscribe(
      PROJECT_ENGAGEMENT_PUBLICATION,
      portfolioId,
    );

    const portfolio = PortfolioCollection.findOne(
      { _id: portfolioId },
      { fields: { viewers: 1, totalViews: 1 } },
    );
    const visitors = visitorsHandle.ready()
      ? mapLiveVisitors(portfolio ? [portfolio] : [])
      : [];
    const clickEvents = engagementsHandle.ready()
      ? ProjectEngagement.find(
          { portfolioId },
          { fields: { clicks: 1 } },
        ).fetch()
      : [];

    return {
      visitors,
      totalViews: portfolio?.totalViews || 0,
      interactions: clickEvents.reduce(
        (total, event) =>
          total + (Number.isFinite(event.clicks) ? event.clicks : 0),
        0,
      ),
    };
  }, [portfolioId]);
  const stats = [
    {
      id: "total-views",
      value: totalViews,
      label: "Total Views",
      change: "",
    },
    {
      id: "visitors-now",
      value: visitors.length,
      label: "Visitors Right Now",
      change: "",
    },
    {
      id: "interactions",
      value: interactions,
      label: "Interactions",
      change: "",
    },
    {
      id: "ai-used",
      value: "",
      label: "AI Chatbots Used",
      change: "",
    },
  ];

  return (
    <>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            stat={{
              ...stat,
              value:
                typeof stat.value === "number"
                  ? stat.value.toLocaleString("en-US")
                  : stat.value,
            }}
          />
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-line bg-surface-fill p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold text-primary">Live Visitors</h2>

          <button
            type="button"
            onClick={onViewAllVisitors}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-primary hover:bg-indigo-50"
          >
            View all
          </button>
        </div>
        <p className="mt-1 block text-xs text-primary">
          Showing {Math.min(3, visitors.length)} of {visitors.length}
        </p>

        <div>
          {visitors.length > 0 ? (
            visitors
              .slice(0, 3)
              .map((visitor) => (
                <VisitorCard key={visitor.id} visitor={visitor} />
              ))
          ) : (
            <div className="py-8 text-center text-sm text-muted">
              No visitors yet
            </div>
          )}
        </div>
      </section>
    </>
  );
};

StatCard.propTypes = {
  stat: PropTypes.shape({
    id: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string,
    change: PropTypes.string,
  }).isRequired,
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

OverviewSection.propTypes = {
  portfolioId: PropTypes.string,
  onViewAllVisitors: PropTypes.func,
};

export default OverviewSection;
