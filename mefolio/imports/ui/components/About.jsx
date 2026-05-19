import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import { PortfolioCollection } from "/imports/api/portfolio";

import AboutCard from "./AboutCard.jsx";
import AboutDetails from "./AboutDetails.jsx";
import SkillsList from "./SkillsList.jsx";
import ContactButtons from "./ContactButtons.jsx";

const About = () => {

  // Subscribe to portfolios
  const { portfolio, isLoading } = useTracker(() => {

    const handle = Meteor.subscribe("portfolios.all");

    const portfolio = PortfolioCollection.findOne();

    return {
      portfolio,
      isLoading: !handle.ready(),
    };
  });

  // Loading state
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <section id="about" className="about-section">
      <div className="about-grid">

        <div className="about-left">
          <AboutDetails portfolio={portfolio} />
          <SkillsList />

          {/* PASS PORTFOLIO */}
          <ContactButtons portfolio={portfolio} />
        </div>

        <div className="about-right">
        </div>

      </div>
    </section>
  );
};

export default About;