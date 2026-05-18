// Small profile summary shown at the bottom of the sidebar.
const ProfileSummary = ({ profile }) => {
  return (
    <div className="border-t border-gray-200 p-5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold shrink-0">
        {profile.initials}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-900 truncate">{profile.name}</p>
        <span className="text-xs text-gray-500 truncate block">
          {profile.email}
        </span>
      </div>
    </div>
  );
};

export default ProfileSummary;
