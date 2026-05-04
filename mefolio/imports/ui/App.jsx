import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { LoginPage } from "./LoginPage.jsx";
import { SignUpPage } from "./SignUpPage.jsx";
import { ForgotPasswordPage } from "./ForgotPasswordPage.jsx"; 
import { TermsOfServicePage } from "./TermsOfServicePage.jsx";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage.jsx";
import { PortfolioBuilderView } from "./PortofolioBuilderView.jsx";
import { BrowserRouter as Router} from "react-router-dom";

export const App = () => {
  const [view, setView] = useState('signin');

  const userId = useTracker(() => Meteor.userId());
  const isLoggingIn = useTracker(() => Meteor.loggingIn());

  if (isLoggingIn) return null; 

  if (userId) {
    return (
      <Router>
      <div className="page">
        <PortfolioBuilderView />
      </div>
      </Router>
    );
  }

  if (view === 'signin') {
    return (
      <LoginPage 
        onSignIn={() => {}} 
        onSwitchToSignUp={() => setView('signup')} 
        onForgotPassword={() => setView('forgot')}
      />
    );
  }

  if (view === 'forgot') {
    return (
      <ForgotPasswordPage 
        onBackToLogin={() => setView('signin')} 
        onPasswordReset={() => setView('signin')} 
      />
    );
  }

  if (view === 'terms') {
    return <TermsOfServicePage onBack={() => setView('signup')} />;
  }

  if (view === 'privacy') {
    return <PrivacyPolicyPage onBack={() => setView('signup')} />;
  }

  return (
    <SignUpPage 
      onSignUp={() => {}} 
      onSwitchToSignIn={() => setView('signin')} 
      onShowTerms={() => setView('terms')}
      onShowPrivacy={() => setView('privacy')}
    />
  );
};
