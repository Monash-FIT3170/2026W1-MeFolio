import PropTypes from "prop-types";

const ProjectReorderingSection = ({
  projects,
  draggedProjectIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  if (!projects.length) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="m-0 text-lg font-bold text-gray-900">Project Order</h2>
        <p className="mt-2 text-sm text-gray-500">
          No projects have been added yet.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="m-0 text-xl font-bold text-gray-900">Project Order</h2>
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop project cards to create a custom display sequence.
        </p>
      </div>

      <div className="flex flex-col">
        {projects.map((project, index) => (
          <article
            key={project._id || project.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            onDragEnd={onDragEnd}
            className={`flex cursor-grab items-start gap-5 border-b border-gray-200 px-6 py-5 transition last:border-b-0 active:cursor-grabbing ${
              draggedProjectIndex === index
                ? "bg-indigo-50 opacity-60"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-extrabold text-indigo-600">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="m-0 text-[17px] font-bold text-gray-900">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {project.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(project.technologies || []).map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700"
                  >
                    {technology}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-3.5">
                {project.githubLink ? (
                  <a
                    href={project.githubLink}
                    className="text-sm font-bold text-indigo-600 no-underline hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    GitHub
                  </a>
                ) : null}
                {project.liveDemoLink ? (
                  <a
                    href={project.liveDemoLink}
                    className="text-sm font-bold text-indigo-600 no-underline hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Live Demo
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

ProjectReorderingSection.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  draggedProjectIndex: PropTypes.number,
  onDragStart: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
};

export default ProjectReorderingSection;
