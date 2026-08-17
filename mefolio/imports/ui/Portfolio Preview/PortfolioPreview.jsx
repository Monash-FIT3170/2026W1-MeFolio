import PropTypes from "prop-types";
import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useParams } from "react-router-dom";
import { ProjectCard } from "./ProjectCard.jsx";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects.js";
import { ProjectCollection } from "../../api/projects.js";
import { PortfolioContent } from "./PortfolioContent.jsx";
import PublishButton from "./PublishButton.jsx";

const getUserEmail = (user) =>
  user?.email ||
  user?.emails?.[0]?.address ||
  user?.services?.google?.email ||
  user?.services?.github?.email ||
  "";

export const PortfolioPreview = ({
  portfolio: propPortfolio = null,
  projects: propProjects = [],
  isStaging = false,
  isPublishedView = false,
  isRecruiterView = false,
}) => {
  const { portfolioId } = useParams();
  const isPublicView = Boolean(portfolioId);

  const {
    portfolio: _loadedPortfolio,
    projects: loadedProjects,
    portfolio,
    ready,
  } = useTracker(() => {
    if (isPublicView) {
      const viewerSub = Meteor.subscribe("portfolios.viewer", portfolioId);
      return { projects: [], portfolio: null, ready: viewerSub.ready() };
    }

    if (draftPortfolio || draftProjects) {
      return {
        portfolio: draftPortfolio,
        projects: draftProjects || [],
      };
    }

    if (isPublicView) {
      const viewerSub = Meteor.subscribe("portfolios.viewer", portfolioId);
      return { projects: [], portfolio: null, ready: viewerSub.ready() };
    }

    const portfolioSub = Meteor.subscribe("portfolios.all");
    const projectsSub = Meteor.subscribe("projects.all");
    const portfolioProjectsSub = Meteor.subscribe("portfolioProjects.all");
    const currentUserSub = Meteor.subscribe("currentUser.profile");

    if (
      !portfolioSub.ready() ||
      !projectsSub.ready() ||
      !portfolioProjectsSub.ready() ||
      !currentUserSub.ready()
    ) {
      return { portfolio: null, projects: [], portfolio: null, ready: false, portfolioId: null };
    }

    const currentUser = Meteor.user();
    const portfolio =
      PortfolioCollection.findOne({ userId: Meteor.userId() }) ||
      PortfolioCollection.findOne({ _id: portfolioId }) ||
      (getUserEmail(currentUser) === "test@example.com"
        ? PortfolioCollection.findOne()
        : null);
        

    if (!portfolio?._id) {
      return {
        portfolio: propPortfolio,
        projects: propProjects,
        portfolioId: propPortfolio?._id || null, portfolio, ready: true };

    const viewerSub = Meteor.subscribe(
      "portfolios.viewer",
      selectedPortfolio._id,
    );
    if (!viewerSub.ready()) {
      return { projects: [], portfolio: selectedPortfolio, ready: false };
    }
    }

    const projectOrderDocuments = PortfolioProjectsCollection.find(
      { portfolioId: portfolio._id },
      { sort: { orderIndex: 1 } },
    ).fetch();
    const orderedProjectIds = projectOrderDocuments.length
      ? projectOrderDocuments.map((projectOrder) => projectOrder.projectId)
      : portfolio.projects || [];

    if (!orderedProjectIds.length) {
      return { portfolio, projects: [], portfolio, ready: true, portfolioId: portfolio._id };
    }

    const projectMap = new Map(
      ProjectCollection.find({ _id: { $in: orderedProjectIds } })
        .fetch()
        .map((project) => [project._id, project]),
    );
    const projects = orderedProjectIds
      .map((projectId) => projectMap.get(projectId))
      .filter(Boolean);

    return { portfolio, projects, portfolio, ready: true, portfolioId: portfolio._id };
  }, [propPortfolio, propProjects, isPublicView, portfolioId]);

  
  const projects = propProjects.length ? propProjects : trackedProjects || [];
  // const resolvedPortfolioId = portfolioId || portfolio?._id;

  _useEffect(() => {
    if (!isPublicView || !portfolioId || !ready) return undefined;

    const sendHeartbeat = () => {
      Meteor.call("portfolios.viewerHeartbeat", portfolioId, (error) => {
        if (error) {
          console.error("Failed to send viewer heartbeat:", error);
        }
      });
    };

    // Send one immediately once the viewer subscription is ready.
    sendHeartbeat();

    // Continue updating lastSeenAt while the portfolio remains open.
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isPublicView, portfolioId, ready]);

  const navigate = useNavigate();
  const [viewportMode, setViewportMode] = useState("desktop");

  if (isPublicView) {
    return null;
  }

  // Skill filter state
  const [selectedSkill, setSelectedSkill] = useState("All");

  // Compute unique skills from the loaded projects
  const availableSkills = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      (p.technologies || []).forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [projects]);

  const displayedProjects =
    selectedSkill && selectedSkill !== "All"
      ? projects.filter((p) => (p.technologies || []).includes(selectedSkill))
      : projects;

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="bg-surface-fill min-h-screen pb-8">
      {/* Dashboard chrome — hidden for the recruiter view */}
      {!isRecruiterView && (
        <div className="border-b border-line bg-surface-fill">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3 lg:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-base font-bold text-primary m-0">
                {isPublishedView
                  ? "Published portfolio"
                  : isStaging
                    ? "Draft preview"
                    : "Project preview"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex rounded-lg border border-line bg-background p-1"
                role="group"
                aria-label="Preview viewport"
              >
                <button
                  type="button"
                  onClick={() => setViewportMode("desktop")}
                  aria-pressed={viewportMode === "desktop"}
                  aria-label="Show desktop preview"
                  className={`rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                    viewportMode === "desktop"
                      ? "bg-primary text-background"
                      : "text-primary hover:bg-surface-fill"
                  }`}
                >
                  Desktop
                </button>

                <button
                  type="button"
                  onClick={() => setViewportMode("mobile")}
                  aria-pressed={viewportMode === "mobile"}
                  aria-label="Show mobile preview"
                  className={`rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                    viewportMode === "mobile"
                      ? "bg-primary text-background"
                      : "text-primary hover:bg-surface-fill"
                  }`}
                >
                  Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-lg border border-line bg-background px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-background"
              >
                Back to Dashboard
              </button>

              {isStaging && <PublishButton portfolio={portfolio} />}
            </div>
          </div>
        </div>
      )}

      <PortfolioContent
        portfolio={portfolio}
        projects={projects}
        viewportMode={viewportMode}
      />
    </div>
  );
};

PortfolioPreview.propTypes = {
  portfolio: PropTypes.object,
  projects: PropTypes.arrayOf(PropTypes.object),
  isStaging: PropTypes.bool,
  isPublishedView: PropTypes.bool,
  isRecruiterView: PropTypes.bool,
};
