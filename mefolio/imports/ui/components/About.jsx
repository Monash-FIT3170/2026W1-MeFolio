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
        <div className="flex justify-center"></div>
      </div>
    </section>
  );
};

export default About;