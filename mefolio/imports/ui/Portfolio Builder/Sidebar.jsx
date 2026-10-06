import PropTypes from "prop-types";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import PublishButton from "../Portfolio Preview/PublishButton";
import ShareButton from "./ShareButton";
import ProfileSummary from "./ProfileSummary";
import { useResponsive } from "../Contexts/ResponsiveContext";

const Sidebar = ({
  items,
  activeTab,
  onTabChange,
  profile,
  onPreviewToggle,
  isPreview = false,
  portfolio,
  projects = [],
  hasUnpublishedChanges = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  // Sidebar content component (reused for both desktop and mobile)
  const renderSidebarContent = () => (
    <>
      <div className="shrink-0 p-6 border-b border-primary">
        <div className="text-2xl font-extrabold text-primary mb-4">MeFolio</div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onPreviewToggle(!isPreview);
              setIsMobileMenuOpen(false);
            }}
            aria-pressed={isPreview}
            className="w-full rounded-xl border border-alt/50 bg-selected px-4 py-3 text-sm font-semibold text-alt transition-colors hover:bg-alt/50 hover:text-secondary"
          >
            {isPreview ? "Back to Builder" : "View Portfolio"}
          </button>
          <PublishButton
            portfolio={portfolio}
            projects={projects}
            sidebar
            onGoToDashboard={() => {
              onPreviewToggle(false);
              setIsMobileMenuOpen(false);
            }}
          />
          <ShareButton
            portfolio={portfolio}
            hasUnpublishedChanges={hasUnpublishedChanges}
            isMobile={isMobile}
          />
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-4 flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
              !isPreview && activeTab === item.id
                ? "bg-selected text-alt"
                : "text-primary bg-surface-fill hover:bg-selected/50 hover:text-alt/50"
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ProfileSummary
        profile={profile}
        onAccountSettings={() => {
          onTabChange("settings");
          setIsMobileMenuOpen(false);
        }}
      />
    </>
  );

  return (
    <>
      {/* Mobile Menu Button - Only shows on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-button text-secondary p-3 rounded-full shadow-lg hover:bg-accent1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Drawer */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-primary/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-80 bg-surface-fill border-r border-line z-50 flex flex-col shadow-xl">
            <div className="p-4 border-b border-line flex justify-between items-center">
              <span className="font-bold text-lg text-primary">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-selected transition-colors min-h-[44px] min-w-[44px]"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>
            {renderSidebarContent()}
          </aside>
        </>
      )}

      {/* Desktop Sidebar - Only shows on desktop/tablet */}
      {!isMobile && (
        <aside className="w-64 h-screen sticky z-99 top-0 bg-surface-fill border-r border-line flex flex-col shrink-0">
          {renderSidebarContent()}
        </aside>
      )}
    </>
  );
};

Sidebar.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    initials: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  onPreviewToggle: PropTypes.func.isRequired,
  isPreview: PropTypes.bool,
  portfolio: PropTypes.object,
  projects: PropTypes.arrayOf(PropTypes.object),
  hasUnpublishedChanges: PropTypes.bool,
};

export default Sidebar;
