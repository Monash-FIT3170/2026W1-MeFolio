/**
 * UI Tests for ProjectCard.jsx
 *
 * Ensures that the ProjectCard component renders correctly and handles user interactions as expected.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import { describe, it } from "mocha";
import { Meteor } from "meteor/meteor";
import { ProjectCard } from "./ProjectCard.jsx";

if (Meteor.isClient) {
  describe("ProjectCard", () => {
    it("renders project title, description, and tech stack", () => {
      const mockProject = {
        title: "AI Portfolio Dashboard",
        description: "An interactive portfolio with AI-powered analytics",
        technologies: ["React", "Meteor", "Tailwind"],
        stars: 42,
      };

      render(<ProjectCard project={mockProject} />);

      expect(screen.getByText("AI Portfolio Dashboard")).to.exist;
      expect(
        screen.getByText("An interactive portfolio with AI-powered analytics"),
      ).to.exist;
      expect(screen.getByText("React")).to.exist;
      expect(screen.getByText("Meteor")).to.exist;
      expect(screen.getByText("Tailwind")).to.exist;
      expect(screen.getByText("42")).to.exist;
    });

    it("shows and hides mock challenge when Try Challenge button is clicked", () => {
      const mockProject = {
        title: "Test Project",
        technologies: ["React"],
      };

      render(<ProjectCard project={mockProject} />);

      expect(screen.getByTestId("challenge-placeholder").textContent).to.equal(
        "Challenge feature coming soon",
      );

      const tryButton = screen.getByRole("button", { name: /try challenge/i });
      fireEvent.click(tryButton);

      expect(screen.getByRole("button", { name: /try challenge/i })).to.exist;
    });

    it("displays Voice Summary, Code, and Demo buttons", () => {
      const mockProject = {
        title: "Test Project",
        technologies: ["React"],
      };

      render(<ProjectCard project={mockProject} />);

      expect(screen.getByText("Voice Summary")).to.exist;
      expect(screen.getByText("Code")).to.exist;
      expect(screen.getByText("Demo")).to.exist;
    });

    it("displays preview placeholder when image is not provided or fails to load", () => {
      const mockProject = {
        title: "Test Project",
        technologies: ["React"],
        media: "",
      };

      render(<ProjectCard project={mockProject} />);

      expect(screen.getByText("Preview Coming Soon")).to.exist;
    });

    it("ensures image asset elements utilize native lazy-loading for page speed efficiency", () => {
      const mockProject = {
        title: "Performance Test Project",
        technologies: ["React"],
        media: "https://example.com/project-preview.png",
      };

      render(<ProjectCard project={mockProject} />);

      const imageElement = screen.getByRole("img");

      expect(imageElement.getAttribute("loading")).to.equal("lazy");
      expect(imageElement.getAttribute("decoding")).to.equal("async");
    });
  });
}
