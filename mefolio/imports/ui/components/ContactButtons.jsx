import React from "react";

const ContactButtons = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <button className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors active:scale-[0.98]">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3 7 12 13 21 7" />
        </svg>
        Get in touch
      </button>
      <button className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors active:scale-[0.98]">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        View Resume
      </button>
    </div>
  );
};

export default ContactButtons;