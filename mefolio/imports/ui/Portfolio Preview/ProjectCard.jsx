import React, { useState, useEffect } from "react";
import { Github, ExternalLink, Code, Play, Star, Mic } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export function ProjectCard({ project }) {
  const [showMockChallenge, setShowMockChallenge] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [githubStars, setGithubStars] = useState(null);

  const data = project || {
    title: "Untitled Project",
    description: "Description placeholder.",
    technologies: [],
    githubLink: "",
    media: "",
  };

  useEffect(() => {
    if (!data.githubLink) return;
    if (data.githubLink.includes("github.com/example/")) {
    setGithubStars(0);
    return;
  }

  const match = data.githubLink.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return;
  const [, owner, repo] = match;

  fetch(`https://api.github.com/repos/${owner}/${repo}`)
    .then((res) => res.json())
    .then((json) => {
      if (json.stargazers_count !== undefined)
        setGithubStars(json.stargazers_count);
    })
    .catch(() => {});
}, [data.githubLink]);

  return (
    <Card className="overflow-hidden bg-white border-2 border-slate-100 rounded-3xl shadow-sm transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 group">
      {/* Top Image & Star Section */}
      <div className="relative h-48 flex items-center justify-center bg-slate-100 overflow-hidden pointer-events-none select-none">
        {data.media ? (
          <img
            src={data.media}
            alt={data.title}
            width="400"        
            height="192"
            loading="lazy"         
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
            Preview Coming Soon
          </span>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white rounded-full shadow-sm">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-extrabold text-slate-800">
            {githubStars ?? data.stars ?? 0}
          </span>
        </div>
      </div>

      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-xl font-bold text-slate-900">
          {data.title}
        </CardTitle>
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
          {data.description}
        </p>
      </CardHeader>

      <CardContent className="project-card-content">
        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {data.technologies.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 text-[11px] font-bold text-indigo-500 bg-indigo-50 rounded-lg"
            >
              {t}
            </span>
          ))}
        </div>

        <button
          disabled
          className="w-full mb-4 py-2.5 flex items-center justify-center gap-2 bg-violet-50 text-indigo-600 rounded-xl font-bold text-sm"
        >
          <Mic className="w-4 h-4" />
          Voice Summary
        </button>

        <div className="p-4 mb-5 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="flex items-center mb-1">
            <Code className="w-4 h-4 text-indigo-600 mr-2" />
            <span className="text-xs font-extrabold text-indigo-600 uppercase">
              Mini Challenge
            </span>
          </div>
          <p className="ml-6 mb-3 text-[11px] font-semibold text-slate-500">
            {"Challenge feature coming soon"}
          </p>
          <button
            onClick={() => setShowMockChallenge(!showMockChallenge)}
            className="w-full py-2 flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm hover:bg-indigo-200 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-700" />
            Try Challenge
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => window.open(data.githubLink)}
            className="flex-1 py-3 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            <Github className="icon-small" />
            <span className="w-4 h-4">Code</span>
          </button>
          <button className="flex-1 py-3 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all">
            <ExternalLink className="w-4 h-4" /> Demo
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
