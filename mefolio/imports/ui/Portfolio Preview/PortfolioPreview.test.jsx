import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect } from "chai";
import { Meteor } from "meteor/meteor";
import { MemoryRouter } from "react-router-dom";
import { PortfolioCollection } from "../../api/portfolio.js";
import { PortfolioProjectsCollection } from "../../api/portfolioProjects.js";
import { ProjectCollection } from "../../api/projects.js";
import { PROJECT_CLICK_METHOD } from "../../api/projectEngagement.js";
import {
  createDashboardViewModel,
  getSelectedPortfolio,
} from "../../models/portfolioBuilderViewModel";
import { PortfolioPreview } from "./PortfolioPreview.jsx";

if (Meteor.isClient) {
  describe("PortfolioPreview click tracking", () => {
    let originalCallAsync;
    let projectClickCalls;

    const portfolio = {
      _id: "portfolio-123",
      title: "Tracking test portfolio",
      profile: { fullName: "Portfolio Owner" },
    };
    const projects = [
      {
        _id: "project-456",
        title: "Tracking test project",
        technologies: [],
        githubLink: "https://github.com/example/tracking-test-project",
      },
    ];

    beforeEach(() => {
      originalCallAsync = Meteor.callAsync;
      projectClickCalls = [];
      Meteor.callAsync = (name, event) => {
        if (name === PROJECT_CLICK_METHOD) {
          projectClickCalls.push(event);
          return Promise.resolve({ recorded: true });
        }

        return originalCallAsync.call(Meteor, name, event);
      };
    });

    afterEach(() => {
      Meteor.callAsync = originalCallAsync;
      cleanup();
    });

    const renderPreview = (props = {}) =>
      render(
        <MemoryRouter initialEntries={["/preview"]}>
          <PortfolioPreview
            portfolio={portfolio}
            portfolioId={portfolio._id}
            projects={projects}
            {...props}
          />
        </MemoryRouter>,
      );

    it("does not record clicks from the draft preview", () => {
      renderPreview();

      fireEvent.click(screen.getByRole("link", { name: /code/i }));

      expect(projectClickCalls).to.deep.equal([]);
    });

    it("records clicks from the published preview", () => {
      renderPreview({ isPublishedView: true });

      fireEvent.click(screen.getByRole("link", { name: /code/i }));

      expect(projectClickCalls).to.have.lengthOf(1);
      expect(projectClickCalls[0]).to.include({
        portfolioId: "portfolio-123",
        projectId: "project-456",
        target: "code",
      });
    });
  });

  describe("PortfolioPreview ownership", () => {
    let originalSubscribe;
    let originalUser;
    let originalUserId;
    let originalFindOne;
    let originalProjectOrdersFind;
    let originalProjectsFind;
    let portfolioSelectors;
    let subscriptionCalls;
    let ownedPortfolio;
    let user;

    const otherPortfolio = {
      _id: "other-portfolio",
      userId: "other-user",
      title: "Another user's portfolio",
      profile: { fullName: "Other Owner" },
    };
    const projects = [
      { _id: "first-project", title: "First owner project", technologies: [] },
      {
        _id: "second-project",
        title: "Second owner project",
        technologies: [],
      },
    ];

    beforeEach(() => {
      originalSubscribe = Meteor.subscribe;
      originalUser = Meteor.user;
      originalUserId = Meteor.userId;
      originalFindOne = PortfolioCollection.findOne;
      originalProjectOrdersFind = PortfolioProjectsCollection.find;
      originalProjectsFind = ProjectCollection.find;
      portfolioSelectors = [];
      subscriptionCalls = [];
      ownedPortfolio = null;
      user = {
        _id: "current-user",
        emails: [{ address: "owner@example.com" }],
      };

      Meteor.user = () => user;
      Meteor.userId = () => user?._id || null;
      Meteor.subscribe = (...args) => {
        subscriptionCalls.push(args);
        return { ready: () => true };
      };
      PortfolioCollection.findOne = (selector) => {
        portfolioSelectors.push(selector);
        if (selector?.userId === user?._id) return ownedPortfolio;
        return otherPortfolio;
      };
      PortfolioProjectsCollection.find = () => ({
        fetch: () => [
          {
            portfolioId: "owner-portfolio",
            projectId: "second-project",
            orderIndex: 0,
          },
          {
            portfolioId: "owner-portfolio",
            projectId: "first-project",
            orderIndex: 1,
          },
        ],
      });
      ProjectCollection.find = (selector) => ({
        fetch: () =>
          projects.filter((project) => selector._id.$in.includes(project._id)),
      });
    });

    afterEach(() => {
      cleanup();
      Meteor.subscribe = originalSubscribe;
      Meteor.user = originalUser;
      Meteor.userId = originalUserId;
      PortfolioCollection.findOne = originalFindOne;
      PortfolioProjectsCollection.find = originalProjectOrdersFind;
      ProjectCollection.find = originalProjectsFind;
    });

    const renderOwnPreview = () =>
      render(
        <MemoryRouter initialEntries={["/preview"]}>
          <PortfolioPreview />
        </MemoryRouter>,
      );

    for (const email of ["owner@example.com", "test@example.com"]) {
      it(`does not fall back to another portfolio for ${email}`, () => {
        user.emails = [{ address: email }];
        renderOwnPreview();

        expect(screen.getByText("Portfolio not available")).to.exist;
        expect(screen.queryByText(otherPortfolio.title)).to.not.exist;
        expect(portfolioSelectors).to.not.be.empty;
        for (const selector of portfolioSelectors) {
          expect(selector).to.deep.equal({ userId: user._id });
        }
        expect(
          subscriptionCalls.some(([name]) => name === "portfolios.viewer"),
        ).to.equal(false);
      });
    }

    it("renders the owner's portfolio and saved project order", () => {
      ownedPortfolio = {
        _id: "owner-portfolio",
        userId: user._id,
        title: "Owner portfolio",
        bio: "Owner biography",
        profile: { fullName: "Current Owner" },
        projects: ["first-project", "second-project"],
        narrationEnabled: false,
      };
      renderOwnPreview();

      expect(screen.getByRole("heading", { name: "Owner portfolio" })).to.exist;
      expect(screen.getByText("Owner biography")).to.exist;
      const projectHeadings = screen.getAllByRole("heading", {
        name: /(?:First|Second) owner project/,
      });
      expect(
        projectHeadings.map((heading) => heading.textContent),
      ).to.deep.equal(["Second owner project", "First owner project"]);
      expect(portfolioSelectors).to.not.be.empty;
      for (const selector of portfolioSelectors) {
        expect(selector).to.deep.equal({ userId: user._id });
      }
      expect(subscriptionCalls).to.deep.include([
        "portfolios.viewer",
        ownedPortfolio._id,
      ]);
    });
  });
}

describe("Dashboard portfolio ownership", () => {
  const otherPortfolio = { _id: "other-portfolio", userId: "other-user" };
  const ownedPortfolio = { _id: "owner-portfolio", userId: "current-user" };

  it("selects the current user's portfolio from mixed client data", () => {
    const user = { _id: "current-user" };

    expect(
      getSelectedPortfolio([otherPortfolio, ownedPortfolio], user),
    ).to.equal(ownedPortfolio);
  });

  it("keeps the first matching portfolio when the owner has several", () => {
    const secondOwnedPortfolio = {
      _id: "second-owner-portfolio",
      userId: "current-user",
    };

    expect(
      getSelectedPortfolio(
        [otherPortfolio, ownedPortfolio, secondOwnedPortfolio],
        { _id: "current-user" },
      ),
    ).to.equal(ownedPortfolio);
    expect(getSelectedPortfolio([], { _id: "current-user" })).to.equal(null);
  });

  it("gives the former test email no access to another user's portfolio", () => {
    const user = {
      _id: "current-user",
      emails: [{ address: "test@example.com" }],
    };

    expect(getSelectedPortfolio([otherPortfolio], user)).to.equal(null);
    expect(
      getSelectedPortfolio([otherPortfolio, ownedPortfolio], user),
    ).to.equal(ownedPortfolio);
  });

  it("does not select a portfolio without an authenticated owner", () => {
    expect(getSelectedPortfolio([otherPortfolio], null)).to.equal(null);
    expect(getSelectedPortfolio([{ _id: "ownerless-portfolio" }], {})).to.equal(
      null,
    );
  });

  it("keeps the empty dashboard display independent of an account", () => {
    const dashboard = createDashboardViewModel();

    expect(dashboard.aboutMe.userId).to.equal("");
    expect(dashboard.aboutMe.title).to.equal("Sample Portfolio");
    expect(dashboard.projects).to.have.length.greaterThan(0);
    expect(dashboard.sidebarItems).to.have.length.greaterThan(0);
  });
});
