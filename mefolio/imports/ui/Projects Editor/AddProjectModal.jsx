import { useState, useEffect, useRef } from "react";
import { Meteor } from "meteor/meteor"

const EMPTY_FORM = {
    title: "",
    description: "",
    technologies: "",
    githubLink: "",
    liveDemoLink: "",
    status: "live",
    media: null,
    createdAt: null
};

const STATUS_OPTIONS = ["live", "in progress", "archived"];

const TECH_SUGGESTIONS = [
    "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt", "TypeScript",
    "JavaScript", "Node.js", "Express", "FastAPI", "Django", "Laravel",
    "Spring Boot", "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase",
    "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Tailwind CSS",
    "GraphQL", "REST",
]

const TechStackInput = ({ value, onChange }) => {
    const [text, setText] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);

    const filtered = text.trim()
    ? TECH_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(text.toLowerCase()) && !value.includes(s)).slice(0, 6): [];

    const add = (tag) => {
        const t = tag.trim();
        if (t && !value.includes(t)) onChange([...value, t]);
        setText("");
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const remove = (tag) => onChange(value.filter((v) => v !== tag));

    const onKey = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      if (text.trim()) add(text);
    } else if (e.key === "Backspace" && !text && value.length) {
      remove(value[value.length - 1]);
    }
  };return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg bg-white min-h-[44px] items-center cursor-text focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(tag); }}
              aria-label={`Remove ${tag}`}
              className="text-indigo-500 hover:text-indigo-700 leading-none"
            >
              x
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => { setText(e.target.value); setShowSuggestions(true); }}
          onKeyDown={onKey}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length === 0 ? "e.g. React, Node.js... press Enter" : ""}
          data-testid="tags-text-input"
          className="flex-1 min-w-[140px] border-none outline-none text-sm text-gray-900 bg-transparent"
        />
      </div>
 
      {showSuggestions && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50 py-1">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => add(s)}
              className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-indigo-50"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const MediaUpload = ({ file, onChange }) => {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handle = (f) => {
        if (f && (f.type.startsWith("image/") || f.type.startsWith("video/")))
            onChange(f);
    };

    if (file) {
        return (
            <div data-testid="upload-preview" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-xl">upload</span>
                <span className="flex-1 text-sm text-gray-600 font-mono truncate">{file.name}</span>
                <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove file"
                className="text-gray-400 hover:text-red-500 text-lg leading-none transition">
                x
                </button>
            </div>
        );
    }
return (
    <div
      data-testid="upload-zone"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Upload project media"
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
        ${dragging
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handle(e.target.files[0])}
        data-testid="file-input"
      />
      <p className="text-2xl mb-2">o</p>
      <p className="text-sm text-gray-500">
        <span className="text-indigo-600 font-semibold">Click to upload</span> or drag & drop
      </p>
      <p className="text-xs text-gray-400 mt-1">PNG · JPG · GIF · WEBP · MP4 · WEBM</p>
    </div>
  );
};

const AddProjectModal = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === "Escape") handleCancel(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;
    
    const set = (k, v) => {
        setForm((f) => ({ ...f, [k]: v}));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
    };

    const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title = "Project title is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (form.githubLink && !/^https?:\/\/.+/.test(form.githubLink))
      e.githubLink = "Enter a valid URL (starting with https://)";
    if (form.liveDemoLink && !/^https?:\/\/.+/.test(form.liveDemoLink))
      e.liveDemoLink = "Enter a valid URL (starting with https://)";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
      Meteor.call("projects.insert", {
        title: form.title,
        description: form.description,
        stack: form.stack,
        github: form.github,
        demo: form.demo,
        status: form.status,
      }, (err, newId) => {
        if (err) { console.error(err); return; }
        onAdd({ ...form, _id: newId });
        handleCancel();
      });
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };
return (
    <div
      ref={overlayRef}
      data-testid="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === overlayRef.current) handleCancel(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-gray-900/50 backdrop-blur-sm"
    >
      {/* Panel */}
      <div
        data-testid="modal-panel"
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-gray-900">
              Add New Project
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Fill in the details below to add it to your portfolio
            </p>
          </div>
          <button
            data-testid="modal-close-btn"
            onClick={handleCancel}
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg w-8 h-8 flex items-center justify-center text-xl transition"
          >
            x
          </button>
        </div>
 
        {/* Form body */}
        <div className="px-6 py-5 flex flex-col gap-5">
 
          {/* Title */}
          <div>
            <label htmlFor="mf-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 outline-none transition
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                ${errors.title ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {errors.title && (
              <p data-testid="error-title" className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
 
          {/* Description */}
          <div>
            <label htmlFor="mf-desc" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mf-desc"
              data-testid="field-description"
              placeholder="What does this project do? What problem does it solve?"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 outline-none resize-y leading-relaxed transition
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                ${errors.description ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {errors.description && (
              <p data-testid="error-description" className="text-xs text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
 
          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tech Stack
            </label>
            <TechStackInput value={form.technologies} onChange={(v) => set("technologies", v)} />
            <p className="text-xs text-gray-400 mt-1">
              Press Enter or comma to add · Backspace to remove last
            </p>
          </div>
 
          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Project Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition
                    ${form.status === s
                      ? "border-indigo-600 bg-indigo-100 text-indigo-700"
                      : "border-gray-200 text-gray-500 hover:border-indigo-400"}`}
                >
                  {s === "live" ? "o" : ""}{s}
                </button>
              ))}
            </div>
          </div>
 
          <hr className="border-gray-100 -mx-6" />
 
          {/* GitHub + Demo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="mf-github" className="block text-sm font-semibold text-gray-700 mb-1.5">
                GitHub Repo
              </label>
              <input
                id="mf-github"
                data-testid="field-githubLink"
                type="url"
                placeholder="https://github.com/..."
                value={form.githubLink}
                onChange={(e) => set("githubLink", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 outline-none transition
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                  ${errors.githubLink ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {errors.githubLink && (
                <p data-testid="error-githubLink" className="text-xs text-red-500 mt-1">{errors.githubLink}</p>
              )}
            </div>
            <div>
              <label htmlFor="mf-demo" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Live Demo URL
              </label>
              <input
                id="mf-demo"
                data-testid="field-liveDemoLink"
                type="url"
                placeholder="https://yourproject.com"
                value={form.liveDemoLink}
                onChange={(e) => set("liveDemoLink", e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 outline-none transition
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100
                  ${errors.liveDemoLink ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {errors.liveDemoLink && (
                <p data-testid="error-liveDemoLink" className="text-xs text-red-500 mt-1">{errors.liveDemoLink}</p>
              )}
            </div>
          </div>
 
          {/* Media */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Project Media
            </label>
            <MediaUpload file={form.media} onChange={(f) => set("media", f)} />
            <p className="text-xs text-gray-400 mt-1">
              Optional: screenshot, demo GIF, or video
            </p>
          </div>
        </div>
 
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0">
          <p className="text-xs text-gray-400">
            <span className="text-red-500">*</span> Required fields
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              data-testid="btn-cancel"
              onClick={handleCancel}
              className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="btn-submit"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-indigo-700 text-white text-sm font-semibold hover:bg-indigo-800 transition"
            >
              + Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;