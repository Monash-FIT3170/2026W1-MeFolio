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
      <section className="rounded-2xl border border-gray-200 bg-white p-7">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Project Order</h2>
        <p className="text-gray-500">No projects have been added yet.</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h2 className="mb-1 text-xl font-semibold text-gray-900">Project Order</h2>
        <p className="text-sm text-gray-500">
          Drag and drop project cards to create a custom display sequence.
        </p>
      </div>

      <div className="flex flex-col">
        {projects.map((project, index) => (
          <article
            key={project.id}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            onDragEnd={onDragEnd}
            className={`flex cursor-grab items-start gap-5 border-b border-gray-200 px-6 py-5 transition last:border-b-0 active:cursor-grabbing ${
              draggedProjectIndex === index ? "bg-indigo-50 opacity-60" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600">
              {index + 1}
            </div>

            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">{project.title}</h3>
              <p className="mb-3 text-sm text-gray-500">{project.description}</p>

              <div className="mb-3 flex flex-wrap gap-2">
                {(project.technologies || []).map((technology) => (
                  <span key={technology} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                    {technology}
                  </span>
                ))}
              </div>

              <div className="flex gap-4">
                <a href={project.githubLink} className="text-sm font-bold text-indigo-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                  GitHub
                </a>
                <a href={project.liveDemoLink} className="text-sm font-bold text-indigo-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                  Live Demo
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProjectReorderingSection;
