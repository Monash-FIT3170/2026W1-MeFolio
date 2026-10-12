export const AI_TWIN_CATEGORIES = [
  { value: "resume", label: "Resume / CV" },
  { value: "about", label: "About me" },
  { value: "experience", label: "Work experience" },
  { value: "project", label: "Project" },
  { value: "skills", label: "Skills and technologies" },
  { value: "education", label: "Education and certifications" },
  { value: "achievements", label: "Achievements and awards" },
  { value: "preferences", label: "Role preferences" },
  { value: "interests", label: "Interests and values" },
  { value: "other", label: "Other" },
];

export const AI_TWIN_LIMITS = {
  maxDocuments: 30,
  maxTitleChars: 120,
  maxDocumentChars: 60000,
  maxTotalChars: 300000,
  maxFileBytes: 200000,
};

export const categoryLabel = (value) =>
  AI_TWIN_CATEGORIES.find((category) => category.value === value)?.label ||
  "Other";

export const isValidCategory = (value) =>
  AI_TWIN_CATEGORIES.some((category) => category.value === value);

// Picks a sensible default category from a file name; the user can change it.
export const guessCategory = (fileName = "") => {
  const name = fileName.toLowerCase();
  if (/(resume|\bcv\b)/.test(name)) return "resume";
  if (/readme/.test(name)) return "project";
  if (/(about|bio|cover)/.test(name)) return "about";
  if (/(skill|stack|tech)/.test(name)) return "skills";
  if (/(edu|degree|cert|transcript)/.test(name)) return "education";
  if (/(experience|employment|job)/.test(name)) return "experience";
  return "other";
};
