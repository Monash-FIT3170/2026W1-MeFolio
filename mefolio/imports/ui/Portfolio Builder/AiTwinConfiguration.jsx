import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import {
  AI_TWIN_CATEGORIES,
  AI_TWIN_LIMITS,
  categoryLabel,
  guessCategory,
} from "../../models/aiTwinCategories.js";

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "rst",
  "adoc",
  "json",
  "yaml",
  "yml",
  "csv",
  "html",
  "htm",
  "xml",
]);

const ACCEPT =
  ".md,.markdown,.txt,.rst,.adoc,.json,.yaml,.yml,.csv,.html,.htm,.xml";

const tabClass = (active) =>
  active
    ? "rounded-md bg-selected px-3 py-1.5 text-sm font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
    : "rounded-md px-3 py-1.5 text-sm font-semibold text-muted hover:bg-selected hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1";

const labelClass = "mb-2 block text-sm font-medium text-primary";
const helperClass = "mt-2 text-xs text-muted";
const fieldClass =
  "w-full rounded-md border border-line bg-background px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline focus:outline-2 focus:outline-accent1";
const ghostButtonClass =
  "rounded-md px-3 py-1.5 text-sm font-semibold text-primary hover:bg-selected focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1";
const primaryButtonClass =
  "rounded-md bg-button px-4 py-2 text-sm font-semibold text-secondary hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1 disabled:cursor-not-allowed disabled:opacity-40";

const formatSize = (chars) => `${Math.max(1, Math.round(chars / 1024))} KB`;

const CategorySelect = ({ id, value, onChange, label, disabled = false }) => (
  <select
    id={id}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    aria-label={label}
    disabled={disabled}
    className={fieldClass}
  >
    {AI_TWIN_CATEGORIES.map((category) => (
      <option key={category.value} value={category.value}>
        {category.label}
      </option>
    ))}
  </select>
);

const DocumentRow = ({ doc, onCategoryChange, onRemove, disabled = false }) => (
  <li className="grid grid-cols-1 items-center gap-3 border-b border-line py-3 last:border-b-0 sm:grid-cols-[1fr_14rem_auto]">
    <div className="min-w-0">
      <p className="m-0 truncate text-sm font-semibold text-primary">
        {doc.title}
      </p>
      <p className="m-0 mt-0.5 text-xs text-muted">
        {doc.kind === "file" ? "File" : "Written note"},{" "}
        {formatSize(doc.content.length)}
      </p>
    </div>

    <CategorySelect
      value={doc.category}
      onChange={(value) => onCategoryChange(doc.id, value)}
      label={`Category for ${doc.title}`}
      disabled={disabled}
    />

    <button
      type="button"
      onClick={() => onRemove(doc.id)}
      aria-label={`Remove ${doc.title}`}
      disabled={disabled}
      className={ghostButtonClass}
    >
      Remove
    </button>
  </li>
);

const DocumentList = ({
  heading,
  description,
  docs,
  onCategoryChange,
  onRemove,
  disabled = false,
}) => (
  <div className="mt-6">
    <h3 className="m-0 text-sm font-bold text-primary">{heading}</h3>
    {description && <p className={helperClass}>{description}</p>}
    <ul className="mt-2 list-none p-0">
      {docs.map((doc) => (
        <DocumentRow
          key={doc.id}
          doc={doc}
          onCategoryChange={onCategoryChange}
          onRemove={onRemove}
          disabled={disabled}
        />
      ))}
    </ul>
  </div>
);

const AiTwinConfiguration = ({ portfolioId, configuration }) => {
  const [tab, setTab] = useState("text");
  const [savedDocs, setSavedDocs] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("about");
  const [text, setText] = useState("");
  const [status, setStatus] = useState({ message: "", isError: false });
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const dirtyRef = useRef(false);
  const operationInProgress = useRef(false);
  const isBusy = isSaving || isReadingFiles;

  const serverDocs = Array.isArray(configuration?.documents)
    ? configuration.documents
    : [];

  // Sync from the server, but never overwrite changes the user hasn't saved yet.
  useEffect(() => {
    if (dirtyRef.current) return;
    setSavedDocs(serverDocs);
  }, [configuration]);

  const markDirty = () => {
    dirtyRef.current = true;
    setIsDirty(true);
  };

  const clearDirty = () => {
    dirtyRef.current = false;
    setIsDirty(false);
  };

  const fail = (message) => setStatus({ message, isError: true });
  const clearStatus = () => setStatus({ message: "", isError: false });

  const totals = () => {
    const all = [...savedDocs, ...pendingDocs];
    return {
      count: all.length,
      chars: all.reduce((sum, doc) => sum + doc.content.length, 0),
    };
  };

  const addText = () => {
    if (isBusy || operationInProgress.current) return;

    const content = text.trim();
    if (!content) return;

    const { count, chars } = totals();
    if (content.length > AI_TWIN_LIMITS.maxDocumentChars) {
      fail("That note is too long. Split it into smaller notes.");
      return;
    }
    if (
      count >= AI_TWIN_LIMITS.maxDocuments ||
      chars + content.length > AI_TWIN_LIMITS.maxTotalChars
    ) {
      fail("You have reached the limit. Remove something before adding more.");
      return;
    }

    setPendingDocs((current) => [
      ...current,
      {
        id: Random.id(),
        kind: "text",
        title:
          title.trim().slice(0, AI_TWIN_LIMITS.maxTitleChars) ||
          categoryLabel(category),
        category,
        content,
      },
    ]);
    setTitle("");
    setText("");
    markDirty();
    clearStatus();
  };

  const handleFileSelection = async (event) => {
    if (operationInProgress.current) {
      event.target.value = "";
      return;
    }
    operationInProgress.current = true;
    setIsReadingFiles(true);

    try {
      const selected = Array.from(event.target.files || []);
      event.target.value = "";
      const additions = [];
      const skipped = [];
      let { count, chars } = totals();

      for (const file of selected) {
        const extension = file.name.split(".").pop().toLowerCase();
        if (!TEXT_EXTENSIONS.has(extension) && !file.type.startsWith("text/")) {
          skipped.push(`${file.name} (not a text file)`);
          continue;
        }
        if (file.size > AI_TWIN_LIMITS.maxFileBytes) {
          skipped.push(`${file.name} (file too large)`);
          continue;
        }

        let content = "";
        try {
          content = (await file.text()).trim();
        } catch {
          content = "";
        }
        if (!content) {
          skipped.push(`${file.name} (empty or unreadable)`);
          continue;
        }
        if (
          content.length > AI_TWIN_LIMITS.maxDocumentChars ||
          count >= AI_TWIN_LIMITS.maxDocuments ||
          chars + content.length > AI_TWIN_LIMITS.maxTotalChars
        ) {
          skipped.push(`${file.name} (over the size limit)`);
          continue;
        }

        additions.push({
          id: Random.id(),
          kind: "file",
          title: file.name.slice(0, AI_TWIN_LIMITS.maxTitleChars),
          fileName: file.name,
          category: guessCategory(file.name),
          content,
        });
        count += 1;
        chars += content.length;
      }

      if (additions.length > 0) {
        setPendingDocs((current) => [...current, ...additions]);
        markDirty();
      }

      if (skipped.length > 0) {
        fail(`Skipped: ${skipped.join(", ")}.`);
      } else {
        clearStatus();
      }
    } finally {
      operationInProgress.current = false;
      setIsReadingFiles(false);
    }
  };

  const changeCategory = (id, value) => {
    if (isBusy || operationInProgress.current) return;

    const update = (docs) =>
      docs.map((doc) => (doc.id === id ? { ...doc, category: value } : doc));
    setSavedDocs(update);
    setPendingDocs(update);
    markDirty();
  };

  const removeDoc = (id) => {
    if (isBusy || operationInProgress.current) return;

    setSavedDocs((docs) => docs.filter((doc) => doc.id !== id));
    setPendingDocs((docs) => docs.filter((doc) => doc.id !== id));
    markDirty();
  };

  const discardChanges = () => {
    if (isBusy || operationInProgress.current) return;

    setPendingDocs([]);
    setSavedDocs(serverDocs);
    clearDirty();
    clearStatus();
  };

  const save = async () => {
    if (operationInProgress.current) return;

    if (!portfolioId) {
      fail("No active portfolio found to save.");
      return;
    }

    const documents = [...savedDocs, ...pendingDocs];
    operationInProgress.current = true;
    setIsSaving(true);
    clearStatus();

    try {
      await new Promise((resolve, reject) => {
        Meteor.call(
          "portfolios.saveAiTwinConfiguration",
          portfolioId,
          { documents },
          (error, result) => (error ? reject(error) : resolve(result)),
        );
      });
      setSavedDocs(documents);
      setPendingDocs([]);
      clearDirty();
      setStatus({
        message: "Your AI twin has saved your information.",
        isError: false,
      });
    } catch (error) {
      fail(error.reason || "Unable to save your AI twin information.");
    } finally {
      operationInProgress.current = false;
      setIsSaving(false);
    }
  };

  return (
    <section
      className="rounded-lg border border-line bg-surface-fill p-6 shadow-sm"
      aria-labelledby="ai-twin-title"
    >
      <h2 id="ai-twin-title" className="m-0 text-lg font-bold text-primary">
        Tell your AI twin about yourself
      </h2>
      <p className="mt-1 text-sm text-primary">
        Add notes or text-based files, and label each one so your AI twin only
        reads what is relevant to a recruiter&apos;s question.
      </p>

      <div
        role="tablist"
        aria-label="Information source"
        className="mt-5 mb-5 flex gap-2 border-b border-line pb-3"
      >
        <button
          id="ai-twin-text-tab"
          type="button"
          role="tab"
          aria-selected={tab === "text"}
          aria-controls="ai-twin-text-panel"
          onClick={() => setTab("text")}
          className={tabClass(tab === "text")}
        >
          Enter text
        </button>
        <button
          id="ai-twin-upload-tab"
          type="button"
          role="tab"
          aria-selected={tab === "upload"}
          aria-controls="ai-twin-upload-panel"
          onClick={() => setTab("upload")}
          className={tabClass(tab === "upload")}
        >
          Upload files
        </button>
      </div>

      {tab === "text" ? (
        <div
          id="ai-twin-text-panel"
          role="tabpanel"
          aria-labelledby="ai-twin-text-tab"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
            <div>
              <label htmlFor="ai-twin-title-input" className={labelClass}>
                Title
              </label>
              <input
                id="ai-twin-title-input"
                type="text"
                value={title}
                maxLength={AI_TWIN_LIMITS.maxTitleChars}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Portfolio builder project"
                disabled={isBusy}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="ai-twin-category" className={labelClass}>
                Category
              </label>
              <CategorySelect
                id="ai-twin-category"
                value={category}
                onChange={setCategory}
                label="Category"
                disabled={isBusy}
              />
            </div>
          </div>

          <label htmlFor="ai-twin-text" className={`${labelClass} mt-4`}>
            Information for your AI twin
          </label>
          <textarea
            id="ai-twin-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Share your background, a project, your goals, or anything else your AI twin should know."
            rows={8}
            disabled={isBusy}
            className={fieldClass}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={addText}
              disabled={isBusy || !text.trim()}
              className={primaryButtonClass}
            >
              Add to list
            </button>
            <p className="m-0 text-xs text-muted">
              Nothing is saved until you select Save for AI twin.
            </p>
          </div>
        </div>
      ) : (
        <div
          id="ai-twin-upload-panel"
          role="tabpanel"
          aria-labelledby="ai-twin-upload-tab"
        >
          <label htmlFor="ai-twin-files" className={labelClass}>
            Choose README or context files
          </label>
          <input
            id="ai-twin-files"
            type="file"
            multiple
            accept={ACCEPT}
            onChange={handleFileSelection}
            disabled={isBusy}
            className="block w-full rounded-md border border-line bg-background p-2 text-sm text-primary file:mr-3 file:rounded-md file:border-0 file:bg-button file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-secondary"
          />
          <p className={helperClass}>
            Text-based files only (Markdown, text, JSON, YAML, CSV, HTML, XML).
            Chosen files are added to the list below and are not saved until you
            select Save for AI twin.
          </p>
        </div>
      )}

      {pendingDocs.length > 0 && (
        <DocumentList
          heading="Ready to save"
          description="Set a category for each item so your AI twin knows when to use it."
          docs={pendingDocs}
          onCategoryChange={changeCategory}
          onRemove={removeDoc}
          disabled={isBusy}
        />
      )}

      <div className="mt-6">
        <h3 className="m-0 text-sm font-bold text-primary">Saved</h3>
        {savedDocs.length > 0 ? (
          <ul className="mt-2 list-none p-0">
            {savedDocs.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onCategoryChange={changeCategory}
                onRemove={removeDoc}
                disabled={isBusy}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-2 py-4 text-sm text-muted">
            Nothing saved yet. Add a note or file above, then save.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={save}
          disabled={isBusy || !isDirty}
          className={primaryButtonClass}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>

        {isDirty && !isSaving && (
          <button
            type="button"
            onClick={discardChanges}
            disabled={isReadingFiles}
            className={ghostButtonClass}
          >
            Discard changes
          </button>
        )}

        {isDirty && (
          <p className="m-0 text-sm text-muted">
            You have unsaved changes. Removed items are deleted when you save.
          </p>
        )}

        {status.message && (
          <p
            role="status"
            className={
              status.isError
                ? "m-0 text-sm font-medium text-red-700"
                : "m-0 text-sm font-medium text-primary"
            }
          >
            {status.message}
          </p>
        )}
      </div>
    </section>
  );
};

const documentShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  kind: PropTypes.oneOf(["text", "file"]).isRequired,
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  fileName: PropTypes.string,
});

CategorySelect.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

DocumentRow.propTypes = {
  doc: documentShape.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

DocumentList.propTypes = {
  heading: PropTypes.string.isRequired,
  description: PropTypes.string,
  docs: PropTypes.arrayOf(documentShape).isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

AiTwinConfiguration.propTypes = {
  portfolioId: PropTypes.string,
  configuration: PropTypes.shape({
    documents: PropTypes.arrayOf(documentShape),
  }),
};

export default AiTwinConfiguration;
