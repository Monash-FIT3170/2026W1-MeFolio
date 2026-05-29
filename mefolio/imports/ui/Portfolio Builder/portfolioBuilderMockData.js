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

export const mockOverviewStats = [
  {
    id: "total-views",
    value: "2,847",
    label: "Total Views",
    change: "+12%",
    colour: "indigo",
  },
  {
    id: "visitors-now",
    value: "3",
    label: "Visitors Right Now",
    change: "+8%",
    colour: "purple",
  },
  {
    id: "interactions",
    value: "145",
    label: "Interactions",
    change: "+24%",
    colour: "pink",
  },
  {
    id: "ai-used",
    value: "67",
    label: "AI Chatbot Used",
    change: "+18%",
    colour: "orange",
  },
];

export const mockLiveVisitors = [
  {
    id: "visitor-1",
    name: "James O'Brien",
    email: "james.obrien@canva.com",
    activity: "Viewing Projects",
    location: "Sydney, AU",
    duration: "3:24",
    active: true,
  },
  {
    id: "visitor-2",
    name: "Emily Zhang",
    email: "emily.z@atlassian.com",
    activity: "AI Chat Session",
    location: "Melbourne, AU",
    duration: "7:12",
    active: true,
  },
  {
    id: "visitor-3",
    name: "Liam Robertson",
    email: "lrobertson@seek.com.au",
    activity: "Viewing Skills",
    location: "Brisbane, AU",
    duration: "1:45",
    active: false,
  },
];

export const mockProfile = {
  initials: "JD",
  name: "John Doe",
  email: "john@example.com",
};

export const defaultPortfolioProfileData = {
  userId: "",
  portfolioNumber: 1,
  title: "",
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

export const samplePortfolioProfileData = {
  userId: "Superuser",
  portfolioNumber: 1,
  title: "Sample Portfolio",
  bio: "This is a sample portfolio.",
  createdAt: new Date(),
  projects: [],
  theme: "minimal",
  badges: [
    {
      title: "Sample Badge",
      issuer: "Sample Issuer",
      issueDate: new Date(),
      badgeImageUrl: "https://example.com/badge.png",
      verificationUrl: "https://example.com/verify-badge",
    },
  ],
  recruiterInfo: {
    salaryExpectation: "$70,000 - $90,000",
    phoneNumber: "123-456-7890",
    currentLocation: "Sydney NSW",
    availability: "Immediate",
    personalNote: "Looking for opportunities in full-stack development.",
    resumeLink: "https://example.com/resume.pdf",
    allowAccess: true,
  },
};

export const mockProjects = [
  {
    id: "project-1",
    title: "Personal Portfolio Website",
    description:
      "A responsive portfolio website used to showcase projects, skills, and contact details.",
    technologies: ["React", "CSS", "Meteor"],
    githubLink: "https://github.com/example/portfolio",
    liveDemoLink: "https://example-portfolio.com",
  },
  {
    id: "project-2",
    title: "Task Management App",
    description:
      "A simple task tracking app with project cards, status updates, and basic filtering.",
    technologies: ["JavaScript", "MongoDB", "Meteor"],
    githubLink: "https://github.com/example/task-app",
    liveDemoLink: "https://example-task-app.com",
  },
  {
    id: "project-3",
    title: "Developer Blog Platform",
    description:
      "A blog-style project used to share technical writeups and software engineering reflections.",
    technologies: ["React", "Node.js", "CSS"],
    githubLink: "https://github.com/example/blog-platform",
    liveDemoLink: "https://example-blog.com",
  },
];
