import {
  mockAboutMe,
  mockLiveVisitors,
  mockOverviewStats,
  mockProfile,
  sidebarItems,
  samplePortfolioProfileData,
  defaultPortfolioProfileData,
} from "../ui/portfolioBuilderMockData";

// Returns the empty/loading-safe shape expected by the dashboard UI.
export const createLoadingViewModel = () => ({
  isLoading: true,
  sidebarItems: [],
  overviewStats: [],
  liveVisitors: [],
  profile: {},
  aboutMe: {},
});

// Maps raw portfolio analytics into the stat card format used by the overview tab.
export const mapOverviewStats = (portfolios) => {
  return portfolios?.length ? mockOverviewStats : mockOverviewStats;
};

// Maps raw visitor/session data into the visitor list format used by the UI.
export const mapLiveVisitors = (portfolios) => {
  return portfolios?.length ? mockLiveVisitors : mockLiveVisitors;
};

// Maps the current user or portfolio owner into the sidebar profile shape.
export const mapProfile = (portfolio) => {
  if (!portfolio) {
    return mockProfile;
  }

  const bio = typeof portfolio.bio === "object" ? portfolio.bio : {};
  const name =
    portfolio.profile?.fullName ||
    bio.fullName ||
    portfolio.title ||
    "Portfolio Owner";
  const email =
    portfolio.contact?.email ||
    bio.email ||
    portfolio.userId ||
    "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "PO";

  return {
    initials,
    name,
    email,
    username: portfolio.username || "me",
  };
};

// Maps current user and portfolio fields into the About Me editor/view shape.
export const mapAboutMe = (portfolio) => {
  /*
    Teammate handoff:
    Replace this with a pure mapper that returns the agreed FEAT-05 shape:

    {
      profile: {
        fullName,
        headline,
        avatarUrl,
        location,
        availability: {
          isAvailable,
          label,
        },
      },
      about: {
        summary,
        highlights,
        yearsOfExperience,
      },
      contact: {
        email,
        phone,
        website,
      },
      socials: {
        github,
        linkedin,
        twitter,
        other: [{ label, url }],
      },
      cta: {
        resumeUrl,
        contactEnabled,
      },
    }

    Example source fields may come from the signed-in user record plus the
    portfolio document being edited.
  */

  if (!portfolio) {
    return mockAboutMe;
  }

  return {
    ...defaultPortfolioProfileData,
    ...samplePortfolioProfileData,
    ...portfolio,

    profile: {
      ...defaultPortfolioProfileData.profile,
      ...samplePortfolioProfileData.profile,
      ...(portfolio.profile || {}),
      availability: {
        ...defaultPortfolioProfileData.profile.availability,
        ...samplePortfolioProfileData.profile.availability,
        ...(portfolio.profile?.availability || {}),
      },
    },

    about: {
      ...defaultPortfolioProfileData.about,
      ...samplePortfolioProfileData.about,
      ...(portfolio.about || {}),
      highlights: Array.isArray(portfolio.about?.highlights)
        ? portfolio.about.highlights
        : samplePortfolioProfileData.about.highlights,
    },

    contact: {
      ...defaultPortfolioProfileData.contact,
      ...samplePortfolioProfileData.contact,
      ...(portfolio.contact || {}),
    },

    socials: {
      ...defaultPortfolioProfileData.socials,
      ...samplePortfolioProfileData.socials,
      ...(portfolio.socials || {}),
      other: Array.isArray(portfolio.socials?.other)
        ? portfolio.socials.other
        : samplePortfolioProfileData.socials.other,
    },

    cta: {
      ...defaultPortfolioProfileData.cta,
      ...samplePortfolioProfileData.cta,
      ...(portfolio.cta || {}),
    },

    projects: Array.isArray(portfolio.projects) ? portfolio.projects : [],
    badges: Array.isArray(portfolio.badges) ? portfolio.badges : [],
    recruiterInfo: {
      ...defaultPortfolioProfileData.recruiterInfo,
      ...samplePortfolioProfileData.recruiterInfo,
      ...(portfolio.recruiterInfo || {}),
    },
  };
};

// Returns the current mock-backed dashboard state while the API is not wired in.
// TODO: Replace with generic view to be used when users have no portfolio data, or during loading.
export const createMockDashboardViewModel = () => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
  profile: mockProfile,
  aboutMe: mockAboutMe,
});

// Builds the single data object the UI consumes, from either loading, mock, or real data.
export const createDashboardViewModel = ({
  isLoading = false,
  portfolios = [],
} = {}) => {
  if (isLoading) {
    return createLoadingViewModel();
  }

  if (!portfolios.length) {
    return createMockDashboardViewModel();
  }

  return {
    isLoading: false,
    sidebarItems,
    overviewStats: mapOverviewStats(portfolios),
    liveVisitors: mapLiveVisitors(portfolios),
    profile: mapProfile(portfolios[0]),
    aboutMe: mapAboutMe(portfolios[0]),
  };
};

// Safely returns the currently selected tab, or a fallback if the list is empty.
export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;