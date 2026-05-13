import React from "react";
import AboutDetails from "./AboutDetails.jsx";
import ContactButtons from "./ContactButtons.jsx";
import SocialLinks from "./SocialLinks.jsx";

const About = () => {
  return (
    <section id="about" className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 md:gap-12 items-center">
        <div className="flex flex-col items-start gap-6">
          <AboutDetails />
          <ContactButtons />
          <SocialLinks />
        </div>
<<<<<<< HEAD
        <div className="about-right">
          <AboutCard
            name={bio.fullName || "John Doe"}
            title={bio.headline || "Full-Stack Developer"}
            location={bio.location || "Sydney, NSW"}
            summary={bioSummary || "A concise one-line summary or tagline goes here. Team can replace with real content."}
          />
          <AboutCard />
        </div>
=======
        <div className="flex justify-center"></div>
>>>>>>> 165f97f (FEAT-05: Restore portfolio builder changes, exclude OAuth credentials)
      </div>
    </section>
  );
};

export default About;