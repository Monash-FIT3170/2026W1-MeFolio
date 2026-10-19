import {
  sidebarItems,
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

export const mapOverviewStats = (engagements = [], totalViews = 0) => {
  const totalInteractions = engagements.reduce(
    (total, engagement) => total + Number(engagement.clicks || 0),
    0,
  );

  return [
    {
      id: "total-views",
      value: String(Number(totalViews) || 0),
      label: "Total Views",
      change: "0%",
    },
    {
      id: "visitors-now",
      value: "0",
      label: "Visitors Right Now",
      change: "0%",
    },
    {
      id: "interactions",
      value: String(totalInteractions),
      label: "Interactions",
      change: "0%",
    },
    {
      id: "ai-used",
      value: "0",
      label: "AI Chatbot Used",
      change: "0%",
    },
  ];
};

export const mapLiveVisitors = (portfolios) => {
  if (!portfolios?.length) return [];

  const viewers = portfolios?.[0]?.viewers || [];
  if (!viewers.length) return [];

  return viewers.filter(Boolean).map((viewer, index) => {
    const displayName =
      viewer.name && viewer.name !== viewer.userId && viewer.name !== "Guest"
        ? viewer.name
        : "Anonymous Viewer";

    const connectedAt = viewer.connectedAt
      ? new Date(viewer.connectedAt)
      : null;

    const duration = connectedAt
      ? `${Math.max(0, Math.floor((Date.now() - connectedAt) / 60000))} min ago`
      : "Live now";

    return {
      id: viewer.connectionId || viewer.userId || `viewer-${index}`,
      name: displayName,
      email: viewer.email || "",
      activity: "Viewing portfolio",
      location: viewer.userId ? "Signed in" : "Guest",
      duration,
      active: true,
    };
  });
};

export const mapProjects = (projects) => {
  if (!Array.isArray(projects) || !projects.length) return [];

  return projects.map((project, index) => ({
    ...project,
    id: project.id || project._id || `project-${index + 1}`,
    title: project.title || project.name || "Untitled project",
    description: project.description || "",
    technologies: Array.isArray(project.technologies)
      ? project.technologies
      : [],
    githubLink: project.githubLink || project.githubUrl || "",
    liveDemoLink: project.liveDemoLink || project.demoUrl || "",
  }));
};

const getProfileInitials = (name = "", email = "") => {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
};

export const mapProfile = (user) => {
  if (!user) {
    return {
      initials: "",
      name: "",
      email: "",
    };
  }

  const selectedUser = Array.isArray(user) ? user[0] : user;
  const googleProfile = selectedUser.services?.google;
  const githubProfile = selectedUser.services?.github;

  const email =
    selectedUser.email ||
    selectedUser.emails?.[0]?.address ||
    googleProfile?.email ||
    githubProfile?.email ||
    "";

  const name =
    selectedUser.profile?.name ||
    googleProfile?.name ||
    githubProfile?.name ||
    githubProfile?.username ||
    email.split("@")[0] ||
    "";

  return {
    initials: getProfileInitials(name, email),
    name,
    email,
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
      ...(portfolio.recruiterInfo || {}),
    },
  };
};

export const createDashboardViewModel = ({
  isLoading = false,
  portfolios = [],
  projects = null,
  engagements = [],
  user = null,
} = {}) => {
  if (isLoading) return createLoadingViewModel();

  if (!portfolios.length) {
    return {
      isLoading: false,
      sidebarItems,
      overviewStats: mapOverviewStats(engagements),
      liveVisitors: [],
      profile: mapProfile(user),
      aboutMe: mapAboutMe(defaultPortfolioProfileData),
      projects: [],
    };
  }

  return {
    isLoading: false,
    sidebarItems,
    overviewStats: mapOverviewStats(engagements, portfolios[0]?.totalViews),
    liveVisitors: mapLiveVisitors(portfolios),
    profile: mapProfile(user),
    aboutMe: mapAboutMe(portfolios[0]),
    projects: mapProjects(projects),
  };
};

export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;
