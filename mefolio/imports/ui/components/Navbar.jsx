import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const { portfolio } = useTracker(() => {
    Meteor.subscribe("portfolios.all");
    return { portfolio: PortfolioCollection.findOne() };
  });

  const displayName =
    portfolio?.profile?.fullName || portfolio?.title || "Portfolio";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="px-10 lg:px-20 h-16 flex items-center justify-between">
        <a
          href="#"
          className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-none"
          style={{ minHeight: "unset" }}
        >
          {displayName}
        </a>
        <div className="flex items-center gap-8">
          <a
            href="#about"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            About
          </a>
          <a
            href="#projects"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            Projects
          </a>
          <a
            href="#skills"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            Skills
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors leading-none"
            style={{ minHeight: "unset" }}
          >
            Contact
          </a>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
