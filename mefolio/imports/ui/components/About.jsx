import React from "react";
import AboutCard from "./AboutCard.jsx";
import AboutDetails from "./AboutDetails.jsx";
import SkillsList from "./SkillsList.jsx";
import ContactButtons from "./ContactButtons.jsx";
import SocialLinksRow from "./SocialLinksRow.jsx";

const defaultAboutData = {
  contact: {
    email: "john@example.com",
  },
  socials: {
    github: "https://github.com/johndoe",
    linkedin: "https://www.linkedin.com/in/johndoe",
    other: [
      {
        label: "",
        url: "",
      },
    ],
  },
};

const About = ({ aboutMe = defaultAboutData }) => {
  return (
    <section id="about" className="about-section">
      <div className="about-grid">
        <div className="about-left">
          <AboutDetails />
          <SkillsList />
          <ContactButtons />
          <SocialLinksRow
            email={aboutMe.contact?.email}
            github={aboutMe.socials?.github}
            linkedin={aboutMe.socials?.linkedin}
            otherLinks={aboutMe.socials?.other || []}
          />
        </div>
        <div className="about-right">
          <AboutCard />
        </div>
      </div>
    </section>
  );
};

export default About;
