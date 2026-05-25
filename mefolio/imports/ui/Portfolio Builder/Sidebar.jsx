import PropTypes from "prop-types";
import { ModeSwitch } from "../Portfolio Preview/ModeButton";
import ProfileSummary from "./ProfileSummary";

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
                ? "bg-primary text-secondary"
                : "text-primary bg-background hover:bg-primary hover:text-background"
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ProfileSummary profile={profile} />
    </aside>
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
