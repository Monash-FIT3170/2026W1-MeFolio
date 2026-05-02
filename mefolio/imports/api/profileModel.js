// Default portfolio profile data aligned with the current PortfolioCollection shape in server/main.js.
// This helps the UI safely load and display portfolio/user information even when fields are missing.

export const defaultPortfolioProfileData = {
  userId: "",
  portfolioNumber: 1,
  title: "",
  bio: "",
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
    allowAccess: false,
  },
};

// Temporary sample data for testing display before real database data is connected.
export const samplePortfolioProfileData = {
  userId: "Superuser",
  portfolioNumber: 1,
  title: "Sample Portfolio",
  bio: "This is a sample portfolio.",
  createdAt: new Date(),
  projects: [],
  theme: "minimal",
  badges: [
    {
      title: "Sample Badge",
      issuer: "Sample Issuer",
      issueDate: new Date(),
      badgeImageUrl: "https://example.com/badge.png",
      verificationUrl: "https://example.com/verify-badge",
    },
  ],
  recruiterInfo: {
    salaryExpectation: "$70,000 - $90,000",
    phoneNumber: "123-456-7890",
    currentLocation: "Sydney NSW",
    availability: "Immediate",
    personalNote: "Looking for opportunities in full-stack development.",
    resumeLink: "https://example.com/resume.pdf",
    allowAccess: true,
  },
};

// Merges loaded portfolio data with default values.
// This prevents the UI from breaking if database data is incomplete.
export function normalisePortfolioProfileData(portfolio = {}) {
  return {
    ...defaultPortfolioProfileData,
    ...portfolio,
    projects: Array.isArray(portfolio.projects) ? portfolio.projects : [],
    badges: Array.isArray(portfolio.badges) ? portfolio.badges : [],
    recruiterInfo: {
      ...defaultPortfolioProfileData.recruiterInfo,
      ...(portfolio.recruiterInfo || {}),
    },
  };
}

// Returns fallback text when a display field is empty.
export function getPortfolioDisplayValue(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
}