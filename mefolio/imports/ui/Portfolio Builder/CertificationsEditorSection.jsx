import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { Award, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import CertificationModal from "./CertificationModal";

const CertificationsEditorSection = ({
  portfolioId,
  certifications = [],
  credlyUsername = "",
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingRemove, setConfirmingRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [editingCredlyUsername, setEditingCredlyUsername] = useState(false);
  const [credlyUsernameDraft, setCredlyUsernameDraft] =
    useState(credlyUsername);
  const [credlyAction, setCredlyAction] = useState("");
  const [credlyMessage, setCredlyMessage] = useState(null);

  useEffect(() => {
    setCredlyUsernameDraft(credlyUsername);
  }, [credlyUsername]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (index, certification) => {
    setEditing({ index, certification });
    setModalOpen(true);
  };

  const handleRemove = (index) => {
    setRemoving(true);
    Meteor.call("portfolios.removeCertification", portfolioId, index, (err) => {
      setRemoving(false);
      if (err) {
        console.error(err);
        return;
      }
      setConfirmingRemove(null);
    });
  };

  const handleSaveCredlyUsername = () => {
    const username = credlyUsernameDraft.trim();
    if (!username) {
      setCredlyMessage({
        type: "error",
        text: "Enter a Credly username to continue.",
      });
      return;
    }

    setCredlyAction("save");
    setCredlyMessage(null);
    Meteor.call("users.setCredlyUsername", username, (error) => {
      setCredlyAction("");
      if (error) {
        setCredlyMessage({
          type: "error",
          text: error.reason || "Could not save the Credly username.",
        });
        return;
      }

      setCredlyUsernameDraft(username);
      setEditingCredlyUsername(false);
      setCredlyMessage({ type: "success", text: "Credly username saved." });
    });
  };

  const handleSyncCredly = () => {
    setCredlyAction("sync");
    setCredlyMessage(null);
    Meteor.call("users.syncCredlyCertifications", (error, importedCount) => {
      setCredlyAction("");
      if (error) {
        setCredlyMessage({
          type: "error",
          text: error.reason || "Could not sync Credly certifications.",
        });
        return;
      }

      setCredlyMessage({
        type: "success",
        text: `Synced ${importedCount} Credly certification${importedCount === 1 ? "" : "s"}.`,
      });
    });
  };

  return (
    <section className="rounded-2xl border border-line bg-surface-fill p-6">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-primary">Certifications</h2>
          <p className="text-sm text-muted mt-0.5">
            Add certifications manually, or sync them from Credly.
          </p>
        </div>
        <button
          type="button"
          data-testid="cert-add-btn"
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-button px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-accent1"
        >
          <Plus className="h-4 w-4" />
          Add Certification
        </button>
      </header>

      <div className="mb-5 rounded-xl border border-line bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {editingCredlyUsername ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="credly-username">
                Credly username
              </label>
              <input
                id="credly-username"
                data-testid="credly-username-input"
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="Credly username"
                value={credlyUsernameDraft}
                onChange={(event) => setCredlyUsernameDraft(event.target.value)}
                disabled={credlyAction === "save"}
                className="min-w-48 flex-1 rounded-lg border border-line bg-surface-fill px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent2 disabled:opacity-60"
              />
              <button
                type="button"
                data-testid="credly-save-btn"
                onClick={handleSaveCredlyUsername}
                disabled={credlyAction === "save"}
                className="rounded-lg bg-button px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-accent1 disabled:cursor-wait disabled:opacity-60"
              >
                {credlyAction === "save" ? "Saving..." : "Save"}
              </button>
              {credlyUsername && (
                <button
                  type="button"
                  onClick={() => {
                    setCredlyUsernameDraft(credlyUsername);
                    setEditingCredlyUsername(false);
                    setCredlyMessage(null);
                  }}
                  disabled={credlyAction === "save"}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-primary disabled:opacity-60"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="min-w-0 flex-1 text-sm text-muted">
                {credlyUsername ? (
                  <>
                    Credly username:{" "}
                    <span className="font-medium text-primary">
                      {credlyUsername}
                    </span>
                  </>
                ) : (
                  "Link a Credly username to import your public certifications."
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="credly-edit-btn"
                  onClick={() => {
                    setCredlyUsernameDraft(credlyUsername);
                    setEditingCredlyUsername(true);
                    setCredlyMessage(null);
                  }}
                  disabled={Boolean(credlyAction)}
                  className="rounded-lg border border-line bg-surface-fill px-4 py-2 text-sm font-semibold text-primary transition hover:bg-selected disabled:opacity-60"
                >
                  {credlyUsername
                    ? "Edit Credly username"
                    : "Add a Credly username"}
                </button>
                {credlyUsername && (
                  <button
                    type="button"
                    data-testid="credly-sync-btn"
                    onClick={handleSyncCredly}
                    disabled={Boolean(credlyAction)}
                    className="flex items-center gap-2 rounded-lg bg-button px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-accent1 disabled:cursor-wait disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${credlyAction === "sync" ? "animate-spin" : ""}`}
                    />
                    {credlyAction === "sync" ? "Syncing..." : "Sync"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        {credlyMessage && (
          <p
            data-testid="credly-message"
            role={credlyMessage.type === "error" ? "alert" : "status"}
            className={`mt-2 text-sm ${credlyMessage.type === "error" ? "text-accent2" : "text-muted"}`}
          >
            {credlyMessage.text}
          </p>
        )}
      </div>

      {certifications.length === 0 ? (
        <p
          data-testid="cert-empty-state"
          className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted"
        >
          No certifications yet. Click "Add Certification" to create your first
          one.
        </p>
      ) : (
        <ul data-testid="cert-list" className="flex flex-col gap-3">
          {certifications.map((cert, index) => (
            <li
              key={cert.verificationUrl || `${cert.title}-${index}`}
              data-testid="cert-list-item"
              className="flex items-start gap-3 rounded-xl border border-line bg-background p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-fill text-accent1">
                <Award className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary truncate">
                  {cert.title || "Untitled certification"}
                </p>
                {cert.issuer && (
                  <p className="text-xs text-muted truncate">{cert.issuer}</p>
                )}
                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold">
                  <span className="text-muted uppercase tracking-wider">
                    {cert.source === "credly" ? "Credly" : "Manual"}
                  </span>
                  {cert.verified && (
                    <span className="text-accent1">• Verified</span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {confirmingRemove === index ? (
                  <>
                    {/* Matches EditProjectModal's delete-confirm styling:
                        raw reds are already used there for destructive actions. */}
                    <button
                      type="button"
                      data-testid="cert-confirm-remove"
                      onClick={() => handleRemove(index)}
                      disabled={removing}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      data-testid="cert-cancel-remove"
                      onClick={() => setConfirmingRemove(null)}
                      className="rounded-lg px-2 py-2 text-xs font-medium text-muted transition hover:text-primary"
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      data-testid="cert-edit-btn"
                      aria-label={`Edit ${cert.title || "certification"}`}
                      onClick={() => openEdit(index, cert)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-fill text-muted transition hover:bg-selected hover:text-accent2"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      data-testid="cert-remove-btn"
                      aria-label={`Remove ${cert.title || "certification"}`}
                      onClick={() => setConfirmingRemove(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface-fill text-muted transition hover:bg-selected hover:text-primary"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <CertificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        portfolioId={portfolioId}
        certification={editing?.certification || null}
        index={editing?.index ?? null}
      />
    </section>
  );
};

CertificationsEditorSection.propTypes = {
  portfolioId: PropTypes.string.isRequired,
  certifications: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      issuer: PropTypes.string,
      issueDate: PropTypes.string,
      imageUrl: PropTypes.string,
      verificationUrl: PropTypes.string,
      source: PropTypes.string,
      verified: PropTypes.bool,
    }),
  ),
  credlyUsername: PropTypes.string,
};

export default CertificationsEditorSection;
