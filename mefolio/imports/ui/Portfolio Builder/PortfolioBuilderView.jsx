import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects";
import { ProjectCollection } from "../../api/projects";
import { getPublishedTheme } from "../publishedTheme";
import {
  ProjectEngagement,
  PROJECT_ENGAGEMENT_PUBLICATION,
} from "../../api/projectEngagement";
import {
  createDashboardViewModel,
  getCurrentTab,
} from "../../models/portfolioBuilderViewModel";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { PortfolioPreview } from "../Portfolio Preview/PortfolioPreview";
import { getPublishedTheme } from "../Portfolio Preview/publishedTheme";
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
import RecruiterVisitAlert from "/imports/ui/Recruiter/RecruiterVisitAlert.jsx";
import LogoutButton from "../Login/LogoutButton";
import AnalyticsSection from "./AnalyticsSection";
import DraftStatusIndicator from "../Portfolio Preview/DraftStatusIndicator";
import DraftComparisonModal from "../Portfolio Preview/DraftComparisonModal";
import { getDraftStatus } from "../Portfolio Preview/portfolioDraftDiff";

const getProjectId = (project) => project?._id || project?.id;

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

const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    const projectsHandler = Meteor.subscribe("projects.all");
    const portfolioProjectsHandler = Meteor.subscribe("portfolioProjects.all");
    const currentUserHandler = Meteor.subscribe("currentUser.profile");

    const projectDocuments = ProjectCollection.find({}).fetch();
    const portfolios = PortfolioCollection.find({}).fetch();
    const user = Meteor.user();
    const selectedPortfolio = getSelectedPortfolio(portfolios, user);
    const engagementHandler = selectedPortfolio?._id
      ? Meteor.subscribe(PROJECT_ENGAGEMENT_PUBLICATION, selectedPortfolio._id)
      : null;
    const engagementsReady = !engagementHandler || engagementHandler.ready();

    const engagements = selectedPortfolio?._id
      ? ProjectEngagement.find(
          { portfolioId: selectedPortfolio._id },
          { sort: { date: 1 } },
        ).fetch()
      : [];

    return {
      isLoading:
        !portfoliosHandler.ready() ||
        !projectsHandler.ready() ||
        !portfolioProjectsHandler.ready() ||
        !currentUserHandler.ready() ||
        !engagementsReady,

      portfolios,

      projectDocuments,

      projectOrderDocuments: PortfolioProjectsCollection.find(
        {},
        { sort: { orderIndex: 1 } },
      ).fetch(),

      engagements,

      user,
    };
  });

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderedProjects, setOrderedProjects] = useState([]);
  const [dataProjectKey, setDataProjectKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [draggedProjectIndex, setDraggedProjectIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const {
    isLoading,
    portfolios,
    projectDocuments,
    projectOrderDocuments,
    engagements,
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

    if (saveStatus !== "unsaved" && nextProjectDataKey !== dataProjectKey) {
      setOrderedProjects(nextProjects);
      setDataProjectKey(nextProjectDataKey);
      setSaveStatus("idle");
    }
  }, [databaseProjects, dataProjectKey, saveStatus]);

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
        projectIds: updatedProjects.map((project) => project._id || project.id),
      });
    }
  };

  const handleProjectDragEnd = () => setDraggedProjectIndex(null);

  // New project becomes the first card in the display.
  const handleAddProject = (newProject) => {
    setOrderedProjects((previousProjects) => [newProject, ...previousProjects]);
  };

  const handleEditProject = (project) => setEditingProject(project);

  const handleSaveProject = (projectId, updates) => {
    Meteor.call("projects.update", projectId, updates, (error) => {
      if (error) {
        console.error("Failed to update project:", error);
        return;
      }

      setOrderedProjects((previousProjects) =>
        previousProjects.map((project) =>
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

      setOrderedProjects((previousProjects) =>
        previousProjects.filter(
          (project) => (project._id || project.id) !== projectId,
        ),
      );

      setEditingProject(null);
    });
  };

  const navigate = useNavigate();
  const currentTab = getCurrentTab(sidebarItems, activeTab);
  const draftStatus = getDraftStatus({
    portfolio: selectedPortfolio,
    projects: orderedProjects,
  });

  if (viewModelLoading) {
    return <p className="p-8 text-lg">Loading...</p>;
  }

  if (!currentTab) {
    return <p className="p-8 text-lg">No dashboard sections available.</p>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* FEAT-17: reactive in-app alert when a recruiter opens the owner's link */}
      <RecruiterVisitAlert />
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
        <header className="flex items-center justify-between border-b border-line bg-surface-fill px-8 py-6">
          <h1 className="text-2xl font-extrabold text-primary">
            {currentTab.label}
          </h1>

          <div className="flex items-center gap-3">
            <DraftStatusIndicator
              status={draftStatus}
              onReview={() => setIsComparisonOpen(true)}
            />
            {activeTab === "settings" && <LogoutButton />}

            {activeTab === "projects" && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg border border-line bg-button px-5 py-2 text-sm font-semibold text-secondary transition hover:opacity-90"
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
          ) : activeTab === "analytics" ? (
            <AnalyticsSection
              projects={orderedProjects}
              engagements={engagements}
            />
          ) : activeTab === "recruiter" ? (
            <RecruiterPortal portfolio={selectedPortfolio} userId={user?._id} />
          ) : activeTab === "themes" ? (
            <ThemeSection
              portfolioId={selectedPortfolio?._id}
              currentActiveTheme={selectedPortfolio?.theme}
            />
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
      <DraftComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        status={draftStatus}
      />
    </div>
  );
};

const OwnerPreviewRoute = () => {
  const {
    isLoading,
    portfolios,
    projectDocuments,
    projectOrderDocuments,
    user,
  } = useDashboardData();
  const selectedPortfolio = getSelectedPortfolio(portfolios, user);
  const databaseProjects = getPortfolioProjects(
    selectedPortfolio,
    projectDocuments,
    projectOrderDocuments,
  );

  if (isLoading) {
    return <p className="p-8 text-lg">Loading draft preview...</p>;
  }

  return (
    <PortfolioPreview
      portfolio={selectedPortfolio}
      projects={databaseProjects}
      isStaging
    />
  );
};

// Renders the snapshot taken at publish time rather than the live draft, so
// the owner can see exactly what was published.
const PublishedPortfolioRoute = () => {
  const { isLoading, portfolios, user } = useDashboardData();
  const navigate = useNavigate();
  const selectedPortfolio = getSelectedPortfolio(portfolios, user);
  const publishedContent = selectedPortfolio?.publishedContent;

  if (isLoading) {
    return <p className="p-8 text-lg">Loading published portfolio...</p>;
  }

  if (!publishedContent) {
    return (
      <div className="flex flex-col items-start gap-4 p-8">
        <p className="text-lg text-primary">
          This portfolio has not been published yet.
        </p>
        <button
          type="button"
          onClick={() => navigate("/preview")}
          className="rounded-lg bg-button px-5 py-2 text-sm font-semibold text-secondary transition hover:bg-accent1"
        >
          Back to draft preview
        </button>
      </div>
    );
  }

  // The app applies the draft's theme globally, so the snapshot's own theme is
  // re-applied here. Theme variables are plain CSS custom properties, so this
  // nested data-theme overrides the outer one for everything inside it.
  //
  // The background and font utilities have to be repeated rather than
  // inherited: they are declared once on the app shell, where the draft theme
  // is in scope, and an inherited font-family arrives already resolved.
  return (
    <div
      data-theme={getPublishedTheme(publishedContent.theme)}
      className="min-h-screen bg-background font-main"
    >
      <PortfolioPreview
        portfolio={publishedContent}
        projects={publishedContent.projects || []}
        isPublishedView
      />
    </div>
  );
};

export const PortfolioBuilderView = () => {
  const { portfolio, ready } = useTracker(() => {
    const portfoliosSub = Meteor.subscribe("portfolios.all");
    const currentUserSub = Meteor.subscribe("users.current");

    const user = Meteor.user();
    const portfolios = PortfolioCollection.find({}).fetch();

    return {
      portfolio: getSelectedPortfolio(portfolios, user),
      ready: portfoliosSub.ready() && currentUserSub.ready(),
    };
  });

  // AUTO-CREATE PORTFOLIO FOR USER IF NOT EXISTS
  // note this is intentionally minimal as extra fields can be added later as the user edits their portfolio.
  useEffect(() => {
    if (ready && !portfolio) {
      Meteor.call("portfolios.insert", {
        title: "My Portfolio",
        projects: [],
        theme: "default",
        createdAt: new Date(),
      });
    }
  }, [ready, portfolio]);

  if (!ready) return null;

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/preview" element={<OwnerPreviewRoute />} />
      <Route path="/published" element={<PublishedPortfolioRoute />} />
    </Routes>
  );
};
