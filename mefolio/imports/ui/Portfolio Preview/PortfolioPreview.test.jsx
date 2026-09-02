import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect } from "chai";
import { afterEach, beforeEach, describe, it } from "mocha";
import { Meteor } from "meteor/meteor";
import { MemoryRouter } from "react-router-dom";
import { PROJECT_CLICK_METHOD } from "../../api/projectEngagement.js";
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
}
