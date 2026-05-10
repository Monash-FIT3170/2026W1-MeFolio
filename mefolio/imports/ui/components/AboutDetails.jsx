import React from "react";

const AboutDetails = ({ bioSummary }) => {
  return (
    <div className="about-details">
      <h2>About</h2>
      <p>
        {bioSummary ||
          "This portfolio owner has not yet added an about summary. Update the About section in the builder to show a short bio here."}
      </p>
    </div>
  );
};

export default AboutDetails;
