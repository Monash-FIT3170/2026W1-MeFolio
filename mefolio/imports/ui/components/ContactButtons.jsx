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
  }, [portfolio]);

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

      if (error) {
        console.error(error);
        alert("Upload failed");
        return;
      }

      console.log(fileObj);

      const fileUrl = `${fileObj._downloadRoute}/${fileObj._collectionName}/${fileObj._id}.${fileObj.extension}`;

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

          alert("Upload successful");
        }
      );
    });

    upload.start();
  };

  const buttonBase =
    "text-white px-4 py-2 rounded flex items-center gap-2 transition-colors";

  return (
    <div className="contact-buttons flex flex-wrap gap-3">

      <button className={`${buttonBase} bg-blue-600 hover:bg-blue-700`}>
        Get in touch
      </button>

      {resumeLink ? (
        <>
          <a href={resumeLink} target="_blank" rel="noreferrer">
            <button className={`${buttonBase} bg-gray-500 hover:bg-gray-600`}>
              View Resume
            </button>
          </a>

          <a href={resumeLink} download>
            <button className={`${buttonBase} bg-green-600 hover:bg-green-700`}>
              Download Resume
            </button>
          </a>

          <button className={`${buttonBase} bg-purple-600 hover:bg-purple-700`} onClick={handleUploadClick}>
            Replace Resume
          </button>
        </>
      ) : (
        <button className={`${buttonBase} bg-purple-600 hover:bg-purple-700`} onClick={handleUploadClick}>
          Upload Resume
        </button>
      )}

      <input
        type="file"
        id="resume-upload"
        style={{ display: "none" }}
        accept="application/pdf"
        onChange={handleFileChange}
      />

    </div>
  );
};

export default ContactButtons;