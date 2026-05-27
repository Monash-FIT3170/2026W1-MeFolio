import PropTypes from "prop-types";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ModeSwitch } from "../Portfolio Preview/ModeButton";
import ProfileSummary from "./ProfileSummary";
import { useResponsive } from "../Contexts/ResponsiveContext";

const Sidebar = ({
  items,
  activeTab,
  onTabChange,
  profile,
  onPreviewToggle,
}) => {
  return (
    <aside className="w-64 bg-background border-r border-primary primary flex flex-col shrink-0">
      <div className="p-6 border-b border-primary">
        <div className="text-2xl font-extrabold text-primary mb-4">
          MeFolio
        </div>
        <ModeSwitch onToggle={onPreviewToggle} />
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors ${
              activeTab === item.id
                ? "bg-selected text-alt"
                : "text-primary bg-surface-fill hover:bg-selected/50 hover:text-alt/50"
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ProfileSummary profile={profile} />
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
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Desktop Sidebar - Only shows on desktop/tablet */}
      {!isMobile && (
        <aside className="w-64 bg-surface-fill border-r border-line flex flex-col shrink-0">
          <SidebarContent />
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
};

export default Sidebar;
