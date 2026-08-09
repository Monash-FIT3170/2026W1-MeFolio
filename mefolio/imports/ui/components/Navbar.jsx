import PropTypes from "prop-types";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";

// Callers that already hold the portfolio being displayed can pass it in, so
// the heading matches that content instead of whichever portfolio the client
// happens to have cached. Falls back to the previous lookup when omitted.
const Navbar = ({ portfolio: providedPortfolio = null }) => {
  const [darkMode, setDarkMode] = useState(false);

  const { portfolio } = useTracker(() => {
    if (providedPortfolio) return { portfolio: providedPortfolio };

    Meteor.subscribe("portfolios.all");
    return { portfolio: PortfolioCollection.findOne() };
  }, [providedPortfolio]);

  const displayName =
    portfolio?.profile?.fullName || portfolio?.title || "Portfolio";

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-muted">
      <div className="px-10 lg:px-20 h-16 flex items-center justify-between">
        <a
          href="#"
          className="text-base font-bold text-primary hover:text-alt transition-colors leading-none"
          style={{ minHeight: "unset" }}
        >
          {displayName}
        </a>
        <div className="flex items-center gap-8">
          <a
            href="#about"
            className="text-sm font-medium text-primary hover:text-alt transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            About
          </a>
          <a
            href="#projects"
            className="text-sm font-medium text-primary hover:text-alt transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            Projects
          </a>
          <a
            href="#skills"
            className="text-sm font-medium text-primary hover:text-alt transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            Skills
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-primary hover:text-alt transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            Contact
          </a>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-primary hover:text-alt hover:bg-background transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

Navbar.propTypes = {
  portfolio: PropTypes.object,
};

export default Navbar;
