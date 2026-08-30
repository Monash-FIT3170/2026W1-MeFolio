/**
 * UI tests for PublicPortfolioPage.jsx (FEAT-12)
 *
 * Renders the public route inside a MemoryRouter (it relies on useParams) and
 * covers the three states a visitor can land in, plus the two things that make
 * this page public rather than a dashboard preview: no dashboard chrome, and
 * the published snapshot's own theme.
 *
 * Meteor.subscribe and PortfolioCollection.findOne are monkey-patched per
 * test, matching the mocking style used in RecruiterLoginPage.test.jsx.
 */

import { render, screen } from "@testing-library/react";
import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PublicPortfolioPage } from "./PublicPortfolioPage.jsx";

if (Meteor.isClient) {
  describe("PublicPortfolioPage Component", () => {
    let originalSubscribe;
    let originalFindOne;
    let subscriptionCalls;

    // Shaped like the snapshot portfolios.publish writes. No githubLink on the
    // projects, so ProjectCard does not reach out to the GitHub API.
    const publishedContent = {
      title: "Public Owner Portfolio",
      bio: "Builds things on the web.",
      profile: { fullName: "Public Owner", location: "Melbourne" },
      theme: "terminal-retro",
      projects: [
        {
          _id: "project-1",
          title: "Weather Dashboard",
          description: "Forecasts at a glance.",
          technologies: ["React"],
        },
        {
          _id: "project-2",
          title: "Recipe Finder",
          description: "Search by what is in the fridge.",
          technologies: ["Meteor"],
        },
      ],
    };

    beforeEach(() => {
      originalSubscribe = Meteor.subscribe;
      originalFindOne = PortfolioCollection.findOne;
      subscriptionCalls = [];
    });

    afterEach(() => {
      Meteor.subscribe = originalSubscribe;
      PortfolioCollection.findOne = originalFindOne;
    });

    // Stands in for the portfolios.publicView subscription and whatever it
    // would have put into minimongo.
    const stubSubscription = ({ ready = true, portfolio } = {}) => {
      Meteor.subscribe = (...args) => {
        subscriptionCalls.push(args);
        return { ready: () => ready };
      };
      PortfolioCollection.findOne = () => portfolio;
    };

    const renderPage = () =>
      render(
        <MemoryRouter initialEntries={["/testPortfolioId/view"]}>
          <Routes>
            <Route
              path="/:portfolioId/view"
              element={<PublicPortfolioPage />}
            />
          </Routes>
        </MemoryRouter>,
      );

    it("shows a loading state until the subscription is ready", () => {
      stubSubscription({ ready: false });
      renderPage();

      expect(screen.getByTestId("public-portfolio-loading")).to.exist;
      expect(screen.queryByTestId("public-portfolio-view")).to.not.exist;
    });

    it("shows the unavailable message when no portfolio matches the id", () => {
      stubSubscription({ portfolio: undefined });
      renderPage();

      expect(screen.getByTestId("public-portfolio-unavailable")).to.exist;
      expect(screen.getByText("Portfolio not available")).to.exist;
    });

    it("shows the unavailable message when the portfolio is not published", () => {
      stubSubscription({
        portfolio: {
          _id: "testPortfolioId",
          isPublished: false,
          publishedContent: null,
        },
      });
      renderPage();

      expect(screen.getByTestId("public-portfolio-unavailable")).to.exist;
    });

    it("renders the published snapshot", () => {
      stubSubscription({
        portfolio: {
          _id: "testPortfolioId",
          isPublished: true,
          publishedContent,
        },
      });
      renderPage();

      expect(screen.getByRole("heading", { name: "Public Owner Portfolio" })).to
        .exist;
      expect(screen.getByText("Builds things on the web.")).to.exist;
      expect(screen.getByText("Project Gallery")).to.exist;
      expect(screen.getByText("Weather Dashboard")).to.exist;
      expect(screen.getByText("Recipe Finder")).to.exist;
    });

    it("subscribes to live viewer presence for a published portfolio", () => {
      stubSubscription({
        portfolio: {
          _id: "testPortfolioId",
          isPublished: true,
          publishedContent,
        },
      });
      renderPage();

      expect(subscriptionCalls).to.deep.include([
        "portfolios.viewer",
        "testPortfolioId",
      ]);
    });

    it("does not render the dashboard chrome", () => {
      stubSubscription({
        portfolio: {
          _id: "testPortfolioId",
          isPublished: true,
          publishedContent,
        },
      });
      renderPage();

      expect(screen.queryByText("Back to Dashboard")).to.not.exist;
      expect(screen.queryByRole("button", { name: /desktop/i })).to.not.exist;
      expect(screen.queryByRole("button", { name: /mobile/i })).to.not.exist;
      expect(screen.queryByTestId("publish-btn")).to.not.exist;
      expect(screen.queryByText("Published portfolio")).to.not.exist;
      expect(screen.queryByText("Draft preview")).to.not.exist;
    });

    it("applies the published snapshot's theme", () => {
      stubSubscription({
        portfolio: {
          _id: "testPortfolioId",
          isPublished: true,
          publishedContent,
        },
      });
      renderPage();

      expect(
        screen.getByTestId("public-portfolio-view").getAttribute("data-theme"),
      ).to.equal("terminal-retro");
    });

    it("falls back to the default theme for a theme with no stylesheet rule", () => {
      stubSubscription({
        portfolio: {
          _id: "testPortfolioId",
          isPublished: true,
          // "minimal" was never a defined theme, but older records store it.
          publishedContent: { ...publishedContent, theme: "minimal" },
        },
      });
      renderPage();

      expect(
        screen.getByTestId("public-portfolio-view").getAttribute("data-theme"),
      ).to.equal("default");
    });
  });
}
