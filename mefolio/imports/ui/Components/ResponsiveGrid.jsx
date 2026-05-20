import React from 'react';
import PropTypes from 'prop-types';

export const ResponsiveGrid = ({ children, className = "" }) => {
  return (
    <div className={`
      grid 
      /* Mobile: 1 column */
      grid-cols-1
      /* Tablet: 2 columns */
      sm:grid-cols-2
      /* Desktop: 3 columns */
      lg:grid-cols-3
      /* Large Desktop: 4 columns */
      xl:grid-cols-4
      /* Responsive gap spacing */
      gap-4 md:gap-6
      ${className}
    `}>
      {children}
    </div>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const ResponsiveCard = ({ children, className = "" }) => {
  return (
    <div className={`
    /* Responsive padding */
      bg-white rounded-xl shadow-sm border border-gray-200
      p-4 md:p-6
      hover:shadow-md transition-shadow duration-200
      ${className}
    `}>
      {children}
    </div>
  );
};

ResponsiveCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};