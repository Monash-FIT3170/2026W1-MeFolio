import { useState, useEffect, useRef } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";

// Modal for adding and editing a single certification
// Follows similar format to AddProjectModal.jsx and EditProjectModal.jsx
const EMPTY_FORM = {
  title: "",
  issuer: "",
  issueDate: "",
  imageUrl: "",
  verificationUrl: "",
};

const CertificationModal = ({
  isOpen,
  onClose,
  portfolioId,
  certification = null,
  index = null,
  onSaved,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef(null);

  const isEditMode = index !== null && certification !== null;

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode) {
      setForm({
        title: certification.title || "",
        issuer: certification.issuer || "",
        issueDate: (certification.issueDate || "").slice(0, 10),
        imageUrl: certification.imageUrl || "",
        verificationUrl: certification.verificationUrl || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, isEditMode, certification]);

  useEffect(() => {
    if (!isOpen) return undefined;
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

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Certification title is required.";
    if (form.imageUrl && !/^https?:\/\/.+/.test(form.imageUrl))
      e.imageUrl = "Enter a valid URL (starting with http).";
    if (form.verificationUrl && !/^https?:\/\/.+/.test(form.verificationUrl))
      e.verificationUrl = "Enter a valid URL (starting with http).";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      issueDate: form.issueDate ? `${form.issueDate}T00:00:00.000Z` : "",
      imageUrl: form.imageUrl.trim(),
      verificationUrl: form.verificationUrl.trim(),
    };

    const methodName = isEditMode
      ? "portfolios.updateCertification"
      : "portfolios.addCertification";

    const args = isEditMode
      ? [portfolioId, index, payload]
      : [portfolioId, payload];

    Meteor.call(methodName, ...args, (err) => {
      setSaving(false);
      if (err) {
        setErrors({ _form: err.reason || "Unable to save certification." });
        return;
      }
      onSaved?.();
      handleCancel();
    });
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const fieldClass = (key) =>
    `w-full px-3.5 py-2.5 border rounded-lg text-sm text-primary bg-surface-fill outline-none transition
      focus:border-accent2 focus:ring-2 focus:ring-selected
      ${errors[key] ? "border-accent2 bg-accent2/10" : "border-line"}`;

  return (
    <div
      ref={overlayRef}
      data-testid="cert-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-primary/50 backdrop-blur-sm"
    >
      <div
        data-testid="cert-modal-panel"
        className="bg-surface-fill rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-line sticky top-0 bg-surface-fill rounded-t-2xl z-10">
          <div>
            <h2 id="cert-modal-title" className="text-lg font-bold text-primary">
              {isEditMode ? "Edit Certification" : "Add Certification"}
            </h2>
            <p className="text-sm text-muted mt-0.5">
              {isEditMode
                ? "Update the details and save your changes."
                : "Fill in the details to add it to your portfolio."}
            </p>
          </div>
          <button
            type="button"
            data-testid="cert-modal-close-btn"
            onClick={handleCancel}
            aria-label="Close modal"
            className="text-muted hover:text-primary hover:bg-selected rounded-lg w-8 h-8 flex items-center justify-center text-xl transition"
          >
            x
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {errors._form && (
            <p className="text-xs text-accent2">{errors._form}</p>
          )}

          <div>
            <label
              htmlFor="cert-title"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Title <span className="text-accent2">*</span>
            </label>
            <input
              id="cert-title"
              data-testid="cert-field-title"
              type="text"
              placeholder="e.g. AWS Certified Developer"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              autoFocus
              className={fieldClass("title")}
            />
            {errors.title && (
              <p className="text-xs text-accent2 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="cert-issuer"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Issuer
            </label>
            <input
              id="cert-issuer"
              data-testid="cert-field-issuer"
              type="text"
              placeholder="e.g. Amazon Web Services"
              value={form.issuer}
              onChange={(e) => set("issuer", e.target.value)}
              className={fieldClass("issuer")}
            />
          </div>

          <div>
            <label
              htmlFor="cert-issue-date"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Issue Date
            </label>
            <input
              id="cert-issue-date"
              data-testid="cert-field-issueDate"
              type="date"
              value={form.issueDate}
              onChange={(e) => set("issueDate", e.target.value)}
              className={fieldClass("issueDate")}
            />
          </div>

          <div>
            <label
              htmlFor="cert-image-url"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Image URL
            </label>
            <input
              id="cert-image-url"
              data-testid="cert-field-imageUrl"
              type="url"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              className={fieldClass("imageUrl")}
            />
            {errors.imageUrl && (
              <p className="text-xs text-accent2 mt-1">{errors.imageUrl}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="cert-verification-url"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Verification URL
            </label>
            <input
              id="cert-verification-url"
              data-testid="cert-field-verificationUrl"
              type="url"
              placeholder="https://verify.example.com/..."
              value={form.verificationUrl}
              onChange={(e) => set("verificationUrl", e.target.value)}
              className={fieldClass("verificationUrl")}
            />
            {errors.verificationUrl && (
              <p className="text-xs text-accent2 mt-1">
                {errors.verificationUrl}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-line bg-background rounded-b-2xl sticky bottom-0">
          <p className="text-xs text-muted">
            <span className="text-accent2">*</span> Required fields
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              data-testid="cert-btn-cancel"
              onClick={handleCancel}
              className="px-5 py-2 rounded-lg border border-line bg-surface-fill text-sm font-medium text-muted hover:bg-selected transition"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="cert-btn-submit"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-button text-secondary text-sm font-semibold hover:bg-accent1 transition disabled:opacity-60"
            >
              {saving ? "Saving…" : isEditMode ? "Save Changes" : "Add Certification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

CertificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  portfolioId: PropTypes.string.isRequired,
  certification: PropTypes.object,
  index: PropTypes.number,
  onSaved: PropTypes.func,
};

export default CertificationModal;
