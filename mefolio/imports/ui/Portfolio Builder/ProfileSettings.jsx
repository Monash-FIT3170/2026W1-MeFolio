const handleSave = (profile) => {
  const updates = {};

  // Email
  if (profile.email) {
    updates.email = profile.email;
  }

  // Profile fields
  const profileUpdates = {};
  if (profile.name) profileUpdates.name = profile.name;
  // if (profile.initials) profileUpdates.initials = profile.initials;
  if (Object.keys(profileUpdates).length > 0) {
    updates.profile = profileUpdates;
  }

  // Services fields
  const serviceUpdates = {};
  if (profile.password !== undefined) serviceUpdates.password = profile.password;
  if (profile.resume !== undefined) serviceUpdates.resume = profile.resume;
  if (Object.keys(serviceUpdates).length > 0) {
    updates.services = serviceUpdates;
  }

  Meteor.call(
    'users1.update',
    profile._id,
    updates,
    (error) => {
      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to save changes. Please try again.');
      } else {
        console.log(profile._id, updates);
        alert('Profile updated successfully!');
      }
    }
  );
}

const ProfileSettings = ({ profile }) => {
  console.log('Rendering ProfileSettings with profile:', profile);
  return (
    <div className="visitor-details"> 
      <h2>Profile Settings</h2>
      <input type="text" placeholder="Name" defaultValue={profile.name} />
      <input type="email" placeholder="Email" defaultValue={profile.email} />
      <button onClick={() => handleSave(profile)}>Save Changes</button>
    </div>
  );
};

export default ProfileSettings;