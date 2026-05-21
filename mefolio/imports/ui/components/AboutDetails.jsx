import React from "react";

const AboutDetails = ({ portfolio }) => {
  return (
    <div className="flex flex-col items-start gap-6">
      <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-full">
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Available for hire
      </span>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-gray-900 m-0">
        {portfolio?.title || "Full-Stack Developer & Problem Solver"}
      </h1>

      <p className="text-lg leading-relaxed text-gray-500 max-w-[34rem] m-0">
        {portfolio?.bio || "No bio provided yet."}
      </p>
    </div>
  );
};

export default AboutDetails;