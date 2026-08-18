import { useState, useRef, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { ResumeFiles } from "/imports/api/files/resumeFiles";
import { PortfolioCollection } from "/imports/api/portfolio";
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
  Link2,
  ChevronDown,
  ExternalLink,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import PropTypes from "prop-types";

const RecruiterPortal = ({ portfolio, userId }) => {
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);

  // Link management states
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(
    portfolio?._id || "",
  );
  const [recruiterLinks, setRecruiterLinks] = useState([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [expandedLink, setExpandedLink] = useState(null);

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

  // Get all portfolios for the current user for link-management
  const { allPortfolios } = useTracker(() => {
    Meteor.subscribe("portfolios.all");
    const portfolios = PortfolioCollection.find({ userId }).fetch();
    return { allPortfolios: portfolios };
  }, [userId]);

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

  // Load recruiter links
  useEffect(() => {
    if (!selectedPortfolioId) {
      setRecruiterLinks([]);
      return;
    }

    const currentPortfolio = allPortfolios.find(
      (p) => p._id === selectedPortfolioId,
    );
    if (currentPortfolio?.recruiterInfo?.generatedLinks) {
      setRecruiterLinks(currentPortfolio.recruiterInfo.generatedLinks);
    } else {
      setRecruiterLinks([]);
    }
  }, [selectedPortfolioId, allPortfolios]);

  // Update selected portfolio when prop changes
  useEffect(() => {
    if (portfolio?._id && portfolio._id !== selectedPortfolioId) {
      setSelectedPortfolioId(portfolio._id);
    }
  }, [portfolio?._id]);

  // Get selected portfolio
  const selectedPortfolio =
    allPortfolios.find((p) => p._id === selectedPortfolioId) || portfolio;

  // Generates Recruiter Access Token
  const handleGenerateCode = () => {
    if (!selectedPortfolioId) {
      setCodeMessage({ type: "error", text: "No portfolio selected." });
      return;
    }

    setIsSaving(true);
    setCodeMessage({ type: "", text: "" });

    Meteor.call(
      "tokens.generate",
      { portfolioId: selectedPortfolioId, recruiterName: "General Recruiter" },
      (err, token) => {
        setIsSaving(false);
        if (err) {
          setCodeMessage({
            type: "error",
            text: `Failed to generate code: ${err.reason || "Unknown error"}`,
          });
        } else {
          handleChange("accessCode", token);

          // TODO: expiry date can be added and saved
          const newLink = {
            token: token,
            status: "active",
            createdAt: new Date(),
            expiresAt: null,
          };

          // Get existing links from the portfolio
          const currentPortfolio = allPortfolios.find(
            (p) => p._id === selectedPortfolioId,
          );
          const existingLinks =
            currentPortfolio?.recruiterInfo?.generatedLinks || [];
          const updatedLinks = [newLink, ...existingLinks];

          Meteor.call(
            "portfolios.update",
            selectedPortfolioId,
            {
              "recruiterInfo.generatedLinks": updatedLinks,
            },
            (updateErr) => {
              if (updateErr) {
                setCodeMessage({
                  type: "error",
                  text: `Failed to save link: ${updateErr.reason || "Unknown error"}`,
                });
              } else {
                setRecruiterLinks(updatedLinks);
                setCodeMessage({
                  type: "success",
                  text: "New access code generated and saved!",
                });
              }
            },
          );
        }
      },
    );
  };

  // Revokes a specific recruiter access token
  const handleRevokeCode = (token) => {
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to revoke this recruiter access link? Anyone using this code will immediately lose access.",
    );
    if (!confirmed) return;

    setIsRevoking(true);
    setCodeMessage({ type: "", text: "" });

    const updatedLinks = recruiterLinks.map((link) =>
      link.token === token ? { ...link, status: "revoked" } : link,
    );
    setRecruiterLinks(updatedLinks);

    Meteor.call(
      "portfolios.update",
      selectedPortfolioId,
      {
        "recruiterInfo.generatedLinks": updatedLinks,
      },
      (err) => {
        setIsRevoking(false);
        if (err) {
          setCodeMessage({
            type: "error",
            text: `Failed to revoke access link: ${err.reason || "Unknown error"}`,
          });
          setRecruiterLinks(recruiterLinks);
        } else {
          if (token === recruiterInfo.accessCode) {
            handleChange("accessCode", "");
          }
          setCodeMessage({
            type: "success",
            text: "Recruiter access link has been revoked.",
          });
        }
      },
    );
  };

  // Revoke the current active code
  const handleRevokeCurrentCode = () => {
    if (!recruiterInfo.accessCode) return;
    handleRevokeCode(recruiterInfo.accessCode);
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

  // Copy the access code to the clipboard. Wrapped in try/catch because
  // navigator.clipboard.writeText rejects (e.g. "Document is not focused")
  // in some browser states, which otherwise surfaces as an uncaught error.
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

  const baseRecruiterLink = selectedPortfolioId
    ? `${window.location.origin}/recruiter/${selectedPortfolioId}`
    : "";

  // Copy the shareable recruiter link. Same try/catch guard as the code copy.
  const copyLink = async () => {
    if (!baseRecruiterLink) return;
    try {
      await navigator.clipboard.writeText(baseRecruiterLink);
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

  const getLinkStatus = (status) => {
    const statusMap = {
      active: { color: "bg-green-100 text-green-800", label: "ACTIVE" },
      expired: { color: "bg-yellow-100 text-yellow-800", label: "EXPIRED" },
      revoked: { color: "bg-red-100 text-red-800", label: "REVOKED" },
      pending: { color: "bg-blue-100 text-blue-800", label: "PENDING" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const toggleExpand = (token) => {
    setExpandedLink(expandedLink === token ? null : token);
  };

  return (
    <div className="space-y-8">
      {/* PORTFOLIO SELECTOR */}
      <section className="bg-surface-fill border border-line rounded-2xl p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary mb-4">
          <Link2 size={22} />
          Select Portfolio
        </h2>
        <p className="text-muted text-sm mb-4">
          Select a portfolio to manage recruiter links.
        </p>
        <div className="relative">
          <select
            value={selectedPortfolioId}
            onChange={(e) => setSelectedPortfolioId(e.target.value)}
            className="w-full px-4 py-3 bg-background text-primary border border-line rounded-lg focus:ring-2 focus:ring-accent1 focus:border-transparent outline-none appearance-none min-h-[44px]"
          >
            {allPortfolios.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title || "Untitled Portfolio"}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
      </section>

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

      {/* ACCESS CODE SECTION */}
      <section className="bg-surface-fill border border-line rounded-2xl p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary mb-2">
          <Shield size={22} />
          Recruiter Access Codes
        </h2>

        <p className="text-muted mb-6">
          Generate and manage access codes for recruiters to view your private
          portfolio. Each code can be revoked at any time. The shareable link is
          the same for all recruiters, but each recruiter needs their own unique
          access code.
        </p>

        {/* Base Link */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Shareable Link:
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="flex-1 p-2 bg-white rounded border border-blue-200 text-sm text-blue-700 font-mono break-all min-h-[44px] flex items-center">
              {baseRecruiterLink || "Select a portfolio first"}
            </code>
            <button
              onClick={copyLink}
              disabled={!baseRecruiterLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors min-h-[44px] disabled:opacity-50 whitespace-nowrap"
            >
              {copiedLink ? "✓ Copied" : "Copy Link"}
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Share this link with recruiters. Each recruiter will need their own
            access code.
          </p>
        </div>

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

        {/* Generate New Code Button */}
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
        </div>

        {/* Links Table with Expandable Details */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-primary mb-4">
            Generated Access Codes
          </h3>

          {isLoadingLinks ? (
            <div className="text-center py-8 text-muted">
              Loading access codes...
            </div>
          ) : recruiterLinks.length === 0 ? (
            <div className="text-center py-8 text-muted border border-dashed border-line rounded-lg">
              No access codes generated yet. Click "Generate New Code" to create
              one.
            </div>
          ) : (
            <div className="space-y-3">
              {recruiterLinks.map((link) => {
                const statusBadge = getLinkStatus(link.status);
                const isExpanded = expandedLink === link.token;
                return (
                  <div
                    key={link.token}
                    className="border border-line rounded-lg overflow-hidden"
                  >
                    {/* Clickable Row */}
                    <div
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-selected/30 transition-colors ${
                        isExpanded ? "bg-selected/20" : ""
                      }`}
                      onClick={() => toggleExpand(link.token)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-sm font-mono text-primary truncate">
                          {link.token}
                        </span>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="px-4 py-3 border-t border-line bg-background">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-muted">Access Code</p>
                            <p className="text-sm font-mono text-primary break-all">
                              {link.token}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Status</p>
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge.color}`}
                            >
                              {statusBadge.label}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Created</p>
                            <p className="text-sm text-primary">
                              {link.createdAt
                                ? new Date(link.createdAt).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Expires</p>
                            <p className="text-sm text-primary">
                              {link.expiresAt
                                ? new Date(link.expiresAt).toLocaleDateString()
                                : "Never"}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted">
                              Full Link for Recruiter
                            </p>
                            <code className="block mt-1 text-xs text-primary bg-surface-fill p-2 rounded border border-line break-all">
                              {baseRecruiterLink}
                            </code>
                            <p className="text-xs text-muted mt-1">
                              Recruiter will need to enter:{" "}
                              <span className="font-mono font-bold">
                                {link.token}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(baseRecruiterLink);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-accent1 border border-line rounded hover:bg-selected transition-colors min-h-[44px]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(link.token);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-accent1 border border-line rounded hover:bg-selected transition-colors min-h-[44px]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Code
                          </button>
                          {link.status === "active" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevokeCode(link.token);
                              }}
                              disabled={isRevoking}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded transition-colors min-h-[44px] disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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

RecruiterPortal.propTypes = {
  portfolio: PropTypes.object,
  userId: PropTypes.string,
};

export default RecruiterPortal;
