import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects.js";
import { ProjectCollection } from "../../api/projects.js";
import { PortfolioContent } from "./PortfolioContent.jsx";
import PublishButton from "./PublishButton.jsx";

const getUserEmail = (user) =>
  user?.email ||
  user?.emails?.[0]?.address ||
  user?.services?.google?.email ||
  user?.services?.github?.email ||
  "";

export const PortfolioPreview = ({
  portfolio: propPortfolio = null,
  projects: propProjects = [],
  isStaging = false,
  isPublishedView = false,
  isRecruiterView = false,
}) => {
  const {
    portfolio: trackedPortfolio,
    projects: trackedProjects,
    portfolioId,
  } = useTracker(() => {
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
      return { portfolio: null, projects: [], portfolioId: null };
    }

    const currentUser = Meteor.user();
    const portfolio =
      propPortfolio ||
      PortfolioCollection.findOne({ userId: Meteor.userId() }) ||
      (getUserEmail(currentUser) === "test@example.com"
        ? PortfolioCollection.findOne()
        : null);

    if (!portfolio?._id) {
      return {
        portfolio: propPortfolio,
        projects: propProjects,
        portfolioId: propPortfolio?._id || null,
      };
    }

    const projectOrderDocuments = PortfolioProjectsCollection.find(
      { portfolioId: portfolio._id },
      { sort: { orderIndex: 1 } },
    ).fetch();
    const orderedProjectIds = projectOrderDocuments.length
      ? projectOrderDocuments.map((projectOrder) => projectOrder.projectId)
      : portfolio.projects || [];

    if (!orderedProjectIds.length) {
      return { portfolio, projects: [], portfolioId: portfolio._id };
    }

    const projectMap = new Map(
      ProjectCollection.find({ _id: { $in: orderedProjectIds } })
        .fetch()
        .map((project) => [project._id, project]),
    );
    const projects = orderedProjectIds
      .map((projectId) => projectMap.get(projectId))
      .filter(Boolean);

    return { portfolio, projects, portfolioId: portfolio._id };
  }, [propPortfolio, propProjects]);

  const portfolio = propPortfolio || trackedPortfolio;
  const projects = propProjects.length ? propProjects : trackedProjects;
  const resolvedPortfolioId = portfolioId || portfolio?._id;

  const navigate = useNavigate();
  const [viewportMode, setViewportMode] = useState("desktop");

  return (
    <div className="bg-surface-fill min-h-screen pb-8">
      {/* Dashboard chrome — hidden for the recruiter view */}
      {!isRecruiterView && (
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
      )}

      <PortfolioContent
        portfolio={portfolio}
        projects={projects}
        viewportMode={viewportMode}
      />
    </div>
  );
};

PortfolioPreview.propTypes = {
  portfolio: PropTypes.object,
  projects: PropTypes.arrayOf(PropTypes.object),
  isStaging: PropTypes.bool,
  isPublishedView: PropTypes.bool,
  isRecruiterView: PropTypes.bool,
};
