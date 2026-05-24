import {
  mockAboutMe,
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

export const mapProjects = (projects) => {
  if (!Array.isArray(projects) || !projects.length) return mockProjects;

  return projects.map((project, index) => ({
    ...project,
    id: project.id || project._id || `project-${index + 1}`,
    title: project.title || project.name || "Untitled project",
    description: project.description || "",
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
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

  return email.slice(0, 2).toUpperCase() || mockProfile.initials;
};

export const mapProfile = (user) => {
  if (!user) return mockProfile;

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
export const mapAboutMe = (portfolio) => {
  if (!portfolio) {
    return mockAboutMe;
  }

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

export const createMockDashboardViewModel = (user) => ({
  isLoading: false,
  sidebarItems,
  overviewStats: mockOverviewStats,
  liveVisitors: mockLiveVisitors,
  profile: mapProfile(user),
  aboutMe: mapAboutMe(samplePortfolioProfileData),
  projects: mockProjects,
});

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
    projects: mapProjects(projects),
  };
};

export const getCurrentTab = (items, activeTab) =>
  items.find((item) => item.id === activeTab) ?? items[0] ?? null;