import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { PortfolioCollection } from "/imports/api/portfolio";
import { PortfolioPreview } from "../Portfolio Preview/PortfolioPreview.jsx";
import {
  Shield,
  Building,
  DollarSign,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  LogOut,
  Lock,
} from "lucide-react";

/**
 * FEAT-15: Recruiter-only view.
 *
 * Access is verified explicitly via `recruiter.verifyAccess` on every mount
 * (including refresh), rather than inferred from whatever happens to be in
 * PortfolioCollection locally. This avoids two bugs:
 *  - Minimongo can already hold this portfolio doc from an unrelated
 *    subscription (e.g. the owner's own dashboard in the same tab), which
 *    made an invalid/revoked token look "valid" because *a* doc existed.
 *  - Passing the error via router `state` doesn't survive a hard refresh.
 * Invalid/revoked/expired state is rendered inline here instead of via
 * Navigate, so refreshing re-checks and lands on the same screen.
 */
export function RecruiterView() {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const token =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(`recruiter_token_${portfolioId}`)
      : null;

  // 'checking' | 'valid' | 'invalid'
  const [accessState, setAccessState] = useState(token ? "checking" : "invalid");
  const [invalidReason, setInvalidReason] = useState(
    token ? "" : "This link is missing an access code.",
  );

  // Re-verify the token against the server on every mount/refresh and
  // whenever portfolioId/token change.
  useEffect(() => {
    if (!token) {
      setAccessState("invalid");
      setInvalidReason("This link is missing an access code.");
      return;
    }

    let cancelled = false;
    setAccessState("checking");

    Meteor.call(
      "recruiter.verifyAccess",
      { portfolioId, accessCode: token },
      (err) => {
        if (cancelled) return;
        if (err) {
          sessionStorage.removeItem(`recruiter_token_${portfolioId}`);
          setInvalidReason(
            err.reason || "This link has been revoked or has expired.",
          );
          setAccessState("invalid");
        } else {
          setAccessState("valid");
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [portfolioId, token]);

  // Only subscribe once we've confirmed the token is currently valid.
  const { portfolio, isReady } = useTracker(() => {
    if (accessState !== "valid") return { portfolio: null, isReady: false };
    const handle = Meteor.subscribe(
      "portfolio.recruiterView",
      portfolioId,
      token,
    );
    return {
      portfolio: PortfolioCollection.findOne(portfolioId),
      isReady: handle.ready(),
    };
  }, [portfolioId, token, accessState]);

  const handleExit = () => {
    sessionStorage.removeItem(`recruiter_token_${portfolioId}`);
    navigate(`/recruiter/${portfolioId}`);
  };

  // --- Invalid / revoked / expired link ---
  if (accessState === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
        <div className="w-full max-w-md text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <div className="p-3 bg-red-50 rounded-2xl mb-4 inline-flex">
            <Lock className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Link no longer valid
          </h1>
          <p className="text-gray-500 mt-2">{invalidReason}</p>
          <p className="text-gray-400 text-sm mt-6">
            Ask the portfolio owner for a new access link.
          </p>
        </div>
      </div>
    );
  }

  // --- Still verifying, or subscription not ready yet ---
  if (accessState === "checking" || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted font-main">
        Loading portfolio…
      </div>
    );
  }

  const published = portfolio?.publishedContent;
  const recruiter = portfolio?.recruiterInfo || {};
  const resumeLink =
    (Array.isArray(recruiter.resumeLinks) && recruiter.resumeLinks[0]?.url) ||
    recruiter.resumeLink ||
    published?.cta?.resumeUrl ||
    "";

  const details = [
    { icon: Building, label: "Company", value: recruiter.companyName },
    {
      icon: DollarSign,
      label: "Salary expectation",
      value: recruiter.salaryExpectation,
    },
    { icon: Phone, label: "Phone", value: recruiter.phoneNumber },
    { icon: MapPin, label: "Location", value: recruiter.currentLocation },
    { icon: Calendar, label: "Availability", value: recruiter.availability },
  ].filter((detail) => detail.value);

  const hasRecruiterDetails = details.length > 0 || !!recruiter.personalNote;

  return (
    <div className="min-h-screen bg-background font-main">
      {/* Slim recruiter header (owner chrome is hidden in PortfolioPreview) */}
      <div className="border-b border-line bg-surface-fill">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent1" />
            <span className="text-lg font-bold text-primary">
              Recruiter View
            </span>
          </div>
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary border border-line rounded-lg hover:bg-selected transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Exit
          </button>
        </div>
      </div>

      {/* The full published portfolio */}
      {published ? (
        <PortfolioPreview
          portfolio={published}
          projects={published.projects || []}
          isPublishedView
          isRecruiterView
        />
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-10">
          <section className="bg-surface-fill border border-line rounded-2xl p-7 text-center">
            <h1 className="text-xl font-bold text-primary">
              This portfolio hasn&apos;t been published yet
            </h1>
            <p className="text-muted mt-2">
              The owner needs to publish their portfolio before it can be viewed
              here.
            </p>
          </section>
        </div>
      )}

      {/* Recruiter-only details */}
      {hasRecruiterDetails && (
        <div className="max-w-2xl mx-auto px-6 pb-12">
          <section className="bg-surface-fill border border-line rounded-2xl p-7">
            <h2 className="text-lg font-bold text-primary mb-4">
              Recruiter details
            </h2>

            {details.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 mt-1 text-accent1" />
                    <div>
                      <p className="text-xs text-muted">{label}</p>
                      <p className="font-medium text-primary">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recruiter.personalNote && (
              <div className="mt-6 flex items-start gap-3">
                <MessageSquare className="w-4 h-4 mt-1 text-accent1" />
                <div>
                  <p className="text-xs text-muted">Personal note</p>
                  <p className="font-medium text-primary">
                    {recruiter.personalNote}
                  </p>
                </div>
              </div>
            )}

            {resumeLink && (
              <a
                href={resumeLink}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-button text-secondary rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                <FileText className="w-4 h-4" />
                View resume
              </a>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default RecruiterView;
