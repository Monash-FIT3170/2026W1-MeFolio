import {
  mockLiveVisitors,
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
export const mapProfile = (portfolio) => {
  /*
    Teammate handoff:
    Replace this with a pure mapper from the current user or portfolio owner
    into: { initials, name, email }
  */
  return portfolio ? mockProfile : mockProfile;
};

// Returns the current mock-backed dashboard state while the API is not wired in.
export const createMockDashboardViewModel = () => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
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

  /*
    Suggested Meteor integration skeleton:

    import { Meteor } from "meteor/meteor";
    import { useTracker } from "meteor/react-meteor-data";
    import { PortfolioCollection } from "../api/portfolio";

    const useDashboardData = () =>
      useTracker(() => {
        const portfoliosHandler = Meteor.subscribe("portfolios.all");
        const portfolios = PortfolioCollection.find({}).fetch();

        return {
          isLoading: !portfoliosHandler.ready(),
          portfolios,
        };
      });

    In the component:

    const { isLoading, portfolios } = useDashboardData();
    const viewModel = createDashboardViewModel({ isLoading, portfolios });
  */

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
