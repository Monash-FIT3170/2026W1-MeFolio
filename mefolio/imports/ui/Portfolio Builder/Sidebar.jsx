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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-200">
        <div className="text-2xl font-extrabold text-gray-900 mb-4">
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
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-700 hover:bg-gray-100"
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
