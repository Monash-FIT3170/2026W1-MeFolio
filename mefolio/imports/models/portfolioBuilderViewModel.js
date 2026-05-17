import {
  mockLiveVisitors,
  mockOverviewStats,
  mockProfile,
  mockProjects,
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
  projects: [],
  profile: {},
  aboutMe: {}
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

// Maps portfolio project data into the project order cards used by the Projects tab.
export const mapProjects = (portfolios) => {
  const portfolioProjects = portfolios?.[0]?.projects;

  if (!Array.isArray(portfolioProjects) || !portfolioProjects.length) {
    return mockProjects;
  }

  return portfolioProjects.map((project, index) => ({
    id: project.id || project._id || `project-${index + 1}`,
    title: project.title || project.name || "Untitled project",
    description: project.description || "",
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    githubLink: project.githubLink || project.githubUrl || "",
    liveDemoLink: project.liveDemoLink || project.demoUrl || ""
  }));
};

// Maps the current user or portfolio owner into the sidebar profile shape.
export const mapProfile = (user) => {
  if (!user) {
    return mockProfile;
  }

  return {
    name: user.profile?.name || "",
    email: user.email || user.emails?.[0]?.address || ""
  };
};

// Maps current user and portfolio fields into the About Me editor/view shape.
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
  };
};

// Returns the current mock-backed dashboard state while the API is not wired in.
// TODO: Replace with generic view to be used when users have no portfolio data, or during loading.
export const createMockDashboardViewModel = (user) => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
  projects: mockProjects,
  profile: mapProfile(user),
  aboutMe: mapAboutMe(samplePortfolioProfileData)
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
    projects: mapProjects(portfolios),
    profile: mapProfile(user),
    aboutMe: mapAboutMe(portfolios[0])
  };
};

// Safely returns the currently selected tab, or a fallback if the list is empty.
export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;
