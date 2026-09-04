import PropTypes from "prop-types";
import ProjectCard from "./ProjectCard";

// Displays the portfolio owner's submitted projects as a responsive grid of
// visual cards on the Portfolio Editing dashboard. The newest project is shown
// first (ordering is decided by the parent). Cards can be dragged to reorder
// into any sequence, and each card exposes an Edit action.
const ProjectsSection = ({
  projects = [],
  onEdit,
  onSync,
  syncingProjectId = null,
  draggedProjectIndex = null,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  if (!projects.length) {
    return (
      <section className="rounded-2xl border border-dashed border-line bg-surface-fill p-10 text-center">
        <h2 className="mb-2 text-xl font-semibold text-primary">
          No projects yet
        </h2>
        <p className="text-muted">
          Click "Add Project" to create your first project — it will appear here
          as a card.
        </p>
      </section>
    );
  }

  const isDraggable = Boolean(onDragStart);

  return (
    <section>
      <div
        data-testid="projects-grid"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project, index) => {
          const projectId = project._id || project.id;

          return (
            <ProjectCard
              key={projectId}
              project={project}
              index={index}
              onEdit={onEdit}
              onSync={onSync}
              isSyncing={onSync ? syncingProjectId === projectId : false}
              draggable={isDraggable}
              isDragging={draggedProjectIndex === index}
              onDragStart={onDragStart ? () => onDragStart(index) : undefined}
              onDragOver={onDragOver}
              onDrop={onDrop ? () => onDrop(index) : undefined}
              onDragEnd={onDragEnd}
            />
          );
        })}
      </div>
    </section>
  );
};

ProjectsSection.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object),
  onEdit: PropTypes.func,
  onSync: PropTypes.func,
  syncingProjectId: PropTypes.string,
  draggedProjectIndex: PropTypes.number,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  onDragEnd: PropTypes.func,
};

export default ProjectsSection;
