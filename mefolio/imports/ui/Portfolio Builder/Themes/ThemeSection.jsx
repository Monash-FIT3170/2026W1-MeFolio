import React, { useState } from "react";
import PropTypes from "prop-types";
import { ThemeCard } from "./ThemeCard";
import { Meteor } from "meteor/meteor";

const ThemeSection = ({ portfolioId, currentActiveTheme }) => {
  const [activeTheme, setActiveTheme] = useState(
    currentActiveTheme || "default",
  );

  const handleApply = (themeId) => {
    if (!portfolioId) {
      alert("Portfolio not found.");
      return;
    }

    Meteor.call(
      "portfolios.update",
      portfolioId,
      { theme: themeId },
      (error) => {
        if (error) {
          console.error("Error updating theme:", error);
        } else {
          setActiveTheme(themeId);
        }
      },
    );
  };

  // Themes
  const Themes = [
    {
      id: "default",
      title: "Default",
      description: "Sleek, standard and modern.",
      image: "/default-preview.png",
    },
    {
      id: "minimalist",
      title: "Minimalist",
      description:
        "Clean, minimalist design with subtle typography and ample whitespace",
      image: "/minimalist-preview.png",
    },
    {
      id: "terminal-retro",
      title: "Retro Terminal",
      description:
        "Nostalgic terminal aesthetic with monospace fonts and green CRT glow",
      image: "/terminal-retro-preview.png",
    },
    {
      id: "modern-saas",
      title: "Modern SaaS",
      description:
        "Contemporary rich design with bold colors and smooth interactions",
      image: "/modern-saas-preview.png",
    },
  ];
  return (
    <section className="rounded-lg border border-line bg-surface-fill p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-primary mb-6">
        Theme Selection
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            title={theme.title}
            description={theme.description}
            image={theme.image}
            isActive={activeTheme === theme.id}
            onApply={() => handleApply(theme.id)}
          />
        ))}
      </div>
    </section>
  );
};

ThemeSection.propTypes = {
  portfolioId: PropTypes.string.isRequired,
  currentTheme: PropTypes.string,
};

export default ThemeSection;
