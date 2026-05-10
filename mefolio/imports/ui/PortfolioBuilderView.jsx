import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { PortfolioCollection } from "../api/portfolio";
import {
  createDashboardViewModel,
  getCurrentTab
} from "../models/portfolioBuilderViewModel";

import "./PortfolioBuilderView.css";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { ModeSwitch } from "./ModeButton";
import { PortfolioView } from "./PortfolioView";


import ProfileSummary from "./Portfolio Builder/ProfileSummary";
import PlaceholderSection from "./Portfolio Builder/PlaceholderSection";
import OverviewSection from "./Portfolio Builder/OverviewSection";
import ProfileSettings from "./Portfolio Builder/ProfileSettings";



// Custom hook to fetch real portfolio data from MongoDB via Meteor
const useDashboardData = () =>
  useTracker(() => {
    const portfoliosHandler = Meteor.subscribe("portfolios.all");
    const portfolios = PortfolioCollection.find({}).fetch();

    /* HANDOVER
    Currently fetching from the dummy users1 collection as there is no logged in user system set up yet. 
    Will switch to Meteor.user() once authentication is implemented.

    const user = Meteor.user(); 
    */
    const usersHandler = Meteor.subscribe("users1.all");
    const user = UsersCollection.find({}).fetch();

    return {
      isLoading: !portfoliosHandler.ready() || !usersHandler.ready(),
      portfolios,
      user
    };
  });

// Top-level dashboard view that coordinates tab state and renders the active section.
const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { portfolios, isLoading: portfoliosLoading } = useTracker(() => {
    const handler = Meteor.subscribe("portfolios.all");
    return {
      portfolios: PortfolioCollection.find({}, { sort: { createdAt: -1 } }).fetch(),
      isLoading: !handler.ready(),
    };
  });

  const { isLoading, sidebarItems, overviewStats, liveVisitors, profile, aboutMe, portfolioId } =
    createDashboardViewModel({ isLoading: portfoliosLoading, portfolios });

  const currentTab = getCurrentTab(sidebarItems, activeTab);

  if (viewModelLoading) {
    return <p className="builder-loading">Loading...</p>;
  }

  if (!currentTab) {
    return <p className="builder-loading">No dashboard sections available.</p>;
  }

    return (
      <div className="builder-layout">
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          profile={profile}
          onPreviewToggle={(isPreview) => {
            if (isPreview) navigate("/preview");
          }}
        />

      <main className="builder-main">
        <header className="builder-header">
          <h1>{currentTab.label}</h1>
        </header>

        <div className="builder-content">
          {activeTab === "overview" ? (
            <OverviewSection stats={overviewStats} visitors={liveVisitors} />
          ) : activeTab === "about-me" ? (
            <AboutMeBioForm aboutMe={aboutMe} portfolioId={portfolioId} />
          ) : (
            <PlaceholderSection title={currentTab.label} />
          )}
        </div>
      </main>
    </div>
  );
};

// Sidebar navigation for switching dashboard sections.
const Sidebar = ({
  items,
  activeTab,
  onTabChange,
  profile,
  onPreviewToggle
}) => {
  return (
    <aside className="builder-sidebar">
      <div className="sidebar-top">
        <div className="builder-logo">
          <span>MeFolio</span>
        </div>

        <ModeSwitch onToggle={onPreviewToggle} />
      </div>

      <nav className="builder-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={
              activeTab === item.id
                ? "builder-nav-item active"
                : "builder-nav-item"
            }
            onClick={() => onTabChange(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <ProfileSummary profile={profile} />
    </aside>
  );
};

export const PortfolioBuilderView = () => {
  return(
    <Routes>
      <Route path="/" element={<DashboardLayout />} />
      <Route path="/preview" element={<PortfolioView />} />
    </Routes>

  );
};

// Overview tab content that displays summary stats and recent visitor activity.
const OverviewSection = ({ stats, visitors }) => {
  return (
    <>
      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className="live-visitors-card">
        <div className="live-visitors-header">
          <h2>Live Visitors</h2>
          <button>View all</button>
        </div>

        <div className="visitor-list">
          {visitors.map((visitor) => (
            <Visitor key={visitor.id} visitor={visitor} />
          ))}
        </div>
      </section>
    </>
  );
};

// Reusable card for a single dashboard statistic.
const StatCard = ({ stat }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-change"> -^ {stat.change}</span>
      </div>

      <h2>{stat.value}</h2>
      <p>{stat.label}</p>
    </div>
  );
};

// Displays one visitor row inside the live visitors list.
const Visitor = ({ visitor }) => {
  return (
    <div className="visitor-row">
      <div className={visitor.active ? "visitor-dot active" : "visitor-dot"} />

      <div className="visitor-details">
        <h3>{visitor.name}</h3>
        <p>{visitor.email}</p>
        <p>{visitor.activity}</p>
        <span>{visitor.location} · 2 min ago</span>
      </div>

      <div className="visitor-duration">{visitor.duration}</div>
    </div>
  );
};

// Generic placeholder used for dashboard tabs that are not built yet.
const PlaceholderSection = ({ title, description = "This section is a placeholder for now." }) => {
  return (
    <section className="placeholder-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
};

// About Me Bio Form Component
const AboutMeBioForm = ({ aboutMe, portfolioId }) => {
  const [formData, setFormData] = useState(() => {
    const { customSection, ...rest } = aboutMe || {};
    return {
      ...rest,
      highlights: Array.isArray(rest.highlights) ? rest.highlights : [],
    };
  });
  const [originalData, setOriginalData] = useState(() => {
    const { customSection, ...rest } = aboutMe || {};
    return {
      ...rest,
      highlights: Array.isArray(rest.highlights) ? rest.highlights : [],
    };
  });
  const [highlightInput, setHighlightInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const { customSection, ...rest } = aboutMe || {};
    setFormData({
      ...rest,
      highlights: Array.isArray(rest.highlights) ? rest.highlights : [],
    });
    setOriginalData({
      ...rest,
      highlights: Array.isArray(rest.highlights) ? rest.highlights : [],
    });
    setErrors({});
    setHighlightInput("");
  }, [aboutMe]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full Name must be at least 2 characters";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.headline?.trim()) {
      newErrors.headline = "Headline is required";
    } else if (formData.headline.length > 100) {
      newErrors.headline = "Headline must not exceed 100 characters";
    }

    if (!formData.professionalSummary?.trim()) {
      newErrors.professionalSummary = "Professional Summary is required";
    }

    if (formData.yearsOfExperience) {
      if (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50) {
        newErrors.yearsOfExperience = "Years of experience must be between 0 and 50";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors((prevErrors) => {
      const nextErrors = { ...prevErrors };
      delete nextErrors[field];
      delete nextErrors.submit;
      return nextErrors;
    });
  };

  const handleAddHighlight = () => {
    const trimmedInput = highlightInput.trim();
    if (!trimmedInput) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        highlights: "Highlight cannot be empty",
      }));
      return;
    }

    if (formData.highlights.includes(trimmedInput)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        highlights: "This highlight already exists",
      }));
      return;
    }

    setFormData({
      ...formData,
      highlights: [...formData.highlights, trimmedInput],
    });
    setHighlightInput("");
    setErrors((prevErrors) => {
      const nextErrors = { ...prevErrors };
      delete nextErrors.highlights;
      return nextErrors;
    });
  };

  const handleRemoveHighlight = (index) => {
    setFormData({
      ...formData,
      highlights: formData.highlights.filter((_, i) => i !== index),
    });
    setErrors((prevErrors) => {
      const nextErrors = { ...prevErrors };
      delete nextErrors.highlights;
      return nextErrors;
    });
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await new Promise((resolve, reject) => {
        if (portfolioId) {
          Meteor.call("portfolios.update", portfolioId, { bio: formData }, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        } else {
          Meteor.call(
            "portfolios.insert",
            {
              userId: "Superuser",
              username: "me",
              title: formData.portfolioTitle || "Personal Portfolio",
              bio: formData,
              createdAt: new Date(),
              projects: [],
              theme: "minimal",
              badges: [],
              recruiterInfo: { allowAccess: false },
            },
            (error) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            }
          );
        }
      });

      setOriginalData(formData);
      setShowSuccessMessage(true);
      setErrors({});
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error saving bio:", error);
      setErrors({ submit: "Failed to save. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    }
  };

  const handleDiscardChanges = () => {
    setFormData(originalData);
    setErrors({});
    setHighlightInput("");
    setShowDiscardModal(false);
  };

  return (
    <div className="about-me-form-container">
      {showDiscardModal && (
        <div className="modal-overlay" onClick={() => setShowDiscardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Discard Changes?</h3>
            <p>Are you sure you want to discard all unsaved changes?</p>
            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDiscardModal(false)}
              >
                Keep Editing
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="success-message">
          Bio saved successfully!
        </div>
      )}

      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}

      <form className="about-me-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {/* Mandatory Information Section */}
        <section className="form-section">
          <h3 className="section-title">Mandatory Information</h3>

          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName || ""}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`form-input ${errors.fullName ? "input-error" : ""}`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <span className="error-text">{errors.fullName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span className="error-text">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="headline">Headline * (max 100 characters)</label>
            <input
              id="headline"
              type="text"
              value={formData.headline || ""}
              onChange={(e) => handleInputChange("headline", e.target.value)}
              className={`form-input ${errors.headline ? "input-error" : ""}`}
              placeholder="e.g., Product Designer and Frontend Developer"
              maxLength="100"
            />
            <span className="char-count">{(formData.headline || "").length}/100</span>
            {errors.headline && (
              <span className="error-text">{errors.headline}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="professionalSummary">Professional Summary *</label>
            <textarea
              id="professionalSummary"
              value={formData.professionalSummary || ""}
              onChange={(e) => handleInputChange("professionalSummary", e.target.value)}
              className={`form-textarea ${errors.professionalSummary ? "input-error" : ""}`}
              placeholder="Tell us about yourself and your professional background..."
              rows="5"
            />
            {errors.professionalSummary && (
              <span className="error-text">{errors.professionalSummary}</span>
            )}
          </div>

        </section>

        {/* Additional Information Section */}
        <section className="form-section">
          <h3 className="section-title">Additional Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={formData.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="form-input"
                placeholder="e.g., Sydney, Australia"
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearsOfExperience">Years of Experience</label>
              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                max="50"
                value={formData.yearsOfExperience || ""}
                onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                className={`form-input ${errors.yearsOfExperience ? "input-error" : ""}`}
                placeholder="0-50"
              />
              {errors.yearsOfExperience && (
                <span className="error-text">{errors.yearsOfExperience}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="form-input"
              placeholder="e.g., +61 2 1234 5678"
            />
          </div>
        </section>

        {/* Highlights Section */}
        <section className="form-section">
          <h3 className="section-title">Highlights</h3>

          <div className="highlights-input-group">
            <input
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHighlight())}
              className="form-input"
              placeholder="Add a highlight (e.g., React Expert)"
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              className="btn btn-secondary"
            >
              Add
            </button>
          </div>
          {errors.highlights && (
            <span className="error-text">{errors.highlights}</span>
          )}

          <div className="highlights-list">
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="highlight-tag">
                <span>{highlight}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(index)}
                  className="highlight-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!hasChanges || isSaving || hasErrors}
            className={`btn btn-primary ${isSaving ? "is-loading" : ""}`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};
