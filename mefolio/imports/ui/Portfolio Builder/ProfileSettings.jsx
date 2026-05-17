import PropTypes from "prop-types";
import { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";

const ProfileSettings = ({ profile, aboutMe }) => {
  const currentUser = useTracker(() => Meteor.user());
  const userId = currentUser?._id;

  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    title: aboutMe.title || "",
    bio: aboutMe.bio || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (formValues) => {
    const updates = {};

    if (formValues.email) updates.email = formValues.email;

    const profileUpdates = {};
    if (formValues.name) profileUpdates.name = formValues.name;
    if (Object.keys(profileUpdates).length > 0) {
      updates.profile = profileUpdates;
    }

    const aboutMeUpdates = {};
    if (formValues.title) aboutMeUpdates.title = formValues.title;
    if (formValues.bio) aboutMeUpdates.bio = formValues.bio;

    if (!userId) {
      alert("You must be logged in to save changes.");
      return;
    }

    Meteor.call("users.updateCurrentProfile", updates, (error) => {
      if (error) {
        console.error("Error updating profile:", error);
        alert("Failed to save changes. Please try again.");
      }
    });

    const userPortfolio = PortfolioCollection.find({ userId }).fetch();
    Meteor.call(
      "portfolios.update",
      userPortfolio[0]?._id,
      aboutMeUpdates,
      (error) => {
        if (error) {
          console.error("Error updating portfolio:", error);
          alert("Failed to save changes. Please try again.");
        }
      },
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Profile Settings
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio Title
          </label>
          <input
            type="text"
            name="title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            placeholder="Portfolio Title"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          onClick={() => handleSave(form)}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

ProfileSettings.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  aboutMe: PropTypes.shape({
    title: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
};

export default ProfileSettings;
