import {
  mockLiveVisitors,
  mockOverviewStats,
  mockProfile,
  mockProjects,
  sidebarItems,
  samplePortfolioProfileData,
  defaultPortfolioProfileData,
} from "../ui/Portfolio Builder/portfolioBuilderMockData";

export const createLoadingViewModel = () => ({
  isLoading: true,
  sidebarItems: [],
  overviewStats: [],
  liveVisitors: [],
  profile: {},
  aboutMe: {},
  projects: [],
});

export const mapOverviewStats = (portfolios) => {
  return portfolios?.length ? mockOverviewStats : mockOverviewStats;
};

export const mapLiveVisitors = (portfolios) => {
  return portfolios?.length ? mockLiveVisitors : mockLiveVisitors;
};

export const mapProfile = (user) => {
  if (!user) {
    return mockProfile;
  }
  const selectedUser = Array.isArray(user) ? user[0] : user;

  return {
    name: selectedUser.profile?.name || "",
    email: selectedUser.email || "",
  };
};

export const mapAboutMe = (portfolio) => {
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
};

export const mapProjects = (portfolios) => {
  return portfolios?.length ? mockProjects : mockProjects;
};

export const createMockDashboardViewModel = (user) => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
  profile: mapProfile(user),
  aboutMe: mapAboutMe(samplePortfolioProfileData),
  projects: mockProjects,
});

export const getCurrentTab = (items, activeTab) => {
  return items.find((item) => item.id === activeTab);
};

export const createDashboardViewModel = ({
  isLoading = false,
  portfolios = [],
  user = null,
} = {}) => {
  if (isLoading) {
    return createLoadingViewModel();
  }

  if (!portfolios.length) {
    return createMockDashboardViewModel(user);
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
