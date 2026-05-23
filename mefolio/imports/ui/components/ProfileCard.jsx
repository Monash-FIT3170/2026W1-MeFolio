import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../../api/portfolio";

export const ProfileCard = () => {
  const { portfolio, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe("portfolios.all");
    const portfolio = PortfolioCollection.findOne();

    return {
      portfolio,
      isLoading: !handle.ready(),
    };
  });

  if (isLoading || !portfolio) {
    return (
      <div className="w-full min-h-[480px] flex items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  // -----------------------------
  // SAFE EXTRACTION (KEY FIX)
  // -----------------------------

  const profile = portfolio.profile || {};
  const aboutMe = portfolio.aboutMe || portfolio || {}; 
  // fallback handles bad mapping / flattened data

  const name = profile.name || "No name set";

  const title =
    aboutMe.title ||
    portfolio.title ||   // fallback if stored at root
    "No title set";

  const location = profile.location || "";

  const imageUrl =
    profile.avatarUrl ||
    profile.avatar ||
    null;

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      className="w-full min-h-[480px] p-1 rounded-[32px] flex box-border shadow-[0_20px_40px_rgba(91,61,245,0.18),0_8px_20px_rgba(0,0,0,0.06)]"
      style={{
        background:
          "linear-gradient(135deg, #5b3df5 0%, #7b2ff7 45%, #ff0f7b 100%)",
      }}
    >
      <div className="flex-1 w-full bg-white rounded-[28px] flex flex-col items-center justify-center px-8 py-16">
        
        {/* Avatar */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-60 h-60 rounded-full object-cover mb-10 border-[6px] border-white shadow-[0_20px_50px_rgba(123,47,247,0.25)]"
          />
        ) : (
          <div
            className="w-60 h-60 rounded-full flex items-center justify-center text-white text-[84px] font-extrabold mb-10"
            style={{
              background:
                "linear-gradient(135deg, #5b3df5 0%, #7b2ff7 45%, #a855f7 100%)",
            }}
          >
            {initials}
          </div>
        )}

        {/* Title */}
        <h2 className="m-0 text-[2rem] font-bold text-slate-900 text-center">
          {title}
        </h2>

        {/* Name */}
        <p className="text-xl font-semibold text-slate-900 m-0 mt-2">
          {name}
        </p>

        {/* Location */}
        {location && (
          <p className="mt-2 text-[1.1rem] text-slate-500">
            {location}
          </p>
        )}
      </div>
    </div>
  );
};