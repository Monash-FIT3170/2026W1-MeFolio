import { useState } from "react";

export const ModeSwitch = ({ inititalPreview = false}, onClick) => {
  const [preview, setPreview] = useState(inititalPreview); // state to track if in preview mode or not

  const click = () => { // when clicking mode switch
    setPreview(!preview);
    if (onClick) {
        onClick(!preview);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-full
        border transition-all duration-200
        ${
          active
            ? "bg-indigo-100 border-indigo-300 text-indigo-600"
            : "bg-gray-100 border-gray-200 text-indigo-500 hover:bg-gray-200"
        }
      `}
    >
        <span className="font-medium">View Portfolio</span>

    </button>
  );
};
