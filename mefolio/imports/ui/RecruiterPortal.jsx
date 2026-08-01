import { useRef, useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { ResumeFiles } from "/imports/api/files/resumeFiles";
import { Eye, Trash2, Plus, Download } from "lucide-react";

const RecruiterPortal = ({ portfolio }) => {
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const resumeLinks = Array.isArray(portfolio?.recruiterInfo?.resumeLinks)
      ? portfolio.recruiterInfo.resumeLinks
      : portfolio?.recruiterInfo?.resumeLink
        ? [
            {
              name:
                portfolio.recruiterInfo.resumeLink.split("/").pop() ||
                "Resume.pdf",
              url: portfolio.recruiterInfo.resumeLink,
            },
          ]
        : [];

    setResumes(resumeLinks);
  }, [
    portfolio?.recruiterInfo?.resumeLink,
    portfolio?.recruiterInfo?.resumeLinks,
  ]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const syncResumeLinks = (updatedLinks) => {
    setResumes(updatedLinks);

    if (!portfolio?._id) {
      return;
    }

    Meteor.call(
      "portfolios.update",
      portfolio._id,
      {
        "recruiterInfo.resumeLinks": updatedLinks,
      },
      (err) => {
        if (err) {
          console.error(err);
          alert("Could not save uploaded resume list.");
        }
      },
    );
  };

  const handleDelete = (url) => {
    const updated = resumes.filter((r) => r.url !== url);
    syncResumeLinks(updated);
  };

  const handleFileUpload = (file) => {
    const upload = ResumeFiles.insert(
      {
        file,
        chunkSize: "dynamic",
      },
      false,
    );

    upload.on("end", (error, fileObj) => {
      if (error) {
        console.error(error);
        alert("Upload failed");
        return;
      }

      const fileUrl = `${fileObj._downloadRoute}/${fileObj._collectionName}/${fileObj._id}.${fileObj.extension}`;

      const newResume = {
        name: file.name,
        url: fileUrl,
      };

      setResumes((prevResumes) => {
        const updatedLinks = [...prevResumes, newResume];
        syncResumeLinks(updatedLinks);
        return updatedLinks;
      });

      alert("Upload successful");
    });

    upload.start();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    files.forEach((file) => {
      handleFileUpload(file);
    });

    event.target.value = null;
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-7">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-2">
        <Download size={22} />
        CV/Resume Management
      </h2>

      <p className="text-gray-500 mb-8">
        Upload and manage your resumes. Recruiters will have access to download
        these files. The top file in the list is chosen for the "View Resume"
        button in the recruiter view.
      </p>

      <div className="mt-6 space-y-3">
        {resumes.map((resume, index) => (
          <div
            key={index}
            className="flex justify-between items-center px-5 py-3.5 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] shadow-sm"
          >
            <span className="text-sm font-medium">{resume.name}</span>

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
