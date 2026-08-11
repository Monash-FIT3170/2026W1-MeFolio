import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Shield } from "lucide-react";

/**
 * FEAT-14: Recruiter-only view (placeholder).
 *
 * Reached after a successful access-code entry on RecruiterLoginPage, which
 * stores the token in sessionStorage. This is a lightweight gate + placeholder
 * until the full read-only recruiter view lands in FEAT-15 (see the FEAT-15
 * integration plan). If there is no stored token, we send the visitor back to
 * the access-code screen rather than showing anything.
 */
export function RecruiterView() {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem(`recruiter_token_${portfolioId}`);

  if (!token) {
    return <Navigate to={`/recruiter/${portfolioId}`} replace />;
  }

  const handleExit = () => {
    sessionStorage.removeItem(`recruiter_token_${portfolioId}`);
    navigate(`/recruiter/${portfolioId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-main p-6">
      <div className="w-full max-w-md text-center bg-surface-fill border border-line rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-7 h-7 text-accent1" />
          <span className="text-2xl font-bold text-primary">
            Recruiter View
          </span>
        </div>
        <p className="text-primary font-semibold mb-2">Access granted.</p>
        <p className="text-muted mb-8">
          The full recruiter view is coming soon. It will show this portfolio
          owner&apos;s recruiter-only details here.
        </p>
        <button
          onClick={handleExit}
          className="w-full bg-button text-background py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          Exit
        </button>
      </div>
    </div>
  );
}

export default RecruiterView;
