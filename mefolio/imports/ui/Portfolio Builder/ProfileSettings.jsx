import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";

const ProfileSettings = ({ profile, aboutMe, portfolioId }) => {

  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    title: aboutMe.title || "",
    bio: aboutMe.bio || "",
    location: aboutMe.profile?.location || "",
  });

  useEffect(() => {
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      title: aboutMe.title || "",
      bio: aboutMe.bio || "",
      location: aboutMe.profile?.location || "",
    });
  }, [aboutMe.bio, aboutMe.title, aboutMe.profile?.location, profile.email, profile.name]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (formValues) => {
    const userUpdates = {};
    if (formValues.email) userUpdates.email = formValues.email;
    const profileUpdates = {};
    if (formValues.name) profileUpdates.name = formValues.name;
    if (Object.keys(profileUpdates).length > 0) {
      userUpdates.profile = profileUpdates;
    }

    Meteor.call("users.updateCurrentProfile", userUpdates, (error) => {
      if (error) {
        console.error("Error updating profile:", error);
        alert("Failed to save changes. Please try again.");
      }
    });

    const portfolioUpdates = {
      title: formValues.title,
      bio: formValues.bio,
      "profile.fullName": formValues.name,
      "profile.location": formValues.location,
    };

    if (portfolioId) {
      Meteor.call("portfolios.update", portfolioId, portfolioUpdates, (error) => {
        if (error) {
          console.error("Error updating portfolio:", error);
          alert("Failed to save changes. Please try again.");
        }
      });
    } else {
      // No portfolio yet — create one and include all profile fields.
      Meteor.call(
        "portfolios.insert",
        {
          title: formValues.title,
          bio: formValues.bio,
          profile: {
            fullName: formValues.name,
            location: formValues.location,
          },
          projects: [],
          createdAt: new Date(),
        },
        (error) => {
          if (error) {
            console.error("Error creating portfolio:", error);
            alert("Failed to save changes. Please try again.");
          }
        },
      );
    }
  };

  return (
    <div className="bg-background rounded-xl border border-primary p-6">
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
              className="w-full px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none text-primary"
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
              className="w-full px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none text-primary"
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
            className="w-full px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none text-primary"
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
            className="w-full px-4 py-2 border border-primary rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none resize-none text-primary"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <button
          className="px-6 py-2 bg-background border border-primary text-primary rounded-lg hover:bg-primary hover:text-background transition"
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
  portfolioId: PropTypes.string,
};

export default ProfileSettings;
