export const sidebarItems = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
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
