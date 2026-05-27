import React, { useState, useEffect } from "react";

const sectionStyle = {
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "24px",
};

const headingStyle = {
  margin: "0 0 8px",
  fontSize: "20px",
  fontWeight: "700",
  color: "#111827",
};

const descriptionStyle = {
  margin: "0 0 24px",
  color: "#6b7280",
  fontSize: "14px",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const fullWidthFieldStyle = {
  ...fieldStyle,
  gridColumn: "1 / -1",
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "12px 14px",
  fontSize: "14px",
  color: "#111827",
  outline: "none",
};

const helperStyle = {
  marginTop: "20px",
  fontSize: "13px",
  color: "#6b7280",
};

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
    <section style={sectionStyle}>
      <h2 style={headingStyle}>About Me Links</h2>
      <p style={descriptionStyle}>
        Add the public links you want shown on your portfolio profile.
      </p>

      <div style={formGridStyle}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="about-email">
            Email
          </label>
          <input
            id="about-email"
            type="email"
            placeholder="john@example.com"
            value={localValue.contact.email}
            onChange={(event) => updateContact("email", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="about-github">
            GitHub
          </label>
          <input
            id="about-github"
            type="url"
            placeholder="https://github.com/username"
            value={localValue.socials.github}
            onChange={(event) => updateSocial("github", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="about-linkedin">
            LinkedIn
          </label>
          <input
            id="about-linkedin"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={localValue.socials.linkedin}
            onChange={(event) => updateSocial("linkedin", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="about-other-label">
            Other Link Label
          </label>
          <input
            id="about-other-label"
            type="text"
            placeholder="Portfolio, Twitter, Blog..."
            value={otherLink.label}
            onChange={(event) => updateOtherLink("label", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={fullWidthFieldStyle}>
          <label style={labelStyle} htmlFor="about-other-url">
            Other Link URL
          </label>
          <input
            id="about-other-url"
            type="url"
            placeholder="https://example.com"
            value={otherLink.url}
            onChange={(event) => updateOtherLink("url", event.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <p style={helperStyle}>
        These links will later appear as icons on the public portfolio preview.
      </p>
    </section>
  );
};

export default AboutMeLinksEditor;
