import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";

export const ModeSwitch = ({ initialPreview = false, onToggle }) => {
  const [preview, setPreview] = useState(initialPreview);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!initialPreview) return;

    const reset = () => {
      setVisible(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 3000);
    };

    reset();
    window.addEventListener("scroll", reset);
    return () => {
      window.removeEventListener("scroll", reset);
      clearTimeout(timerRef.current);
    };
  }, [initialPreview]);

  const handleClick = () => {
    const next = !preview;
    setPreview(next);
    if (onToggle) onToggle(next);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        border px-4 py-3 rounded-xl font-bold cursor-pointer transition-all duration-200
        ${initialPreview ? `transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}` : ""}
        ${
          preview
            ? "w-auto bg-white-50 border-primary/50 text-primary hover:bg-primary/50"
            : "w-full border-none bg-primary/10 text-primary hover:bg-primary/20"
        }
      `}
    >
      <span className="font-medium">
        {preview ? "Back to Builder" : "View Portfolio"}
      </span>
    </button>
  );
};

ModeSwitch.propTypes = {
  initialPreview: PropTypes.bool,
  onToggle: PropTypes.func,
};
