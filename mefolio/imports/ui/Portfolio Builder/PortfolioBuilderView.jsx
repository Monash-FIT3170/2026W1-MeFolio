import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects";
import { ProjectCollection } from "../../api/projects";
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

const getProjectId = (project) => project?._id || project?.id;

const getProjectOrderKey = (projects = []) =>
  projects.map((project) => getProjectId(project)).join("|");

const getProjectDataKey = (projects = []) =>
  projects
    .map((project) =>
      [
        getProjectId(project),
        project?.title || "",
        project?.isMissingProjectDocument ? "missing" : "loaded",
      ].join(":"),
    )
    .join("|");

const getUserEmail = (user) =>
  user?.email ||
  user?.emails?.[0]?.address ||
  user?.services?.google?.email ||
  user?.services?.github?.email ||
  "";

const getSelectedPortfolio = (portfolios = [], user) => {
  const ownedPortfolio = portfolios.find(
    (portfolio) => portfolio.userId === user?._id,
  );

  if (ownedPortfolio) return ownedPortfolio;
  if (getUserEmail(user) === "test@example.com") return portfolios[0];
  return portfolios[0] ?? null;
};

const createUnavailableProject = (projectId) => ({
  _id: projectId,
  id: projectId,
  title: "Project unavailable",
  description: "This project could not be loaded yet.",
  technologies: [],
  githubLink: "",
  liveDemoLink: "",
  isMissingProjectDocument: true,
});

const getPortfolioProjects = (
  portfolio,
  projectDocuments = [],
  projectOrderDocuments = [],
) => {
  const projectsById = new Map(
    projectDocuments.map((project) => [project._id, project]),
  );

  if (!portfolio?._id) return projectDocuments;

  const savedProjectIds = projectOrderDocuments
    .filter((projectOrder) => projectOrder.portfolioId === portfolio._id)
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((projectOrder) => projectOrder.projectId);

  const projectIds = savedProjectIds.length
    ? savedProjectIds
    : portfolio.projects || [];

  return projectIds.map(
    (projectId) => projectsById.get(projectId) || createUnavailableProject(projectId),
  );
};

const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    const projectsHandler = Meteor.subscribe("projects.all");
    const portfolioProjectsHandler = Meteor.subscribe("portfolioProjects.all");
    const currentUserHandler = Meteor.subscribe("currentUser.profile");

    return {
      isLoading:
        !portfoliosHandler.ready() ||
        !projectsHandler.ready() ||
        !portfolioProjectsHandler.ready() ||
        !currentUserHandler.ready(),
      portfolios: PortfolioCollection.find({}).fetch(),
      projectDocuments: ProjectCollection.find({}).fetch(),
      projectOrderDocuments: PortfolioProjectsCollection.find(
        {},
        { sort: { orderIndex: 1 } },
      ).fetch(),
      user: Meteor.user(),
    };
  });

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderedProjects, setOrderedProjects] = useState([]);
  const [dataProjectKey, setDataProjectKey] = useState("");
  const [sourceProjectOrderKey, setSourceProjectOrderKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  const {
    isLoading,
    portfolios,
    projectDocuments,
    projectOrderDocuments,
    user,
  } = useDashboardData();
  const selectedPortfolio = getSelectedPortfolio(portfolios, user);
  const visiblePortfolios = selectedPortfolio ? [selectedPortfolio] : [];
  const databaseProjects = getPortfolioProjects(
    selectedPortfolio,
    projectDocuments,
    projectOrderDocuments,
  );

  const {
    isLoading: viewModelLoading,
    sidebarItems,
    overviewStats,
    liveVisitors,
    profile,
    aboutMe,
  } = createDashboardViewModel({
    isLoading,
    portfolios: visiblePortfolios,
    projects: databaseProjects,
    user,
  });

  useEffect(() => {
    const nextProjects = databaseProjects;
    const nextProjectDataKey = getProjectDataKey(nextProjects);
    const nextProjectOrderKey = getProjectOrderKey(nextProjects);

    if (saveStatus !== "unsaved" && nextProjectDataKey !== dataProjectKey) {
      setOrderedProjects(nextProjects);
      setDataProjectKey(nextProjectDataKey);
      setSourceProjectOrderKey(nextProjectOrderKey);
      setSaveStatus("idle");
    }
  }, [databaseProjects, dataProjectKey, saveStatus]);

  const handleProjectsReorder = (nextProjects) => {
    setOrderedProjects(nextProjects);
    setSaveStatus(
      getProjectOrderKey(nextProjects) === sourceProjectOrderKey
        ? "idle"
        : "unsaved",
    );
  };

  const handleSaveProjectOrder = () => {
    if (!selectedPortfolio?._id) {
      setSaveStatus("error");
      return;
    }

    const projectIds = orderedProjects.map((project) => getProjectId(project));

    setSaveStatus("saving");
    Meteor.call(
      "portfolioProjects.reorder",
      {
        portfolioId: selectedPortfolio._id,
        projectIds,
      },
      (error) => {
        if (error) {
          setSaveStatus("error");
          return;
        }

        setSourceProjectOrderKey(projectIds.join("|"));
        setSaveStatus("saved");
      },
    );
  };

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
            <ProfileSettings profile={profile} aboutMe={aboutMe} />
          ) : activeTab === "projects" ? (
            <ProjectReorderingSection
              projects={orderedProjects}
              onProjectsReorder={handleProjectsReorder}
              onSaveOrder={handleSaveProjectOrder}
              saveStatus={saveStatus}
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
