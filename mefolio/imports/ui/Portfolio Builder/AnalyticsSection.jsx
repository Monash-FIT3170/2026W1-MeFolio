import PropTypes from "prop-types";

const AnalyticsSection = ({ projects = [], engagements = [] }) => {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="m-0 text-lg font-bold text-gray-900">
          Clicks by Project
        </h2>

        {projects.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No project analytics are available yet.
          </p>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Graph will use real project click data.
          </p>
        )}
      </div>
    </section>
  );
};

AnalyticsSection.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object),
  engagements: PropTypes.arrayOf(PropTypes.object),
};

export default AnalyticsSection;