const ProfileSettings = ({ profile }) => {
  return (
    <div className="visitor-details"> 
      <h2>Profile Settings</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
    </div>
  );
};

export default ProfileSettings;