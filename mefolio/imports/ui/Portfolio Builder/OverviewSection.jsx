// Reusable card for a single dashboard statistic.
const StatCard = ({ stat }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-change">
          {"\u2197"} {stat.change}
        </span>
      </div>

      <h2>{stat.value}</h2>
      <p>{stat.label}</p>
    </div>
  );
};

// Displays one visitor row inside the live visitors list.
const VisitorCard = ({ visitor }) => {
  return (
    <div className="visitor-row">
      <div className={visitor.active ? "visitor-dot active" : "visitor-dot"} />

      <div className="visitor-details">
        <h3>{visitor.name}</h3>
        <p>{visitor.email}</p>
        <p>{visitor.activity}</p>
        <span>{visitor.location} · 2 min ago</span>
      </div>

      <div className="visitor-duration">{visitor.duration}</div>
    </div>
  );
};

// Overview tab content that displays summary stats and recent visitor activity.
const OverviewSection = ({ stats, visitors }) => {
  return (
    <>
      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="live-visitors-card">
        <div className="live-visitors-header">
          <h2>Live Visitors</h2>
          <button>View all</button>
        </div>

        <div className="visitor-list">
          {visitors.map((visitor) => (
            <VisitorCard key={visitor.id} visitor={visitor} />
          ))}
        </div>
      </section>
    </>
  );
};

export default OverviewSection;
