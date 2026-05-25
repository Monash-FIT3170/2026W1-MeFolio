import PropTypes from "prop-types";

// Small profile summary shown at the bottom of the sidebar.
const ProfileSummary = ({ profile }) => {
  return (
    <div className="border-t border-primary p-4">
      <div className="flex items-center gap-3 rounded-lg bg-background p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-primary text-sm font-bold text-primary">
          {profile.initials}
        </div>

        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-semibold text-primary">
            {profile.name}
          </p>
          <span className="block truncate text-xs text-primary">
            {profile.email}
          </span>
        </div>
      </div>
    </div>
  );
};

ProfileSummary.propTypes = {
  profile: PropTypes.shape({
    initials: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
};

export default ProfileSummary;
