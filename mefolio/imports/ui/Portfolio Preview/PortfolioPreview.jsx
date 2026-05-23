import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectCard } from "./ProjectCard.jsx";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import { ProjectCollection } from "../../api/projects.js";
import About from "../components/About.jsx";
import Navbar from "../components/Navbar.jsx";
import { ProfileCard } from "../components/ProfileCard.jsx";

export const PortfolioPreview = () => {
  const { portfolio, projects } = useTracker(() => {
  const portfolioSub = Meteor.subscribe("portfolios.all");
  const projectsSub = Meteor.subscribe("projects.all");

  if (!portfolioSub.ready() || !projectsSub.ready()) {
    return { portfolio: null, projects: [] };
  }

  const portfolio = PortfolioCollection.findOne();

  if (!portfolio?.projects?.length) {
    return { portfolio, projects: [] };
  }

  const projectMap = new Map(
    ProjectCollection.find({ _id: { $in: portfolio.projects } })
      .fetch()
      .map((p) => [p._id, p]),
  );

  const projects = portfolio.projects
    .map((id) => projectMap.get(id))
    .filter(Boolean);

  return { portfolio, projects };
});

  const navigate = useNavigate();
  const scrollRef = useRef(null);

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
    <div className="p-12 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Project Preview</h1>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          Back to Dashboard
        </button>
      </header>
    <div>
      <Navbar />
      {/* Hero - two-column grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_500px] items-center min-h-[calc(100vh-64px)] px-10 lg:px-20 gap-12 py-12 lg:py-0">

      {/* Left column */}
        <div className="flex flex-col gap-6">
          <About />
        </div>
      
      {/* Right column- profile card */}
        <div className="flex justify-center items-center py-4 order-first lg:order-last">
          <ProfileCard/>
        </div>
      </section>

      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Project Gallery</h1>
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
          {projects.map((project) => (
            <div className="shrink-0 w-[380px]" key={project._id}>
              <ProjectCard project={project} />
            </div>
          ))}
          {/* Spacer using Tailwind */}
          <div className="flex-none w-8" />
        </div>

        {/* Tailwind-powered Gradient Hint */}
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
      </div>
    </div>
    </div>
  );
};