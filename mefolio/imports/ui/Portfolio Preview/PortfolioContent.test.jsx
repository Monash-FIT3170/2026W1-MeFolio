import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect } from "chai";
import { afterEach, describe, it } from "mocha";
import { Meteor } from "meteor/meteor";
import { isProjectNarrationEnabled } from "../../api/projectNarration.js";
import { PortfolioContent } from "./PortfolioContent.jsx";

if (Meteor.isClient) {
  describe("PortfolioContent narration controls", () => {
    afterEach(() => cleanup());

    it("enables or disables narration for every project on the page", () => {
      render(
        <PortfolioContent
          portfolio={{ _id: "portfolio-1", title: "Test portfolio" }}
          portfolioId="portfolio-1"
          projects={[
            { _id: "project-1", title: "First project" },
            { _id: "project-2", title: "Second project" },
          ]}
        />,
      );

      const toggle = screen.getByRole("switch", {
        name: "Enable voice narration",
      });
      expect(toggle.checked).to.equal(true);
      expect(
        screen
          .getByTestId("narration-switch-thumb")
          .className.split(" ")
          .includes("translate-x-3"),
      ).to.equal(true);
      expect(screen.getAllByTestId("narration-player")).to.have.lengthOf(2);

      fireEvent.click(toggle);

      expect(toggle.checked).to.equal(false);
      expect(
        screen
          .getByTestId("narration-switch-thumb")
          .className.split(" ")
          .includes("translate-x-0"),
      ).to.equal(true);
      expect(screen.queryByTestId("narration-player")).to.equal(null);

      fireEvent.click(toggle);

      expect(toggle.checked).to.equal(true);
      expect(screen.getAllByTestId("narration-player")).to.have.lengthOf(2);
    });

    it("turns the feature off only when explicitly disabled in public settings", () => {
      expect(isProjectNarrationEnabled({})).to.equal(true);
      expect(
        isProjectNarrationEnabled({
          public: { features: { projectNarration: false } },
        }),
      ).to.equal(false);
      expect(
        isProjectNarrationEnabled({
          public: { features: { projectNarration: true } },
        }),
      ).to.equal(true);
    });
  });
}
