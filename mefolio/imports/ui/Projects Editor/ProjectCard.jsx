import PropTypes from "prop-types";
import {
  Github,
  ExternalLink,
  ImageOff,
  Pencil,
  GripVertical,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../Portfolio Preview/Card";

// Treat these extensions as video so we render a <video> rather than an <img>.
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

const isVideoMedia = (media) =>
  typeof media === "string" &&
  (media.startsWith("data:video/") || VIDEO_EXTENSIONS.test(media));

// Owner-facing project card shown on the Portfolio Editing dashboard.
// Renders the title, description, tech stack, media, and clickable repo/demo
// links. Optional fields degrade gracefully (placeholder media, hidden links).
// When drag handlers are supplied the whole card becomes draggable so the owner
// can reorder cards into any sequence; an Edit button shows when onEdit is set.
export function ProjectCard({
  project,
  onEdit,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const {
    title = "Untitled Project",
    description = "",
    technologies = [],
    githubLink = "",
    liveDemoLink = "",
    media = "",
  } = project || {};

  return (
    <Card
      data-testid="project-card"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`overflow-hidden gap-0 ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "opacity-60 ring-2 ring-indigo-300" : "hover:-translate-y-1"}`}
    >
      {/* Media / placeholder */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {media ? (
          isVideoMedia(media) ? (
            <video
              data-testid="project-card-video"
              src={media}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              data-testid="project-card-image"
              src={media}
              alt={`${title} preview`}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div
            data-testid="project-card-placeholder"
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400"
          >
            <ImageOff className="h-7 w-7" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest">
              No media
            </span>
          </div>
        )}

        {/* Drag handle hint */}
        {draggable && (
          <span
            data-testid="project-card-drag-handle"
            aria-hidden="true"
            className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm"
          >
            <GripVertical className="h-4 w-4" />
          </span>
        )}

        {/* Edit button */}
        {onEdit && (
          <button
            type="button"
            data-testid="project-card-edit"
            aria-label={`Edit ${title}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-white hover:text-indigo-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-lg font-bold text-slate-900">
          {title}
        </CardTitle>
        {description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-3">
            {description}
          </p>
        )}
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-3">
        {/* Tech stack */}
        {technologies.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-500"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links — always shown. When a URL is missing the button is dimmed,
            non-clickable, and explains why on hover. */}
        <div className="flex gap-3">
          {githubLink ? (
            <a
              data-testid="project-card-github"
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50"
            >
              <Github className="h-4 w-4" />
              Code
            </a>
          ) : (
            <button
              type="button"
              data-testid="project-card-github-disabled"
              disabled
              title="No GitHub link added"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-sm font-bold text-slate-300"
            >
              <Github className="h-4 w-4" />
              Code
            </button>
          )}

          {liveDemoLink ? (
            <a
              data-testid="project-card-demo"
              href={liveDemoLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition-all hover:bg-indigo-700"
            >
              <ExternalLink className="h-4 w-4" />
              Demo
            </a>
          ) : (
            <button
              type="button"
              data-testid="project-card-demo-disabled"
              disabled
              title="No live demo link added"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-indigo-300/60 py-2.5 text-sm font-bold text-white"
            >
              <ExternalLink className="h-4 w-4" />
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
  }),
  onEdit: PropTypes.func,
  draggable: PropTypes.bool,
  isDragging: PropTypes.bool,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  onDragEnd: PropTypes.func,
};

export default ProjectCard;
