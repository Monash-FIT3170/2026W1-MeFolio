// Theme ids that have a matching [data-theme] rule in styles.css. A value
// outside this list matches no rule at all, so the subtree would silently
// inherit the surrounding theme instead of falling back to a readable one.
// Older records store "minimal", which was never a defined theme.
export const PUBLISHED_THEMES = [
  "default",
  "minimalist",
  "terminal-retro",
  "modern-saas",
];

export const getPublishedTheme = (theme) =>
  PUBLISHED_THEMES.includes(theme) ? theme : "default";
