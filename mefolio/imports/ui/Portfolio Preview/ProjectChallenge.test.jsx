import { expect } from "chai";
import { Meteor } from "meteor/meteor";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

    it("runs the snippet and sends its console output to the server", async function () {
      const originalCall = Meteor.call;
      let sentArgs = null;
      Meteor.call = (name, ...args) => {
        if (name === "validate_challenge_completion") {
          sentArgs = args.slice(0, -1);
          args[args.length - 1](null, { completed: true });
          return undefined;
        }
        return originalCall.call(Meteor, name, ...args);
      };

      try {
        render(<ProjectChallenge project={project} />);
        fireEvent.click(
          screen.getByRole("button", { name: /submit solution/i }),
        );

        expect(await screen.findByText("Correct!")).to.exist;
        // The captured output ("4"), not the raw code, is what is sent.
        expect(sentArgs).to.deep.equal(["p1", "4"]);
      } finally {
        Meteor.call = originalCall;
      }
    });

    it("reports 'Not quite yet!' when the server says the output is wrong", async function () {
      const originalCall = Meteor.call;
      Meteor.call = (name, ...args) => {
        if (name === "validate_challenge_completion") {
          args[args.length - 1](null, { completed: false });
          return undefined;
        }
        return originalCall.call(Meteor, name, ...args);
      };

      try {
        render(<ProjectChallenge project={project} />);
        fireEvent.click(
          screen.getByRole("button", { name: /submit solution/i }),
        );

        expect(await screen.findByText("Not quite yet!")).to.exist;
      } finally {
        Meteor.call = originalCall;
      }
    });

    it("shows the error and skips the server call when the snippet throws", async function () {
      const originalCall = Meteor.call;
      let called = false;
      Meteor.call = (name, ...args) => {
        if (name === "validate_challenge_completion") called = true;
        return originalCall.call(Meteor, name, ...args);
      };

      try {
        render(
          <ProjectChallenge
            project={{
              _id: "p2",
              challenge: {
                title: "Boom",
                language: "JavaScript",
                hint: "",
                starterCode: "throw new Error('boom');",
              },
            }}
          />,
        );
        fireEvent.click(
          screen.getByRole("button", { name: /submit solution/i }),
        );

        const alert = await screen.findByRole("alert");
        expect(alert.textContent).to.contain("boom");
        expect(called).to.equal(false);
      } finally {
        Meteor.call = originalCall;
      }
    });
  });
}
