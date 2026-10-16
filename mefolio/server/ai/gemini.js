import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Meteor } from "meteor/meteor";

export const createGeminiModel = ({ model, temperature = 0.2 } = {}) => {
  const settings = Meteor.settings?.private?.gemini;

  if (!settings?.apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  return new ChatGoogleGenerativeAI({
    apiKey: settings.apiKey,
    model: model || settings.model || "gemini-3.8-flash",
    temperature,
    maxRetries: 2,
  });
};

export const createGeminiRouterModel = () =>
  createGeminiModel({
    model: Meteor.settings?.private?.gemini?.routerModel,
    temperature: 0,
  });
