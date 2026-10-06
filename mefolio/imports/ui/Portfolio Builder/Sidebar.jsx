import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { isMobile } = useResponsive();

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isMobile || !isMobileMenuOpen) return;

    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, isMobileMenuOpen]);

  // Sidebar content component (reused for both desktop and mobile)
  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-primary">
        <div className="text-2xl font-extrabold text-primary mb-4">MeFolio</div>
        <ModeSwitch onToggle={(isPreview) => {
          closeMenu();
          onPreviewToggle(isPreview);
        }} />
      </div>

      <nav aria-label="Dashboard sections" className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              closeMenu();
            }}
            aria-current={activeTab === item.id ? "page" : undefined}
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
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-40 bg-button text-secondary p-3 rounded-lg shadow-lg hover:bg-accent1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls={isMobileMenuOpen ? "dashboard-mobile-menu" : undefined}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Drawer */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-primary/50 z-40"
            onClick={closeMenu}
          />
          <aside id="dashboard-mobile-menu" aria-label="Dashboard menu" className="fixed top-0 left-0 h-dvh w-80 max-w-full bg-surface-fill border-r border-line z-50 flex flex-col shadow-xl">
            <div className="p-4 border-b border-line flex justify-between items-center">
              <span className="font-bold text-lg text-primary">Menu</span>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
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
        <aside className="w-64 h-screen sticky z-99 top-0 bg-surface-fill border-r border-line flex flex-col shrink-0">
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
