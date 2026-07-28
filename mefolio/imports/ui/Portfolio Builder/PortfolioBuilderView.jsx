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
import ThemeSection from "./Themes/ThemeSection";
import ProjectsSection from "../Projects Editor/ProjectsSection";
import AddProjectModal from "../Projects Editor/AddProjectModal";
import EditProjectModal from "../Projects Editor/EditProjectModal";
import Sidebar from "./Sidebar";
import AboutMeLinksEditor from "../components/AboutMeLinksEditor";
import RecruiterPortal from "../RecruiterPortal";
import LogoutButton from "../Login/LogoutButton";

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
  return null;
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
    (projectId) =>
      projectsById.get(projectId) || createUnavailableProject(projectId),
  );
};

// Newest project first (falls back to insertion order when createdAt is absent).
const byNewestFirst = (a, b) =>
  new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);

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
  const [draggedProjectIndex, setDraggedProjectIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

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

    if (selectedPortfolio?._id) {
      Meteor.call("portfolioProjects.reorder", {
        portfolioId: selectedPortfolio._id,
        projectIds: updatedProjects.map((p) => p._id || p.id),
      });
    }
  };

  const handleProjectDragEnd = () => setDraggedProjectIndex(null);

  // New project becomes the first card in the display.
  const handleAddProject = (newProject) => {
    setOrderedProjects((prev) => [newProject, ...prev]);
  };

  const handleEditProject = (project) => setEditingProject(project);

  const handleSaveProject = (projectId, updates) => {
    Meteor.call("projects.update", projectId, updates, (error) => {
      if (error) {
        console.error("Failed to update project:", error);
        return;
      }
      // Reflect the change immediately in the locally ordered list.
      setOrderedProjects((prev) =>
        prev.map((project) =>
          (project._id || project.id) === projectId
            ? { ...project, ...updates }
            : project,
        ),
      );
      setEditingProject(null);
    });
  };

  const handleDeleteProject = (projectId) => {
    Meteor.call("projects.delete", projectId, (error) => {
      if (error) {
        console.error("Failed to delete project:", error);
        return;
      }
      // Remove the card from the display and close the modal.
      setOrderedProjects((prev) =>
        prev.filter((project) => (project._id || project.id) !== projectId),
      );
      setEditingProject(null);
    });
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
    <div className="flex min-h-screen bg-background">
      <Sidebar
        items={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        onPreviewToggle={(isPreview) => {
          if (isPreview) navigate("/preview");
        }}
      />

      <main className="flex-1 overflow-y-auto b">
        <header className="bg-surface-fill border-b border-line px-8 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-primary">
            {currentTab.label}
          </h1>
          <div className="flex items-center gap-3">
            {activeTab === "settings" && <LogoutButton />}
            {activeTab === "projects" && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2 rounded-lg bg-button text-secondary text-sm font-semibold hover:bg-alt/50 hover:text-secondary transition"
              >
                Add Project
              </button>
            )}
          </div>
        </header>

        <div className="p-8">
          {activeTab === "overview" ? (
            <OverviewSection stats={overviewStats} visitors={liveVisitors} />
          ) : activeTab === "about-me" ? (
            <AboutMeLinksEditor
              value={aboutMe}
              onChange={(updatedValue) => {
                const portfolioId = selectedPortfolio?._id;
                if (!portfolioId) return;
                Meteor.call(
                  "portfolios.update",
                  portfolioId,
                  {
                    contact: updatedValue.contact,
                    socials: updatedValue.socials,
                  },
                  (error) => {
                    if (error) {
                      console.error("Failed to save portfolio:", error);
                    }
                  },
                );
              }}
            />
          ) : activeTab === "settings" ? (
            <ProfileSettings
              profile={profile}
              aboutMe={aboutMe}
              portfolioId={selectedPortfolio?._id}
            />
          ) : activeTab === "projects" ? (
            <ProjectsSection
              projects={orderedProjects}
              onEdit={handleEditProject}
              draggedProjectIndex={draggedProjectIndex}
              onDragStart={handleProjectDragStart}
              onDragOver={handleProjectDragOver}
              onDrop={handleProjectDrop}
              onDragEnd={handleProjectDragEnd}
            />
          ) : activeTab === "recruiter" ? (
            <RecruiterPortal portfolio={selectedPortfolio} />
          ) : activeTab === "themes" ? (
            <ThemeSection portfolioId={selectedPortfolio?._id} currentActiveTheme={selectedPortfolio?.theme} />
          ) : (
            <PlaceholderSection title={currentTab.label} />
          )}
        </div>
      </main>
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProject}
        portfolioId={selectedPortfolio?._id}
      />
      <EditProjectModal
        isOpen={Boolean(editingProject)}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
};

export const PortfolioBuilderView = () => {
  const portfolio = useTracker(() =>
    PortfolioCollection.findOne({ userId: Meteor.userId() }),
  );
  const activeTheme = (newTheme) => {
    if (portfolio) {
      PortfolioCollection.update(portfolio._id, { $set: { theme: newTheme } });
    }
  };
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/preview" element={<PortfolioPreview />} />
    </Routes>
  );
};
