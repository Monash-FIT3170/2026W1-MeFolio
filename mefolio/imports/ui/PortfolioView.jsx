import { useParams } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "../api/portfolio";
import { useTracker } from "meteor/react-meteor-data";

import About from "./components/About.jsx";
import Navbar from "./components/Navbar.jsx";
import { ProfileCard } from "./components/ProfileCard.jsx";

export const PortfolioView = () => {
  const { username } = useParams();

  const { portfolio, isLoading } = useTracker(() => {
    const userKey = username || "me";
    const handler = Meteor.subscribe("portfolios.byUsername", userKey);

    const portfolioData = PortfolioCollection.findOne(
      { username: userKey },
      { sort: { createdAt: -1 } }
    );

    return {
      portfolio: portfolioData,
      isLoading: !handler.ready(),
    };
  }, [username]);

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <main className="portfolio-loading">
          <p>Loading portfolio...</p>
        </main>
      </div>
    );
  }

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
    </div>
  );
};