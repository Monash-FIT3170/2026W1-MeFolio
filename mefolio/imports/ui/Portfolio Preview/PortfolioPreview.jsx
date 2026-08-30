import PropTypes from "prop-types";
import { useRef, useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectCard } from "./ProjectCard.jsx";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects.js";
import { ProjectCollection } from "../../api/projects.js";
import About from "../components/About.jsx";
import Navbar from "../components/Navbar.jsx";
import { ProfileCard } from "../components/ProfileCard.jsx";
import PublishButton from "./PublishButton.jsx";

const getUserEmail = (user) =>
  user?.email ||
  user?.emails?.[0]?.address ||
  user?.services?.google?.email ||
  user?.services?.github?.email ||
  "";

export const PortfolioPreview = ({
  portfolio: draftPortfolio = null,
  projects: draftProjects = null,
  isStaging = false,
  isPublishedView = false,
}) => {
  const { portfolioId } = useParams();
  const isPublicView = Boolean(portfolioId);

  const { portfolio: loadedPortfolio, projects: loadedProjects, portfolio, ready } =
    useTracker(() => {
      if (draftPortfolio || draftProjects) {
        return {
          portfolio: draftPortfolio,
          projects: draftProjects || [],
          ready: true,
        };
      }

      if (isPublicView) {
        const viewerSub = Meteor.subscribe("portfolios.viewer", portfolioId);
        const selectedPortfolio = PortfolioCollection.findOne({ _id: portfolioId });

        if (!selectedPortfolio?._id) {
          return { portfolio: null, projects: [], ready: viewerSub.ready() };
        }

        const projectOrderDocuments = PortfolioProjectsCollection.find(
          { portfolioId: selectedPortfolio._id },
          { sort: { orderIndex: 1 } },
        ).fetch();
        const orderedProjectIds = projectOrderDocuments.length
          ? projectOrderDocuments.map((projectOrder) => projectOrder.projectId)
          : selectedPortfolio.projects || [];

        if (!orderedProjectIds.length) {
          return {
            portfolio: selectedPortfolio,
            projects: [],
            ready: viewerSub.ready(),
          };
        }

        const projectMap = new Map(
          ProjectCollection.find({ _id: { $in: orderedProjectIds } })
            .fetch()
            .map((project) => [project._id, project]),
        );

        const projects = orderedProjectIds
          .map((projectId) => projectMap.get(projectId))
          .filter(Boolean);

        return {
          portfolio: selectedPortfolio,
          projects,
          ready: viewerSub.ready(),
        };
      }

      if (isPublicView) {
        const viewerSub = Meteor.subscribe("portfolios.viewer", portfolioId);
        const selectedPortfolio = PortfolioCollection.findOne({ _id: portfolioId });

        if (!selectedPortfolio?._id) {
          return { portfolio: null, projects: [], ready: viewerSub.ready() };
        }

        const projectOrderDocuments = PortfolioProjectsCollection.find(
          { portfolioId: selectedPortfolio._id },
          { sort: { orderIndex: 1 } },
        ).fetch();
        const orderedProjectIds = projectOrderDocuments.length
          ? projectOrderDocuments.map((projectOrder) => projectOrder.projectId)
          : selectedPortfolio.projects || [];

        if (!orderedProjectIds.length) {
          return {
            portfolio: selectedPortfolio,
            projects: [],
            ready: viewerSub.ready(),
          };
        }

        const projectMap = new Map(
          ProjectCollection.find({ _id: { $in: orderedProjectIds } })
            .fetch()
            .map((project) => [project._id, project]),
        );

        const projects = orderedProjectIds
          .map((projectId) => projectMap.get(projectId))
          .filter(Boolean);

        return {
          portfolio: selectedPortfolio,
          projects,
          ready: viewerSub.ready(),
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
        return { portfolio: null, projects: [], ready: false };
      }

      const currentUser = Meteor.user();
      const selectedPortfolio =
        PortfolioCollection.findOne({ userId: Meteor.userId() }) ||
        PortfolioCollection.findOne({ _id: portfolioId }) ||
      (getUserEmail(currentUser) === "test@example.com"
        ? PortfolioCollection.findOne()
        : null);

      if (!selectedPortfolio?._id) {
        return { portfolio: selectedPortfolio, projects: [], ready: true };
      }
    if (!portfolio?._id) return { projects: [], portfolio, ready: true };

    const viewerSub = Meteor.subscribe("portfolios.viewer", portfolio._id);
    if (!viewerSub.ready()) {
      return { projects: [], portfolio: selectedPortfolio , ready: false };
    }

      const projectOrderDocuments = PortfolioProjectsCollection.find(
        { portfolioId: selectedPortfolio._id },
        { sort: { orderIndex: 1 } },
      ).fetch();
      const orderedProjectIds = projectOrderDocuments.length
        ? projectOrderDocuments.map((projectOrder) => projectOrder.projectId)
        : selectedPortfolio.projects || [];

      if (!orderedProjectIds.length) {
        return { portfolio: selectedPortfolio, projects: [], ready: true };
      }

    const projectMap = new Map(
      ProjectCollection.find({ _id: { $in: orderedProjectIds } })
        .fetch()
        .map((project) => [project._id, project]),
    );
    const projects = orderedProjectIds
      .map((projectId) => projectMap.get(projectId))
      .filter(Boolean);

      return { portfolio: selectedPortfolio, projects, ready: true };
    }, [draftPortfolio, draftProjects, isPublicView, portfolioId]);

  const projects = draftProjects || loadedProjects || [];

  useEffect(() => {
    if (!isPublicView || !portfolioId || !ready) return undefined;

    const sendHeartbeat = () => {
      Meteor.call("portfolios.viewerHeartbeat", portfolioId, (error) => {
        if (error) {
          console.error("Failed to send viewer heartbeat:", error);
        }
      });
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isPublicView, portfolioId, ready]);

  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [viewportMode, setViewportMode] = useState("desktop");

  if (isPublicView) {
    return null;
  }

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
      {/* Dashboard chrome — full-width border, padded content */}
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

      {/* Full-width navbar */}
      <div
        className={`mx-auto overflow-hidden bg-background transition-all duration-300 ${
          viewportMode === "mobile"
            ? "w-[390px] max-w-full border border-line shadow-xl rounded-b-2xl"
            : "w-full"
        }`}
      >
        <Navbar portfolio={portfolio} viewportMode={viewportMode} />

        {/* Hero section — about + profile card */}
        <section className="bg-background border-b border-line">
          <div
            className={`grid items-center mx-auto w-full ${
              viewportMode === "mobile"
                ? "grid-cols-1 min-h-0 px-5 py-10 gap-8"
                : "grid-cols-[1fr_40%] min-h-[calc(100vh-64px)] px-20 py-32 gap-12 max-w-7xl"
            }`}
          >
            {/* Left column */}
            <div className="flex flex-col gap-6">
              <About portfolio={portfolio} />
            </div>

            {/* Right column - profile card */}
            <div
              className={`flex justify-center items-center w-full ${
                viewportMode === "mobile" ? "order-first" : "order-last"
              }`}
            >
              <ProfileCard portfolio={portfolio} />
            </div>
          </div>
        </section>

        {/* Project gallery section */}
        <section
          id="projects"
          className={`bg-background border-b border-line w-full ${
            viewportMode === "mobile" ? "px-5 pt-8 pb-10" : "px-20 pt-10 pb-16"
          }`}
        >
          <header
            className={`flex justify-between mb-4 gap-3 ${
              viewportMode === "mobile"
                ? "flex-col items-start"
                : "flex-row items-center"
            }`}
          >
            <h1 className="text-3xl font-bold text-primary">Project Gallery</h1>

            <div
              className={`flex gap-3 ${
                viewportMode === "mobile"
                  ? "w-full flex-col items-start"
                  : "items-center"
              }`}
            >
              <label className="text-sm text-muted">Filter by skill:</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className={`rounded-xl border border-line bg-surface-fill px-3 py-2 text-sm font-bold text-primary ${
                  viewportMode === "mobile" ? "w-full" : ""
                }`}
              >
                <option value="All">All Skills</option>
                {availableSkills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {selectedSkill !== "All" && (
                <button
                  onClick={() => setSelectedSkill("All")}
                  className="text-sm font-semibold text-alt hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </header>

          <div className="relative w-full">
            <div
              className={`flex flex-row flex-nowrap overflow-x-auto cursor-grab select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-8 ${
                viewportMode === "mobile" ? "gap-4" : "gap-8"
              } ${isDown ? "cursor-grabbing" : ""}`}
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {displayedProjects.map((project) => (
                <div
                  className={`shrink-0 ${
                    viewportMode === "mobile"
                      ? "w-[330px] max-w-full"
                      : "w-[380px]"
                  }`}
                  key={project._id}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
              <div className="flex-none w-8" />
            </div>

            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        </section>
      </div>
    </div>
  );
};

PortfolioPreview.propTypes = {
  portfolio: PropTypes.object,
  projects: PropTypes.arrayOf(PropTypes.object),
  isStaging: PropTypes.bool,
  isPublishedView: PropTypes.bool,
};