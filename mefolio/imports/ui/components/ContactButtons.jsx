// import React from "react";
import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { ResumeFiles } from "/imports/api/files/resumeFiles";
import { useEffect } from "react";
import { Mail, ExternalLink } from "lucide-react";

const ContactButtons = ({ portfolio }) => {
  const resumeLinkValue = Array.isArray(portfolio?.recruiterInfo?.resumeLinks)
    ? portfolio.recruiterInfo.resumeLinks[0]?.url || ""
    : portfolio?.recruiterInfo?.resumeLink || "";

  const [resumeLink, setResumeLink] = useState(resumeLinkValue);

  useEffect(() => {
    setResumeLink(
      Array.isArray(portfolio?.recruiterInfo?.resumeLinks)
        ? portfolio.recruiterInfo.resumeLinks[0]?.url || ""
        : portfolio?.recruiterInfo?.resumeLink || ""
    );
  }, [portfolio?.recruiterInfo?.resumeLink, portfolio?.recruiterInfo?.resumeLinks]);

  const handleUploadClick = () => {
    document.getElementById("resume-upload").click();
  };

  const handleFileChange = (event) => {

    const file = event.target.files[0];
    if (!file) return;

    const upload = ResumeFiles.insert({
      file,
      chunkSize: "dynamic",
    }, false);

    upload.on("end", (error, fileObj) => {

      console.log("UPLOAD END");
      console.log(fileObj);

      if (!portfolio?._id) return;

      Meteor.call(
        "portfolios.update",
        portfolio?._id,
        {
          "recruiterInfo.resumeLink": fileUrl,
        },
        (err) => {

          if (err) {
            console.error(err);
            alert("Database update failed");
            return;
          }

          setResumeLink(fileUrl);
        }
      );
    });

    upload.start();
  };

  const buttonBase =
    "text-white px-4 py-2 rounded flex items-center gap-2 transition-colors";

  return (
    <div className="flex flex-wrap gap-4">
      <button className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors active:scale-[0.98]">
        <Mail size={18} />
        Get in touch
      </button>

      {Boolean(resumeLink) && (
        <a
          href={resumeLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors active:scale-[0.98]"
        >
          <ExternalLink size={18} />
          View Resume
        </a>
      )}
    </div>
  );
};

export default ContactButtons;
