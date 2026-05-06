export const PortfolioBuilderView = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    isLoading, 
    sidebarItems, 
    overviewStats, 
    liveVisitors, 
    profile, 
    aboutMe 
  } = createDashboardViewModel();

  const currentTab = getCurrentTab(sidebarItems, activeTab);

  if (isLoading) {
    return <p className="builder-loading">Loading...</p>;
  }

  if (!currentTab) {
    return <p className="builder-loading">No dashboard sections available.</p>;
  }

  return (
    <>
      {/* Top UI */}
      <Navbar />
      <About />

      <section>
        <h2>Portfolios</h2>
        <div>Placeholder for portfolio UI</div>
      </section>

      {/* Dashboard Layout */}
      <div className="builder-layout">
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          profile={profile}
        />

        <main className="builder-main">
          <header className="builder-header">
            <h1>{currentTab.label}</h1>
          </header>

          <div className="builder-content">
            {activeTab === "overview" ? (
              <OverviewSection 
                stats={overviewStats} 
                visitors={liveVisitors} 
              />
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
    </>
  );
};