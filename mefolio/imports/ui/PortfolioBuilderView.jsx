import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import { PortfolioCollection } from "../api/portfolio";
import { UsersCollection } from "../api/users";
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

// Sidebar navigation for switching dashboard sections.
const Sidebar = ({
  items,
  activeTab,
  onTabChange,
  profile,
  onPreviewToggle,
}) => {
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

// Projects tab content that allows project cards to be visually reordered.
const ProjectReorderingSection = ({
  projects,
  draggedProjectIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  if (!projects.length) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-7">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Project Order
        </h2>
        <p className="text-gray-500">No projects have been added yet.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="mb-1 text-xl font-semibold text-gray-900">
          Project Order
        </h2>
        <p className="text-sm text-gray-500">
          Drag and drop project cards to create a custom display sequence.
        </p>
      </div>

      <div className="flex flex-col">
        {projects.map((project, index) => (
          <article
            key={project.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            onDragEnd={onDragEnd}
            className={`flex cursor-grab items-start gap-5 border-b border-gray-200 px-6 py-5 transition last:border-b-0 active:cursor-grabbing ${
              draggedProjectIndex === index
                ? "bg-indigo-50 opacity-60"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
              {index + 1}
            </div>

            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                {project.title}
              </h3>

              <p className="mb-3 text-sm text-gray-500">
                {project.description}
              </p>

              <div className="mb-3 flex flex-wrap gap-2">
                {(project.technologies || []).map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700"
                  >
                    {technology}
                  </span>
                ))}
              </div>

              <div className="flex gap-4">
                <a
                  href={project.githubLink}
                  className="text-sm font-bold text-indigo-600 hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  GitHub
                </a>

                <a
                  href={project.liveDemoLink}
                  className="text-sm font-bold text-indigo-600 hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  Live Demo
                </a>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-500">
              Drag
            </div>
          </article>
        ))}
      </div>
    </section>
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