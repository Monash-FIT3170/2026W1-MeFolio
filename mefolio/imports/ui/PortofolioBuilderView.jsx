import { PortfolioCollection } from "../api/portfolio";

import { useTracker } from "meteor/react-meteor-data";

export const Portfolios = () => {
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
      <h2>Portfolios</h2>
      Placeholder for portfolio UI
      </div>
  ); //TODO: Create UI to edit portfolio details instead of returning none.
};
