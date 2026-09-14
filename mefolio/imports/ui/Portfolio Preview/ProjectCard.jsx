import { useState } from "react";
import PropTypes from "prop-types";
import {
  Github,
  ExternalLink,
  Code,
  Play,
  Star,
  GitBranch,
  Clock3,
  Mic,
} from "lucide-react";
import { trackProjectClick } from "../../api/projectClickTracking";
import { Meteor } from "meteor/meteor";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import CodeBlock from "../Projects Editor/CodeBlock";
import getLanguageFromTechStack from "../Projects Editor/techToLanguage";

export function ProjectCard({
  project,
  portfolioId,
  onProjectClick = trackProjectClick,
}) {
  const [showMockChallenge, setShowMockChallenge] = useState(false);
  const [challengeCode, setChallengeCode] = useState("");
  const [challengeResult, setChallengeResult] = useState(null);
  const [challengeError, setChallengeError] = useState("");
  const [, setImageError] = useState(false);

  const data = project || {
    title: "Untitled Project",
    description: "Description placeholder.",
    technologies: [],
    media: "",
  };

  const githubStats = data.githubStats;
  const githubStarsToDisplay = githubStats?.stars ?? data.stars ?? 0;

  const lastUpdated = githubStats?.updatedAt
    ? new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(githubStats.updatedAt))
    : "-";

  const handleProjectClick = (target) => {
    const projectId = data._id || data.id;
    if (!portfolioId || !projectId) return;

    try {
      const trackingRequest = onProjectClick({
        portfolioId,
        projectId,
        target,
      });

      Promise.resolve(trackingRequest).catch(() => undefined);
    } catch {
      // Keep the destination usable if analytics fails.
    }
  };

  const handleChallengeSubmit = () => {
    const projectId = data._id || data.id;
    setChallengeResult(null);
    setChallengeError("");

    Meteor.call(
      "validate_challenge_completion",
      projectId,
      challengeCode,
      (error, result) => {
        if (error) {
          setChallengeError(error.reason || "Unable to validate challenge.");
          return;
        }
        setChallengeResult(result.completed);
      },
    );
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
          <Star className="h-3.5 w-3.5 fill-accent2 text-accent2" />
          <span className="text-xs font-extrabold text-primary">
            {githubStarsToDisplay}
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
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-accent1" />
            {githubStats?.commits ?? data.commits ?? "-"} commits
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-alt" />
            Updated {lastUpdated}
          </span>
        </div>
      </CardHeader>

      <CardContent className="project-card-content">
        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(data.technologies || []).map((technology) => (
            <span
              key={technology}
              className="px-2.5 py-1 text-[11px] font-bold text-accent1 bg-background rounded-lg"
            >
              {technology}
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

          {data.challenge ? (
            showMockChallenge ? (
              <div className="ml-6 mb-3 space-y-3">
                <p className="text-[11px] font-semibold text-accent2">
                  {data.challenge.title} · {data.challenge.language}
                </p>
                <CodeBlock
                  code={data.challenge.starterCode}
                  language={getLanguageFromTechStack(data.technologies)}
                />
                <textarea
                  aria-label="Challenge answer"
                  value={challengeCode}
                  onChange={(event) => setChallengeCode(event.target.value)}
                  placeholder="Enter your answer"
                  rows={3}
                  className="w-full rounded-lg border border-line bg-surface-fill p-2 text-xs text-primary"
                />
                <button
                  type="button"
                  onClick={handleChallengeSubmit}
                  className="w-full rounded-lg bg-button py-2 text-xs font-bold text-secondary"
                >
                  Check Answer
                </button>
                {challengeResult !== null && (
                  <p
                    className={`text-xs font-bold ${
                      challengeResult ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {challengeResult ? "Correct!" : "Not quite yet!"}
                  </p>
                )}
                {challengeError && (
                  <p className="text-xs font-bold text-accent2">
                    {challengeError}
                  </p>
                )}
              </div>
            ) : null
          ) : (
            <p
              data-testid="challenge-placeholder"
              className="ml-6 mb-3 text-[11px] font-semibold text-accent2"
            >
              Challenge feature coming soon
            </p>
          )}

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
              className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-background py-3 text-sm font-bold text-muted opacity-60"
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
              <ExternalLink className="w-4 h-4" />
              Demo
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-background py-3 text-sm font-bold text-muted opacity-60"
            >
              <ExternalLink className="w-4 h-4" />
              Demo
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
    stars: PropTypes.number,
    commits: PropTypes.number,
    githubStats: PropTypes.shape({
      stars: PropTypes.number,
      commits: PropTypes.number,
      updatedAt: PropTypes.string,
    }),
    challenge: PropTypes.shape({
      title: PropTypes.string,
      language: PropTypes.string,
      starterCode: PropTypes.string,
      expectedOutput: PropTypes.string,
    }),
  }),
  portfolioId: PropTypes.string,
  onProjectClick: PropTypes.func,
};
