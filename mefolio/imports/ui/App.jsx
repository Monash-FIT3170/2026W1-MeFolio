import { lazy, Suspense } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { LoginPage } from "./Login/LoginPage.jsx";
import { SignUpPage } from "./Login/SignUpPage.jsx";
import { ForgotPasswordPage } from "./Login/ForgotPasswordPage.jsx";
import { PortfolioCollection } from "../api/portfolio.js";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

const TermsOfServicePage = lazy(() =>
  import("./Terms & Conditions/TermsOfServicePage.jsx").then((module) => ({
    default: module.TermsOfServicePage,
  })),
);
const PrivacyPolicyPage = lazy(() =>
  import("./Terms & Conditions/PrivacyPolicyPage.jsx").then((module) => ({
    default: module.PrivacyPolicyPage,
  })),
);
const PortfolioBuilderView = lazy(() =>
  import("./Portfolio Builder/PortfolioBuilderView.jsx").then((module) => ({
    default: module.PortfolioBuilderView,
  })),
);
const RecruiterLoginPage = lazy(() =>
  import("./Recruiter/RecruiterLoginPage.jsx").then((module) => ({
    default: module.RecruiterLoginPage,
  })),
);
const RecruiterView = lazy(() =>
  import("./Recruiter/RecruiterView.jsx").then((module) => ({
    default: module.RecruiterView,
  })),
);
const PublicPortfolioPage = lazy(() =>
  import("./Public/PublicPortfolioPage.jsx").then((module) => ({
    default: module.PublicPortfolioPage,
  })),
);

const RouteFallback = () => (
  <div className="min-h-screen bg-background text-text flex items-center justify-center">
    <p className="text-sm text-muted">Loading…</p>
  </div>
);

export const App = () => {
  const userId = useTracker(() => Meteor.userId());
  const isLoggingIn = useTracker(() => Meteor.loggingIn());
  const { portfolio } = useTracker(() => {
    if (!Meteor.userId()) {
      return { portfolio: null };
    }

    Meteor.subscribe("portfolios.all");
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
          element={
            <Suspense fallback={<RouteFallback />}>
              <TermsOfServicePage onBack={() => navigate("/signup")} />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PrivacyPolicyPage onBack={() => navigate("/signup")} />
            </Suspense>
          }
        />
        {/* FEAT-14: unauthenticated recruiter access gate (public route). */}
        <Route
          path="/recruiter/:portfolioId"
          element={
            <Suspense fallback={<RouteFallback />}>
              <RecruiterLoginPage />
            </Suspense>
          }
        />
        {/* FEAT-15: token-gated read-only recruiter view. */}
        <Route
          path="/recruiter/:portfolioId/view"
          element={
            <Suspense fallback={<RouteFallback />}>
              <RecruiterView />
            </Suspense>
          }
        />
        {/* FEAT-12 / FEAT-13: public portfolio view (no login required). */}
        <Route
          path="/u/:username"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PublicPortfolioPage />
            </Suspense>
          }
        />
        <Route
          path="/:portfolioId/view"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PublicPortfolioPage />
            </Suspense>
          }
        />
        <Route
          path="/*"
          element={
            userId ? (
              <Suspense fallback={<RouteFallback />}>
                <div className="page">
                  <PortfolioBuilderView />
                </div>
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
};
