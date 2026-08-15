import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { KeyRound, Lock, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";

/**
 * FEAT-14: Recruiter Access Portal
 *
 * Dedicated, unauthenticated screen that gates a recruiter portal behind an
 * access code. A recruiter reaches this via a shared link (/recruiter/:portfolioId),
 * enters the code the portfolio owner gave them, and on success is taken to the
 * recruiter-only view.
 *
 * NOTE: this screen depends on the `recruiter.verifyAccess` Meteor method
 * (a separate FEAT-14 subtask). Until that method exists the call below returns
 * a "Method 'recruiter.verifyAccess' not found" error, which surfaces as the
 * inline error message. Add a temporary server-side stub to test the happy path.
 */
export function RecruiterLoginPage() {
  const { portfolioId } = useParams();
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!accessCode.trim()) {
      setError("Please enter your access code.");
      return;
    }

    setIsSubmitting(true);
    Meteor.call(
      "recruiter.verifyAccess",
      { portfolioId, accessCode },
      (err) => {
        setIsSubmitting(false);

        if (err) {
          // Keep the portal locked; show a clear, non-revealing message.
          setError(err.reason || "Incorrect access code. Please try again.");
          return;
        }

        // STEP 3: Save token to sessionStorage on success.
        // Scoped to this specific user's portfolio.
        // It will auto-delete when the recruiter closes the tab/browser.
        sessionStorage.setItem(`recruiter_token_${portfolioId}`, accessCode);

        // Route to the recruiter-only view
        navigate(`/recruiter/${portfolioId}/view`);
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-indigo-600" />
          <span className="text-3xl font-bold text-gray-900">MeFolio</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-indigo-50 rounded-2xl mb-4">
              <KeyRound className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Recruiter Access
            </h1>
            <p className="text-gray-500 mt-2">
              Enter the access code to access the recruiter view for this
              portfolio.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="access-code"
                className="text-sm font-bold text-gray-700 ml-1"
              >
                Access code
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  id="access-code"
                  type={showCode ? "text" : "password"}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-lg shadow-sm group-hover:border-gray-200"
                  placeholder="Enter access code"
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  aria-label={
                    showCode ? "Hide access code" : "Show access code"
                  }
                >
                  {showCode ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verifying..." : "Unlock Portfolio"}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 mx-auto flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to MeFolio
        </button>
      </div>
    </div>
  );
}

export default RecruiterLoginPage;
