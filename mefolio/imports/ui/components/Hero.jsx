import React from "react";
import { ProfileCard } from "./ProfileCard.jsx";
import Button from "./Button.jsx";

const Hero = ({ bio = {}, recruiterInfo = {} }) => {
  const bioSummary =
    bio.professionalSummary || bio.summary || bio.headline || "";
  const headline = bio.headline || "Full-Stack Developer & Problem Solver";

  const showAvailability = recruiterInfo?.allowAccess === true;
  const availabilityLabel = recruiterInfo?.availability
    ? `Available · ${recruiterInfo.availability}`
    : "Available for hire";

  return (
    <section id="hero" className="hero-section">
      <div className="hero-grid">
        <div className="hero-left">
          {showAvailability && (
            <span className="hero-badge">
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
          )}

          <h1 className="hero-headline">{headline}</h1>

          <p className="hero-summary">
            {bioSummary ||
              "Add your professional summary in the builder to introduce yourself here."}
          </p>

          <div className="hero-buttons">
            <Button text="Get in Touch" />
            <Button text="View Resume" variant="ghost" />
          </div>
        </div>

        <div className="hero-right">
          <ProfileCard
            name={bio.fullName}
            title={bio.headline}
            location={bio.location}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;