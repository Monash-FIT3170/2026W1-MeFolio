import { useState } from "react";
import { Mail, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";

/**
 * BUG-01: Functional password reset.
 * Requests a real password-reset email via Accounts.forgotPassword. The actual
 * password change happens on ResetPasswordPage, reached through the emailed link
 * (/reset-password/:token).
 */
export function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    Accounts.forgotPassword({ email }, (err) => {
      setSubmitting(false);
      // Don't leak which emails are registered: an unknown address (403) shows
      // the same generic confirmation as a successful send. Surface any other
      // failure (e.g. mail transport down) honestly.
      if (err && err.error !== 403) {
        setError(err.reason || "Something went wrong sending the reset email.");
        return;
      }
      setSent(true);
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans relative">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-20 text-white w-full text-center">
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-10 h-10 text-yellow-300" />
            </div>
            <span className="text-4xl font-black tracking-tight">MeFolio</span>
          </div>

          <h1 className="text-5xl font-extrabold mb-8 leading-[1.1]">
            Reset Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-300">
              Password.
            </span>
          </h1>

          <p className="text-xl opacity-80 mb-12 max-w-lg leading-relaxed mx-auto">
            Enter your email and we&apos;ll send you a secure link to set a new
            password.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">MeFolio</span>
          </div>

          <button
            onClick={onBackToLogin}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Login</span>
          </button>

          {sent ? (
            <div>
              <div className="mb-6 flex items-center gap-3 text-green-600">
                <CheckCircle2 className="w-10 h-10" />
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Check your inbox
                </h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                If an account exists for <strong>{email}</strong>, we&apos;ve
                sent a password reset link. It may take a minute to arrive — be
                sure to check your spam folder.
              </p>
              <button
                onClick={onBackToLogin}
                className="mt-8 w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98]"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                  Forgot your password?
                </h2>
                <p className="text-gray-500 text-lg">
                  Enter the email address associated with your account.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-bold text-gray-700 ml-1"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-lg shadow-sm group-hover:border-gray-200"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-gray-500 text-sm">
            Remember your password?{" "}
            <button
              onClick={onBackToLogin}
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Back to Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

ForgotPasswordPage.propTypes = {
  onBackToLogin: PropTypes.func.isRequired,
};
