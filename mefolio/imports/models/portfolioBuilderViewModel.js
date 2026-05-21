import {
  mockAboutMe,
  mockLiveVisitors,
  mockOverviewStats,
  mockProfile,
  mockProjects,
  sidebarItems,
  samplePortfolioProfileData,
  defaultPortfolioProfileData,
<<<<<<< HEAD
} from "../ui/portfolioBuilderMockData";
=======
} from "../ui/Portfolio Builder/portfolioBuilderMockData";
>>>>>>> FEAT-05-Merge-Dev

// Returns the empty/loading-safe shape expected by the dashboard UI.
export const createLoadingViewModel = () => ({
  isLoading: true,
  sidebarItems: [],
  overviewStats: [],
  liveVisitors: [],
  profile: {},
  aboutMe: {},
<<<<<<< HEAD
=======
  projects: [],
>>>>>>> FEAT-05-Merge-Dev
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
export const mapProfile = (user) => {
  if (!user) return mockProfile;
  const selectedUser = Array.isArray(user) ? user[0] : user;
  return {
    name: selectedUser.profile?.name || "",
    email: selectedUser.email || "",
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
      ...(portfolio.recruiterInfo || {}),
    },
  };
};

export const mapProjects = (portfolios) => {
  return portfolios?.length ? mockProjects : mockProjects;
};

// Returns the current mock-backed dashboard state while the API is not wired in.
export const createMockDashboardViewModel = (user) => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
  profile: mapProfile(user),
  aboutMe: mapAboutMe(samplePortfolioProfileData),
  projects: mockProjects,
});

// Builds the single data object the UI consumes, from either loading, mock, or real data.
export const createDashboardViewModel = ({
  isLoading = false,
  portfolios = [],
  projects = null,
  user = null,
} = {}) => {
  if (isLoading) return createLoadingViewModel();
  if (!portfolios.length) return createMockDashboardViewModel(user);

  return {
    isLoading: false,
    sidebarItems,
    overviewStats: mapOverviewStats(portfolios),
    liveVisitors: mapLiveVisitors(portfolios),
    profile: mapProfile(user),
    aboutMe: mapAboutMe(portfolios[0]),
    projects: projects || mapProjects(portfolios),
  };
};

// Safely returns the currently selected tab, or a fallback if the list is empty.
export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;