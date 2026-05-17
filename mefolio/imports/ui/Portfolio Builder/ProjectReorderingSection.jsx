import { useState } from "react";

const ProjectReorderingSection = ({
  projects,
  onMoveProject,
  onReorderProject
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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
          Drag project cards or use the move buttons to set their display order.
        </p>
      </div>

      <div className="flex flex-col">
        {projects.map((project, index) => (
          <article
            className={
              draggedIndex === index
                ? "flex cursor-grabbing gap-[18px] border-b border-gray-200 px-6 py-5 opacity-60 last:border-b-0"
                : dragOverIndex === index
                  ? "flex cursor-grab gap-[18px] border-b border-gray-200 bg-indigo-50 px-6 py-5 shadow-[inset_4px_0_0_#4f46e5] last:border-b-0"
                  : "flex cursor-grab gap-[18px] border-b border-gray-200 px-6 py-5 last:border-b-0"
            }
            draggable
            key={project.id}
            onDragStart={(event) => {
              setDraggedIndex(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(index));
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDragOverIndex(index);
            }}
            onDragLeave={() => {
              setDragOverIndex((currentIndex) =>
                currentIndex === index ? null : currentIndex
              );
            }}
            onDrop={(event) => {
              event.preventDefault();
              const sourceIndex = Number(
                event.dataTransfer.getData("text/plain")
              );
              onReorderProject(sourceIndex, index);
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-extrabold text-indigo-600">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="m-0 text-[17px] font-bold text-gray-900">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(project.technologies || []).map((technology) => (
                  <span
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700"
                    key={technology}
                  >
                    {technology}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-3.5">
                {project.githubLink ? (
                  <a
                    className="text-sm font-bold text-indigo-600 no-underline hover:underline"
                    href={project.githubLink}
                  >
                    GitHub
                  </a>
                ) : null}
                {project.liveDemoLink ? (
                  <a
                    className="text-sm font-bold text-indigo-600 no-underline hover:underline"
                    href={project.liveDemoLink}
                  >
                    Live Demo
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <button
                className="rounded-lg border-0 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                disabled={index === 0}
                onClick={() => onMoveProject(index, -1)}
                type="button"
              >
                Move Up
              </button>

              <button
                className="rounded-lg border-0 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                disabled={index === projects.length - 1}
                onClick={() => onMoveProject(index, 1)}
                type="button"
              >
                Move Down
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProjectReorderingSection;
