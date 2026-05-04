import React, { useState } from 'react';
import { Eye, EyeOff, Github, Mail, Lock, Sparkles, Shield, Layout, LineChart, Bot } from 'lucide-react';
import { Meteor } from 'meteor/meteor';

/**
 * FEAT-01: User Authentication UI
 * This component implements the visual requirements for the MeFolio login page,
 * matching the version in auth ui/src/LogInPage.tsx.
 */
export function LoginPage({
  onSignIn,
  onSwitchToSignUp,
  onForgotPassword
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
      e.preventDefault();
      setError(null);

      Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          // Log the error for debugging and update the local state for the UI warning
          console.error("Authentication Failure:", error.reason);
          setError(error.reason);
        } else {
          console.log("Authentication Success: Session established.");
        }
      });
    };

  const handleGithubLogin = () => {
    setError(null);

    Meteor.loginWithGithub({}, (error) => {
      if (error) {
        console.error("GitHub Authentication Failure:", error.reason);
        setError(error.reason || error.message);
      } else {
        console.log("GitHub Authentication Success.");
        onSignIn?.();
      }
    });
  };

const handleGoogleLogin = () => {
  setError(null);

  Meteor.loginWithGoogle(
    { requestPermissions: ['email'] },
    (error) => {
      if (error) {
        console.error("Google Authentication Failure:", error.reason);
        setError(error.reason || error.message);
      } else {
        console.log("Google Authentication Success.");
        onSignIn?.();
      }
    }
  );
};

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans relative">
      {/* Dev Bypass - Top Right Corner */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={onSignIn}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-bold transition-colors border border-slate-200"
        >
          <Shield className="w-3.5 h-3.5" />
          Dev Bypass
        </button>
      </div>

      {/* Left side - Branding & Graphics */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
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
            Build Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-300">
              Interactive Portfolio.
            </span>
          </h1>

          <p className="text-xl opacity-80 mb-12 max-w-lg leading-relaxed mx-auto">
            Transform your professional presence with real-time analytics, AI-powered interactions, and engaging project showcases.
          </p>

          <div className="grid gap-6 text-left">
            {[
              { icon: <Layout className="w-6 h-6" />, title: 'Interactive Project Showcases', desc: 'Add mini-challenges and live code snippets to prove your skills' },
              { icon: <LineChart className="w-6 h-6" />, title: 'Real-Time Visitor Analytics', desc: "Track who's viewing your portfolio and what they're interested in" },
              { icon: <Bot className="w-6 h-6" />, title: 'AI Portfolio Twin', desc: 'Let an AI chatbot answer questions about your experience 24/7' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm text-yellow-200">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm opacity-70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">MeFolio</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-base">Sign in to your professional dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field - Prominent */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1">
                Email address
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

            {/* Password Field - Prominent */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-sm font-bold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-lg shadow-sm group-hover:border-gray-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] mt-2"
            >
              Sign In
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-slate-50 text-gray-400 font-bold">Or sign in with</span>
              </div>
            </div>

            {/* Social Sign In Options */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
              >
                <Github className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                <span className="font-bold text-gray-700 text-sm">GitHub</span>
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-bold text-gray-700 text-sm">Google</span>
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-10 text-center text-gray-500 font-medium">
            New to MeFolio?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
