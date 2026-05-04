import { useState } from "react";

/**
 * Mode switch button component to toggle between builder and preview modes.
 * 
 * @param {boolean} initialPreview - Whether in preview mode or not.
 * @param {function} onToggle - Callback function when the mode is toggled.
 * @returns Button element that toggles between builder and preview modes.
 */
export const ModeSwitch = ({ initialPreview = false, onToggle}) => {
  const [preview, setPreview] = useState(initialPreview); // state to track if in preview mode or not

  const handleClick = () => { // when clicking mode switch
    const next = !preview
    setPreview(next);
    if (onToggle) {
        onToggle(next);
    }
  }

  return (
    <button
      onClick={handleClick} //TODO double check styling with tailwind
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-full
        border transition-all duration-200
        ${
          preview
            ? "bg-indigo-100 border-indigo-300 text-indigo-600"
            : "bg-gray-100 border-gray-200 text-indigo-500 hover:bg-gray-200"
        }
      `}
    >
        <span className="font-medium">
          {preview? "Back to Builder" : "View Portfolio"}
        </span>
    </button>
  );
};
