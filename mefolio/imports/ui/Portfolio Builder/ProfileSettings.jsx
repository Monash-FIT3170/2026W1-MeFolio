import PropTypes from "prop-types";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      title: aboutMe.title || "",
      bio: aboutMe.bio || "",
    });
  }, [aboutMe.bio, aboutMe.title, profile.email, profile.name]);

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
    <div className="bg-background rounded-xl border border-line p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-primary mb-6">
          Profile Settings
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-accent2 focus:border-transparent outline-none text-primary"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-accent2 focus:border-transparent outline-none text-primary"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Portfolio Title
          </label>
          <input
            type="text"
            name="title"
            className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-accent2 focus:border-transparent outline-none text-primary"
            placeholder="Portfolio Title"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-accent2 focus:border-transparent outline-none resize-none text-primary"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <button
          className="px-6 py-2 bg-button border border-line text-secondary rounded-lg hover:bg-alt/50 hover:text-secondary transition"
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
