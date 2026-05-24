import React from "react";

const Button = ({ text, variant = "primary" }) => {
  return (
    <button className={`btn ${variant}`}>
      {text}
    </button>
  );
};

export default Button;