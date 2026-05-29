import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";

/**
 * Mode switch button component to toggle between builder and preview modes.
 *
 * @param {boolean} initialPreview - Whether in preview mode or not.
 * @param {function} onToggle - Callback function when the mode is toggled.
 * @returns Button element that toggles between builder and preview modes.
 */
export const ModeSwitch = ({ initialPreview = false, onToggle }) => {
  const [preview, setPreview] = useState(initialPreview); // state to track if in preview mode or not
  const [visible, setVisible] = useState(true); //track visibility
  const timerRef = useRef(null);

  useEffect(() => {
    //show when scrolling
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
    // when clicking mode switch
    const next = !preview;
    setPreview(next);
    if (onToggle) {
      onToggle(next);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        border px-4 py-3 rounded-xl
        font-bold cursor-pointer transition-all duration-200
        ${initialPreview ? `transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}` : ""}
        ${
          preview
            ? "w-auto bg-white-50 border-indigo-500 text-indigo-500 hover:bg-indigo-50"
            : "w-full border-none bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
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
