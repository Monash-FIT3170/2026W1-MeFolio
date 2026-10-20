import { Meteor } from "meteor/meteor";

const trimmedText = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Whether a project reads its custom case-study narration rather than its
 * description. Projects saved before the owner could choose keep using their
 * custom narration when they have one.
 */
export const usesCustomNarration = (project) =>
  typeof project?.useCustomNarration === "boolean"
    ? project.useCustomNarration
    : Boolean(trimmedText(project?.caseStudyNarrative));

/**
 * Builds the text read aloud for a project's narration: the owner's custom
 * case study when switched on, otherwise the public description.
 */
export const buildNarrationText = (project) => {
  const customText = trimmedText(project?.caseStudyNarrative);
  if (usesCustomNarration(project) && customText) return customText;
  return trimmedText(project?.description);
};

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
