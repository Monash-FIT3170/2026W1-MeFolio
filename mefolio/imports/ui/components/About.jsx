import React from "react";
import AboutCard from "./AboutCard.jsx";
import AboutDetails from "./AboutDetails.jsx";
import SkillsList from "./SkillsList.jsx";
import ContactButtons from "./ContactButtons.jsx";

const About = ({ bioSummary }) => {
  return (
    <section id="about" className="about-section">
      <div className="about-grid">
        <div className="about-left">
          <AboutDetails bioSummary={bioSummary} />
          <SkillsList />
          <ContactButtons />
        </div>
        <div className="about-right">
        </div>
      </div>
    </section>
  );
};

export default About;
