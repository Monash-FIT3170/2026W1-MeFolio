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
  if (profile.password !== undefined)
    serviceUpdates.password = profile.password;
  if (profile.resume !== undefined) serviceUpdates.resume = profile.resume;
  if (Object.keys(serviceUpdates).length > 0) {
    updates.services = serviceUpdates;
  }

  Meteor.call("users1.update", profile._id, updates, (error) => {
    if (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save changes. Please try again.");
    } else {
      console.log(profile._id, updates);
      alert("Profile updated successfully!");
    }
  });
};

const ProfileSettings = ({ profile }) => {
  console.log("Rendering ProfileSettings with profile:", profile);
  return (
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">
          Profile Settings
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              placeholder="Name"
              defaultValue={profile.name}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              placeholder="Email"
              defaultValue={profile.email}
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Title
          </label>
          <input
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            placeholder="Portfolio Title"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none"
            placeholder="Bio"
          />
        </div>

        <button
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          onClick={() => handleSave(profile)}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
