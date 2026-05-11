// cv resume management
// move upload resume button here
// also a download and delete button icon on the right of the resume pdf
// add minimal ui for now

import React from "react";

const RecruiterPortal = ({ onUploadClick }) => {

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-4">
          Recruiter Portal
        </h1>

        <p className="text-gray-600 mb-6">
          Upload or replace your resume for recruiters to view and download.
        </p>

        <button
          onClick={onUploadClick}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Upload Resume
        </button>

      </div>

    </div>
  );
};

export default RecruiterPortal;