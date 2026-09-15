import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect } from "chai";
import { afterEach, describe, it } from "mocha";
import { Meteor } from "meteor/meteor";
import SkillsProjectMap from "./SkillsProjectMap.jsx";

if (Meteor.isClient) {
  describe("SkillsProjectMap Component", () => {
    afterEach(cleanup);

    const projects = [
      { _id: "project-1", title: "Portfolio", technologies: ["React", "CSS"] },
      { _id: "project-2", title: "Dashboard", technologies: ["react"] },
      { _id: "project-3", title: "API", technologies: ["Node.js"] },
    ];

    it("scales skill nodes by the number of associated projects", () => {
      render(<SkillsProjectMap projects={projects} />);

      const reactNode = screen.getByRole("button", {
        name: /Skill React, used in 2 projects/,
      });
      const cssNode = screen.getByRole("button", {
        name: /Skill CSS, used in 1 project/,
      });

      expect(reactNode.querySelector("circle").getAttribute("r")).to.equal(
        "26",
      );
      expect(cssNode.querySelector("circle").getAttribute("r")).to.equal("22");
    });

    it("highlights projects connected to a hovered skill", () => {
      render(<SkillsProjectMap projects={projects} />);

      fireEvent.mouseEnter(
        screen.getByRole("button", { name: /Skill React, used in 2 projects/ }),
      );

      expect(
        screen.getByRole("button", { name: "Project Portfolio" }).className,
      ).to.include("opacity-100");
      expect(
        screen.getByRole("button", { name: "Project Dashboard" }).className,
      ).to.include("opacity-100");
      expect(
        screen.getByRole("button", { name: "Project API" }).className,
      ).to.include("opacity-30");
    });
  });
}
