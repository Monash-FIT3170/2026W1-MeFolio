import PropTypes from "prop-types";

const getProjectId = (project) => project?._id || project?.id;

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));

const buildProjectAnalytics = (projects = [], engagements = []) =>
  projects
    .map((project) => {
      const projectId = getProjectId(project);

      const projectEngagements = engagements.filter(
        (engagement) => engagement.project_id === projectId,
      );

      const totalClicks = projectEngagements.reduce(
        (total, engagement) => total + Number(engagement.clicks || 0),
        0,
      );

      return {
        id: projectId,
        title: project.title || "Untitled project",
        totalClicks,
      };
    })
    .sort((a, b) => b.totalClicks - a.totalClicks);

const buildDailyAnalytics = (engagements = []) => {
  const clicksByDate = new Map();

  engagements.forEach((engagement) => {
    if (!engagement.date) return;

    const date = new Date(engagement.date);

    if (Number.isNaN(date.getTime())) return;

    const dateKey = date.toISOString().split("T")[0];
    const currentClicks = clicksByDate.get(dateKey) || 0;

    clicksByDate.set(
      dateKey,
      currentClicks + Number(engagement.clicks || 0),
    );
  });

  return [...clicksByDate.entries()]
    .map(([date, clicks]) => ({
      date,
      clicks,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const ProjectClicksChart = ({ analytics }) => {
  const highestClickCount = Math.max(
    ...analytics.map((project) => project.totalClicks),
    0,
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="m-0 text-lg font-bold text-gray-900">
          Clicks by Project
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Total recorded clicks for each portfolio project.
        </p>
      </div>

      {analytics.length === 0 ? (
        <p className="text-sm text-gray-500">
          No project analytics are available yet.
        </p>
      ) : (
        <div className="space-y-5">
          {analytics.map((project) => {
            const width =
              highestClickCount > 0
                ? (project.totalClicks / highestClickCount) * 100
                : 0;

            return (
              <div key={project.id}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="truncate text-sm font-medium text-gray-700">
                    {project.title}
                  </span>

                  <span className="text-sm font-bold text-gray-900">
                    {project.totalClicks}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const TopProjects = ({ analytics }) => {
  const topProjects = analytics.slice(0, 5);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="m-0 text-lg font-bold text-gray-900">Top Projects</h2>
        <p className="mt-1 text-sm text-gray-500">
          Projects ranked by recorded clicks.
        </p>
      </div>

      {topProjects.length === 0 ? (
        <p className="text-sm text-gray-500">
          No project activity is available yet.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {topProjects.map((project, index) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                  {index + 1}
                </span>

                <span className="truncate text-sm font-semibold text-gray-800">
                  {project.title}
                </span>
              </div>

              <span className="shrink-0 text-sm font-bold text-gray-900">
                {project.totalClicks} clicks
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const ClickActivity = ({ dailyAnalytics }) => {
  const highestClickCount = Math.max(
    ...dailyAnalytics.map((entry) => entry.clicks),
    0,
  );

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="m-0 text-lg font-bold text-gray-900">
          Click Activity
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Recorded portfolio project clicks by date.
        </p>
      </div>

      {dailyAnalytics.length === 0 ? (
        <p className="text-sm text-gray-500">
          No dated click activity is available yet.
        </p>
      ) : (
        <div className="flex min-h-56 items-end gap-3 overflow-x-auto pb-2">
          {dailyAnalytics.map((entry) => {
            const height =
              highestClickCount > 0
                ? Math.max((entry.clicks / highestClickCount) * 160, 4)
                : 4;

            return (
              <div
                key={entry.date}
                className="flex min-w-14 flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-xs font-semibold text-gray-700">
                  {entry.clicks}
                </span>

                <div
                  className="w-full max-w-12 rounded-t-md bg-indigo-600"
                  style={{ height: `${height}px` }}
                  title={`${entry.clicks} clicks on ${formatDate(entry.date)}`}
                />

                <span className="mt-2 whitespace-nowrap text-xs text-gray-500">
                  {formatDate(entry.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

const AnalyticsSection = ({ projects = [], engagements = [] }) => {
  const projectAnalytics = buildProjectAnalytics(projects, engagements);
  const dailyAnalytics = buildDailyAnalytics(engagements);

  const totalClicks = projectAnalytics.reduce(
    (total, project) => total + project.totalClicks,
    0,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm font-medium text-gray-500">
            Total Project Clicks
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {totalClicks}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm font-medium text-gray-500">
            Projects Tracked
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {projectAnalytics.length}
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <ProjectClicksChart analytics={projectAnalytics} />
        <TopProjects analytics={projectAnalytics} />
      </div>

      <ClickActivity dailyAnalytics={dailyAnalytics} />

      <section className="rounded-xl border border-dashed border-gray-300 bg-white p-6">
        <h2 className="m-0 text-lg font-bold text-gray-900">
          Visitor Locations
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Location analytics will appear here once visitor location data is
          available.
        </p>
      </section>
    </div>
  );
};

const projectAnalyticsPropType = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  totalClicks: PropTypes.number,
});

ProjectClicksChart.propTypes = {
  analytics: PropTypes.arrayOf(projectAnalyticsPropType).isRequired,
};

TopProjects.propTypes = {
  analytics: PropTypes.arrayOf(projectAnalyticsPropType).isRequired,
};

ClickActivity.propTypes = {
  dailyAnalytics: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      clicks: PropTypes.number,
    }),
  ).isRequired,
};

AnalyticsSection.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object),
  engagements: PropTypes.arrayOf(PropTypes.object),
};

export default AnalyticsSection;