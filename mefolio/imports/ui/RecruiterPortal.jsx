import { useState, useRef, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { ResumeFiles } from "/imports/api/files/resumeFiles";
import {
  Building,
  DollarSign,
  Globe,
  RefreshCw,
  Copy,
  Check,
  EyeOff,
  Eye,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Shield,
  Download,
  Plus,
  Trash2,
  Ban,
} from "lucide-react";

const RecruiterPortal = ({ portfolio }) => {
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);

  // Recruiter settings state
  const [recruiterInfo, setRecruiterInfo] = useState({
    companyName: portfolio?.recruiterInfo?.companyName || "",
    salaryExpectation: portfolio?.recruiterInfo?.salaryExpectation || "",
    phoneNumber: portfolio?.recruiterInfo?.phoneNumber || "",
    currentLocation: portfolio?.recruiterInfo?.currentLocation || "",
    availability: portfolio?.recruiterInfo?.availability || "",
    personalNote: portfolio?.recruiterInfo?.personalNote || "",
    allowAccess: portfolio?.recruiterInfo?.allowAccess || false,
    accessCode: portfolio?.recruiterInfo?.accessCode || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [codeMessage, setCodeMessage] = useState({ type: "", text: "" });

  // Load resumes
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

  // Generates Recruiter Access Token
  const handleGenerateCode = () => {
    if (!portfolio?._id) {
      setCodeMessage({ type: "error", text: "No portfolio found." });
      return;
    }

    setIsSaving(true);
    setCodeMessage({ type: "", text: "" });

    Meteor.call(
      "tokens.generate",
      { portfolioId: portfolio._id, recruiterName: "General Recruiter" },
      (err, token) => {
        setIsSaving(false);
        if (err) {
          setCodeMessage({
            type: "error",
            text: `Failed to generate code: ${err.reason || "Unknown error"}`,
          });
        } else {
          handleChange("accessCode", token);
          setCodeMessage({
            type: "success",
            text: "New access code generated! Remember to click 'Save Changes'.",
          });
        }
      },
    );
  };

  // Revokes the current recruiter access token
  const handleRevokeCode = () => {
    if (!recruiterInfo.accessCode) return;

    const confirmed = window.confirm(
      "Are you sure you want to revoke this recruiter access link? Anyone using this code will immediately lose access.",
    );
    if (!confirmed) return;

    setIsRevoking(true);
    setCodeMessage({ type: "", text: "" });

    Meteor.call(
      "recruiterLinks.revoke",
      { token: recruiterInfo.accessCode },
      (err) => {
        setIsRevoking(false);
        if (err) {
          setCodeMessage({
            type: "error",
            text: `Failed to revoke access link: ${err.reason || "Unknown error"}`,
          });
        } else {
          handleChange("accessCode", "");
          setCodeMessage({
            type: "success",
            text: "Recruiter access link has been revoked.",
          });
        }
      },
    );
  };

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

  const handleChange = (field, value) => {
    setRecruiterInfo((prev) => ({ ...prev, [field]: value }));
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    if (!portfolio?._id) {
      setMessage({ type: "error", text: "No portfolio found." });
      setIsSaving(false);
      return;
    }

    Meteor.call(
      "portfolios.update",
      portfolio._id,
      {
        recruiterInfo: recruiterInfo,
      },
      (err) => {
        setIsSaving(false);
        if (err) {
          setMessage({
            type: "error",
            text: `Failed to save: ${err.reason || "Unknown error"}`,
          });
          console.error(err);
        } else {
          setMessage({
            type: "success",
            text: "Recruiter settings saved successfully!",
          });
          setIsEditing(false);
          setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
      },
    );
  };

  const copyAccessCode = async () => {
    if (!recruiterInfo.accessCode) return;
    try {
      await navigator.clipboard.writeText(recruiterInfo.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      setCodeMessage({
        type: "error",
        text: "Could not copy the code. Please copy it manually.",
      });
    }
  };

  const recruiterLink = recruiterInfo.accessCode
    ? `${window.location.origin}/recruiter/${portfolio._id}`
    : "";

  const copyLink = async () => {
    if (!recruiterLink) return;
    try {
      await navigator.clipboard.writeText(recruiterLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      setCodeMessage({
        type: "error",
        text: "Could not copy the link. Please copy it manually.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* RECRUITER SETTINGS SECTION */}
      <section className="bg-surface-fill border border-line rounded-2xl p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-primary">
              <Building size={22} />
              Recruiter Settings
            </h2>
            <p className="text-muted mt-1">
              Manage your recruiter profile information and access settings.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isEditing && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setRecruiterInfo({
                      companyName: portfolio?.recruiterInfo?.companyName || "",
                      salaryExpectation:
                        portfolio?.recruiterInfo?.salaryExpectation || "",
                      phoneNumber: portfolio?.recruiterInfo?.phoneNumber || "",
                      currentLocation:
                        portfolio?.recruiterInfo?.currentLocation || "",
                      availability:
                        portfolio?.recruiterInfo?.availability || "",
                      personalNote:
                        portfolio?.recruiterInfo?.personalNote || "",
                      allowAccess:
                        portfolio?.recruiterInfo?.allowAccess || false,
                      accessCode: portfolio?.recruiterInfo?.accessCode || "",
                    });
                  }}
                  className="px-4 py-2 text-sm font-bold text-muted border border-line rounded-lg hover:bg-selected transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-button text-secondary rounded-lg font-bold text-sm hover:opacity-90 transition-opacity min-h-[44px] disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-button text-secondary rounded-lg font-bold text-sm hover:opacity-90 transition-opacity min-h-[44px]"
              >
                Edit Settings
              </button>
            )}
          </div>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-bold ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : message.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : ""
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company Name
            </label>
            <input
              type="text"
              value={recruiterInfo.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-background text-primary border border-line rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none disabled:opacity-60 min-h-[44px]"
              placeholder="e.g., Google, Atlassian"
            />
          </div>

          {/* Salary Expectation */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Salary Expectation
            </label>
            <input
              type="text"
              value={recruiterInfo.salaryExpectation}
              onChange={(e) =>
                handleChange("salaryExpectation", e.target.value)
              }
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-background text-primary border border-line rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none disabled:opacity-60 min-h-[44px]"
              placeholder="e.g., $120,000 - $150,000"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <input
              type="tel"
              value={recruiterInfo.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-background text-primary border border-line rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none disabled:opacity-60 min-h-[44px]"
              placeholder="e.g., +61 412 345 678"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Current Location
            </label>
            <input
              type="text"
              value={recruiterInfo.currentLocation}
              onChange={(e) => handleChange("currentLocation", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-background text-primary border border-line rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none disabled:opacity-60 min-h-[44px]"
              placeholder="e.g., Sydney, Australia"
            />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Availability
            </label>
            <input
              type="text"
              value={recruiterInfo.availability}
              onChange={(e) => handleChange("availability", e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 bg-background text-primary border border-line rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none disabled:opacity-60 min-h-[44px]"
              placeholder="e.g., Immediate, 2 weeks notice"
            />
          </div>
        </div>

        {/* Personal Note */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-bold text-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Personal Note for Recruiters
          </label>
          <textarea
            value={recruiterInfo.personalNote}
            onChange={(e) => handleChange("personalNote", e.target.value)}
            disabled={!isEditing}
            rows={3}
            className="w-full px-4 py-3 bg-background text-primary border border-line rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none disabled:opacity-60 resize-none min-h-[44px]"
            placeholder="Tell recruiters about what you're looking for in your next role..."
          />
        </div>
      </section>

      {/* Access Code Section */}
      <section className="bg-surface-fill border border-line rounded-2xl p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary mb-2">
          <Shield size={22} />
          Recruiter Access Code
        </h2>

        <p className="text-muted mb-8">
          Generate and manage access codes for recruiters to view your private
          portfolio information!
        </p>

        {codeMessage.text && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-bold ${
              codeMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : codeMessage.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : ""
            }`}
          >
            {codeMessage.text}
          </div>
        )}

        {/* Action Buttons: Generate & Revoke */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <button
            onClick={handleGenerateCode}
            disabled={isSaving || isRevoking}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-accent1 border border-line rounded-lg hover:bg-selected transition-colors min-h-[44px] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`}
            />
            Generate New Code
          </button>

          <button
            onClick={handleRevokeCode}
            disabled={!recruiterInfo.accessCode || isSaving || isRevoking}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Ban className={`w-4 h-4 ${isRevoking ? "animate-spin" : ""}`} />
            {isRevoking ? "Revoking..." : "Revoke Access Link"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <input
              type={showAccessCode ? "text" : "password"}
              value={recruiterInfo.accessCode || "No access code generated yet"}
              readOnly
              className="w-full px-4 py-3 bg-background border border-line rounded-lg text-primary font-mono min-h-[44px]"
            />
            <button
              onClick={() => setShowAccessCode(!showAccessCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent1 transition-colors"
            >
              {showAccessCode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            onClick={copyAccessCode}
            disabled={!recruiterInfo.accessCode}
            className="w-full sm:w-auto px-4 py-3 border border-line rounded-lg hover:bg-selected transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {recruiterInfo.accessCode && (
          <div className="mt-4 p-4 bg-selected border border-line rounded-lg">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Share this link with recruiters:
            </p>
            <code className="block mt-2 p-2 bg-background rounded border border-line text-sm text-primary break-all">
              {recruiterLink}
            </code>
            <button
              onClick={copyLink}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-accent1 border border-line rounded-lg hover:bg-selected transition-colors min-h-[44px]"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Link copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy link
                </>
              )}
            </button>
            <p className="text-xs text-muted mt-2">
              Recruiters will need the access code to view your private
              portfolio information.
            </p>
          </div>
        )}

        <div className="mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={recruiterInfo.allowAccess}
              onChange={(e) => handleChange("allowAccess", e.target.checked)}
              disabled={!isEditing}
              className="w-5 h-5 rounded border-line text-accent1 focus:ring-accent1"
            />
            <span className="text-sm font-medium text-primary">
              Allow recruiters to access my private portfolio information
            </span>
          </label>
        </div>
      </section>

      {/* CV/Resume Management Section */}
      <section className="bg-surface-fill border border-line rounded-2xl p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary mb-2">
          <Download size={22} />
          CV/Resume Management
        </h2>

        <p className="text-muted mb-8">
          Upload and manage your resumes. Recruiters will have access to
          download these files. The top file in the list is chosen for the "View
          Resume" button in the recruiter view.
        </p>

        <div className="mt-6 space-y-3">
          {resumes.map((resume, index) => (
            <div
              key={index}
              className="flex justify-between items-center px-5 py-3.5 border border-line rounded-lg bg-background shadow-sm"
            >
              <span className="text-sm font-medium text-primary">
                {resume.name}
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={resume.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-md hover:bg-selected transition"
                >
                  <Eye className="w-4 h-4" />
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

        <div className="mt-5 pt-4 border-t border-line">
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-5.5 py-3 bg-transparent hover:bg-selected text-sm font-semibold rounded-xl border border-line hover:border-accent1 transition-colors duration-150 cursor-pointer text-primary"
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
    </div>
  );
};

export default RecruiterPortal;
