import React, { useState } from 'react';
import { Counter } from "./Counter.jsx";
import { Header } from "./Header.jsx";
import { Info } from "./Info.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { SignUpPage } from "./SignUpPage.jsx";

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
      <Header />
      <main className="main">
        <Counter />
        <Info />
      </main>
    </div>
  );
};
