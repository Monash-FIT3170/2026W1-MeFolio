import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { LoginPage } from "./LoginPage.jsx";
import { SignUpPage } from "./SignUpPage.jsx";
import { PortfolioBuilderView } from "./PortofolioBuilderView.jsx";

export const App = () => {
  const [view, setView] = useState('signin');

  const userId = useTracker(() => Meteor.userId());
  const isLoggingIn = useTracker(() => Meteor.loggingIn());

  if (isLoggingIn) return null; 

  if (userId) {
    return (
      <div className="page">
        <PortfolioBuilderView />
      </div>
    );
  }

  if (view === 'signin') {
    return (
      <LoginPage 
        onSignIn={() => {}} 
        onSwitchToSignUp={() => setView('signup')} 
      />
    );
  }

  return (
    <SignUpPage 
      onSignUp={() => {}} 
      onSwitchToSignIn={() => setView('signin')} 
    />
  );
};
