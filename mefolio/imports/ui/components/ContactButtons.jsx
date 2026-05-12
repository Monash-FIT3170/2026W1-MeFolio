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
    <div className="flex gap-3 flex-wrap">
      <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b3df5] hover:bg-[#4a30d4] text-white text-base font-semibold rounded-xl transition-colors duration-150 cursor-pointer border-none">
        <Mail size={18} />
        Get in touch
      </button>

      {Boolean(resumeLink) && (
        <>
          <a href={resumeLink} target="_blank" rel="noreferrer">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#F3F4F6] hover:bg-slate-50 text-slate-900 text-base font-semibold rounded-xl transition-colors duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 border-none">
              <ExternalLink size={18} />
              View Resume
            </button>
          </a>
        </>
      )}
      
      {/* <input
        type="file"
        id="resume-upload"
        style={{ display: "none" }}
        accept="application/pdf"
        onChange={handleFileChange}
      /> */}
    </div>
  );
};

export default ContactButtons;