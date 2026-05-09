import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  createDashboardViewModel,
  getCurrentTab,
} from "./portfolioBuilderViewModel";
import { ModeSwitch } from "./ModeButton";
import { TestPortfolioView } from "./TestPortfolioView";

// Top-level dashboard view that coordinates tab state and renders the active section.
const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { isLoading, sidebarItems, overviewStats, liveVisitors, profile, aboutMe } =
    createDashboardViewModel();
  const navigate = useNavigate();
  const currentTab = getCurrentTab(sidebarItems, activeTab);

  if (isLoading) {
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
          ) : activeTab === "about-me" ? (
            <PlaceholderSection
              title={currentTab.label}
              description={`Placeholder for ${
                aboutMe.fullName || "the current user"
              }'s About Me details.`}
            />
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

// Small profile summary shown at the bottom of the sidebar.
const ProfileSummary = ({ profile }) => {
  return (
    <div className="flex items-center gap-3 border-t border-gray-200 px-5 py-[18px]">
      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 font-extrabold text-white">
        {profile.initials}
      </div>

      <div>
        <p className="m-0 font-bold text-gray-900">{profile.name}</p>
        <span className="text-[13px] text-gray-500">{profile.email}</span>
      </div>
    </div>
  );
};

// Overview tab content that displays summary stats and recent visitor activity.
const OverviewSection = ({ stats, visitors }) => {
  return (
    <>
      <section className="mb-8 grid grid-cols-2 gap-6 min-[1001px]:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-[18px]">
          <h2 className="m-0 text-lg text-gray-900">Live Visitors</h2>
          <button className="cursor-pointer border-0 bg-transparent font-bold text-indigo-600">
            View all
          </button>
        </div>

        <div className="flex flex-col">
          {visitors.map((visitor) => (
            <Visitor key={visitor.id} visitor={visitor} />
          ))}
        </div>
      </section>
    </>
  );
};

// Reusable card for a single dashboard statistic.
const StatCard = ({ stat }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-[22px] flex items-center justify-between">
        <span className="text-sm font-extrabold text-green-600">
          {"\u2197"} {stat.change}
        </span>
      </div>

      <h2 className="mb-1.5 mt-0 text-[34px] font-[850] text-gray-900">
        {stat.value}
      </h2>
      <p className="m-0 text-sm text-gray-500">{stat.label}</p>
    </div>
  );
};

// Displays one visitor row inside the live visitors list.
const Visitor = ({ visitor }) => {
  return (
    <div className="flex items-start gap-4 border-b border-gray-200 px-6 py-[18px] last:border-b-0">
      <div
        className={
          visitor.active
            ? "mt-2 h-[9px] w-[9px] rounded-full bg-green-500"
            : "mt-2 h-[9px] w-[9px] rounded-full bg-gray-300"
        }
      />

      <div>
        <h3 className="mb-1 mt-0 text-[15px] font-[750] text-gray-900">
          {visitor.name}
        </h3>
        <p className="my-[3px] text-sm text-gray-500">{visitor.email}</p>
        <p className="my-[3px] text-sm text-gray-500">{visitor.activity}</p>
        <span className="text-xs text-gray-400">
          {visitor.location}
          {" \u00b7 "}
          2 min ago
        </span>
      </div>

      <div className="ml-auto text-sm text-gray-500">{visitor.duration}</div>
    </div>
  );
};

// Generic placeholder used for dashboard tabs that are not built yet.
const PlaceholderSection = ({
  title,
  description = "This section is a placeholder for now.",
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-7">
      <h2 className="mb-2">{title}</h2>
      <p className="text-gray-500">{description}</p>
    </section>
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
