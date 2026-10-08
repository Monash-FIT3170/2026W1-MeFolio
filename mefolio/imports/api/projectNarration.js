/**
 * Builds the private case-study text read aloud for a project's narration.
 */
export const buildNarrationText = (project) =>
  typeof project?.caseStudyNarrative === "string"
    ? project.caseStudyNarrative.trim()
    : "";
