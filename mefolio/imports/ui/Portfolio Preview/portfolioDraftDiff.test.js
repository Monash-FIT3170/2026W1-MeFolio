import { expect } from "chai";
import { Meteor } from "meteor/meteor";
import { getDraftStatus } from "./portfolioDraftDiff.js";

if (Meteor.isServer) {
  describe("portfolioDraftDiff AI Twin changes", () => {
    const document = (content) => ({
      id: "resume",
      kind: "text",
      title: "Resume",
      category: "resume",
      content,
    });

    it("includes chatbot personality and AI Twin information in review changes", () => {
      const status = getDraftStatus({
        portfolio: {
          title: "Portfolio",
          chatbotPersona: "friendly",
          aiTwinConfiguration: { documents: [document("Updated resume")] },
          publishedAiTwinConfiguration: {
            documents: [document("Published resume")],
          },
          publishedContent: {
            title: "Portfolio",
            chatbotPersona: "professional",
            projects: [],
          },
        },
        projects: [],
      });

      const personaChange = status.fieldChanges.find(
        ({ path }) => path === "chatbotPersona",
      );
      const aiTwinChange = status.fieldChanges.find(
        ({ path }) => path === "aiTwinConfiguration",
      );

      expect(status.hasUnpublishedChanges).to.equal(true);
      expect(personaChange.label).to.equal("AI chatbot personality");
      expect(personaChange.from).to.equal("professional");
      expect(personaChange.to).to.equal("friendly");
      expect(aiTwinChange.label).to.equal("AI Twin information");
      expect(aiTwinChange.from).to.equal("1 item: Resume");
      expect(aiTwinChange.to).to.equal("1 item: Resume (updated)");
    });

    it("does not report AI Twin changes when saved and published documents match", () => {
      const savedDocument = document("Same resume");
      const status = getDraftStatus({
        portfolio: {
          title: "Portfolio",
          chatbotPersona: "professional",
          aiTwinConfiguration: { documents: [savedDocument] },
          publishedAiTwinConfiguration: {
            documents: [{ ...savedDocument }],
          },
          publishedContent: {
            title: "Portfolio",
            chatbotPersona: "professional",
            projects: [],
          },
        },
        projects: [],
      });

      expect(
        status.fieldChanges.some(
          ({ path }) =>
            path === "aiTwinConfiguration" || path === "chatbotPersona",
        ),
      ).to.equal(false);
      expect(status.hasUnpublishedChanges).to.equal(false);
    });
  });
}
