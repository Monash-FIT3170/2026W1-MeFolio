import { expect } from "chai";
import { Meteor } from "meteor/meteor";
import { render, screen, cleanup } from "@testing-library/react";
import { ProjectChallenge } from "./ProjectChallenge.jsx";

if (Meteor.isClient) {
  describe("ProjectChallenge", function () {
    afterEach(function () {
      cleanup();
    });

    const project = {
      _id: "p1",
      challenge: {
        title: "Cart Logic Challenge",
        language: "JavaScript",
        hint: "Consider item quantities",
        starterCode: "console.log(2 + 2);",
      },
    };

    it("renders nothing when the project has no challenge", function () {
      const { container } = render(
        <ProjectChallenge project={{ _id: "p0" }} />,
      );
      expect(container.textContent).to.equal("");
    });

    it("shows the title, language, hint, starter code and submit button", function () {
      render(<ProjectChallenge project={project} />);

      expect(screen.getByText(/Cart Logic Challenge/)).to.exist;
      expect(screen.getByText(/JavaScript/)).to.exist;
      expect(screen.getByText(/Consider item quantities/)).to.exist;

      const editor = screen.getByLabelText("Challenge code");
      expect(editor.value).to.equal("console.log(2 + 2);");

      expect(screen.getByRole("button", { name: /submit solution/i })).to.exist;
    });
  });
}
