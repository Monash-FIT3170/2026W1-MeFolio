import PropTypes from "prop-types";

// Generic placeholder used for dashboard tabs that are not built yet.
const PlaceholderSection = ({
  title,
  description = "This section is a placeholder for now.",
}) => {
  return (
    <section className="rounded-lg border border-muted/20 bg-surface p-6 shadow-sm">
      <h2 className="m-0 text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
    </section>
  );
};

PlaceholderSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default PlaceholderSection;