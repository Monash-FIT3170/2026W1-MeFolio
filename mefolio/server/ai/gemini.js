import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Meteor } from "meteor/meteor";

export const createGeminiModel = () => {
  const settings = Meteor.settings?.private?.gemini;

  if (!settings?.apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  return new ChatGoogleGenerativeAI({
    apiKey: settings.apiKey,
    model: settings.model || "gemini-3.8-flash",
    temperature: 0.2,
    maxRetries: 2,
  });
};