import React from "react";
import AboutCard from "./AboutCard.jsx";
import AboutDetails from "./AboutDetails.jsx";
import ContactButtons from "./ContactButtons.jsx";
import SocialLinks from "./SocialLinks.jsx";

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-grid container">
        <div className="about-left">
          <AboutDetails />
          <ContactButtons />
          <SocialLinks />
        </div>
        <div className="about-right">
        </div>
      </div>
    </section>
  );
};

export default About;