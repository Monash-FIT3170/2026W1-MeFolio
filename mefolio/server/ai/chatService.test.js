import { expect } from "chai";
import { buildSystemPrompt } from "./chatService.js";

if (Meteor.isServer) {
  describe("chatService", function () {
    it("includes friendly persona instructions in the system prompt", function () {
      const prompt = buildSystemPrompt({
        chatbotPersona: "friendly",
        bio: "Portfolio context",
      });

      expect(prompt).to.include("You are a friendly portfolio assistant.");
      expect(prompt).to.include(
        "Use a warm, approachable, and conversational tone.",
      );
      expect(prompt).to.include("Portfolio context");
    });

    it("includes casual persona instructions in the system prompt", function () {
      const prompt = buildSystemPrompt({ chatbotPersona: "casual" });

      expect(prompt).to.include("You are a casual portfolio assistant.");
      expect(prompt).to.include("Use a relaxed, informal, and friendly tone.");
    });

    it("uses the professional default for unsupported persona IDs", function () {
      const prompt = buildSystemPrompt({
        chatbotPersona: "untrusted-prompt",
      });

      expect(prompt).to.include("You are a professional portfolio assistant.");
      expect(prompt).to.not.include("You are a untrusted-prompt");
    });
  });
}
