export const CHATBOT_PERSONAS = [
  {
    id: "professional",
    label: "Professional",
    description: "Polished and formal, with concise answers.",
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Warm and approachable while staying informative.",
  },
  {
    id: "casual",
    label: "Casual",
    description: "Relaxed and informal, with a friendly tone.",
  },
];

export const DEFAULT_CHATBOT_PERSONA = "professional";

export const isChatbotPersona = (persona) =>
  CHATBOT_PERSONAS.some(({ id }) => id === persona);
