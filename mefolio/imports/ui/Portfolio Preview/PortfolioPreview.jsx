import PropTypes from "prop-types";
import { useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectCard } from "./ProjectCard.jsx";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects.js";
import { ProjectCollection } from "../../api/projects.js";
import About from "../components/About.jsx";
import Navbar from "../components/Navbar.jsx";
import { ProfileCard } from "../components/ProfileCard.jsx";

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
}) => {
  const { portfolio: loadedPortfolio, projects: loadedProjects } =
    useTracker(() => {
      if (draftPortfolio || draftProjects) {
        return {
          portfolio: draftPortfolio,
          projects: draftProjects || [],
        };
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
        return { portfolio: null, projects: [] };
      }

      const currentUser = Meteor.user();
      const portfolio =
        PortfolioCollection.findOne({ userId: Meteor.userId() }) ||
        (getUserEmail(currentUser) === "test@example.com"
          ? PortfolioCollection.findOne()
          : null);

      if (!portfolio?._id) return { portfolio: null, projects: [] };

      const projectOrderDocuments = PortfolioProjectsCollection.find(
        { portfolioId: portfolio._id },
        { sort: { orderIndex: 1 } },
      ).fetch();
      const orderedProjectIds = projectOrderDocuments.length
        ? projectOrderDocuments.map((projectOrder) => projectOrder.projectId)
        : portfolio.projects || [];

      if (!orderedProjectIds.length) return { portfolio, projects: [] };

      const projectMap = new Map(
        ProjectCollection.find({ _id: { $in: orderedProjectIds } })
          .fetch()
          .map((project) => [project._id, project]),
      );
      const projects = orderedProjectIds
        .map((projectId) => projectMap.get(projectId))
        .filter(Boolean);

      return { portfolio, projects };
    }, [draftPortfolio, draftProjects]);

  const portfolio = draftPortfolio || loadedPortfolio;
  const projects = draftProjects || loadedProjects;

  const navigate = useNavigate();
  const scrollRef = useRef(null);

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
    <div className="bg-surface-fill min-h-screen">
      {/* Dashboard chrome — full-width border, padded content */}
      <div className="border-b border-line bg-surface-fill/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-base font-bold text-primary m-0">
              {isStaging ? "Draft preview" : "Project preview"}
            </p>
            {isStaging && (
              <span className="rounded-full border border-alt/30 bg-alt/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-alt">
                Private staging view
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border border-line bg-background px-4 py-2 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-primary hover:text-background"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Full-width navbar */}
      <Navbar />

      {/* Hero section — about + profile card */}
      <section className="bg-background border-b border-muted">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_40%] items-center min-h-[calc(100vh-64px)] px-10 lg:px-20 gap-12 py-20 lg:py-32 max-w-7xl mx-auto w-full">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <About portfolio={portfolio} />
          </div>

          {/* Right column - profile card */}
          <div className="flex justify-center items-center order-first lg:order-last w-full">
            <ProfileCard portfolio={portfolio} />
          </div>
        </div>
      </section>

      {/* Project gallery section */}
      <section
        id="projects"
        className="bg-background border-b border-line px-10 lg:px-20 pt-10 pb-16 w-full"
      >
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h1 className="text-3xl font-bold text-primary">Project Gallery</h1>

          <div className="flex items-center gap-3">
            <label className="text-sm text-muted">Filter by skill:</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="rounded-xl border border-line bg-surface-fill px-3 py-2 text-sm font-bold text-primary"
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
            className={`flex flex-row flex-nowrap overflow-x-auto cursor-grab select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-8 pb-8 ${isDown ? "cursor-grabbing" : ""}`}
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {displayedProjects.map((project) => (
              <div className="shrink-0 w-[380px]" key={project._id}>
                <ProjectCard project={project} />
              </div>
            ))}
            <div className="flex-none w-8" />
          </div>

          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
};

PortfolioPreview.propTypes = {
  portfolio: PropTypes.object,
  projects: PropTypes.arrayOf(PropTypes.object),
  isStaging: PropTypes.bool,
};
