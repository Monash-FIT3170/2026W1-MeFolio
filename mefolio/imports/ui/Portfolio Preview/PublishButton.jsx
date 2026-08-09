// Friendly names for the fields the publish method requires.
export const REQUIRED_FIELD_LABELS = {
  title: "Portfolio title",
  bio: "Bio",
  "profile.fullName": "Your full name",
  projects: "At least one project",
};

// Mirrors the checks inside the portfolios.publish Meteor method so the owner
// is told what is missing before a request goes out. The server stays the
// authority - anything that slips past this is still rejected there.
export const getMissingFields = (portfolio) => {
  if (!portfolio) return [];

  const missingFields = [];

  if (!portfolio.title || !String(portfolio.title).trim()) {
    missingFields.push("title");
  }

  if (!portfolio.bio || !String(portfolio.bio).trim()) {
    missingFields.push("bio");
  }

  const profileName =
    portfolio.profile?.fullName || portfolio.profile?.name || "";
  if (!String(profileName).trim()) {
    missingFields.push("profile.fullName");
  }

  if (!Array.isArray(portfolio.projects) || portfolio.projects.length === 0) {
    missingFields.push("projects");
  }

  return missingFields;
};
