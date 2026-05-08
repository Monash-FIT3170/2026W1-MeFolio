import { useState } from "react";

import {
  createDashboardViewModel,
  getCurrentTab,
} from "../models/portfolioBuilderViewModel";

import "./PortfolioBuilderView.css";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { ModeSwitch } from "./ModeButton";
import { TestPortfolioView } from "./TestPortfolioView";


import ProfileSummary from "./Portfolio Builder/ProfileSummary";
import PlaceholderSection from "./Portfolio Builder/PlaceholderSection";
import OverviewSection from "./Portfolio Builder/OverviewSection";
import ProfileSettings from "./Portfolio Builder/ProfileSettings";


// Top-level dashboard view that coordinates tab state and renders the active section.
  const PortfolioBuilderView = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const { isLoading, sidebarItems, overviewStats, liveVisitors, profile, aboutMe } =
      createDashboardViewModel();
    const navigate = useNavigate();
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
          onPreviewToggle={(isPreview) => {
            if (isPreview) navigate("/preview");
          }}
        />

        <main className="builder-main">
          <header className="builder-header">
            <h1>{currentTab.label}</h1>
          </header>

        <div className="builder-content">
          {activeTab === "overview" ? (
            <OverviewSection stats={overviewStats} visitors={liveVisitors} />
          ) : activeTab === "settings" ? (
            <ProfileSettings profile={profile} />
          ) : (
            <PlaceholderSection title={currentTab.label} />
          )}
        </div>
      </main>
    </div>
  );
};

  // Sidebar navigation for switching dashboard sections.
  const Sidebar = ({ items, activeTab, onTabChange, profile, onPreviewToggle }) => {
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

export default PortfolioBuilderView;