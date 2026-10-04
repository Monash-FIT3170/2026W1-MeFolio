import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

/**
 * BUG-01: Functional password reset.
 * Landing screen for the link in the reset email (/reset-password/:token).
 * Sets a new password via Accounts.resetPassword, then sends the user to login.
 */
const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  return null;
};

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    Accounts.resetPassword(token, newPassword, (err) => {
      if (err) {
        setSubmitting(false);
        setError(
          err.reason ||
            "This reset link is invalid or has expired. Please request a new one.",
        );
        return;
      }
      // resetPassword signs the user in; sign back out so they land on the
      // login screen and confirm the new password works (AC #2).
      setDone(true);
      setTimeout(() => {
        Meteor.logout(() => navigate("/login"));
      }, 1500);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <span className="text-3xl font-bold text-gray-900">MeFolio</span>
        </div>

        {done ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Password updated
            </h2>
            <p className="text-gray-500 text-lg">
              Redirecting you to sign in…
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Create New Password
              </h2>
              <p className="text-gray-500 text-lg">
                Choose a strong password for your account.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="new-password"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-lg shadow-sm group-hover:border-gray-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-bold text-gray-700 ml-1"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-lg shadow-sm group-hover:border-gray-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-xs text-blue-800">
                <p className="font-bold mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  <li
                    className={
                      newPassword.length >= 8
                        ? "text-green-600"
                        : "text-blue-800"
                    }
                  >
                    {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(newPassword)
                        ? "text-green-600"
                        : "text-blue-800"
                    }
                  >
                    {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least one
                    uppercase letter
                  </li>
                  <li
                    className={
                      /[0-9]/.test(newPassword)
                        ? "text-green-600"
                        : "text-blue-800"
                    }
                  >
                    {/[0-9]/.test(newPassword) ? "✓" : "○"} At least one number
                  </li>
                  <li
                    className={
                      newPassword === confirmPassword && newPassword !== ""
                        ? "text-green-600"
                        : "text-blue-800"
                    }
                  >
                    {newPassword === confirmPassword && newPassword !== ""
                      ? "✓"
                      : "○"}{" "}
                    Passwords match
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Resetting…" : "Reset Password"}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Need a new link?{" "}
              <button
                onClick={() => navigate("/forgot")}
                className="font-bold text-indigo-600 hover:text-indigo-700"
              >
                Request another
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
