import React from "react";
import PropTypes from "prop-types";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-background text-primary flex flex-col gap-4 rounded-2xl border-2 border-primary shadow-sm transition-all hover:shadow-md hover:border-secondary ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 px-6 pt-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3
      className={`text-xl font-bold tracking-tight text-secondary ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`px-6 pb-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

const sharedPropTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Card.propTypes = sharedPropTypes;
CardHeader.propTypes = sharedPropTypes;
CardTitle.propTypes = sharedPropTypes;
CardContent.propTypes = sharedPropTypes;
