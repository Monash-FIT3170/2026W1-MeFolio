import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from './ProjectCard.jsx';
import './PortfolioPreview.css';

const MOCK_PROJECTS = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-stack store with real-time inventory.",
    tech: ["React", "Node.js", "Stripe"],
    stars: 234,
    challengeName: "Cart Logic Challenge"
  },
  {
    id: "2",
    title: "Task Management App",
    description: "Collaborative tasks with real-time updates.",
    tech: ["Vue.js", "Firebase", "Tailwind"],
    stars: 156,
    challengeName: "State Management"
  },
  {
    id: "3",
    title: "AI Content Generator",
    description: "Generate high-quality blog posts using GPT-4 API endpoints.",
    tech: ["Next.js", "OpenAI", "PostgreSQL"],
    stars: 380,
    challengeName: "API Rate Limiting",
    imageUrl: ""
  },
  {
    id: "4",
    title: "ksksjkfase",
    description: "awawfawfawf",
    tech: ["Python", "React", "D3.js"],
    stars: 89,
    challengeName: "hfhejfhjf",
    imageUrl: ""
  },
  {
    id: "5",
    title: "fesfsefsef",
    description: "esfsfsefsefsefsef",
    tech: ["React Native", "Express", "SQLite"],
    stars: 412,
    challengeName: "efsefsefsf",
    imageUrl: ""
  }
];

export const PortfolioPreview = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e) => {
    if (!isDown) return;
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
        {/* Behavioral CSS class: project-scroll-viewport */}
        <div 
          className={`project-scroll-viewport gap-8 pb-8 ${isDown ? 'active' : ''}`}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {MOCK_PROJECTS.map((project) => (
            <div className="project-card-slot" key={project.id}>
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