// Small profile summary shown at the bottom of the sidebar.
const ProfileSummary = ({ profile }) => {
  return (
    <div className="sidebar-profile">
      <div className="profile-avatar">{profile.initials}</div>

      <div className="profile-text">
        <p>{profile.name}</p>
        <span>{profile.email}</span>
      </div>
    </div>
  );
};

export default ProfileSummary;