import {
  mockLiveVisitors,
  mockOverviewStats,
  mockProfile,
  sidebarItems,
  samplePortfolioProfileData,
  defaultPortfolioProfileData
} from "../ui/portfolioBuilderMockData";

// Returns the empty/loading-safe shape expected by the dashboard UI.
export const createLoadingViewModel = () => ({
  isLoading: true,
  sidebarItems: [],
  overviewStats: [],
  liveVisitors: [],
  profile: {},
<<<<<<< HEAD:mefolio/imports/models/portfolioBuilderViewModel.js
  aboutMe: {}
=======
  aboutMe: {},
  portfolioId: null,
>>>>>>> e480147 (feat: implement About Me personal info section):mefolio/imports/ui/portfolioBuilderViewModel.js
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
<<<<<<< HEAD:mefolio/imports/models/portfolioBuilderViewModel.js
export const mapProfile = (user) => {
  if (!user) {
    return mockProfile;
  }

  return {
    name: user.profile?.name || "",
    email: user.email || ""
=======
export const mapProfile = (portfolio) => {
  if (!portfolio) {
    return mockProfile;
  }

  const bio = typeof portfolio.bio === "object" ? portfolio.bio : {};
  const name = bio.fullName || portfolio.title || "Portfolio Owner";
  const email = bio.email || portfolio.userId || "";
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
>>>>>>> e480147 (feat: implement About Me personal info section):mefolio/imports/ui/portfolioBuilderViewModel.js
  };
};

// Maps current user and portfolio fields into the About Me editor/view shape.
<<<<<<< HEAD:mefolio/imports/models/portfolioBuilderViewModel.js
export const mapAboutMe = (portfolio = {}) => {
  return {
    ...defaultPortfolioProfileData,
    ...portfolio,
    projects: Array.isArray(portfolio.projects) ? portfolio.projects : [],
    badges: Array.isArray(portfolio.badges) ? portfolio.badges : [],
    recruiterInfo: {
      ...defaultPortfolioProfileData.recruiterInfo,
      ...(portfolio.recruiterInfo || {})
    }
=======
export const mapAboutMe = (portfolio) => {
  if (!portfolio) {
    return mockAboutMe;
  }

  const bio = typeof portfolio.bio === "object" ? portfolio.bio : {
    professionalSummary: portfolio.bio,
  };

  return {
    fullName: bio.fullName || "",
    email: bio.email || "",
    headline: bio.headline || "",
    professionalSummary: bio.professionalSummary || "",
    location: bio.location || "",
    yearsOfExperience: bio.yearsOfExperience ?? 0,
    phone: bio.phone || "",
    highlights: Array.isArray(bio.highlights) ? bio.highlights : [],
    signInEmail: bio.signInEmail || "",
    linkedinUrl: bio.linkedinUrl || "",
    githubUrl: bio.githubUrl || "",
    portfolioTitle: portfolio.title || "",
>>>>>>> e480147 (feat: implement About Me personal info section):mefolio/imports/ui/portfolioBuilderViewModel.js
  };
};

// Returns the current mock-backed dashboard state while the API is not wired in.
// TODO: Replace with generic view to be used when users have no portfolio data, or during loading.
export const createMockDashboardViewModel = (user) => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
<<<<<<< HEAD:mefolio/imports/models/portfolioBuilderViewModel.js
  profile: mapProfile(user),
  aboutMe: mapAboutMe(samplePortfolioProfileData)
=======
  profile: mockProfile,
  aboutMe: mockAboutMe,
  portfolioId: "mock-portfolio-id",
>>>>>>> e480147 (feat: implement About Me personal info section):mefolio/imports/ui/portfolioBuilderViewModel.js
});

// Builds the single data object the UI consumes, from either loading, mock, or real data.
export const createDashboardViewModel = ({
  isLoading = false,
  portfolios = [],
  user = null
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
<<<<<<< HEAD:mefolio/imports/models/portfolioBuilderViewModel.js
    profile: mapProfile(user[0]),
    aboutMe: mapAboutMe(portfolios[0])
=======
    profile: mapProfile(portfolios[0]),
    aboutMe: mapAboutMe(portfolios[0]),
    portfolioId: portfolios[0]._id,
>>>>>>> e480147 (feat: implement About Me personal info section):mefolio/imports/ui/portfolioBuilderViewModel.js
  };
};

// Safely returns the currently selected tab, or a fallback if the list is empty.
export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;
