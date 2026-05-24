import PropTypes from "prop-types";

// Reusable card for a single dashboard statistic.
const StatCard = ({ stat }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {"\u2197"} {stat.change}
        </span>
      </div>

      <h2 className="m-0 text-3xl font-extrabold text-gray-900">
        {stat.value}
      </h2>
      <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
    </div>
  );
};

// Displays one visitor row inside the live visitors list.
const VisitorCard = ({ visitor }) => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-gray-100 px-1 py-4 last:border-b-0">
      <div
        className={
          visitor.active
            ? "h-2.5 w-2.5 rounded-full bg-emerald-500"
            : "h-2.5 w-2.5 rounded-full bg-gray-300"
        }
      />

      <div className="min-w-0">
        <h3 className="m-0 text-sm font-semibold text-gray-900">
          {visitor.name}
        </h3>
        <p className="mt-0.5 truncate text-sm text-gray-500">{visitor.email}</p>
        <p className="mt-1 text-sm font-medium text-gray-700">
          {visitor.activity}
        </p>
        <span className="mt-1 block text-xs text-gray-400">
          {visitor.location} - 2 min ago
        </span>
      </div>

      <div className="text-sm font-semibold text-gray-700">
        {visitor.duration}
      </div>
    </div>
  );
};

// Overview tab content that displays summary stats and recent visitor activity.
const OverviewSection = ({ stats, visitors }) => {
  return (
    <>
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="m-0 text-lg font-bold text-gray-900">Live Visitors</h2>
          <button className="rounded-md px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
            View all
          </button>
        </div>

        <div>
          {visitors.map((visitor) => (
            <VisitorCard key={visitor.id} visitor={visitor} />
          ))}
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
  stats: PropTypes.arrayOf(PropTypes.object).isRequired,
  visitors: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default OverviewSection;