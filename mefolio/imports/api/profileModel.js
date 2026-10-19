// Default portfolio profile data aligned with the current PortfolioCollection shape in server/main.js.
// This helps the UI safely load and display portfolio/user information even when fields are missing.

export const defaultPortfolioProfileData = {
  userId: "",
  portfolioNumber: 1,
  title: "",
  isPublished: false,
  publishedContent: null,
  bio: {
    fullName: "",
    email: "",
    headline: "",
    professionalSummary: "",
    location: "",
    yearsOfExperience: 0,
    phone: "",
    highlights: [],
  },
  createdAt: null,
  projects: [],
  theme: "minimal",
  badges: [],
  recruiterInfo: {
    salaryExpectation: "",
    phoneNumber: "",
    currentLocation: "",
    availability: "",
    personalNote: "",
    resumeLink: "",
    resumeLinks: [],
    allowAccess: false,
  },
};

// Merges loaded portfolio data with default values.
// This prevents the UI from breaking if database data is incomplete.
export function normalisePortfolioProfileData(portfolio = {}) {
  const recruiterInfo = {
    ...defaultPortfolioProfileData.recruiterInfo,
    ...(portfolio.recruiterInfo || {}),
  };

  if (!Array.isArray(recruiterInfo.resumeLinks)) {
    recruiterInfo.resumeLinks = recruiterInfo.resumeLink
      ? [
          {
            name: recruiterInfo.resumeLink.split("/").pop() || "Resume.pdf",
            url: recruiterInfo.resumeLink,
          },
        ]
      : [];
  }

  return {
    ...defaultPortfolioProfileData,
    ...portfolio,
    projects: Array.isArray(portfolio.projects) ? portfolio.projects : [],
    badges: Array.isArray(portfolio.badges) ? portfolio.badges : [],
    recruiterInfo,
  };
}

// Returns fallback text when a display field is empty.
export function getPortfolioDisplayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
}
