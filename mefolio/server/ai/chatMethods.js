import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";
import { answerPortfolioQuestion } from "./chatService.js";

Meteor.methods({
  async "chat.send"({ portfolioId, message }) {
    check(portfolioId, String);
    check(message, String);

    const trimmedMessage = message.trim();

    if (!trimmedMessage || trimmedMessage.length > 2000) {
      throw new Meteor.Error(
        "invalid-message",
        "Message must contain between 1 and 2000 characters.",
      );
    }

    const portfolio = await PortfolioCollection.findOneAsync(
      { _id: portfolioId, isPublished: true },
      { fields: { publishedContent: 1 } },
    );

    if (!portfolio?.publishedContent) {
      throw new Meteor.Error(
        "portfolio-unavailable",
        "This portfolio is not available.",
      );
    }

    try {
      const answer = await answerPortfolioQuestion({
        portfolio: portfolio.publishedContent,
        question: trimmedMessage,
      });

      return { answer };
    } catch (error) {
      console.error("Portfolio AI request failed:", error);
      throw new Meteor.Error(
        "ai-request-failed",
        "The portfolio assistant is temporarily unavailable.",
      );
    }
  },
});