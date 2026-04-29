import React from "react";
import AboutCard from "./AboutCard.jsx";
import AboutDetails from "./AboutDetails.jsx";
import SkillsList from "./SkillsList.jsx";
import ContactButtons from "./ContactButtons.jsx";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-grid">
        <div className="about-left">
          <AboutDetails />
          <SkillsList />
          <ContactButtons />
        </div>
        <div className="about-right">
          <AboutCard />
        </div>
      </div>
    </section>
  );
};

export default About;
