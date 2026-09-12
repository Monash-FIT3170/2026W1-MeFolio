import { useState, useEffect } from "react";

const getSafeValue = (value = {}) => ({
  contact: {
    email: value.contact?.email || "",
  },
  socials: {
    github: value.socials?.github || "",
    linkedin: value.socials?.linkedin || "",
    other:
      Array.isArray(value.socials?.other) && value.socials.other.length > 0
        ? value.socials.other
        : [{ label: "", url: "" }],
  },
});

const inputClasses =
  "border border-muted rounded-[10px] px-[14px] py-3 text-sm text-primary outline-none";

const labelClasses = "text-sm font-semibold text-primary";

const AboutMeLinksEditor = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(() => getSafeValue(value));

  useEffect(() => {
    setLocalValue(getSafeValue(value));
  }, [
    value?.contact?.email,
    value?.socials?.github,
    value?.socials?.linkedin,
    JSON.stringify(value?.socials?.other),
  ]);

  const otherLink = localValue.socials.other[0];

  const updateContact = (field, fieldValue) => {
    const updated = {
      ...localValue,
      contact: { ...localValue.contact, [field]: fieldValue },
    };
    setLocalValue(updated);
    onChange(updated);
  };

  const updateSocial = (field, fieldValue) => {
    const updated = {
      ...localValue,
      socials: { ...localValue.socials, [field]: fieldValue },
    };
    setLocalValue(updated);
    onChange(updated);
  };

  const updateOtherLink = (field, fieldValue) => {
    const updated = {
      ...localValue,
      socials: {
        ...localValue.socials,
        other: [{ ...otherLink, [field]: fieldValue }],
      },
    };
    setLocalValue(updated);
    onChange(updated);
  };

  return (
    <section className="bg-surface-fill border border-muted rounded-2xl p-6">
      <h2 className="m-0 mb-2 text-xl font-bold text-primary">
        About Me Links
      </h2>
      <p className="m-0 mb-6 text-sm text-primary">
        Add the public links you want shown on your portfolio profile.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className={labelClasses} htmlFor="about-email">
            Email
          </label>
          <input
            id="about-email"
            type="email"
            placeholder="john@example.com"
            value={localValue.contact.email}
            onChange={(event) => updateContact("email", event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses} htmlFor="about-github">
            GitHub
          </label>
          <input
            id="about-github"
            type="url"
            placeholder="https://github.com/username"
            value={localValue.socials.github}
            onChange={(event) => updateSocial("github", event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses} htmlFor="about-linkedin">
            LinkedIn
          </label>
          <input
            id="about-linkedin"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={localValue.socials.linkedin}
            onChange={(event) => updateSocial("linkedin", event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses} htmlFor="about-other-label">
            Other Link Label
          </label>
          <input
            id="about-other-label"
            type="text"
            placeholder="Portfolio, Twitter, Blog..."
            value={otherLink.label}
            onChange={(event) => updateOtherLink("label", event.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-2 col-span-2">
          <label className={labelClasses} htmlFor="about-other-url">
            Other Link URL
          </label>
          <input
            id="about-other-url"
            type="url"
            placeholder="https://example.com"
            value={otherLink.url}
            onChange={(event) => updateOtherLink("url", event.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      <p className="mt-5 text-[13px] text-muted">
        These links will later appear as icons on the public portfolio preview.
      </p>
    </section>
  );
};

export default AboutMeLinksEditor;
