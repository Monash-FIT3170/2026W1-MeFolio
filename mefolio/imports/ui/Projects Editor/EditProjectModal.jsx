import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import TechStackInput from "./TechStackInput";

const STATUS_OPTIONS = ["live", "in progress", "archived"];

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;
const isVideoMedia = (media) =>
  typeof media === "string" &&
  (media.startsWith("data:video/") || VIDEO_EXTENSIONS.test(media));

// Modal form for editing an existing project's details. Pre-fills from the
// given project and reports the updated fields back through onSave.
const EditProjectModal = ({ isOpen, project, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    technologies: [],
    status: "live",
    githubLink: "",
    liveDemoLink: "",
    media: "",
  });
  const [errors, setErrors] = useState({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const overlayRef = useRef(null);

  // Re-seed the form whenever a different project is opened for editing.
  useEffect(() => {
    if (!project) return;
    setForm({
      title: project.title || "",
      description: project.description || "",
      technologies: project.technologies || [],
      status: project.status || "live",
      githubLink: project.githubLink || "",
      liveDemoLink: project.liveDemoLink || "",
      media: project.media || "",
    });
    setErrors({});
  }, [project]);

  // Reset the delete confirmation each time the modal opens.
  useEffect(() => {
    if (isOpen) setConfirmingDelete(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Project title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (form.githubLink && !/^https?:\/\/.+/.test(form.githubLink))
      e.githubLink = "Enter a valid URL (starting with http).";
    if (form.liveDemoLink && !/^https?:\/\/.+/.test(form.liveDemoLink))
      e.liveDemoLink = "Enter a valid URL (starting with http).";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    onSave(project._id, {
      title: form.title.trim(),
      description: form.description.trim(),
      technologies: form.technologies,
      status: form.status,
      githubLink: form.githubLink.trim(),
      liveDemoLink: form.liveDemoLink.trim(),
      media: form.media.trim(),
    });
  };

  const fieldClass = (key) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-sm text-primary bg-surface-fill outline-none transition focus:border-accent2 focus:ring-2 focus:ring-selected ${
      errors[key] ? "border-red-400 bg-red-50" : "border-line"
    }`;

  return (
    <div
      ref={overlayRef}
      data-testid="edit-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface-fill shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-2xl border-b border-line bg-surface-fill px-6 py-5">
          <div>
            <h2
              id="edit-modal-title"
              className="text-lg font-bold text-primary"
            >
              Edit Project
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Update the details below and save your changes.
            </p>
          </div>
          <button
            type="button"
            data-testid="edit-modal-close-btn"
            onClick={onClose}
            aria-label="Close edit modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-muted transition hover:bg-selected hover:text-primary"
          >
            x
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <label
              htmlFor="edit-title"
              className="mb-1.5 block text-sm font-semibold text-primary"
            >
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              data-testid="edit-field-title"
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={fieldClass("title")}
            />
            {errors.title && (
              <p
                data-testid="edit-error-title"
                className="mt-1 text-xs text-red-500"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="mb-1.5 block text-sm font-semibold text-primary"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="edit-description"
              data-testid="edit-field-description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`${fieldClass("description")} resize-y leading-relaxed`}
            />
            {errors.description && (
              <p
                data-testid="edit-error-description"
                className="mt-1 text-xs text-red-500"
              >
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-primary">
              Tech Stack
            </label>
            <TechStackInput
              value={form.technologies}
              onChange={(v) => set("technologies", v)}
            />
            <p className="mt-1 text-xs text-muted">
              Press Enter or comma to add · Backspace to remove last
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-primary">
              Project Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition
                    ${
                      form.status === s
                        ? "border-alt bg-selected text-alt"
                        : "border-line text-muted hover:border-alt"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-github"
                className="mb-1.5 block text-sm font-semibold text-primary"
              >
                GitHub Repo
              </label>
              <input
                id="edit-github"
                data-testid="edit-field-github"
                type="url"
                placeholder="https://github.com/..."
                value={form.githubLink}
                onChange={(e) => set("githubLink", e.target.value)}
                className={fieldClass("githubLink")}
              />
              {errors.githubLink && (
                <p
                  data-testid="edit-error-github"
                  className="mt-1 text-xs text-red-500"
                >
                  {errors.githubLink}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="edit-demo"
                className="mb-1.5 block text-sm font-semibold text-primary"
              >
                Live Demo URL
              </label>
              <input
                id="edit-demo"
                data-testid="edit-field-demo"
                type="url"
                placeholder="https://yourproject.com"
                value={form.liveDemoLink}
                onChange={(e) => set("liveDemoLink", e.target.value)}
                className={fieldClass("liveDemoLink")}
              />
              {errors.liveDemoLink && (
                <p
                  data-testid="edit-error-demo"
                  className="mt-1 text-xs text-red-500"
                >
                  {errors.liveDemoLink}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-media-url"
              className="mb-1.5 block text-sm font-semibold text-primary"
            >
              Project Media URL
            </label>
            <input
              id="edit-media-url"
              data-testid="edit-field-media-url"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={form.media}
              onChange={(e) => set("media", e.target.value)}
              className={fieldClass("media")}
            />
            <p className="mt-1 text-xs text-muted">
              Paste a link to an image/video (e.g. from Unsplash or Cloudinary).
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col items-center justify-center gap-3 rounded-b-2xl border-t border-line bg-background px-6 py-4">
          {/* Delete (left). First click asks for confirmation. */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {onDelete &&
              (confirmingDelete ? (
                <>
                  <span className="text-xs font-medium text-muted">
                    Delete this project?
                  </span>
                  <button
                    type="button"
                    data-testid="edit-btn-delete-confirm"
                    onClick={() => onDelete(project._id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    data-testid="edit-btn-delete-cancel"
                    onClick={() => setConfirmingDelete(false)}
                    className="rounded-lg px-2 py-2 text-sm font-medium text-muted transition hover:text-primary"
                  >
                    Keep
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  data-testid="edit-btn-delete"
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-lg border border-red-200 bg-surface-fill px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Delete Project
                </button>
              ))}
          </div>

          {/* Cancel / Save (right) */}
          <div className="flex items-center justify-center gap-2.5">
            <button
              type="button"
              data-testid="edit-btn-cancel"
              onClick={onClose}
              className="rounded-lg border border-line bg-surface-fill px-5 py-2 text-sm font-medium text-muted transition hover:bg-selected"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="edit-btn-save"
              onClick={handleSubmit}
              className="rounded-lg bg-button px-5 py-2 text-sm font-semibold text-secondary transition hover:bg-accent1"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EditProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  project: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};

export default EditProjectModal;
