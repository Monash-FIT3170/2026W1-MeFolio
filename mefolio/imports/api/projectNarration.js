import { Meteor } from "meteor/meteor";

/**
 * Builds the private case-study text read aloud for a project's narration.
 */
export const buildNarrationText = (project) =>
  typeof project?.caseStudyNarrative === "string"
    ? project.caseStudyNarrative.trim()
    : "";

export const isProjectNarrationEnabled = (settings = Meteor.settings) =>
  settings?.public?.features?.projectNarration !== false;

/**
 * Whether narration is switched on for a portfolio. Works on both the draft
 * portfolio and its published snapshot, since both carry `narrationEnabled`.
 * Portfolios saved before the owner toggle existed default to on.
 */
export const isPortfolioNarrationEnabled = (
  portfolio,
  settings = Meteor.settings,
) =>
  isProjectNarrationEnabled(settings) && portfolio?.narrationEnabled !== false;
