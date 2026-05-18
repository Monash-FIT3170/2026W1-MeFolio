// Default portfolio profile data aligned with both the current PortfolioCollection
// shape and the agreed FEAT-05 About Me structure.
// This lets the UI safely load data even while the team is transitioning schema.

export const defaultPortfolioProfileData = {
  userId: "",
  portfolioNumber: 1,

  // Legacy fields kept for compatibility with existing code
  title: "",
  bio: "",

  // Agreed FEAT-05 structure
  profile: {
    fullName: "",
    headline: "",
    avatarUrl: "",
    location: "",
    availability: {
      isAvailable: false,
      label: "",
    },
  },

  about: {
    summary: "",
    highlights: [],
    yearsOfExperience: 0,
  },

  contact: {
    email: "",
    phone: "",
    website: "",
  },

  socials: {
    github: "",
    linkedin: "",
    twitter: "",
    other: [],
  },

  cta: {
    resumeUrl: "",
    contactEnabled: true,
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
    allowAccess: false,
  },
};

// Temporary sample data for testing display before real database data is connected.
export const samplePortfolioProfileData = {
  userId: "Superuser",
  portfolioNumber: 1,

  // Legacy fields kept for compatibility
  title: "Sample Portfolio",
  bio: "This is a sample portfolio.",

  // Agreed FEAT-05 structure
  profile: {
    fullName: "John Doe",
    headline: "Product Designer and Frontend Developer",
    avatarUrl: "",
    location: "Sydney, NSW",
    availability: {
      isAvailable: true,
      label: "Available for hire",
    },
  },

  about: {
    summary:
      "Product designer and frontend developer focused on building clean, user-friendly digital experiences.",
    highlights: ["React", "UI Design", "Frontend Development"],
    yearsOfExperience: 3,
  },

  contact: {
    email: "john@example.com",
    phone: "",
    website: "",
  },

  socials: {
    github: "https://github.com/johndoe",
    linkedin: "https://www.linkedin.com/in/johndoe",
    twitter: "",
    other: [],
  },

  cta: {
    resumeUrl: "https://example.com/resume.pdf",
    contactEnabled: true,
  },

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

    profile: {
      ...defaultPortfolioProfileData.profile,
      ...(portfolio.profile || {}),
      availability: {
        ...defaultPortfolioProfileData.profile.availability,
        ...(portfolio.profile?.availability || {}),
      },
    },

    about: {
      ...defaultPortfolioProfileData.about,
      ...(portfolio.about || {}),
      highlights: Array.isArray(portfolio.about?.highlights)
        ? portfolio.about.highlights
        : [],
    },

    contact: {
      ...defaultPortfolioProfileData.contact,
      ...(portfolio.contact || {}),
    },

    socials: {
      ...defaultPortfolioProfileData.socials,
      ...(portfolio.socials || {}),
      other: Array.isArray(portfolio.socials?.other)
        ? portfolio.socials.other
        : [],
    },

    cta: {
      ...defaultPortfolioProfileData.cta,
      ...(portfolio.cta || {}),
    },

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