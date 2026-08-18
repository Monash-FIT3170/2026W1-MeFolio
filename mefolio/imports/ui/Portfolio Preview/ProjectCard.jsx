import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Github, ExternalLink, Code, Play, Star, Mic } from "lucide-react";
import { trackProjectClick } from "../../api/projectClickTracking";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export function ProjectCard({
  project,
  portfolioId,
  onProjectClick = trackProjectClick,
}) {
  const [showMockChallenge, setShowMockChallenge] = useState(false);
  const [, setImageError] = useState(false);
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

  const handleProjectClick = (target) => {
    const projectId = data._id || data.id;
    if (!portfolioId || !projectId) return;

    try {
      const trackingRequest = onProjectClick({
        portfolioId,
        projectId,
        target,
      });

      // Analytics must never block or cancel the visitor's destination.
      Promise.resolve(trackingRequest).catch(() => undefined);
    } catch {
      // Keep the destination usable if a custom analytics transport fails.
    }
  };

  return (
    <Card className="overflow-hidden bg-surface-fill border-2 border-line rounded-3xl shadow-sm transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 group">
      {/* Top Image & Star Section */}
      <div className="relative h-48 flex items-center justify-center bg-background overflow-hidden pointer-events-none select-none">
        {data.media ? (
          <img
            src={data.media}
            alt={data.title}
            width={400}
            height={192}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest">
            Preview Coming Soon
          </span>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-background rounded-full shadow-sm">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-extrabold text-primary">
            {githubStars ?? data.stars ?? 0}
          </span>
        </div>
      </div>

      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-xl font-bold text-primary">
          {data.title}
        </CardTitle>
        <p className="mt-1 text-sm text-primary line-clamp-2">
          {data.description}
        </p>
      </CardHeader>

      <CardContent className="project-card-content">
        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(data.technologies || []).map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 text-[11px] font-bold text-accent1 bg-background rounded-lg"
            >
              {t}
            </span>
          ))}
        </div>

        <button
          disabled
          className="w-full mb-4 py-2.5 flex items-center border-line justify-center gap-2 bg-background text-primary rounded-xl font-bold text-sm"
        >
          <Mic className="w-4 h-4" />
          Voice Summary
        </button>

        <div className="p-4 mb-5 bg-background border border-accent2 rounded-2xl">
          <div className="flex items-center mb-1">
            <Code className="w-4 h-4 text-accent2 mr-2" />
            <span className="text-xs font-extrabold text-accent2 uppercase">
              Mini Challenge
            </span>
          </div>
          <p
            data-testid="challenge-placeholder"
            className="ml-6 mb-3 text-[11px] font-semibold text-accent2"
          >
            {"Challenge feature coming soon"}
          </p>
          <button
            onClick={() => setShowMockChallenge(!showMockChallenge)}
            className="w-full py-2 flex items-center justify-center gap-2 bg-background text-accent2 rounded-lg font-bold text-sm hover:bg-accent2 hover:text-background transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-accent2" />
            Try Challenge
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {data.githubLink ? (
            <a
              href={data.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleProjectClick("code")}
              className="flex-1 py-3 flex items-center justify-center gap-2 bg-background border border-line text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-background transition-all"
            >
              <Github className="icon-small" />
              <span>Code</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed py-3 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-300 rounded-xl font-bold text-sm"
            >
              <Github className="icon-small" />
              <span>Code</span>
            </button>
          )}

          {data.liveDemoLink ? (
            <a
              href={data.liveDemoLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleProjectClick("demo")}
              className="flex-1 py-3 flex items-center justify-center gap-2 bg-background border border-alt text-alt rounded-xl font-bold text-sm hover:bg-alt/50 hover:text-background transition-all"
            >
              <ExternalLink className="w-4 h-4" /> Demo
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed py-3 flex items-center justify-center gap-2 bg-indigo-300 text-white rounded-xl font-bold text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Demo
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.string),
    githubLink: PropTypes.string,
    liveDemoLink: PropTypes.string,
    media: PropTypes.string,
  }),
  portfolioId: PropTypes.string,
  onProjectClick: PropTypes.func,
};
