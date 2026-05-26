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
            ? "w-auto bg-alt/50 border-alt text-alt hover:bg-background hover:text-primary"
            : "w-full border-alt/50 bg-selected text-alt hover:bg-alt/50 hover:text-secondary"
        }
      `}
    >
      <span className="font-bold">
        {preview ? "Back to Builder" : "View Portfolio"}
      </span>
    </button>
  );
};

ModeSwitch.propTypes = {
  initialPreview: PropTypes.bool,
  onToggle: PropTypes.func,
};
