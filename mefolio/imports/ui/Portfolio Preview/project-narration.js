export function generateProjectNarration(text) {
  if (typeof text !== "string" || !text.trim() || text.trim().length > 5000) {
    throw new Error(
      "Project text must contain between 1 and 5,000 characters.",
    );
  }

  if (
    !globalThis.speechSynthesis ||
    typeof globalThis.SpeechSynthesisUtterance !== "function"
  ) {
    throw new Error("Your browser does not support project narration.");
  }

  const utterance = new globalThis.SpeechSynthesisUtterance(text.trim());
  globalThis.speechSynthesis.cancel();
  globalThis.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopProjectNarration() {
  globalThis.speechSynthesis?.cancel();
}
