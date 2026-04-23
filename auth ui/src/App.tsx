import { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';

function App() {
  const [view, setView] = useState<'signin' | 'signup'>('signin');

  return (
  
    <div className="w-full min-h-screen flex flex-col">
      {view === 'signin' ? (
        <LoginPage 
          onSignIn={() => alert('Signed in!')} 
          onSwitchToSignUp={() => setView('signup')} 
        />
      ) : (
        <SignUpPage 
          onSignUp={() => alert('Account created!')} 
          onSwitchToSignIn={() => setView('signin')} 
        />
      )}
    </div>
  );
}

export default App;
