import PropTypes from "prop-types";

// Generic placeholder used for dashboard tabs that are not built yet.
const PlaceholderSection = ({
  title,
  description = "This section is a placeholder for now.",
}) => {
  return (
<<<<<<< HEAD
    <section className="rounded-lg border border-muted/20 bg-surface p-6 shadow-sm">
      <h2 className="m-0 text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-muted">{description}</p>
=======
    <section className="rounded-lg border border-primary bg-background p-6 shadow-sm">
      <h2 className="m-0 text-lg font-bold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-primary">{description}</p>
>>>>>>> 3b630462f86874007e594b2150528a62f4f36c45
    </section>
  );
};

PlaceholderSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default PlaceholderSection;