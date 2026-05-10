import { useParams } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "../api/portfolio";
import { useTracker } from "meteor/react-meteor-data";
import About from "./components/About.jsx";
import Navbar from "./components/Navbar.jsx";

export const PortfolioView = () => {
  const { username } = useParams();

  const { portfolio, isLoading } = useTracker(() => {
    const userKey = username || "me";
    const handler = Meteor.subscribe("portfolios.byUsername", userKey);

    return {
      portfolio: PortfolioCollection.findOne({ username: userKey }, { sort: { createdAt: -1 } }),
      isLoading: !handler.ready(),
    };
  });

  const portfolioBioSummary = portfolio
    ? typeof portfolio.bio === "string"
      ? portfolio.bio
      : portfolio.bio?.professionalSummary || portfolio.bio?.headline || ""
    : "";

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
      <About bioSummary={portfolioBioSummary} />
      <section className="portfolio-summary">
        <h2>{portfolio?.title || "Portfolio Overview"}</h2>
        {portfolio ? (
          <div className="portfolio-details">
            <p>
              <strong>Owner:</strong> {portfolio.userId || "Unknown"}
            </p>
            <p>
              <strong>Theme:</strong> {portfolio.theme || "Minimal"}
            </p>
            <p>
              <strong>Projects:</strong> {portfolio.projects?.length ?? 0}
            </p>
          </div>
        ) : (
          <p>
            This portfolio is still being built. Check back later for an
            updated summary of experience, interests, and technical skills.
          </p>
        )}
      </section>
    </div>
  );
};
