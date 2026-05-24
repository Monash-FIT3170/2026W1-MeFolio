import {
  mockAboutMe,
  mockLiveVisitors,
  mockOverviewStats,
  mockProfile,
  mockProjects,
  sidebarItems,
} from "../ui/Portfolio Builder/portfolioBuilderMockData";
import {
  normalisePortfolioProfileData,
  defaultPortfolioProfileData,
  samplePortfolioProfileData,
} from "../api/profileModel";

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
  return portfolios?.length ? mockOverviewStats : mockOverviewStats;
};

// Maps raw visitor/session data into the visitor list format used by the UI.
export const mapLiveVisitors = (portfolios) => {
  return portfolios?.length ? mockLiveVisitors : mockLiveVisitors;
};

const findOwnerUser = (users, portfolio) => {
  if (!Array.isArray(users) || !portfolio?.userId) {
    return null;
  }

  return users.find((user) => user?._id === portfolio.userId) || users[0] || null;
};

// Maps the current portfolio owner into the sidebar/profile settings shape.
export const mapProfile = (portfolio, users = null) => {
  if (!portfolio) return mockProfile;
  const selectedPortfolio = Array.isArray(portfolio) ? portfolio[0] : portfolio;
  if (!selectedPortfolio) return mockProfile;
  const ownerUser = findOwnerUser(users, selectedPortfolio);

  const bio =
    typeof selectedPortfolio.bio === "object" ? selectedPortfolio.bio : {};
  const name =
    selectedPortfolio.profile?.fullName ||
    selectedPortfolio.profile?.name ||
    bio.fullName ||
    ownerUser?.profile?.name ||
    ownerUser?.profile?.fullName ||
    ownerUser?.profile?.userName ||
    selectedPortfolio.title ||
    "Portfolio Owner";
  const email =
    selectedPortfolio.contact?.email ||
    bio.email ||
    selectedPortfolio.email ||
    selectedPortfolio.emails?.[0]?.address ||
    ownerUser?.email ||
    ownerUser?.emails?.[0]?.address ||
    selectedPortfolio.userId ||
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
    username: selectedPortfolio.username || "me",
  };
};

// Maps current user and portfolio fields into the About Me editor/view shape.
export const mapAboutMe = (portfolio) => {
  if (!portfolio) {
    return mockAboutMe;
  }

  return normalisePortfolioProfileData(portfolio);
};

export const mapProjects = (portfolios) => {
  return portfolios?.length ? mockProjects : mockProjects;
};

// Returns the current mock-backed dashboard state while the API is not wired in.
export const createMockDashboardViewModel = (user) => {
  const portfolio = mapAboutMe(samplePortfolioProfileData);
  return {
    isLoading: false,
    sidebarItems,
    overviewStats: mockOverviewStats,
    liveVisitors: mockLiveVisitors,
    profile: mapProfile(portfolio, user),
    aboutMe: portfolio,
    portfolio: portfolio,
    projects: mockProjects,
  };
};

// Builds the single data object the UI consumes, from either loading, mock, or real data.
export const createDashboardViewModel = ({
  isLoading = false,
  portfolios = [],
  projects = null,
  user = null,
} = {}) => {
  if (isLoading) return createLoadingViewModel();
  if (!portfolios.length) return createMockDashboardViewModel(user);

  const normalizedPortfolio = mapAboutMe(portfolios[0]);

  return {
    isLoading: false,
    sidebarItems,
    overviewStats: mapOverviewStats(portfolios),
    liveVisitors: mapLiveVisitors(portfolios),
    profile: mapProfile(portfolios[0], user),
    aboutMe: normalizedPortfolio,
    portfolio: normalizedPortfolio,
    projects: projects || mapProjects(portfolios),
    // profile: mownapProfile(user),
    // aboutMe: mapAboutMe(portfolios[0]),
    // projects: projects || mapProjects(portfolios),
  };
};

// Safely returns the currently selected tab, or a fallback if the list is empty.
export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;
