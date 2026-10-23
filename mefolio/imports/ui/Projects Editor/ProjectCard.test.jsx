import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect } from "chai";
import sinon from "sinon";
import { afterEach, describe, it } from "mocha";
import { Meteor } from "meteor/meteor";
import {
  buildNarrationText,
  usesCustomNarration,
} from "../../api/projectNarration.js";
import { ProjectCard } from "./ProjectCard.jsx";

if (Meteor.isClient) {
  describe("Builder ProjectCard custom narration", () => {
    afterEach(() => {
      cleanup();
      sinon.restore();
    });

    const project = {
      _id: "project-1",
      title: "MeFolio",
      description: "Public description.",
      caseStudyNarrative: "Custom case study.",
    };

    it("shows the switch below the description and reports changes", () => {
      const onToggle = sinon.spy();
      render(
        <ProjectCard project={project} onToggleCustomNarration={onToggle} />,
      );

      const toggle = screen.getByRole("switch", {
        name: "Use custom narration for MeFolio",
      });
      expect(toggle.checked).to.equal(true);
      expect(screen.getByText("Narration reads your custom case study.")).to
        .exist;

      fireEvent.click(toggle);
      sinon.assert.calledOnceWithExactly(onToggle, project, false);
    });

    it("shows the description is read when custom narration is off", () => {
      render(
        <ProjectCard
          project={{ ...project, useCustomNarration: false }}
          onToggleCustomNarration={() => {}}
        />,
      );

      expect(
        screen.getByRole("switch", { name: /use custom narration/i }).checked,
      ).to.equal(false);
      expect(screen.getByText("Narration reads the project description.")).to
        .exist;
    });

    it("disables the switch until the project has custom narration text", () => {
      render(
        <ProjectCard
          project={{ ...project, caseStudyNarrative: "" }}
          onToggleCustomNarration={() => {}}
        />,
      );

      const toggle = screen.getByRole("switch", {
        name: /use custom narration/i,
      });
      expect(toggle.disabled).to.equal(true);
      expect(toggle.checked).to.equal(false);
    });

    it("hides the switch when narration is off for the portfolio", () => {
      render(<ProjectCard project={project} />);
      expect(screen.queryByTestId("project-card-custom-narration")).to.equal(
        null,
      );
    });
  });

  describe("buildNarrationText", () => {
    it("reads custom narration when switched on and present", () => {
      expect(
        buildNarrationText({
          description: "Description.",
          caseStudyNarrative: " Custom. ",
          useCustomNarration: true,
        }),
      ).to.equal("Custom.");
    });

    it("reads the description when custom narration is off or empty", () => {
      expect(
        buildNarrationText({
          description: "Description.",
          caseStudyNarrative: "Custom.",
          useCustomNarration: false,
        }),
      ).to.equal("Description.");
      expect(
        buildNarrationText({
          description: " Description. ",
          caseStudyNarrative: "  ",
          useCustomNarration: true,
        }),
      ).to.equal("Description.");
      expect(buildNarrationText({})).to.equal("");
    });

    it("keeps existing custom narration on for projects saved before the switch", () => {
      expect(usesCustomNarration({ caseStudyNarrative: "Custom." })).to.equal(
        true,
      );
      expect(usesCustomNarration({ description: "Description." })).to.equal(
        false,
      );
    });
  });
}
