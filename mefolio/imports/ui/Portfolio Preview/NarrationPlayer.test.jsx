/**
 * UI Tests for NarrationPlayer.jsx
 *
 * Ensures visitors can play, pause and stop a project's narration and see
 * helpful feedback while audio loads or when it fails.
 */

import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { expect } from "chai";
import sinon from "sinon";
import { describe, it, beforeEach, afterEach } from "mocha";
import { Meteor } from "meteor/meteor";
import { NarrationPlayer } from "./NarrationPlayer.jsx";
import { ProjectCard } from "./ProjectCard.jsx";

const AUDIO_URL = "data:audio/wav;base64,UklGRg==";

if (Meteor.isClient) {
  describe("NarrationPlayer", () => {
    let playStub;
    let pauseStub;

    beforeEach(() => {
      playStub = sinon
        .stub(HTMLMediaElement.prototype, "play")
        .resolves(undefined);
      pauseStub = sinon.stub(HTMLMediaElement.prototype, "pause");
    });

    afterEach(() => {
      cleanup();
      sinon.restore();
    });

    const renderPlayer = (loadAudio = sinon.stub().resolves(AUDIO_URL)) => {
      render(
        <NarrationPlayer
          portfolioId="portfolio-1"
          projectId="project-1"
          loadAudio={loadAudio}
        />,
      );
      return loadAudio;
    };

    it("loads the project audio on first play and shows a pause button", async () => {
      const loadAudio = renderPlayer();

      expect(screen.getByRole("button", { name: /stop narration/i }).disabled)
        .to.be.true;
      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));

      await screen.findByRole("button", { name: /pause narration/i });
      sinon.assert.calledOnceWithExactly(loadAudio, "portfolio-1", "project-1");
      sinon.assert.calledOnce(playStub);
      expect(
        screen.getByTestId("narration-player").querySelector("audio").src,
      ).to.equal(AUDIO_URL);
    });

    it("pauses and resumes without requesting the audio again", async () => {
      const loadAudio = renderPlayer();

      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));
      fireEvent.click(
        await screen.findByRole("button", { name: /pause narration/i }),
      );
      sinon.assert.calledOnce(pauseStub);

      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));
      await screen.findByRole("button", { name: /pause narration/i });
      sinon.assert.calledOnce(loadAudio);
      sinon.assert.calledTwice(playStub);
    });

    it("stops playback and rewinds to the start", async () => {
      renderPlayer();

      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));
      await screen.findByRole("button", { name: /pause narration/i });

      const audio = screen
        .getByTestId("narration-player")
        .querySelector("audio");
      fireEvent.click(screen.getByRole("button", { name: /stop narration/i }));

      expect(audio.currentTime).to.equal(0);
      expect(screen.getByRole("button", { name: /play narration/i })).to.exist;
      expect(screen.getByRole("button", { name: /stop narration/i }).disabled)
        .to.be.true;
    });

    it("shows a loading state while the audio is generated", async () => {
      let finishLoading;
      renderPlayer(
        sinon.stub().returns(
          new Promise((resolve) => {
            finishLoading = resolve;
          }),
        ),
      );

      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));

      expect(await screen.findByText("Loading audio...")).to.exist;
      expect(screen.getByRole("button", { name: /play narration/i }).disabled)
        .to.be.true;

      finishLoading(AUDIO_URL);
      await screen.findByRole("button", { name: /pause narration/i });
    });

    it("shows the server error message when audio cannot be generated", async () => {
      renderPlayer(
        sinon
          .stub()
          .rejects(
            new Meteor.Error(
              "narration-request-failed",
              "Piper could not generate project audio.",
            ),
          ),
      );

      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));

      expect((await screen.findByRole("alert")).textContent).to.equal(
        "Piper could not generate project audio.",
      );
      sinon.assert.notCalled(playStub);
      expect(screen.getByRole("button", { name: /play narration/i }).disabled)
        .to.be.false;
    });

    it("shows a fallback error and clears it after a successful retry", async () => {
      playStub.onFirstCall().rejects(new Error("NotAllowedError"));
      renderPlayer();

      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));
      expect((await screen.findByRole("alert")).textContent).to.equal(
        "Sorry, the audio could not be played. Please try again.",
      );

      fireEvent.click(screen.getByRole("button", { name: /play narration/i }));
      await screen.findByRole("button", { name: /pause narration/i });
      await waitFor(() => expect(screen.queryByRole("alert")).to.equal(null));
    });

    it("is shown on visitor project cards only", () => {
      const project = { _id: "project-1", title: "MeFolio" };

      const { unmount } = render(
        <ProjectCard project={project} portfolioId="portfolio-1" />,
      );
      expect(screen.getByTestId("narration-player")).to.exist;
      unmount();

      render(<ProjectCard project={project} />);
      expect(screen.queryByTestId("narration-player")).to.equal(null);
      expect(screen.getByRole("button", { name: /voice summary/i }).disabled).to
        .be.true;
    });

    it("explains when a draft project has no narration text", () => {
      render(
        <ProjectCard
          project={{ _id: "project-1", title: "MeFolio" }}
          draftPortfolioId="draft-1"
        />,
      );

      expect(screen.getByRole("status").textContent).to.equal(
        "No narration added for this project.",
      );
      expect(screen.queryByTestId("narration-player")).to.equal(null);
    });

    it("explains when a published project has no narration", () => {
      render(
        <ProjectCard
          project={{
            _id: "project-1",
            title: "MeFolio",
            narrationAvailable: false,
          }}
          portfolioId="portfolio-1"
        />,
      );

      expect(screen.getByRole("status").textContent).to.equal(
        "No narration available for this project.",
      );
      expect(screen.queryByTestId("narration-player")).to.equal(null);
    });

    describe("in the draft preview", () => {
      const draftProject = {
        _id: "project-1",
        title: "MeFolio",
        description: "Visible project description.",
        caseStudyNarrative: "Draft case study narration.",
      };
      let callStub;

      beforeEach(() => {
        callStub = sinon.stub(Meteor, "callAsync").resolves(AUDIO_URL);
      });

      it("plays the owner's draft text instead of the published version", async () => {
        render(
          <ProjectCard project={draftProject} draftPortfolioId="draft-1" />,
        );

        fireEvent.click(
          screen.getByRole("button", { name: /play narration/i }),
        );
        await screen.findByRole("button", { name: /pause narration/i });

        sinon.assert.calledOnceWithExactly(
          callStub,
          "projects.generateNarration",
          "draft-1",
          "Draft case study narration.",
        );
      });

      it("requests fresh audio after the draft text is edited", async () => {
        const { rerender } = render(
          <ProjectCard project={draftProject} draftPortfolioId="draft-1" />,
        );
        fireEvent.click(
          screen.getByRole("button", { name: /play narration/i }),
        );
        await screen.findByRole("button", { name: /pause narration/i });

        rerender(
          <ProjectCard
            project={{
              ...draftProject,
              caseStudyNarrative: "Edited case study narration.",
            }}
            draftPortfolioId="draft-1"
          />,
        );
        fireEvent.click(
          screen.getByRole("button", { name: /play narration/i }),
        );
        await screen.findByRole("button", { name: /pause narration/i });

        sinon.assert.calledTwice(callStub);
        expect(callStub.secondCall.args[2]).to.equal(
          "Edited case study narration.",
        );
      });

      it("keeps the placeholder when the draft has no text to read", () => {
        render(
          <ProjectCard
            project={{
              _id: "project-1",
              title: "MeFolio",
              description: "A normal public project description.",
            }}
            draftPortfolioId="draft-1"
          />,
        );

        expect(screen.queryByTestId("narration-player")).to.equal(null);
        expect(screen.getByRole("button", { name: /voice summary/i }).disabled)
          .to.be.true;
        sinon.assert.notCalled(callStub);
      });
    });
  });
}
