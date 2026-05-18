import React from "react";

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginTop: "20px",
  flexWrap: "wrap",
};

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  color: "#4b5563",
  textDecoration: "none",
};

const iconStyle = {
  width: "24px",
  height: "24px",
  display: "block",
};

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle} fill="currentColor">
    <path d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91.57.11.78-.25.78-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.52-2.55-.29-5.23-1.27-5.23-5.64 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18A10.9 10.9 0 0 1 12 6.32c.97 0 1.95.13 2.86.38 2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.24 2.75.12 3.04.73.8 1.18 1.83 1.18 3.08 0 4.38-2.69 5.35-5.25 5.63.41.35.77 1.03.77 2.08 0 1.5-.01 2.71-.01 3.08 0 .31.2.68.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35 0.5 12 0.5Z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle} fill="currentColor">
    <path d="M4.98 3.5A2.49 2.49 0 0 1 2.5 6 2.49 2.49 0 0 1 0 3.5 2.49 2.49 0 0 1 2.5 1a2.49 2.49 0 0 1 2.48 2.5ZM.5 8h4v15h-4V8Zm6.5 0h3.84v2.05h.05c.53-1.01 1.84-2.08 3.79-2.08 4.06 0 4.82 2.54 4.82 5.84V23h-4v-7.92c0-1.89-.03-4.33-2.63-4.33-2.63 0-3.03 2.06-3.03 4.19V23H7V8Z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 1 0-7.07-7.07L11 4" />
    <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19" />
  </svg>
);

const buildLinks = ({ email, github, linkedin, otherLinks = [] }) => {
  const links = [];

  if (github) {
    links.push({
      key: "github",
      href: github,
      label: "GitHub",
      icon: <GitHubIcon />,
      external: true,
    });
  }

  if (linkedin) {
    links.push({
      key: "linkedin",
      href: linkedin,
      label: "LinkedIn",
      icon: <LinkedInIcon />,
      external: true,
    });
  }

  if (email) {
    links.push({
      key: "email",
      href: `mailto:${email}`,
      label: "Email",
      icon: <EmailIcon />,
      external: false,
    });
  }

  otherLinks.forEach((link, index) => {
    if (!link?.url) return;

    links.push({
      key: `other-${index}`,
      href: link.url,
      label: link.label || "Other link",
      icon: <LinkIcon />,
      external: true,
    });
  });

  return links;
};

const SocialLinksRow = ({ email, github, linkedin, otherLinks = [] }) => {
  const links = buildLinks({ email, github, linkedin, otherLinks });

  if (!links.length) {
    return null;
  }

  return (
    <div style={rowStyle} aria-label="Social links">
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          aria-label={link.label}
          title={link.label}
          style={linkStyle}
          {...(link.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};

export default SocialLinksRow;