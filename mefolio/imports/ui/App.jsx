import React, { useState } from 'react';
import { LoginPage } from "./LoginPage.jsx";
import { SignUpPage } from "./SignUpPage.jsx";
import { PortfolioBuilderView } from "./PortofolioBuilderView.jsx";

export const App = () => {
  const [view, setView] = useState('signin');

  if (view === 'signin') {
    return (
      <LoginPage 
        onSignIn={() => setView('main')} 
        onSwitchToSignUp={() => setView('signup')} 
      />
    );
  }

  if (view === 'signup') {
    return (
      <SignUpPage 
        onSignUp={() => setView('main')} 
        onSwitchToSignIn={() => setView('signin')} 
      />
    );
  }

  return (
    <div className="page">
      <PortfolioBuilderView />
    </div>
  );
};
