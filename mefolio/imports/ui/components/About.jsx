import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import { PortfolioCollection } from "/imports/api/portfolio";

import AboutDetails from "./AboutDetails.jsx";
import SkillsList from "./SkillsList.jsx";
import ContactButtons from "./ContactButtons.jsx";
import SocialLinksRow from "./SocialLinksRow.jsx";

const About = () => {
  const { portfolio, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe("portfolios.all");
    const portfolio = PortfolioCollection.findOne();
    return { portfolio, isLoading: !handle.ready() };
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div id="about" className="flex flex-col gap-6">
      <AboutDetails portfolio={portfolio} />
      <ContactButtons portfolio={portfolio} />
      <SocialLinksRow
        email={portfolio?.bio?.email || portfolio?.contact?.email}
        github={portfolio?.socials?.github}
        linkedin={portfolio?.socials?.linkedin}
        otherLinks={portfolio?.socials?.other || []}
      />
    </div>
  );
};

export default About;
