import PropTypes from "prop-types";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Menu } from "lucide-react";

const getProjectId = (project) => project?._id || project?.id;

const SortableProjectCard = ({ project, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: getProjectId(project) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      className={
        isDragging
          ? "z-10 flex gap-[18px] border-b border-gray-200 bg-white px-6 py-5 opacity-70 shadow-lg last:border-b-0"
          : "flex gap-[18px] border-b border-gray-200 bg-white px-6 py-5 last:border-b-0"
      }
      ref={setNodeRef}
      style={style}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-extrabold text-indigo-600">
        {index + 1}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-[17px] font-bold text-gray-900">
          {project.title || "Project unavailable"}
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
              onClick={(event) => event.stopPropagation()}
            >
              GitHub
            </a>
          ) : null}
          {project.liveDemoLink ? (
            <a
              className="text-sm font-bold text-indigo-600 no-underline hover:underline"
              href={project.liveDemoLink}
              onClick={(event) => event.stopPropagation()}
            >
              Live Demo
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <button
          aria-label={`Drag ${project.title || "project"}`}
          className="flex h-10 w-10 cursor-grab items-center justify-center rounded-lg border-0 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:cursor-grabbing"
          type="button"
          {...attributes}
          {...listeners}
        >
          <Menu aria-hidden="true" size={20} strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );
};

const ProjectReorderingSection = ({
  projects,
  onProjectsReorder,
  onSaveOrder,
  saveStatus,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex(
      (project) => getProjectId(project) === active.id,
    );
    const newIndex = projects.findIndex(
      (project) => getProjectId(project) === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) return;

    onProjectsReorder(arrayMove(projects, oldIndex, newIndex));
  };

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
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
        <div>
          <h2 className="m-0 text-xl font-bold text-gray-900">Project Order</h2>
          <p className="mt-1 text-sm text-gray-500">
            Drag the handle on each project card, then save to update its
            display order.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {saveStatus === "saved" ? (
            <span className="text-sm font-semibold text-emerald-600">
              Saved
            </span>
          ) : null}
          {saveStatus === "unsaved" ? (
            <span className="text-sm font-semibold text-amber-600">
              Unsaved changes
            </span>
          ) : null}
          {saveStatus === "error" ? (
            <span className="text-sm font-semibold text-red-600">
              Could not save
            </span>
          ) : null}
          <button
            className="rounded-lg border-0 bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            disabled={saveStatus === "saving"}
            onClick={onSaveOrder}
            type="button"
          >
            {saveStatus === "saving" ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={projects.map((project) => getProjectId(project))}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col">
            {projects.map((project, index) => (
              <SortableProjectCard
                index={index}
                key={getProjectId(project)}
                project={project}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
};

SortableProjectCard.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    technologies: PropTypes.arrayOf(PropTypes.string),
    githubLink: PropTypes.string,
    liveDemoLink: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

ProjectReorderingSection.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  onProjectsReorder: PropTypes.func.isRequired,
  onSaveOrder: PropTypes.func.isRequired,
  saveStatus: PropTypes.oneOf(["idle", "unsaved", "saving", "saved", "error"])
    .isRequired,
};

export default ProjectReorderingSection;