import React from "react";

const ContactButtons = () => {
  return (
    <div className="flex gap-3 flex-wrap">
      <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b3df5] hover:bg-[#4a30d4] text-white text-base font-semibold rounded-xl transition-colors duration-150 cursor-pointer border-none">
        Get in touch
      </button>
      <button className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-slate-50 text-slate-900 text-base font-semibold rounded-xl border border-slate-300 hover:border-[#5b3df5] transition-colors duration-150 cursor-pointer">
        View Resume
      </button>
    </div>
  );
};

export default ContactButtons;