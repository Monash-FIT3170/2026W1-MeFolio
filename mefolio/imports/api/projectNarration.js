/**
 * Builds the text read aloud for a project's story, so the visitor's audio
 * and the owner's draft preview narrate exactly the same content.
 */
export const buildNarrationText = (project) =>
  [project?.title, project?.description]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim())
    .join(". ");
