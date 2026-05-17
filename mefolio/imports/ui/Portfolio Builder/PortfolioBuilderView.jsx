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
import { ModeSwitch } from "../Portfolio Preview/ModeButton";
import { PortfolioPreview } from "../Portfolio Preview/PortfolioPreview";
import ProfileSummary from "./ProfileSummary";
import PlaceholderSection from "./PlaceholderSection";
import OverviewSection from "./OverviewSection";
import ProfileSettings from "./ProfileSettings";
import ProjectReorderingSection from "./ProjectReorderingSection";
import Sidebar from "./Sidebar";

const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    const portfolios = PortfolioCollection.find({}).fetch();

    const projectsHandler = Meteor.subscribe("projects.all");
    const projectDocuments = ProjectCollection.find({}).fetch();

    const usersHandler = Meteor.subscribe("users1.all");
    const user = UsersCollection.find({}).fetch();

    return {
      isLoading:
        !portfoliosHandler.ready() ||
        !projectsHandler.ready() ||
        !usersHandler.ready(),
      portfolios,
      projectDocuments,
      user,
    };
  });

const getProjectId = (project) => project?._id || project?.id;

const getProjectOrderKey = (projects = []) =>
  projects.map((project) => getProjectId(project)).join("|");

const getProjectDataKey = (projects = []) =>
  projects
    .map((project) =>
      [
        getProjectId(project),
        project?.title || "",
        project?.isMissingProjectDocument ? "missing" : "loaded"
      ].join(":")
    )
    .join("|");

const getPortfolioProjects = (portfolio, projectDocuments = []) => {
  const projectsById = new Map(
    projectDocuments.map((project) => [project._id, project])
  );

  if (!portfolio?.projects?.length) {
    return [];
  }

  return portfolio.projects.map((projectId) => {
    const project = projectsById.get(projectId);

    return project || {
      _id: projectId,
      title: "Project unavailable",
      description: "This project could not be loaded yet.",
      technologies: [],
      githubLink: "",
      liveDemoLink: "",
      isMissingProjectDocument: true
    };
  });
};

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderedProjects, setOrderedProjects] = useState([]);
  const [dataProjectKey, setDataProjectKey] = useState("");
  const [sourceProjectOrderKey, setSourceProjectOrderKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  const { isLoading, portfolios, projectDocuments, user } = useDashboardData();
  const selectedPortfolio = portfolios[0];

  const {
    isLoading: viewModelLoading,
    sidebarItems,
    overviewStats,
    liveVisitors,
    profile,
    aboutMe,
    projects = [],
  } = createDashboardViewModel({ isLoading, portfolios, user });
  const databaseProjects = getPortfolioProjects(selectedPortfolio, projectDocuments);

  useEffect(() => {
    const nextProjects = databaseProjects.length ? databaseProjects : projects;
    const nextProjectDataKey = getProjectDataKey(nextProjects);
    const nextProjectOrderKey = getProjectOrderKey(nextProjects);

    if (saveStatus !== "unsaved" && nextProjectDataKey !== dataProjectKey) {
      setOrderedProjects(nextProjects);
      setDataProjectKey(nextProjectDataKey);
      setSourceProjectOrderKey(nextProjectOrderKey);
      setSaveStatus("idle");
    }
  }, [databaseProjects, dataProjectKey, projects, saveStatus]);

  const handleProjectsReorder = (nextProjects) => {
    setOrderedProjects(nextProjects);
    setSaveStatus(
      getProjectOrderKey(nextProjects) === sourceProjectOrderKey
        ? "idle"
        : "unsaved"
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
      "portfolios.update",
      selectedPortfolio._id,
      { projects: projectIds },
      (error) => {
        if (error) {
          setSaveStatus("error");
          return;
        }

        setSourceProjectOrderKey(projectIds.join("|"));
        setSaveStatus("saved");
      }
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
          <h1 className="text-2xl font-extrabold text-gray-900">{currentTab.label}</h1>
        </header>

        <div className="p-8">
          {activeTab === "overview" ? (
            <OverviewSection stats={overviewStats} visitors={liveVisitors} />
          ) : activeTab === "settings" ? (
            <ProfileSettings profile={profile} aboutMe={aboutMe} userId={user?.[0]?._id} />
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
