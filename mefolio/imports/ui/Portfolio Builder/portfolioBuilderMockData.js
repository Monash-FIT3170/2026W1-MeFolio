export const sidebarItems = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
  { id: "about-me", label: "About Me" },
  { id: "analytics", label: "Analytics" },
  { id: "visitors", label: "Live Visitors" },
  { id: "ai-twin", label: "AI Twin" },
  { id: "recruiter", label: "Recruiter Portal" },
  { id: "badges", label: "Badges" },
  { id: "themes", label: "Themes" },
  { id: "settings", label: "Settings" },
];

export const defaultPortfolioProfileData = {
  userId: "",
  portfolioNumber: 1,
  title: "",
  isPublished: false,
  publishedContent: null,
  bio: "",
  createdAt: null,
  projects: [],
  theme: "minimal",
  badges: [],
  recruiterInfo: {
    salaryExpectation: "",
    phoneNumber: "",
    currentLocation: "",
    availability: "",
    personalNote: "",
    resumeLink: "",
    allowAccess: false,
  },
};
