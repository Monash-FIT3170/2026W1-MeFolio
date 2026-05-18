import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../api/portfolio";
import {
  createDashboardViewModel,
  getCurrentTab
} from "../models/portfolioBuilderViewModel";

import "./PortfolioBuilderView.css";
import { PortfolioView } from "./PortfolioView";

import ProfileSummaryComponent from "./Portfolio Builder/ProfileSummary";
import PlaceholderSection from "./Portfolio Builder/PlaceholderSection";
import OverviewSection from "./Portfolio Builder/OverviewSection";
import ProfileSettings from "./Portfolio Builder/ProfileSettings";

// Top-level dashboard view that coordinates tab state and renders the active section.
export const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { portfolios, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe("portfolios.all");
    
    /* HANDOVER NOTE:
       Currently fetching all portfolios until authentication/Meteor.user() 
       is wired up to target specific user data.
    */
    return {
      portfolios: PortfolioCollection.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !handler.ready(),
    };
  });

  const { sidebarItems, overviewStats, liveVisitors, profile } =
    createDashboardViewModel({ isLoading, portfolios });

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
              description={`Placeholder for ${profile?.name || "the current user"}'s About Me details.`}
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
  const navigate = useNavigate();

  return (
    <aside className="builder-sidebar">
      <div className="sidebar-top">
        <div className="builder-logo">
          <span>MeFolio</span>
        </div>

        <button
          className="view-portfolio-btn"
          onClick={() => navigate("/preview")}
        >
          View Portfolio
        </button>
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
      <div className="profile-avatar">{profile?.initials || "U"}</div>

      <div className="profile-text">
        <p>{profile?.name || "User Name"}</p>
        <span>{profile?.email || "No Email Provided"}</span>
      </div>
    </div>
  );
};

export const PortfolioBuilderView = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/preview" element={<PortfolioView />} />
    </Routes>
  );
};