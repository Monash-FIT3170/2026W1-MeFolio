import { useState, useEffect, useRef } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import TechStackInput from "./TechStackInput";

const EMPTY_FORM = {
  title: "",
  description: "",
  technologies: [],
  githubLink: "",
  liveDemoLink: "",
  status: "live",
  media: null,
  createdAt: null,
};

const STATUS_OPTIONS = ["live", "in progress", "archived"];

const MediaUpload = ({ file, onChange }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handle = (f) => {
    if (f && (f.type.startsWith("image/") || f.type.startsWith("video/")))
      onChange(f);
  };

  if (file) {
    return (
      <div
        data-testid="upload-preview"
        className="flex items-center gap-3 p-3 border border-line rounded-lg bg-background"
      >
        <span className="text-xl">upload</span>
        <span className="flex-1 text-sm text-muted font-mono truncate">
          {file.name}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove file"
          className="text-muted hover:text-red-500 text-lg leading-none transition"
        >
          x
        </button>
      </div>
    );
  }
  return (
    <div
      data-testid="upload-zone"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files[0]);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Upload project media"
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
        ${
          dragging
            ? "border-accent2 bg-selected"
            : "border-line bg-background hover:border-accent2 hover:bg-selected"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handle(e.target.files[0])}
        data-testid="file-input"
      />
      <p className="text-sm text-muted">
        <span className="text-alt font-semibold">Click to upload</span>{" "}
        or drag & drop
      </p>
      <p className="text-xs text-muted mt-1">
        PNG · JPG · GIF · WEBP · MP4 · WEBM
      </p>
    </div>
  );
};

const AddProjectModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Project title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (form.githubLink && !/^https?:\/\/.+/.test(form.githubLink))
      e.githubLink = "Enter a valid URL (starting with https://)";
    if (form.liveDemoLink && !/^https?:\/\/.+/.test(form.liveDemoLink))
      e.liveDemoLink = "Enter a valid URL (starting with https://)";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    // Persist with canonical field names + a createdAt (used for newest-first
    // ordering). Media is stored as a data-URL string so it can be rendered.
    const insert = (mediaValue) => {
      const payload = {
        title: form.title,
        description: form.description,
        technologies: form.technologies,
        githubLink: form.githubLink,
        liveDemoLink: form.liveDemoLink,
        media: mediaValue,
        status: form.status,
        createdAt: new Date(),
      };
      Meteor.call("projects.insert", payload, (err, newId) => {
        if (err) {
          console.error(err);
          return;
        }
        handleCancel();
      });
    };

    if (form.media instanceof File) {
      const reader = new FileReader();
      reader.onload = () => insert(reader.result);
      reader.onerror = () => insert("");
      reader.readAsDataURL(form.media);
    } else {
      insert(typeof form.media === "string" ? form.media : "");
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const fieldClass = (key) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-sm text-primary bg-surface-fill outline-none transition
      focus:border-accent2 focus:ring-2 focus:ring-selected
      ${errors[key] ? "border-red-400 bg-red-50" : "border-line"}`;

  return (
    <div
      ref={overlayRef}
      data-testid="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black backdrop-blur-sm"
    >
      {/* Panel */}
      <div
        data-testid="modal-panel"
        className="bg-surface-fill rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-line sticky top-0 bg-surface-fill rounded-t-2xl z-10">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-primary">
              Add New Project
            </h2>
            <p className="text-sm text-muted mt-0.5">
              Fill in the details below to add it to your portfolio
            </p>
          </div>
          <button
            data-testid="modal-close-btn"
            onClick={handleCancel}
            aria-label="Close modal"
            className="text-muted hover:text-primary hover:bg-selected rounded-lg w-8 h-8 flex items-center justify-center text-xl transition"
          >
            x
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label
              htmlFor="mf-title"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              id="mf-title"
              data-testid="field-title"
              type="text"
              placeholder="e.g. E-Commerce Platform"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              autoFocus
              className={fieldClass("title")}
            />
            {errors.title && (
              <p
                data-testid="error-title"
                className="text-xs text-red-500 mt-1"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="mf-desc"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mf-desc"
              data-testid="field-description"
              placeholder="What does this project do? What problem does it solve?"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`${fieldClass("description")} resize-y leading-relaxed`}
            />
            {errors.description && (
              <p
                data-testid="error-description"
                className="text-xs text-red-500 mt-1"
              >
                {errors.description}
              </p>
            )}
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">
              Tech Stack
            </label>
            <TechStackInput
              value={form.technologies}
              onChange={(v) => set("technologies", v)}
            />
            <p className="text-xs text-muted mt-1">
              Press Enter or comma to add · Backspace to remove last
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-1.5">
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

          <hr className="border-line -mx-6" />

          {/* GitHub + Demo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="mf-github"
                className="block text-sm font-semibold text-primary mb-1.5"
              >
                GitHub Repo
              </label>
              <input
                id="mf-github"
                data-testid="field-githubLink"
                type="url"
                placeholder="https://github.com/..."
                value={form.githubLink}
                onChange={(e) => set("githubLink", e.target.value)}
                className={fieldClass("githubLink")}
              />
              {errors.githubLink && (
                <p
                  data-testid="error-githubLink"
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.githubLink}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="mf-demo"
                className="block text-sm font-semibold text-primary mb-1.5"
              >
                Live Demo URL
              </label>
              <input
                id="mf-demo"
                data-testid="field-liveDemoLink"
                type="url"
                placeholder="https://yourproject.com"
                value={form.liveDemoLink}
                onChange={(e) => set("liveDemoLink", e.target.value)}
                className={fieldClass("liveDemoLink")}
              />
              {errors.liveDemoLink && (
                <p
                  data-testid="error-liveDemoLink"
                  className="text-xs text-red-500 mt-1"
                >
                  {errors.liveDemoLink}
                </p>
              )}
            </div>
          </div>

          {/* Media */}
          <div>
            <label
              htmlFor="mf-media"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Project Media URL
            </label>
            <input
              id="mf-media"
              data-testid="field-media"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={form.media || ""}
              onChange={(e) => set("media", e.target.value)}
              className={fieldClass("media")}
            />
            <p className="text-xs text-muted mt-1">
              Link to an image, GIF, or video (e.g., from Unsplash or
              Cloudinary)
            </p>
            {errors.media && (
              <p
                data-testid="error-media"
                className="text-xs text-red-500 mt-1"
              >
                {errors.media}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-line bg-background rounded-b-2xl sticky bottom-0">
          <p className="text-xs text-muted">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              data-testid="btn-cancel"
              onClick={handleCancel}
              className="px-5 py-2 rounded-lg border border-line bg-surface-fill text-sm font-medium text-muted hover:bg-selected transition"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="btn-submit"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-button text-secondary text-sm font-semibold hover:bg-accent1 transition"
            >
              Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TechStackInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

MediaUpload.propTypes = {
  file: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

AddProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default AddProjectModal;
