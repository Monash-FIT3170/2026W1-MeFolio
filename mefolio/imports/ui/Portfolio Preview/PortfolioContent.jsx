import PropTypes from "prop-types";
import { useRef, useState, useMemo } from "react";
import { ProjectCard } from "./ProjectCard.jsx";
import About from "../components/About.jsx";
import Navbar from "../components/Navbar.jsx";
import { ProfileCard } from "../components/ProfileCard.jsx";

// The portfolio as its owner designed it - navbar, hero and project gallery -
// with none of the surrounding dashboard controls. PortfolioPreview renders
// this underneath its preview chrome; the public route renders it on its own.
//
// Everything here is driven by the portfolio and projects passed in. Nothing
// reads the logged-in user, so the same markup serves an anonymous visitor.
export const PortfolioContent = ({
  portfolio,
  portfolioId,
  projects = [],
  viewportMode = "desktop",
}) => {
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
    if (e.target.closest("a, button, input, select, textarea")) return;
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
    /* Full-width navbar */
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
                <ProjectCard project={project} portfolioId={portfolioId} />
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

PortfolioContent.propTypes = {
  portfolio: PropTypes.object,
  portfolioId: PropTypes.string,
  projects: PropTypes.arrayOf(PropTypes.object),
  viewportMode: PropTypes.oneOf(["desktop", "mobile"]),
};

export default PortfolioContent;
