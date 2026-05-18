import React from "react";

const AboutDetails = ({ aboutMe = {} }) => {
  const availabilityLabel =
    aboutMe.profile?.availability?.label || "Available for hire";

  const headline =
    aboutMe.profile?.headline || "Full-Stack Developer & Problem Solver";

  const summary =
    aboutMe.about?.summary ||
    "I build scalable web applications and solve complex technical challenges.";

  return (
    <div className="about-details">
      <span className="about-badge">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {availabilityLabel}
      </span>

      <h1 className="about-headline">{headline}</h1>

      <p className="about-summary">{summary}</p>
    </div>
  );
};

export default AboutDetails;