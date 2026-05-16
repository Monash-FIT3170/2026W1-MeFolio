// Reusable card for a single dashboard statistic.
const StatCard = ({ stat }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-extrabold text-green-600">
          ↗ {stat.change}
        </span>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
        {stat.value}
      </h2>
      <p className="text-sm text-gray-500">{stat.label}</p>
    </div>
  );
};

// Displays one visitor row inside the live visitors list.
const VisitorCard = ({ visitor }) => {
  return (
    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-200 last:border-b-0">
      <div
        className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${visitor.active ? "bg-green-500" : "bg-gray-300"}`}
      />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900">{visitor.name}</h3>
        <p className="text-sm text-gray-500">{visitor.email}</p>
        <p className="text-sm text-gray-500">{visitor.activity}</p>
        <span className="text-xs text-gray-400">
          {visitor.location} · 2 min ago
        </span>
      </div>
      <div className="text-sm text-gray-500 shrink-0">{visitor.duration}</div>
    </div>
  );
};

// Overview tab content that displays summary stats and recent visitor activity.
const OverviewSection = ({ stats, visitors }) => {
  return (
    <>
      <section className="grid grid-cols-4 gap-6 mb-8 max-[1000px]:grid-cols-2">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Live Visitors</h2>
          <button className="text-indigo-600 font-bold text-sm bg-transparent border-none cursor-pointer">
            View all
          </button>
        </div>
        <div className="flex flex-col">
          {visitors.map((visitor) => (
            <VisitorCard key={visitor.id} visitor={visitor} />
          ))}
        </div>
      </section>
    </>
  );
};

export default OverviewSection;
