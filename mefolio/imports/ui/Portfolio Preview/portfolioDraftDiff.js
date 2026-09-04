const FIELD_LABELS = {
  title: "Portfolio title",
  bio: "Bio",
  theme: "Theme",
  "profile.fullName": "Full name",
  "profile.headline": "Headline",
  "profile.avatarUrl": "Avatar",
  "profile.location": "Location",
  "profile.availability.isAvailable": "Availability status",
  "profile.availability.label": "Availability label",
  "about.summary": "About summary",
  "about.highlights": "Highlighted skills",
  "about.yearsOfExperience": "Years of experience",
  "contact.email": "Contact email",
  "contact.phone": "Contact phone",
  "contact.website": "Contact website",
  "socials.github": "GitHub link",
  "socials.linkedin": "LinkedIn link",
  "socials.twitter": "Twitter link",
  "socials.other": "Other social links",
  "cta.resumeUrl": "Resume link",
  "cta.contactEnabled": "Contact button enabled",
};

const getByPath = (obj, path) =>
  path
    .split(".")
    .reduce((value, key) => (value == null ? undefined : value[key]), obj);
const valuesAreEqual = (a, b) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
export const formatDiffValue = (value) => {
  if (value === undefined || value === null || value === "") return "(empty)";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "(empty)";
  return String(value);
};

export const diffPortfolioFields = (draft, live) => {
  if (!live) {
    return Object.entries(FIELD_LABELS)
      .map(([path, label]) => ({
        path,
        label,
        from: undefined,
        to: getByPath(draft, path),
      }))
      .filter((change) => formatDiffValue(change.to) !== "(empty)");
  }
  return Object.entries(FIELD_LABELS)
    .map(([path, label]) => ({
      path,
      label,
      from: getByPath(live, path),
      to: getByPath(draft, path),
    }))
    .filter((change) => !valuesAreEqual(change.from, change.to));
};

const PROJECT_COMPARISON_KEYS = [
  "title",
  "description",
  "technologies",
  "githubLink",
  "liveDemoLink",
  "media",
];

const pickComparable = (project) =>
  PROJECT_COMPARISON_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: project?.[key] }),
    {},
  );

export const diffPortfolioProjects = (
  draftProjects = [],
  liveProjects = [],
) => {
  const draftById = new Map(draftProjects.map((p) => [p._id || p.id, p]));
  const liveById = new Map(liveProjects.map((p) => [p._id, p]));

  const added = [...draftById.values()].filter(
    (p) => !liveById.has(p._id || p.id),
  );
  const removed = [...liveById.values()].filter((p) => !draftById.has(p._id));
  const modified = [...draftById.values()].filter((p) => {
    const liveProject = liveById.get(p._id || p.id);
    if (!liveProject) {
      return false;
    }
    return !valuesAreEqual(pickComparable(p), pickComparable(liveProject));
  });
  return { added, removed, modified };
};

export const getDraftStatus = ({ portfolio, projects = [] }) => {
  if (!portfolio) {
    return {
      neverPublished: true,
      hasUnpublishedChanges: false,
      fieldChanges: [],
      projectChanges: { added: [], removed: [], modified: [] },
    };
  }

  const live = portfolio.publishedContent || null;
  const fieldChanges = diffPortfolioFields(portfolio, live);
  const projectChanges = diffPortfolioProjects(projects, live?.projects || []);
  const hasProjectChanges =
    projectChanges.added.length > 0 ||
    projectChanges.removed.length > 0 ||
    projectChanges.modified.length > 0;

  return {
    neverPublished: !live,
    hasUnpublishedChanges: fieldChanges.length > 0 || hasProjectChanges,
    fieldChanges,
    projectChanges,
  };
};
