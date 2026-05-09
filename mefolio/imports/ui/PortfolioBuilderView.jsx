import { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Route, Routes, useNavigate } from "react-router-dom";

import { PortfolioCollection } from "../api/portfolio";
import {
  createDashboardViewModel,
  getCurrentTab
} from "../models/portfolioBuilderViewModel";

import { ModeSwitch } from "./ModeButton";
import { TestPortfolioView } from "./TestPortfolioView";
import ProfileSummary from "./Portfolio Builder/ProfileSummary";
import PlaceholderSection from "./Portfolio Builder/PlaceholderSection";
import OverviewSection from "./Portfolio Builder/OverviewSection";
import ProfileSettings from "./Portfolio Builder/ProfileSettings";

// Custom hook to fetch real portfolio data from MongoDB via Meteor.
const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    const portfolios = PortfolioCollection.find({}).fetch();

    const userHandler = Meteor.subscribe("users.current");
    const user = Meteor.user();

    return {
      isLoading: !portfoliosHandler.ready() || !userHandler.ready(),
      portfolios,
      user
    };
  });

// Top-level dashboard view that coordinates tab state and renders the active section.
const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isLoading, portfolios, user } = useDashboardData();
  const {
    isLoading: viewModelLoading,
    sidebarItems,
    overviewStats,
    liveVisitors,
    profile,
    aboutMe
  } = createDashboardViewModel({ isLoading, portfolios, user });
  const navigate = useNavigate();
  const currentTab = getCurrentTab(sidebarItems, activeTab);

  if (viewModelLoading) {
    return <p className="p-8 text-[1.2rem]">Loading...</p>;
  }

  if (!currentTab) {
    return <p className="p-8 text-[1.2rem]">No dashboard sections available.</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profile={profile}
        onPreviewToggle={(isPreview) => {
          if (isPreview) navigate("/preview");
        }}
      />

      <main className="flex-1 overflow-y-auto">
        <header className="border-b border-gray-200 bg-white px-8 py-6">
          <h1 className="m-0 text-[28px] font-extrabold text-gray-900">
            {currentTab.label}
          </h1>
        </header>

        <div className="p-8">
          {activeTab === "overview" ? (
            <OverviewSection stats={overviewStats} visitors={liveVisitors} />
          ) : activeTab === "settings" ? (
            <ProfileSettings profile={profile} aboutMe={aboutMe} />
          ) : (
            <PlaceholderSection title={currentTab.label} />
          )}
        </div>
      </main>
    </div>
  );
};

// Sidebar navigation for switching dashboard sections.
const Sidebar = ({ items, activeTab, onTabChange, profile, onPreviewToggle }) => {
  return (
    <aside className="flex w-[260px] flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <div className="mb-[18px] flex items-center gap-2.5 text-[22px] font-extrabold text-gray-900">
          <span>MeFolio</span>
        </div>

        <ModeSwitch onToggle={onPreviewToggle} />
      </div>

      <nav className="flex-1 p-4">
        {items.map((item) => (
          <button
            key={item.id}
            className={
              activeTab === item.id
                ? "flex w-full cursor-pointer items-center gap-3.5 rounded-[10px] border-0 bg-indigo-50 px-4 py-3.5 text-left text-[15px] font-[650] text-indigo-600"
                : "flex w-full cursor-pointer items-center gap-3.5 rounded-[10px] border-0 bg-transparent px-4 py-3.5 text-left text-[15px] font-[650] text-gray-700 hover:bg-gray-100"
            }
            onClick={() => onTabChange(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ProfileSummary profile={profile} />
    </aside>
  );
};

export const PortfolioBuilderView = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/preview" element={<TestPortfolioView />} />
    </Routes>
  );
};
