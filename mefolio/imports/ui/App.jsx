import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LoginPage } from "./Login/LoginPage.jsx";
import { SignUpPage } from "./Login/SignUpPage.jsx";
import { ForgotPasswordPage } from "./Login/ForgotPasswordPage.jsx";
import { TermsOfServicePage } from "./Terms & Conditions/TermsOfServicePage.jsx";
import { PrivacyPolicyPage } from "./Terms & Conditions/PrivacyPolicyPage.jsx";
import { PortfolioBuilderView } from "./Portfolio Builder/PortfolioBuilderView.jsx";
import { PortfolioCollection } from "../api/portfolio.js";
import { RecruiterLoginPage } from "./Recruiter/RecruiterLoginPage.jsx";
import { RecruiterAccessGate } from "./Recruiter/RecruiterAccessGate.jsx";
import { RecruiterPortal } from "./Recruiter/RecruiterPortal.jsx";

export const App = () => {
  const userId = useTracker(() => Meteor.userId());
  const isLoggingIn = useTracker(() => Meteor.loggingIn());
  const { portfolio } = useTracker(() => {
    const handle = Meteor.subscribe("portfolios.all");
    return {
      portfolio: PortfolioCollection.findOne({ userId: Meteor.userId() }),
    };
  });
  const navigate = useNavigate();
  if (isLoggingIn) return null;
  const activeTheme = portfolio?.theme || "default";

  return (
    <div
      data-theme={activeTheme}
      className="min-h-screen bg-background text-text font-main"
    >
      <Routes>
        <Route
          path="/login"
          element={
            userId ? (
              <Navigate to="/" />
            ) : (
              <LoginPage
                onSignIn={() => navigate("/")}
                onSwitchToSignUp={() => navigate("/signup")}
                onForgotPassword={() => navigate("/forgot")}
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            userId ? (
              <Navigate to="/" />
            ) : (
              <SignUpPage
                onSignUp={() => Meteor.logout(() => navigate("/login"))}
                onSwitchToSignIn={() => navigate("/login")}
                onShowTerms={() => navigate("/terms")}
                onShowPrivacy={() => navigate("/privacy")}
              />
            )
          }
        />
        <Route
          path="/forgot"
          element={
            <ForgotPasswordPage
              onBackToLogin={() => navigate("/login")}
              onPasswordReset={() => navigate("/login")}
            />
          }
        />
        <Route
          path="/terms"
          element={<TermsOfServicePage onBack={() => navigate("/signup")} />}
        />
        <Route
          path="/privacy"
          element={<PrivacyPolicyPage onBack={() => navigate("/signup")} />}
        />
        {/* FEAT-14: unauthenticated recruiter access gate (public route). */}
        <Route path="/recruiter/:username" element={<RecruiterLoginPage />} />
        <Route
          path="/recruiter/:username/view"
          element={
            <RecruiterAccessGate>
              <RecruiterPortal />
            </RecruiterAccessGate>
          }
        />
      </Routes>
    </div>
  );
};