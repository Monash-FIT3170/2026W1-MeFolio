import {
  mockAboutMe,
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
  aboutMe: {},
  portfolioId: null,
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
  };
};

// Maps current user and portfolio fields into the About Me editor/view shape.
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
  };
};

// Returns the current mock-backed dashboard state while the API is not wired in.
export const createMockDashboardViewModel = () => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
  profile: mockProfile,
  aboutMe: mockAboutMe,
  portfolioId: "mock-portfolio-id",
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
    aboutMe: mapAboutMe(portfolios[0]),
    portfolioId: portfolios[0]._id,
  };
};

// Safely returns the currently selected tab, or a fallback if the list is empty.
export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;
