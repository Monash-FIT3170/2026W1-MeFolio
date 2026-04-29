import { PortfolioCollection } from "../api/portfolio";

import { useTracker } from "meteor/react-meteor-data";
import About from "./components/About.jsx";
import Navbar from "./components/Navbar.jsx";

export const PortfolioBuilderView = () => {
  const { portfolios, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe("portfolios.all");
    return {
      portfolios: PortfolioCollection.find({}).fetch(),
      isLoading: !handler.ready()
    };
  });

  const addPortfolio = () => {
    Meteor.call("portfolios.insert", portfolioData);
    setPortfolioData({}); 
  };
  const removePortfolio = (id) => {
    Meteor.call("portfolios.remove", id);
  };
  return (
    <div>
      <Navbar />
      <About />
      <section>
        <h2>Portfolios</h2>
        <div>Placeholder for portfolio UI</div>
      </section>
    </div>
  ); //TODO: Create UI to edit portfolio details instead of returning none.
};
