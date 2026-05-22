import PropTypes from "prop-types";

// Small profile summary shown at the bottom of the sidebar.
const ProfileSummary = ({ profile }) => {
  return (
    <div className="border-t border-muted/20 p-4">
      <div className="flex items-center gap-3 rounded-lg bg-background p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-background">
          {profile.initials}
        </div>

        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-semibold text-foreground">
            {profile.name}
          </p>
          <span className="block truncate text-xs text-muted">
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
