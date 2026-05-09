import {
  mockLiveVisitors,
  mockOverviewStats,
  mockProfile,
  mockProjects,
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
  projects: [],
});

// Maps raw portfolio analytics into the stat card format used by the overview tab.
export const mapOverviewStats = (portfolios) => {
  /*
    Teammate handoff:
    Replace this mock fallback with a pure transformation from collection data.
    Example inputs could be portfolio analytics, engagement counts, or AI usage.
  */
  return portfolios?.length ? mockOverviewStats : mockOverviewStats;
};

// Maps raw visitor/session data into the visitor list format used by the UI.
export const mapLiveVisitors = (portfolios) => {
  /*
    Teammate handoff:
    Replace this with a pure mapper from raw visitor/session data into:
    { id, name, email, activity, location, duration, active }
  */
  return portfolios?.length ? mockLiveVisitors : mockLiveVisitors;
};

// Maps the current user or portfolio owner into the sidebar profile shape.
export const mapProfile = (user) => {
  if (!user) {
    return mockProfile;
  }

  const selectedUser = Array.isArray(user) ? user[0] : user;

  if (!selectedUser) {
    return mockProfile;
  }

  return {
    name: selectedUser.name || mockProfile.name,
    role: selectedUser.role || mockProfile.role,
    avatar: selectedUser.avatar || mockProfile.avatar,
  };
};

// Maps profile/about-me data into the settings tab format.
export const mapAboutMe = (portfolio) => {
  const source = portfolio || samplePortfolioProfileData || defaultPortfolioProfileData;

  return {
    fullName: source?.fullName || defaultPortfolioProfileData.fullName,
    professionalTitle:
      source?.professionalTitle || defaultPortfolioProfileData.professionalTitle,
    shortBio: source?.shortBio || defaultPortfolioProfileData.shortBio,
    email: source?.email || defaultPortfolioProfileData.email,
    phone: source?.phone || defaultPortfolioProfileData.phone,
    location: source?.location || defaultPortfolioProfileData.location,
    linkedIn: source?.linkedIn || defaultPortfolioProfileData.linkedIn,
    github: source?.github || defaultPortfolioProfileData.github,
    portfolioUrl:
      source?.portfolioUrl || defaultPortfolioProfileData.portfolioUrl,
  };
};

// Maps project data into the project ordering format used by the Projects tab.
export const mapProjects = (portfolios) => {
  /*
    Teammate handoff:
    Replace this mock fallback with real project data once project ordering
    is connected to the database.
  */
  return portfolios?.length ? mockProjects : mockProjects;
};

// Creates a mock dashboard model for local/demo usage.
export const createMockDashboardViewModel = (user) => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
  profile: mapProfile(user),
  aboutMe: mapAboutMe(samplePortfolioProfileData),
  projects: mockProjects,
});

// Gets the current selected tab from the sidebar list.
export const getCurrentTab = (items, activeTab) => {
  return items.find((item) => item.id === activeTab);
};

// Creates the full dashboard view model from loading state, portfolios, and user data.
export const createDashboardViewModel = ({
  isLoading = false,
  portfolios = [],
  user = null,
} = {}) => {
  if (isLoading) {
    return createLoadingViewModel();
  }

  return {
    isLoading: false,
    sidebarItems,
    overviewStats: mapOverviewStats(portfolios),
    liveVisitors: mapLiveVisitors(portfolios),
    profile: mapProfile(user),
    aboutMe: mapAboutMe(portfolios[0]),
    projects: mapProjects(portfolios),
  };
};