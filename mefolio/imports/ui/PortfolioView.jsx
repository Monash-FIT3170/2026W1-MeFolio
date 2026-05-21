import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { mapAboutMe, mapProfile } from "../models/portfolioBuilderViewModel";

import About from "./components/About.jsx";
import Navbar from "./components/Navbar.jsx";
import { ProfileCard } from "./components/ProfileCard.jsx";

const mapPortfolioToAboutMe = (portfolio) => {
  if (!portfolio) {
    return {};
  }

  return {
    profile: {
      fullName: portfolio.profile?.fullName || "John Doe",
      headline:
        portfolio.profile?.headline || portfolio.title || "Full-Stack Developer",
      avatarUrl: portfolio.profile?.avatarUrl || "",
      location: portfolio.profile?.location || "",
      availability: {
        isAvailable: portfolio.profile?.availability?.isAvailable ?? true,
        label: portfolio.profile?.availability?.label || "Available for hire",
      },
    },

    about: {
      summary:
        portfolio.about?.summary ||
        (typeof portfolio.bio === "string" ? portfolio.bio : "") ||
        "",
      highlights: portfolio.about?.highlights || [],
      yearsOfExperience: portfolio.about?.yearsOfExperience || 0,
    },

    contact: {
      email: portfolio.contact?.email || "",
      phone: portfolio.contact?.phone || "",
      website: portfolio.contact?.website || "",
    },

    socials: {
      github: portfolio.socials?.github || "",
      linkedin: portfolio.socials?.linkedin || "",
      twitter: portfolio.socials?.twitter || "",
      other: Array.isArray(portfolio.socials?.other)
        ? portfolio.socials.other
        : [],
    },

    cta: {
      resumeUrl: portfolio.cta?.resumeUrl || "",
      contactEnabled: portfolio.cta?.contactEnabled ?? true,
    },
  };
};

export const PortfolioView = () => {
  const { portfolio, isLoading } = useTracker(() => {
    const handler = Meteor.subscribe("portfolios.all");

    const portfolioData = PortfolioCollection.findOne(
      {},
      { sort: { createdAt: -1 } }
    );

    return {
      portfolio: portfolioData,
      isLoading: !handler.ready(),
    };
  });

  const addPortfolio = () => {
    Meteor.call("portfolios.insert", portfolioData);
    setPortfolioData({}); 
  };
  const removePortfolio = (id) => {
    Meteor.call("portfolios.remove", id);
  };

  if (isLoading) return <p>Loading...</p>;

  const portfolio = portfolios[0];
  const aboutMe = mapAboutMe(portfolio);      // reuse exact same mapper
  const profile = mapProfile(portfolio);      // reuse exact same mapper

  return (
    <div>
      <Navbar displayName={aboutMe.profile?.fullName || "John Doe"} />

      {/* Hero - two-column grid */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_500px] items-center min-h-[calc(100vh-64px)] px-10 lg:px-20 gap-12 py-12 lg:py-0">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <About aboutMe={aboutMe} profile={profile} />
        </div>

        {/* Right column- profile card */}
        <div className="flex justify-center items-center py-4 order-first lg:order-last">
          <ProfileCard
            name={aboutMe.profile?.fullName || "John Doe"}
            title={aboutMe.profile?.headline || "Full-Stack Developer"}
            location={aboutMe.profile?.location || "Sydney, NSW"}
            summary={aboutMe.about?.summary || ""}
            imageUrl={aboutMe.profile?.avatarUrl || null}
          />
        </div>
      </section>

      <section className="px-10 lg:px-20 py-20 border-t border-slate-100 bg-slate-50">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">
          Portfolios
        </h2>
        <div>Placeholder for portfolio UI</div>
      </section>
    </div>
  ); //TODO: Create UI to edit portfolio details instead of returning none.
};