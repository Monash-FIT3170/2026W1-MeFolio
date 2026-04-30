import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Counter } from "./Counter.jsx";
import { Header } from "./Header.jsx";
import { Info } from "./Info.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { SignUpPage } from "./SignUpPage.jsx";
import { ForgotPasswordPage } from "./ForgotPasswordPage.jsx"; 
import { TermsOfServicePage } from "./TermsOfServicePage.jsx";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage.jsx";

export const App = () => {
  const [view, setView] = useState('signin');

  const user = useTracker(() => Meteor.user());
  const userId = useTracker(() => Meteor.userId());
  const isLoggingIn = useTracker(() => Meteor.loggingIn());

  // Handle the mid-verification state
  if (isLoggingIn) return null; 

 //  IF LOGGED IN: Show the main content 
  if (userId) {
    return (
      <div className="page">
        <Header />
        <main className="main">
          <Counter />
          <Info />
          {/* Added a temporary logout for your testing */}
          <button onClick={() => Meteor.logout()} style={{margin: '20px'}}>
            Logout (RTE Test)
          </button>
        </main>
      </div>
    );
  }

  // IF NOT LOGGED IN: Toggle between different views
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
