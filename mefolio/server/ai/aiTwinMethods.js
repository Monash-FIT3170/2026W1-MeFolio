import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { PortfolioCollection } from "/imports/api/portfolio";
import {
  AI_TWIN_LIMITS,
  isValidCategory,
} from "/imports/models/aiTwinCategories.js";

const DocumentPattern = {
  id: String,
  kind: Match.OneOf("text", "file"),
  title: String,
  category: String,
  content: String,
  fileName: Match.Optional(String),
};

Meteor.methods({
  async "portfolios.saveAiTwinConfiguration"(portfolioId, configuration) {
    check(portfolioId, String);
    check(configuration, { documents: [DocumentPattern] });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "Please sign in to save.");
    }

    // Adjust the owner field to match your portfolio schema.
    const portfolio = await PortfolioCollection.findOneAsync(
      { _id: portfolioId },
      { fields: { userId: 1 } },
    );
    if (!portfolio || portfolio.userId !== this.userId) {
      throw new Meteor.Error(
        "not-authorized",
        "You can't edit this portfolio.",
      );
    }

    const { documents } = configuration;
    if (documents.length > AI_TWIN_LIMITS.maxDocuments) {
      throw new Meteor.Error("too-many", "Too many items.");
    }

    const cleaned = documents.map((doc) => {
      const content = doc.content.trim();
      if (!content || content.length > AI_TWIN_LIMITS.maxDocumentChars) {
        throw new Meteor.Error(
          "invalid-size",
          `"${doc.title}" is empty or too long.`,
        );
      }
      return {
        id: doc.id,
        kind: doc.kind,
        title:
          doc.title.trim().slice(0, AI_TWIN_LIMITS.maxTitleChars) || "Untitled",
        category: isValidCategory(doc.category) ? doc.category : "other",
        content,
        ...(doc.fileName ? { fileName: doc.fileName.slice(0, 255) } : {}),
      };
    });

    const total = cleaned.reduce((sum, doc) => sum + doc.content.length, 0);
    if (total > AI_TWIN_LIMITS.maxTotalChars) {
      throw new Meteor.Error("too-large", "Total content is too large.");
    }

    await PortfolioCollection.updateAsync(
      { _id: portfolioId },
      {
        $set: {
          aiTwinConfiguration: { documents: cleaned, updatedAt: new Date() },
        },
      },
    );

    return { count: cleaned.length };
  },
});
