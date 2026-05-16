// Generic placeholder used for dashboard tabs that are not built yet.
const PlaceholderSection = ({
  title,
  description = "This section is a placeholder for now.",
}) => {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-7">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">{description}</p>
    </section>
  );
};

export default PlaceholderSection;
