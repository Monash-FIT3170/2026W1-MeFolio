import React from "react";

const AboutDetails = () => {
  return (
    <div className="about-details">
      <span className="about-badge">
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Available for hire
      </span>

      <h1 className="about-headline">
        Full-Stack Developer & Problem Solver
      </h1>

      <p className="about-summary">
        I build scalable web applications and solve complex technical
        challenges. Specializing in React, Node.js, and cloud architecture.
      </p>
    </div>
  );
};

export default AboutDetails;