import { expect } from "chai";
import { Meteor } from "meteor/meteor";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ProjectChallenge } from "./ProjectChallenge.jsx";
import getLanguageFromTechStack from "../Projects Editor/techToLanguage";

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

    /**
     * QA: syntax highlighting matches the declared tech stack.
     * getLanguageFromTechStack decides the language — CodeBlock and ProjectChallenge just forward it.
     */
    describe("QA: syntax highlighting matches the declared tech stack", function () {
      describe("getLanguageFromTechStack", function () {
        it("maps common frontend frameworks to their Prism language", function () {
          expect(getLanguageFromTechStack(["React"])).to.equal("jsx");
          expect(getLanguageFromTechStack(["Vue"])).to.equal("markup");
          expect(getLanguageFromTechStack(["Angular"])).to.equal("typescript");
        });

        it("maps common backend languages to their Prism language", function () {
          expect(getLanguageFromTechStack(["Python"])).to.equal("python");
          expect(getLanguageFromTechStack(["Java"])).to.equal("java");
          expect(getLanguageFromTechStack(["Go"])).to.equal("go");
          expect(getLanguageFromTechStack(["Rust"])).to.equal("rust");
        });

        it("is case-insensitive", function () {
          expect(getLanguageFromTechStack(["PYTHON"])).to.equal("python");
          expect(getLanguageFromTechStack(["pYthOn"])).to.equal("python");
        });

        it("trims surrounding whitespace before matching", function () {
          expect(getLanguageFromTechStack(["  React  "])).to.equal("jsx");
        });

        it("resolves aliases to the same language as their canonical name", function () {
          // Aliases should highlight the same as their canonical name.
          expect(getLanguageFromTechStack(["Next.js"])).to.equal("jsx");
          expect(getLanguageFromTechStack(["Next"])).to.equal("jsx");
          expect(getLanguageFromTechStack(["C++"])).to.equal("cpp");
          expect(getLanguageFromTechStack(["C#"])).to.equal("csharp");
        });

        it("returns the first matching technology when a project declares several", function () {
          // Order matters: first match in the list wins.
          expect(
            getLanguageFromTechStack(["Java", "React", "Docker"]),
          ).to.equal("java");
          expect(
            getLanguageFromTechStack(["Docker", "Java", "React"]),
          ).to.equal("docker");
        });

        it("skips unmapped technologies and matches the next one in the list", function () {
          expect(
            getLanguageFromTechStack(["SomeUnknownFramework", "Python"]),
          ).to.equal("python");
        });

        it("falls back to 'text' when nothing in the stack is recognised", function () {
          expect(
            getLanguageFromTechStack(["SomeUnknownFramework", "AlsoUnknown"]),
          ).to.equal("text");
        });

        it("falls back to 'text' for an empty or missing tech stack", function () {
          expect(getLanguageFromTechStack([])).to.equal("text");
          expect(getLanguageFromTechStack(undefined)).to.equal("text");
        });

        it("falls back to 'text' for a non-array input instead of throwing", function () {
          expect(getLanguageFromTechStack("React")).to.equal("text");
          expect(getLanguageFromTechStack(null)).to.equal("text");
          expect(getLanguageFromTechStack(42)).to.equal("text");
        });

        it("ignores non-string entries in the tech stack instead of throwing", function () {
          expect(getLanguageFromTechStack([null, 42, "Python"])).to.equal(
            "python",
          );
        });
      });

      describe("ProjectChallenge wires the resolved language through to the rendered code block", function () {
        it("renders the challenge's starter code so it is visible for highlighting, for a Python-tagged project", function () {
          render(
            <ProjectChallenge
              project={{
                _id: "p3",
                technologies: ["Python"],
                challenge: {
                  title: "Reverse a string",
                  starterCode: "value = 'abc'[::-1]",
                  hint: "",
                },
              }}
            />,
          );

          // Code appears twice: editable textarea + read-only highlighted
          // block. Both should match.
          const editor = screen.getByLabelText("Challenge code");
          expect(editor.value).to.equal("value = 'abc'[::-1]");
          expect(screen.getByText(/value = 'abc'\[::-1\]/)).to.exist;
        });

        it("keeps the highlighted code in sync as the visitor edits it", function () {
          render(
            <ProjectChallenge
              project={{
                _id: "p4",
                technologies: ["JavaScript"],
                challenge: {
                  title: "Add two numbers",
                  starterCode: "1 + 1;",
                  hint: "",
                },
              }}
            />,
          );

          const editor = screen.getByLabelText("Challenge code");
          fireEvent.change(editor, { target: { value: "2 + 2;" } });

          expect(screen.getByText(/2 \+ 2;/)).to.exist;
        });

        it("does not crash when technologies is missing (falls back to plain text highlighting)", function () {
          render(
            <ProjectChallenge
              project={{
                _id: "p5",
                challenge: {
                  title: "No declared stack",
                  starterCode: "console.log('ok');",
                  hint: "",
                },
              }}
            />,
          );

          expect(screen.getByText(/console\.log\('ok'\);/)).to.exist;
        });
      });
    });
  });
}