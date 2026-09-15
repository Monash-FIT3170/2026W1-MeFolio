import PropTypes from "prop-types";
import { useMemo, useState } from "react";

const GRAPH_WIDTH = 1080;
const NODE_GAP = 68;
const GRAPH_TOP_PADDING = 64;
const GRAPH_BOTTOM_PADDING = 36;
const MIN_SKILL_RADIUS = 18;
const MAX_SKILL_RADIUS = 30;
const SKILL_RADIUS_STEP = 4;

const getProjectId = (project, index) =>
  project?._id || project?.id || `project-${index}`;

const getProjectLabel = (project) => project?.title || "Untitled project";
const normalizeSkill = (skill) => String(skill).trim().toLocaleLowerCase();

export const SkillsProjectMap = ({
  projects = [],
  viewportMode = "desktop",
}) => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const { skills, projectNodes, graphHeight } = useMemo(() => {
    const skillProjects = new Map();

    projects.forEach((project, projectIndex) => {
      const projectId = getProjectId(project, projectIndex);
      (project?.technologies || []).forEach((technology) => {
        const skill = String(technology).trim();
        if (!skill) return;

        const skillKey = normalizeSkill(skill);
        const relatedSkill = skillProjects.get(skillKey) || {
          label: skill,
          projectIds: [],
        };
        if (!relatedSkill.projectIds.includes(projectId)) {
          skillProjects.set(skillKey, {
            ...relatedSkill,
            projectIds: [...relatedSkill.projectIds, projectId],
          });
        }
      });
    });

    const skillList = Array.from(skillProjects.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, { label, projectIds }], index) => ({
        id: `skill-${index}`,
        label,
        projectIds,
        radius: Math.min(
          MAX_SKILL_RADIUS,
          MIN_SKILL_RADIUS + projectIds.length * SKILL_RADIUS_STEP,
        ),
        x: 200,
        y: GRAPH_TOP_PADDING + index * NODE_GAP,
      }));

    const projectStartY =
      GRAPH_TOP_PADDING +
      Math.max(0, (skillList.length - projects.length) * NODE_GAP) / 2;

    const projectList = projects.map((project, index) => ({
      id: getProjectId(project, index),
      label: getProjectLabel(project),
      technologies: (project?.technologies || []).map((technology) =>
        normalizeSkill(technology),
      ),
      x: 760,
      y: projectStartY + index * NODE_GAP,
    }));

    return {
      skills: skillList,
      projectNodes: projectList,
      graphHeight:
        Math.max(Math.max(skillList.length, projectList.length) - 1, 0) *
          NODE_GAP +
        GRAPH_TOP_PADDING +
        GRAPH_BOTTOM_PADDING,
    };
  }, [projects]);

  if (!skills.length || !projectNodes.length) return null;

  const isNodeActive = (nodeType, node) => {
    if (!hoveredNode) return true;
    if (hoveredNode.type === nodeType && hoveredNode.id === node.id)
      return true;

    if (nodeType === "skill" && hoveredNode.type === "project") {
      return node.projectIds.includes(hoveredNode.id);
    }

    if (nodeType === "project" && hoveredNode.type === "skill") {
      return node.technologies.includes(normalizeSkill(hoveredNode.label));
    }

    return false;
  };

  const getLinkClassName = (active) => {
    if (!hoveredNode) return "opacity-25";
    return active ? "opacity-85" : "opacity-5";
  };

  const clearHover = () => setHoveredNode(null);

  return (
    <section
      id="skills-map"
      aria-labelledby="skills-map-title"
      className={`w-full border-b border-line bg-background ${
        viewportMode === "mobile" ? "px-5 py-6" : "px-20 py-10"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent1">
              Proof of work
            </p>
            <h2
              id="skills-map-title"
              className="mt-2 text-3xl font-bold text-primary"
            >
              Skills in practice
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Follow each technology to the projects where it is used.
            </p>
          </div>
          <p className="rounded-full border border-line bg-background px-3 py-1.5 text-xs font-bold text-muted">
            {skills.length} skills / {projectNodes.length} projects
          </p>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-fill p-2 shadow-sm sm:p-3">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted sm:hidden">
            Swipe to explore the map
          </p>
          <svg
            role="img"
            aria-labelledby="skills-map-title"
            viewBox={`0 0 ${GRAPH_WIDTH} ${graphHeight}`}
            className="mx-auto block h-auto min-w-[820px] w-full"
          >
            <defs>
              <pattern
                id="skills-map-grid"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  className="stroke-line"
                  strokeWidth="0.5"
                  opacity="0.35"
                />
              </pattern>
            </defs>
            <rect
              width={GRAPH_WIDTH}
              height={graphHeight}
              rx="16"
              className="fill-background"
            />
            <rect
              width={GRAPH_WIDTH}
              height={graphHeight}
              rx="16"
              fill="url(#skills-map-grid)"
            />
            <line
              x1="520"
              y1="48"
              x2="520"
              y2={graphHeight - 32}
              className="stroke-line"
              strokeDasharray="4 8"
            />
            <text
              x="200"
              y="34"
              textAnchor="middle"
              className="fill-muted text-[11px] font-bold uppercase tracking-[0.16em]"
            >
              Skills
            </text>
            <text
              x="760"
              y="34"
              textAnchor="middle"
              className="fill-muted text-[11px] font-bold uppercase tracking-[0.16em]"
            >
              Projects
            </text>

            {skills.flatMap((skill) =>
              skill.projectIds.map((projectId) => {
                const project = projectNodes.find(
                  (node) => node.id === projectId,
                );
                const active =
                  isNodeActive("skill", skill) &&
                  isNodeActive("project", project);
                const curveOffset = (project.y - skill.y) * 0.2;
                return (
                  <path
                    key={`${skill.id}-${projectId}`}
                    d={`M ${skill.x + skill.radius} ${skill.y} C ${skill.x + 150} ${skill.y + curveOffset}, ${project.x - 150} ${project.y - curveOffset}, ${project.x - 22} ${project.y}`}
                    fill="none"
                    className={`stroke-accent2 transition-opacity duration-200 ${getLinkClassName(active)}`}
                    strokeWidth={active ? "2.5" : "2"}
                    strokeLinecap="round"
                  />
                );
              }),
            )}

            {skills.map((skill) => {
              const active = isNodeActive("skill", skill);
              return (
                <g
                  key={skill.id}
                  role="button"
                  tabIndex="0"
                  aria-label={`Skill ${skill.label}, used in ${skill.projectIds.length} ${skill.projectIds.length === 1 ? "project" : "projects"}`}
                  className={`cursor-pointer transition-opacity duration-200 ${active ? "opacity-100" : "opacity-30"}`}
                  onMouseEnter={() =>
                    setHoveredNode({ type: "skill", ...skill })
                  }
                  onMouseLeave={clearHover}
                  onFocus={() => setHoveredNode({ type: "skill", ...skill })}
                  onBlur={clearHover}
                >
                  <circle
                    cx={skill.x}
                    cy={skill.y}
                    r={skill.radius + 7}
                    className="fill-accent1 opacity-10"
                  />
                  <circle
                    cx={skill.x}
                    cy={skill.y}
                    r={skill.radius}
                    className="fill-accent1 stroke-background"
                    strokeWidth="3"
                  />
                  <text
                    x={skill.x - skill.radius - 18}
                    y={skill.y + 4}
                    textAnchor="end"
                    className="fill-primary text-[13px] font-bold"
                  >
                    {skill.label}
                  </text>
                </g>
              );
            })}

            {projectNodes.map((project) => {
              const active = isNodeActive("project", project);
              return (
                <g
                  key={project.id}
                  role="button"
                  tabIndex="0"
                  aria-label={`Project ${project.label}`}
                  className={`cursor-pointer transition-opacity duration-200 ${active ? "opacity-100" : "opacity-30"}`}
                  onMouseEnter={() =>
                    setHoveredNode({ type: "project", ...project })
                  }
                  onMouseLeave={clearHover}
                  onFocus={() =>
                    setHoveredNode({ type: "project", ...project })
                  }
                  onBlur={clearHover}
                >
                  <circle
                    cx={project.x}
                    cy={project.y}
                    r="25"
                    className="fill-alt opacity-15"
                  />
                  <circle
                    cx={project.x}
                    cy={project.y}
                    r="18"
                    className="fill-alt stroke-background"
                    strokeWidth="3"
                  />
                  <text
                    x={project.x + 34}
                    y={project.y + 4}
                    className="fill-primary text-[13px] font-bold"
                  >
                    {project.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
};

SkillsProjectMap.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object),
  viewportMode: PropTypes.oneOf(["desktop", "mobile"]),
};

export default SkillsProjectMap;
