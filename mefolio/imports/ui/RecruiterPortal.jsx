import React, { useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { ResumeFiles } from "/imports/api/files/resumeFiles";
import { Eye, Trash2, Plus, Download } from "lucide-react";

const RecruiterPortal = ({ portfolio }) => {
  const fileInputRef = useRef(null);

  // NEW: local UI list of uploaded resumes
  const [resumes, setResumes] = useState([]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (url) => {
    setResumes((prev) => prev.filter((r) => r.url !== url));

    // optional DB delete if you later support multiple resumes
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const upload = ResumeFiles.insert(
      {
        file,
        chunkSize: "dynamic",
      },
      false
    );

    upload.on("error", (err) => {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    });

    upload.on("end", (error, fileObj) => {
      if (error) {
        console.error(error);
        alert("Upload failed");
        return;
      }

      const fileUrl =
        `${fileObj._downloadRoute}/${fileObj._collectionName}/${fileObj._id}.${fileObj.extension}`;

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

          // NEW: update UI instantly
          setResumes((prev) => [
            ...prev,
            {
              name: fileObj.original?.name || file.name,
              url: fileUrl,
            },
          ]);

          alert("Upload successful");
        }
      );
    });

    upload.start();
  };

  return (
    <section className="placeholder-card">
      <h2 className="flex items-center gap-2">
        <Download size={22} />
        CV/Resume Management
      </h2>

      <p className="mb-8">
        Upload and manage your resumes. Recruiters will have access to download these files.
      </p>

      <div className="mt-6 space-y-3">
        {resumes.map((resume, index) => (
          <div
            key={index}
            className="flex justify-between items-center px-5 py-3.5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] shadow-sm"
          >
            <span className="text-sm font-medium">
              {resume.name}
            </span>

            <div className="flex items-center gap-2">
              <a
                href={resume.url}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-md hover:bg-slate-100 transition"
              >
                <Eye size={18} />
              </a>

              <button
                onClick={() => handleDelete(resume.url)}
                className="p-2 rounded-md hover:bg-red-100 text-red-600 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-5.5 py-3 bg-transparent hover:bg-slate-50 text-sm font-semibold rounded-xl border border-slate-300 hover:border-[#5b3df5] transition-colors duration-150 cursor-pointer"
        >
          <Plus size={16} />
          Upload New Resume
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        accept="application/pdf"
        onChange={handleFileChange}
      />
    </section>
  );
};

export default RecruiterPortal;