import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";

const SLUG_REGEX = /^[a-z0-9-]+$/;

const validateSlug = (value) => {
  if (!value) return "";
  if (!SLUG_REGEX.test(value))
    return "Only lowercase letters, numbers, and hyphens are allowed.";
  if (value.startsWith("-") || value.endsWith("-"))
    return "Slug cannot start or end with a hyphen.";
  if (value.length < 3) return "Slug must be at least 3 characters.";
  if (value.length > 40) return "Slug must be 40 characters or fewer.";
  return "";
};

const ProfileSettings = ({ profile, aboutMe, portfolioId }) => {
  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    title: aboutMe.title || "",
    bio: aboutMe.bio || "",
    location: aboutMe.profile?.location || "",
    slug: aboutMe.username || "",
  });

  const [slugError, setSlugError] = useState("");

  useEffect(() => {
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      title: aboutMe.title || "",
      bio: aboutMe.bio || "",
      location: aboutMe.profile?.location || "",
      slug: aboutMe.username || "",
    });
  }, [
    aboutMe.bio,
    aboutMe.title,
    aboutMe.profile?.location,
    aboutMe.username,
    profile.email,
    profile.name,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "slug") {
      setSlugError(validateSlug(value));
    }
  };

  const handleSave = (formValues) => {
    const error = validateSlug(formValues.slug);
    if (formValues.slug && error) {
      setSlugError(error);
      return;
    }

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
      ...(formValues.slug ? { username: formValues.slug } : {}),
    };

    if (portfolioId) {
      Meteor.call(
        "portfolios.update",
        portfolioId,
        portfolioUpdates,
        (error) => {
          if (error) {
            console.error("Error updating portfolio:", error);
            alert("Failed to save changes. Please try again.");
          }
        },
      );

      if (formValues.slug) {
        Meteor.call(
          "portfolios.setUsername",
          portfolioId,
          formValues.slug,
          (error) => {
            if (error) {
              console.error("Error updating custom URL:", error);

              if (
                error.error === "username-taken" ||
                error.error === "invalid-username"
              ) {
                setSlugError(error.reason);
                return;
              }

              setSlugError("Failed to update custom URL. Please try again.");
              return;
            }

            setSlugError("");
          },
        );
      }
    } else {
      // No portfolio yet — create one first, then set the username
      // through the dedicated validated method.
      Meteor.call(
        "portfolios.insert",
        {
          title: formValues.title,
          bio: formValues.bio,
          profile: {
            fullName: formValues.name,
            location: formValues.location,
          },
          ...(formValues.slug ? { username: formValues.slug } : {}),
          projects: [],
          createdAt: new Date(),
        },
        (error, newPortfolioId) => {
          if (error) {
            console.error("Error creating portfolio:", error);
            alert("Failed to save changes. Please try again.");
            return;
          }

          if (formValues.slug && newPortfolioId) {
            Meteor.call(
              "portfolios.setUsername",
              newPortfolioId,
              formValues.slug,
              (usernameError) => {
                if (usernameError) {
                  console.error("Error updating custom URL:", usernameError);

                  if (
                    usernameError.error === "username-taken" ||
                    usernameError.error === "invalid-username"
                  ) {
                    setSlugError(usernameError.reason);
                    return;
                  }

                  setSlugError(
                    "Failed to update custom URL. Please try again.",
                  );
                  return;
                }

                setSlugError("");
              },
            );
          }
        },
      );
    }
  };

  return (
    <div className="bg-surface-fill rounded-xl border border-line p-6">
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

        {/* Custom URL */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Custom URL
          </label>
          <div className="flex items-stretch rounded-lg border border-line overflow-hidden focus-within:ring-2 focus-within:ring-accent2">
            <span className="px-3 py-2 bg-surface-fill border-r border-line text-sm text-muted select-none whitespace-nowrap flex items-center">
              /u/
            </span>
            <input
              type="text"
              name="slug"
              data-testid="field-slug"
              className="flex-1 px-3 py-2 outline-none text-sm text-primary bg-background"
              placeholder="jane-doe"
              value={form.slug}
              onChange={handleChange}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {slugError && (
            <p data-testid="slug-error" className="mt-1 text-xs text-accent2">
              {slugError}
            </p>
          )}
          {!slugError && form.slug && (
            <p className="mt-1 text-xs text-muted">
              Your portfolio will be available at{" "}
              <span className="font-semibold text-primary">/u/{form.slug}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          data-testid="btn-save"
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
    username: PropTypes.string,
  }).isRequired,
  portfolioId: PropTypes.string,
};

export default ProfileSettings;
