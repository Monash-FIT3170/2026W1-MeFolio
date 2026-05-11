import { PortfolioCollection } from "../api/portfolio";
import { useTracker } from "meteor/react-meteor-data";

import About from "./components/About.jsx";
import Navbar from "./components/Navbar.jsx";
import { ProfileCard } from "./components/ProfileCard.jsx";

export const PortfolioView = () => {
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
      {/* Hero - two-column grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_500px] items-center min-h-[calc(100vh-64px)] px-10 lg:px-20 gap-12 py-12 lg:py-0">

      {/* Left column */}
        <div className="flex flex-col gap-6">
          <About />
        </div>
      
      {/* Right column- profile card */}
        <div className="flex justify-center items-center py-4 order-first lg:order-last">
          <ProfileCard
            name="John Doe"
            title="Full-Stack Developer"
            location="Sydney, NSW"
            summary="A concise one-line summary or tagline goes here. Team can replace with real content."
            imageUrl={null}
          />
        </div>
      </section>

      <section className="px-10 lg:px-20 py-20 border-t border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">
          Portfolios
        </h2>
        <div>Placeholder for portfolio UI</div>
      </section>
    </div>
  ); //TODO: Create UI to edit portfolio details instead of returning none.
};
