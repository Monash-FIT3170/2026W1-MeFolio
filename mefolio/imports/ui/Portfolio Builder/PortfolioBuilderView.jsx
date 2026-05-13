import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import { PortfolioCollection } from "../../api/portfolio";
import { UsersCollection } from "../../api/users";
import {
  createDashboardViewModel,
  getCurrentTab,
} from "../../models/portfolioBuilderViewModel";

import "../../ui/PortfolioBuilderView.css";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { ModeSwitch } from "../Portfolio Preview/ModeButton";
import { TestPortfolioView } from "../Portfolio Preview/TestPortfolioView";

import ProfileSummary from "./ProfileSummary";
import PlaceholderSection from "./PlaceholderSection";
import OverviewSection from "./OverviewSection";
import ProfileSettings from "./ProfileSettings";
import ProjectReorderingSection from "./ProjectReorderingSection";
import Sidebar from "./Sidebar";

// Custom hook to fetch real portfolio data from MongoDB via Meteor
const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    const portfolios = PortfolioCollection.find({}).fetch();

    /*
      HANDOVER:
      Currently fetching from the dummy users1 collection as there is no logged in user system set up yet.
      Will switch to Meteor.user() once authentication is implemented.

      const user = Meteor.user();
    */
    const usersHandler = Meteor.subscribe("users1.all");
    const user = UsersCollection.find({}).fetch();

    return {
      isLoading: !portfoliosHandler.ready() || !usersHandler.ready(),
      portfolios,
      user,
    };
  });

// Top-level dashboard view that coordinates tab state and renders the active section.
const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderedProjects, setOrderedProjects] = useState([]);
  const [draggedProjectIndex, setDraggedProjectIndex] = useState(null);

  const { isLoading, portfolios, user } = useDashboardData();

  const {
    isLoading: viewModelLoading,
    sidebarItems,
    overviewStats,
    liveVisitors,
    profile,
    aboutMe,
    projects = [],
  } = createDashboardViewModel({ isLoading, portfolios, user });

  useEffect(() => {
    setOrderedProjects(projects);
  }, [projects]);

  const handleProjectDragStart = (index) => {
    setDraggedProjectIndex(index);
  };

  const handleProjectDragOver = (event) => {
    event.preventDefault();
  };

  const handleProjectDrop = (dropIndex) => {
    if (draggedProjectIndex === null || draggedProjectIndex === dropIndex) {
      setDraggedProjectIndex(null);
      return;
    }

    const updatedProjects = [...orderedProjects];
    const [draggedProject] = updatedProjects.splice(draggedProjectIndex, 1);
    updatedProjects.splice(dropIndex, 0, draggedProject);

    setOrderedProjects(updatedProjects);
    setDraggedProjectIndex(null);
  };

  const handleProjectDragEnd = () => {
    setDraggedProjectIndex(null);
  };

  const navigate = useNavigate();
  const currentTab = getCurrentTab(sidebarItems, activeTab);

  if (viewModelLoading) {
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
            <ProfileSettings
              profile={profile}
              aboutMe={aboutMe}
              userId={user?.[0]?._id}
            />
          ) : activeTab === "projects" ? (
            <ProjectReorderingSection
              projects={orderedProjects}
              draggedProjectIndex={draggedProjectIndex}
              onDragStart={handleProjectDragStart}
              onDragOver={handleProjectDragOver}
              onDrop={handleProjectDrop}
              onDragEnd={handleProjectDragEnd}
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
      <Route path="/preview" element={<TestPortfolioView />} />
    </Routes>
  );
};
