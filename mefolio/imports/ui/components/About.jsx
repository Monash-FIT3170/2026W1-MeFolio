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
          <AboutCard
            name={bio.fullName || "John Doe"}
            title={bio.headline || "Full-Stack Developer"}
            location={bio.location || "Sydney, NSW"}
            summary={bioSummary || "A concise one-line summary or tagline goes here. Team can replace with real content."}
          />
          <AboutCard />
        </div>
      </div>
    </section>
  );
};

export default About;