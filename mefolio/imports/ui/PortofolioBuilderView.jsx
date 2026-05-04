import { useState } from "react";
import {
  createDashboardViewModel,
  getCurrentTab,
} from "./portfolioBuilderViewModel";
import "./PortfolioBuilderView.css";
import {ModeSwitch} from "./ModeButton.jsx";

// Top-level dashboard view that coordinates tab state and renders the active section.
export const PortfolioBuilderView = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isLoading, sidebarItems, overviewStats, liveVisitors, profile, aboutMe } =
    createDashboardViewModel();

  const currentTab = getCurrentTab(sidebarItems, activeTab);

  if (isLoading) {
    return <p className="builder-loading">Loading...</p>;
  }

  if (!currentTab) {
    return <p className="builder-loading">No dashboard sections available.</p>;
  }

  return (
    <div className="builder-layout">
      <Sidebar
        items={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
      />

      <main className="builder-main">
        <header className="builder-header">
          <h1>{currentTab.label}</h1>
        </header>

        <div className="builder-content">
          {activeTab === "overview" ? (
            <OverviewSection stats={overviewStats} visitors={liveVisitors} />
          ) : activeTab === "about-me" ? (
            <PlaceholderSection
              title={currentTab.label}
              description={`Placeholder for ${aboutMe.fullName || "the current user"}'s About Me details.`}
            />
          ) : (
            <PlaceholderSection title={currentTab.label} />
          )}
        </div>
      </main>
    </div>
  );
};

// Sidebar navigation for switching dashboard sections.
const Sidebar = ({ items, activeTab, onTabChange, profile }) => {
  return (
    <aside className="builder-sidebar">
      <div className="sidebar-top">
        <div className="builder-logo">
          <span>MeFolio</span>
        </div>

        <ModeSwitch onToggle={onPreviewToggle} />
      </div>

      <nav className="builder-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={
              activeTab === item.id
                ? "builder-nav-item active"
                : "builder-nav-item"
            }
            onClick={() => onTabChange(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ProfileSummary profile={profile} />
    </aside>
  );
};

// Small profile summary shown at the bottom of the sidebar.
const ProfileSummary = ({ profile }) => {
  return (
    <div className="sidebar-profile">
      <div className="profile-avatar">{profile.initials}</div>

      <div className="profile-text">
        <p>{profile.name}</p>
        <span>{profile.email}</span>
      </div>
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
            <Visitor key={visitor.id} visitor={visitor} />
          ))}
        </div>
      </section>
    </>
  );
};

// Reusable card for a single dashboard statistic.
const StatCard = ({ stat }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-change">↗ {stat.change}</span>
      </div>

      <h2>{stat.value}</h2>
      <p>{stat.label}</p>
    </div>
  );
};

// Displays one visitor row inside the live visitors list.
const Visitor = ({ visitor }) => {
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

// Generic placeholder used for dashboard tabs that are not built yet.
const PlaceholderSection = ({ title, description = "This section is a placeholder for now." }) => {
  return (
    <section className="placeholder-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
};
