import React from "react";
import AboutCard from "./AboutCard.jsx";
import AboutDetails from "./AboutDetails.jsx";
import SkillsList from "./SkillsList.jsx";
import ContactButtons from "./ContactButtons.jsx";

const About = ({ bio = {} }) => {
  const bioSummary =
    bio.professionalSummary || bio.summary || bio.headline || "";

  return (
    <section id="about" className="about-section">
      <div className="about-grid">
        <div className="about-left">
          <AboutDetails bioSummary={bioSummary} />
          <SkillsList />
          <ContactButtons />
        </div>
        <div className="about-right">
          <AboutCard
            name={bio.fullName || "John Doe"}
            title={bio.headline || "Full-Stack Developer"}
            location={bio.location || "Sydney, NSW"}
            summary={bioSummary || "A concise one-line summary or tagline goes here. Team can replace with real content."}
          />
        </div>
      </div>
    </section>
  );
};

export default About;
