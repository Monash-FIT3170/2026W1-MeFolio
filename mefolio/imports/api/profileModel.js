// Default structure for user profile data.
// Used so the Overview/Profile UI can safely display fields even when database data is incomplete.

export const defaultProfileData = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  roleTitle: "",
  bio: "",
  skills: [],
  githubUrl: "",
  linkedinUrl: "",
  resumeUrl: "",
};

// Temporary sample data for testing the profile display before real database data is connected.
export const sampleProfileData = {
  fullName: "Example User",
  email: "example@email.com",
  phone: "",
  location: "Melbourne, Australia",
  roleTitle: "Software Engineering Student",
  bio: "This is a short professional bio that will be displayed on the portfolio overview page.",
  skills: ["React", "JavaScript", "Meteor", "MongoDB"],
  githubUrl: "https://github.com/example",
  linkedinUrl: "https://linkedin.com/in/example",
  resumeUrl: "",
};

// Merges database profile data with default values.
// This prevents UI errors when some profile fields are missing.
export function normaliseProfileData(profile = {}) {
  return {
    ...defaultProfileData,
    ...profile,
    skills: Array.isArray(profile.skills) ? profile.skills : [],
  };
}

// Returns fallback text when a profile field is empty.
export function getProfileDisplayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
}