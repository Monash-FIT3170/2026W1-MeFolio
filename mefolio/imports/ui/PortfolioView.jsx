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

      <section className="px-10 lg:px-20 py-20 border-t border-slate-100 bg-slate-50">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">
          Portfolios
        </h2>
        <div>Placeholder for portfolio UI</div>
      </section>
      <About bioSummary={portfolioBioSummary} />
      <About bio={portfolioBio} />
      <section className="portfolio-summary">
        <h2>{portfolio?.title || "Portfolio Overview"}</h2>
        {portfolio ? (
          <div className="portfolio-details">
            <p><strong>Owner:</strong> {portfolio.userId || "Unknown"}</p>
            <p><strong>Theme:</strong> {portfolio.theme || "Minimal"}</p>
            <p><strong>Projects:</strong> {portfolio.projects?.length ?? 0}</p>
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