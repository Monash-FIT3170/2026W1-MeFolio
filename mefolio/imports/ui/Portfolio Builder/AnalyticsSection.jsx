import PropTypes from "prop-types";

const getProjectId = (project) => project?._id || project?.id;

const parseAnalyticsDate = (date) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(parseAnalyticsDate(date));

const getLocalDateKey = (date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) =>
      index === 0 ? String(part) : String(part).padStart(2, "0"),
    )
    .join("-");

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

    // The dashboard consistently groups and labels events in the viewer's
    // local timezone, including clicks close to midnight.
    const dateKey = getLocalDateKey(date);
    const currentClicks = clicksByDate.get(dateKey) || 0;

    clicksByDate.set(dateKey, currentClicks + Number(engagement.clicks || 0));
  });

  return [...clicksByDate.entries()]
    .map(([date, clicks]) => ({
      date,
      clicks,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const buildProjectHeatmap = (projects = [], engagements = []) =>
  projects
    .map((project) => {
      const projectId = getProjectId(project);
      const clicksByDay = Array(7).fill(0);

      engagements.forEach((engagement) => {
        if (engagement.project_id !== projectId || !engagement.date) return;

        const date = new Date(engagement.date);
        if (Number.isNaN(date.getTime())) return;

        // Convert JavaScript's Sunday-first index to Monday-first.
        const dayIndex = (date.getDay() + 6) % 7;
        clicksByDay[dayIndex] += Number(engagement.clicks || 0);
      });

      return {
        id: projectId,
        title: project.title || "Untitled project",
        clicksByDay,
        totalClicks: clicksByDay.reduce((total, clicks) => total + clicks, 0),
      };
    })
    .sort((a, b) => b.totalClicks - a.totalClicks);

const ProjectClicksChart = ({ analytics }) => {
  const highestClickCount = Math.max(
    ...analytics.map((project) => project.totalClicks),
    0,
  );

  return (
    <section className="rounded-xl border border-line bg-surface-fill p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="m-0 text-lg font-bold text-primary">
          Clicks by Project
        </h2>
        <p className="mt-1 text-sm text-muted">
          Total recorded clicks for each portfolio project.
        </p>
      </div>

      {analytics.length === 0 ? (
        <p className="text-sm text-muted">
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
                  <span className="truncate text-sm font-medium text-primary">
                    {project.title}
                  </span>

                  <span className="text-sm font-bold text-primary">
                    {project.totalClicks}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted/20">
                  <div
                    className="h-full rounded-full bg-accent2 transition-all"
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
    <section className="rounded-xl border border-line bg-surface-fill p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="m-0 text-lg font-bold text-primary">Top Projects</h2>
        <p className="mt-1 text-sm text-muted">
          Projects ranked by recorded clicks.
        </p>
      </div>

      {topProjects.length === 0 ? (
        <p className="text-sm text-muted">
          No project activity is available yet.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {topProjects.map((project, index) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-selected text-sm font-bold text-alt">
                  {index + 1}
                </span>

                <span className="truncate text-sm font-semibold text-primary">
                  {project.title}
                </span>
              </div>

              <span className="shrink-0 text-sm font-bold text-primary">
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
    <section className="rounded-xl border border-line bg-surface-fill p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="m-0 text-lg font-bold text-primary">Click Activity</h2>
        <p className="mt-1 text-sm text-muted">
          Recorded portfolio project clicks by date.
        </p>
      </div>

      {dailyAnalytics.length === 0 ? (
        <p className="text-sm text-muted">
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
                <span className="mb-2 text-xs font-semibold text-primary">
                  {entry.clicks}
                </span>

                <div
                  className="w-full max-w-12 rounded-t-md bg-accent2"
                  style={{ height: `${height}px` }}
                  title={`${entry.clicks} clicks on ${formatDate(entry.date)}`}
                />

                <span className="mt-2 whitespace-nowrap text-xs text-muted">
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

const ProjectClickHeatmap = ({ analytics }) => {
  const highestDailyClickCount = Math.max(
    ...analytics.flatMap((project) => project.clicksByDay),
    0,
  );

  const getCellColor = (clicks) => {
    if (clicks === 0) {
      return "color-mix(in srgb, var(--theme-muted) 15%, var(--theme-surface-fill))";
    }

    const intensity = Math.round(
      (0.35 + (clicks / highestDailyClickCount) * 0.65) * 100,
    );

    return `color-mix(in srgb, var(--theme-alt) ${intensity}%, var(--theme-surface-fill))`;
  };

  return (
    <section className="rounded-xl border border-line bg-surface-fill p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="m-0 text-lg font-bold text-primary">
          Popular Projects Click Heatmap
        </h2>
        <p className="mt-1 text-sm text-muted">
          Color intensity shows click frequency by day of the week.
        </p>
      </div>

      {analytics.length === 0 ? (
        <p className="text-sm text-muted">
          No project activity is available yet.
        </p>
      ) : (
        <div className="space-y-7 overflow-x-auto pb-2">
          {analytics.map((project) => (
            <div key={project.id} className="min-w-[42rem]">
              <div className="mb-2 flex items-center justify-between gap-4">
                <h3 className="m-0 truncate text-sm font-semibold text-primary">
                  {project.title}
                </h3>
                <span className="shrink-0 text-xs text-muted">
                  {project.totalClicks}{" "}
                  {project.totalClicks === 1 ? "click" : "clicks"}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {project.clicksByDay.map((clicks, index) => (
                  <div key={WEEKDAYS[index]}>
                    <div
                      className="h-24 rounded transition-transform duration-150 hover:-translate-y-0.5"
                      style={{ backgroundColor: getCellColor(clicks) }}
                      title={`${project.title}: ${clicks} ${clicks === 1 ? "click" : "clicks"} on ${WEEKDAYS[index]}`}
                      aria-label={`${project.title}, ${WEEKDAYS[index]}: ${clicks} clicks`}
                    />
                    <span className="mt-2 block text-xs text-muted">
                      {WEEKDAYS[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const AnalyticsSection = ({ projects = [], engagements = [] }) => {
  const projectAnalytics = buildProjectAnalytics(projects, engagements);
  const dailyAnalytics = buildDailyAnalytics(engagements);
  const projectHeatmap = buildProjectHeatmap(projects, engagements);

  const totalClicks = projectAnalytics.reduce(
    (total, project) => total + project.totalClicks,
    0,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-fill p-5 shadow-sm">
          <p className="m-0 text-sm font-medium text-muted">
            Total Project Clicks
          </p>
          <p className="mt-2 text-3xl font-extrabold text-primary">
            {totalClicks}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface-fill p-5 shadow-sm">
          <p className="m-0 text-sm font-medium text-muted">Projects Tracked</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">
            {projectAnalytics.length}
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <ProjectClicksChart analytics={projectAnalytics} />
        <TopProjects analytics={projectAnalytics} />
      </div>

      <ClickActivity dailyAnalytics={dailyAnalytics} />

      <ProjectClickHeatmap analytics={projectHeatmap} />

      <section className="rounded-xl border border-dashed border-line bg-surface-fill p-6">
        <h2 className="m-0 text-lg font-bold text-primary">
          Visitor Locations
        </h2>
        <p className="mt-2 text-sm text-muted">
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

ProjectClickHeatmap.propTypes = {
  analytics: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      totalClicks: PropTypes.number,
      clicksByDay: PropTypes.arrayOf(PropTypes.number),
    }),
  ).isRequired,
};

AnalyticsSection.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object),
  engagements: PropTypes.arrayOf(PropTypes.object),
};

export default AnalyticsSection;
