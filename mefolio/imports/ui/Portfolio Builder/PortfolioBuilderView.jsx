import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";
import { ProjectCollection } from "../../api/projects";
import { UsersCollection } from "../../api/users";
import {
  createDashboardViewModel,
  getCurrentTab,
} from "../../models/portfolioBuilderViewModel";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { PortfolioPreview } from "../Portfolio Preview/PortfolioPreview";
import PlaceholderSection from "./PlaceholderSection";
import OverviewSection from "./OverviewSection";
import ProfileSettings from "./ProfileSettings";
import ProjectReorderingSection from "./ProjectReorderingSection";
import Sidebar from "./Sidebar";

const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    Meteor.subscribe("projects.all");
    const portfolios = PortfolioCollection.find({}).fetch();

    const portfolio = portfolios[0];
    const projects = portfolio?.projects?.length
      ? (() => {
          const projectMap = new Map(
            ProjectCollection.find({ _id: { $in: portfolio.projects } })
              .fetch()
              .map((p) => [p._id, p]),
          );
          return portfolio.projects
            .map((id) => projectMap.get(id))
            .filter(Boolean);
        })()
      : ProjectCollection.find({}).fetch();

    /* HANDOVER
    Currently fetching from the dummy users1 collection as there is no logged in user system set up yet.
    Will switch to Meteor.user() once authentication is implemented.

    const user = Meteor.user();
    */
    const usersHandler = Meteor.subscribe("users1.all");
    const user = UsersCollection.find({}).fetch();

    return {
      isLoading: !portfoliosHandler.ready() || !usersHandler.ready(),
      portfolios,
      projects,
      user,
    };
  });

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderedProjects, setOrderedProjects] = useState([]);
  const [draggedProjectIndex, setDraggedProjectIndex] = useState(null);

  const {
    isLoading,
    portfolios,
    projects: dbProjects,
    user,
  } = useDashboardData();

  const {
    isLoading: viewModelLoading,
    sidebarItems,
    overviewStats,
    liveVisitors,
    profile,
    aboutMe,
    projects = [],
  } = createDashboardViewModel({
    isLoading,
    portfolios,
    projects: dbProjects,
    user,
  });

  const projectsIdString = JSON.stringify(projects.map((p) => p?._id));
  useEffect(() => {
    if (projects.length > 0 && orderedProjects.length === 0) {
      setOrderedProjects(projects);
    }
  }, [projectsIdString]);

  const handleProjectDragStart = (index) => setDraggedProjectIndex(index);
  const handleProjectDragOver = (event) => event.preventDefault();

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

  const handleProjectDragEnd = () => setDraggedProjectIndex(null);

  const navigate = useNavigate();
  const currentTab = getCurrentTab(sidebarItems, activeTab);

  if (viewModelLoading) {
    return <p className="p-8 text-lg">Loading...</p>;
  }

  if (!currentTab) {
    return <p className="p-8 text-lg">No dashboard sections available.</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        onPreviewToggle={(isPreview) => {
          if (isPreview) navigate("/preview");
        }}
      />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {currentTab.label}
          </h1>
        </header>

        <div className="p-8">
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
      <Route path="/preview" element={<PortfolioPreview />} />
    </Routes>
  );
};
