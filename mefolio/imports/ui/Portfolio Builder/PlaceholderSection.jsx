// Generic placeholder used for dashboard tabs that are not built yet.
const PlaceholderSection = ({ title, description = "This section is a placeholder for now." }) => {
  return (
    <section className="placeholder-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
};

export default PlaceholderSection;