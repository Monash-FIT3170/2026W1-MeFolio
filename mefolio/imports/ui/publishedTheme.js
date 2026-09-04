// Theme ids that have a matching [data-theme] rule in styles.css. A value
// outside this list matches no rule at all, so the subtree would silently
// inherit the outer theme instead of falling back to a readable one. Older
// records store "minimal", which was never a defined theme.
export const PUBLISHED_THEMES = [
  "default",
  "minimalist",
  "terminal-retro",
  "modern-saas",
];

// Resolves a stored theme id to one that has a real [data-theme] rule, so a
// published snapshot always renders in a defined theme rather than silently
// inheriting whatever theme is in scope around it.
export const getPublishedTheme = (theme) =>
  PUBLISHED_THEMES.includes(theme) ? theme : "default";
