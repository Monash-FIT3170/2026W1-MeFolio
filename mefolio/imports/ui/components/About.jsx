import PropTypes from "prop-types";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

import { PortfolioCollection } from "/imports/api/portfolio";

import AboutDetails from "./AboutDetails.jsx";
import ContactButtons from "./ContactButtons.jsx";
import SocialLinksRow from "./SocialLinksRow.jsx";

const About = ({ portfolio: draftPortfolio = null }) => {
  const { portfolio, isLoading } = useTracker(() => {
    if (draftPortfolio) {
      return { portfolio: draftPortfolio, isLoading: false };
    }

    const handle = Meteor.subscribe("portfolios.all");
    const portfolio = PortfolioCollection.findOne();
    return { portfolio, isLoading: !handle.ready() };
  }, [draftPortfolio]);

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

About.propTypes = {
  portfolio: PropTypes.object,
};

export default About;
