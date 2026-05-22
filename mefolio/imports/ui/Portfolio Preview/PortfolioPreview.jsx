import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectCard } from "./ProjectCard.jsx";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects.js";
import { ProjectCollection } from "../../api/projects.js";

const getUserEmail = (user) =>
  user?.email ||
  user?.emails?.[0]?.address ||
  user?.services?.google?.email ||
  user?.services?.github?.email ||
  "";

export const PortfolioPreview = () => {
  const { projects } = useTracker(() => {
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

    if (!portfolio?._id) return { portfolio, projects: [] };

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
        <h1 className="text-3xl font-bold text-slate-900">Project Gallery</h1>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          Back to Dashboard
        </button>
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
          <div className="flex-none w-8" />
        </div>

        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
