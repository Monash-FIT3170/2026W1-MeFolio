import {
  mockOverviewStats,
  mockProfile,
  sidebarItems,
} from "./portfolioBuilderMockData";

// Returns the empty/loading-safe shape expected by the dashboard UI.
export const createLoadingViewModel = () => ({
  isLoading: true,
  sidebarItems: [],
  overviewStats: [],
  liveVisitors: [],
  profile: {},
});

// Maps raw portfolio analytics into the stat card format used by the overview tab.
export const mapOverviewStats = (portfolios) => {
  return portfolios?.length ? mockOverviewStats : mockOverviewStats;
};

// Maps raw visitor/session data into the visitor list format used by the UI.
export const mapLiveVisitors = (portfolios) => {
  if (!portfolios?.length) {
    return [];
  }

  const viewers = portfolios[0]?.viewers || [];
  if (!viewers.length) {
    return [];
  }

  return viewers.map((viewer, index) => {
    const connectedAt = viewer.connectedAt
      ? new Date(viewer.connectedAt)
      : null;
    const duration = connectedAt
      ? `${Math.max(0, Math.floor((Date.now() - connectedAt) / 60000))} min ago`
      : "Live now";

    return {
      id: viewer.connectionId || viewer.userId || `viewer-${index}-${Date.now()}`,
      name: viewer.name || "Anonymous Visitor",
      email: viewer.email || "",
      activity: "Viewing portfolio",
      location: viewer.userId ? "Signed in" : "Guest",
      duration,
      active: true,
    };
  });
};

// Maps the current user or portfolio owner into the sidebar profile shape.
export const mapProfile = (portfolio) => {
  if (!portfolio) {
    return mockProfile;
  }

  const bio = typeof portfolio.bio === "object" ? portfolio.bio : {};
  const name = bio.fullName || portfolio.title || "Portfolio Owner";
  const email = bio.email || portfolio.userId || "";
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "PO";

  return {
    initials,
    name,
    email,
  };
};

// Returns the current mock-backed dashboard state while the API is not wired in.
export const createMockDashboardViewModel = () => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: [],
  profile: mockProfile,
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
  };
};

// Safely returns the currently selected tab, or a fallback if the list is empty.
export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;
