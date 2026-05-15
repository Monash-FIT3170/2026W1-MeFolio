import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from './ProjectCard.jsx';
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../api/portfolio.js";
import { ProjectCollection } from '../api/projects.js';

export const PortfolioPreview = () => {
  /*
  The js bellow subscribes to all portfolios and finds the Porfolio with the superuser id.
  Using this portfolio, it then gets all projects with that id. 

  It will break if superuser starts having many portfolios with its current implementation. 

  Personnaly I (harry mills) think this should be refactored so a projects container recieves a portfolio id as
  a component attributes and then sub to projects in thier once the whole page is set up to 
  separate concerns between components.
  */
  const portfolio = useTracker(() => {
    const sub = Meteor.subscribe("portfolios.all");

    if (!sub.ready()) {return [];}

    return PortfolioCollection.findOne({ userId: "Superuser" }); 
  });

  console.log("port_id:", portfolio?._id)

  const projects = useTracker(() => {
    const sub = Meteor.subscribe("projects.all");

    if (!sub.ready() || !portfolio) {return [];}

    return ProjectCollection.find({portfolioId: "abc" }).fetch(); //TODO CHANGE THE KEY TO THE KEY from "abc" TO portfolio._id
  });  

  /*
  Above is 
  Below is related UI js
  */
  
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
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"        
        >
          Back to Dashboard
        </button>
      </header>

      <div className="relative w-full">
        <div
          className={`flex flex-row flex-nowrap overflow-x-auto cursor-grab select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-8 pb-8 ${isDown ? 'cursor-grabbing' : ''}`}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {MONGO_PROJECTS.map((project) => (
            <div className="shrink-0 w-[380px]"  key={project.priority }>
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
  );
};