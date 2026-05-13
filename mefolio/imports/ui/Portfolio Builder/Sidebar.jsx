import { ModeSwitch } from "../Portfolio Preview/ModeButton";
import ProfileSummary from "./ProfileSummary";

// Sidebar navigation for switching dashboard sections.
const Sidebar = ({
  items,
  activeTab,
  onTabChange,
  profile,
  onPreviewToggle,
}) => {
  return (
    <aside className="builder-sidebar">
      <div className="sidebar-top">
        <div className="builder-logo">
          <span>MeFolio</span>
        </div>

        <ModeSwitch onToggle={onPreviewToggle} />
      </div>

      <nav className="builder-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={
              activeTab === item.id
                ? "builder-nav-item active"
                : "builder-nav-item"
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

export default Sidebar;
