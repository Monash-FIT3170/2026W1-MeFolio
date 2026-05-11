import React from "react";

export const ProfileCard = ({ name, title, location, summary, imageUrl }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";
 
  return (
    /* Outer gradient border wrapper */
    <div
      className="w-full min-h-[480px] p-1 rounded-[32px] flex box-border shadow-[0_20px_40px_rgba(91,61,245,0.18),0_8px_20px_rgba(0,0,0,0.06)]"
      style={{ background: "linear-gradient(135deg, #5b3df5 0%, #7b2ff7 45%, #ff0f7b 100%)" }}
    >
      {/* Inner white card */}
      <div className="flex-1 w-full bg-white rounded-[28px] flex flex-col items-center justify-center px-8 py-16">
 
        {/* Avatar */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || "Profile"}
            className="w-60 h-60 rounded-full object-cover mb-10 border-[6px] border-white shadow-[0_20px_50px_rgba(123,47,247,0.25)]"
          />
        ) : (
          <div
            className="w-60 h-60 rounded-full flex items-center justify-center text-white text-[84px] font-extrabold tracking-[-0.05em] mb-10 shadow-[0_25px_60px_rgba(123,47,247,0.35)]"
            style={{ background: "linear-gradient(135deg, #5b3df5 0%, #7b2ff7 45%, #a855f7 100%)" }}
          >
            {initials}
          </div>
        )}
 
        {/* Job title */}
        <h2 className="m-0 text-[2rem] font-bold text-slate-900 tracking-[-0.03em] text-center">
          {title || "Full-Stack Developer"}
        </h2>
 
        {/* Name, location, summary */}
        <div className="text-center mt-2">
          <p className="text-xl font-semibold text-slate-900 m-0">
            {name || "No name set"}
          </p>
 
          {location && (
            <p className="mt-2.5 text-[1.15rem] font-medium text-slate-500 text-center">
              {location}
            </p>
          )}
 
          {summary && (
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};