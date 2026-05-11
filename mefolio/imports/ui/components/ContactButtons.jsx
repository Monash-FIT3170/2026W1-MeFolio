// import React from "react";
import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { ResumeFiles } from "/imports/api/files/resumeFiles";
import { useEffect } from "react";

const ContactButtons = ({ portfolio }) => {

  const [resumeLink, setResumeLink] = useState(
    portfolio?.recruiterInfo?.resumeLink || ""
  );

  useEffect(() => {
    setResumeLink(portfolio?.recruiterInfo?.resumeLink || "");
  }, [portfolio?.recruiterInfo?.resumeLink]);

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
        Get in touch
      </button>

      {Boolean(resumeLink) && (
        <>
          <a href={resumeLink} target="_blank" rel="noreferrer">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#F3F4F6] hover:bg-slate-50 text-slate-900 text-base font-semibold rounded-xl transition-colors duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 border-none">
              View Resume
            </button>
          </a>

          <a
            href={resumeLink}
            download
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-slate-50 text-slate-900 text-base font-semibold rounded-xl border border-slate-300 hover:border-[#5b3df5] transition-colors duration-150 cursor-pointer"
          >
            Download Resume
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