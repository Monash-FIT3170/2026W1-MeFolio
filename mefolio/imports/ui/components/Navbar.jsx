import PropTypes from "prop-types";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";

const Navbar = ({
  portfolio: draftPortfolio = null,
  viewportMode = "desktop",
}) => {
  const [darkMode, setDarkMode] = useState(false);

  const { portfolio: loadedPortfolio } = useTracker(() => {
    if (draftPortfolio) {
      return { portfolio: draftPortfolio };
    }

    Meteor.subscribe("portfolios.all");
    return { portfolio: PortfolioCollection.findOne() };
  }, [draftPortfolio]);

  const portfolio = draftPortfolio || loadedPortfolio;
  const isMobilePreview = viewportMode === "mobile";

  const displayName =
    portfolio?.profile?.fullName || portfolio?.title || "Portfolio";

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-muted">
      <div
        className={`h-16 flex items-center justify-between ${
          isMobilePreview ? "px-4" : "px-20"
        }`}
      >
        <a
          href="#"
          className="text-base font-bold text-primary hover:text-alt transition-colors leading-none"
          style={{ minHeight: "unset" }}
        >
          {displayName}
        </a>
        <div
          className={`items-center ${
            isMobilePreview ? "flex gap-2" : "flex gap-8"
          }`}
        >
          {!isMobilePreview && (
            <>
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
            </>
          )}

          <button
          type="button"
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
  viewportMode: PropTypes.oneOf(["desktop", "mobile"]),
};

export default Navbar;
