import { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import { PortfolioCollection } from "../api/portfolio";
import { UsersCollection } from "../api/users";
import {
  createDashboardViewModel,
  getCurrentTab,
} from "../models/portfolioBuilderViewModel";

import AboutMeLinksEditor from "./components/AboutMeLinksEditor.jsx";
import { PortfolioPreview } from "./Portfolio Preview/PortfolioPreview.jsx";
import ProfileSummary from "./Portfolio Builder/ProfileSummary";
import PlaceholderSection from "./Portfolio Builder/PlaceholderSection";
import OverviewSection from "./Portfolio Builder/OverviewSection";
import ProfileSettings from "./Portfolio Builder/ProfileSettings";

import "./PortfolioBuilderView.css";

// Temporary adapter from the current flat mock shape to the agreed links shape.
// We will clean this up in a later commit when we update the mock/view-model layer.
const createAboutMeLinksValue = (aboutMe = {}) => ({
  contact: {
    email: aboutMe.contact?.email || "",
  },
  socials: {
    github: aboutMe.socials?.github || "",
    linkedin: aboutMe.socials?.linkedin || "",
    other:
      Array.isArray(aboutMe.socials?.other) && aboutMe.socials.other.length > 0
        ? aboutMe.socials.other
        : [{ label: "", url: "" }],
  },
});

// Custom hook to fetch real portfolio data from MongoDB via Meteor
const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    const portfolios = PortfolioCollection.find(
      {},
      { sort: { createdAt: -1 } },
    ).fetch();

    /* HANDOVER
    Currently fetching from the dummy users1 collection as there is no logged in user system set up yet. 
    Will switch to Meteor.user() once authentication is implemented.

    const user = Meteor.user(); 
    */
    const usersHandler = Meteor.subscribe("users1.all");
    const user = UsersCollection.find({}, { sort: { createdAt: -1 } }).fetch();

    return {
      isLoading: !portfoliosHandler.ready() || !usersHandler.ready(),
      portfolios,
      user,
    };
  });

// Builder tab for the About Me links task.
const AboutMeSection = ({
  linksValue,
  onLinksChange,
  onSave,
  isSaving,
  saveMessage,
}) => {
  return (
    <section>
      <AboutMeLinksEditor value={linksValue} onChange={onLinksChange} />

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          type="button"
          className="view-portfolio-btn"
          onClick={onSave}
          disabled={isSaving}
          style={{ maxWidth: "220px" }}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {saveMessage ? (
          <span style={{ color: "#4b5563", fontSize: "14px" }}>
            {saveMessage}
          </span>
        ) : null}
      </div>
    </section>
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

// Top-level dashboard view that coordinates tab state and renders the active section.
const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isLoading, portfolios, user } = useDashboardData();

  const {
    isLoading: viewModelLoading,
    sidebarItems,
    overviewStats,
    liveVisitors,
    profile,
    aboutMe,
  } = createDashboardViewModel({
    isLoading,
    portfolios,
  });

  const currentPortfolio = portfolios[0] || null;

  const [aboutMeLinks, setAboutMeLinks] = useState(() =>
    createAboutMeLinksValue(aboutMe),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setAboutMeLinks(createAboutMeLinksValue(aboutMe));
  }, [aboutMe]);

  const currentTab = getCurrentTab(sidebarItems, activeTab);

  const handleSaveAboutMeLinks = () => {
    if (!currentPortfolio?._id) {
      setSaveMessage("No active portfolio found to save.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    Meteor.call(
      "portfolios.update",
      currentPortfolio._id,
      {
        contact: {
          ...(currentPortfolio.contact || {}),
          ...(aboutMeLinks.contact || {}),
        },
        socials: {
          ...(currentPortfolio.socials || {}),
          ...(aboutMeLinks.socials || {}),
        },
        updatedAt: new Date(),
      },
      (error) => {
        setIsSaving(false);

        if (error) {
          setSaveMessage("Failed to save changes.");
          return;
        }

        setSaveMessage("About Me links saved successfully.");
      },
    );
  };

  if (isLoading || viewModelLoading) {
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
            <AboutMeSection
              linksValue={aboutMeLinks}
              onLinksChange={setAboutMeLinks}
              onSave={handleSaveAboutMeLinks}
              isSaving={isSaving}
              saveMessage={saveMessage}
            />
          ) : activeTab === "settings" ? (
            <ProfileSettings
              profile={profile}
              aboutMe={aboutMe}
              userId={user[0]?._id}
            />
          ) : (
            <PlaceholderSection title={currentTab.label} />
          )}
        </div>
      </main>
    </div>
  );
};

export const PortfolioBuilderView = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/preview" element={<PortfolioPreview />} />
    </Routes>
  );
};
