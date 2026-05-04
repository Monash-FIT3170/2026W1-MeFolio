import React, { useState } from 'react';
import { Eye, EyeOff, Github, Mail, Lock, User, Sparkles, Shield, Rocket, Trophy, BarChart3 } from 'lucide-react';
import { Accounts } from 'meteor/accounts-base';

/**
 * FEAT-01: User Authentication UI
 * This component implements the visual requirements for the MeFolio sign up page.
 */
export function SignUpPage({ 
  onSignUp,
  onSwitchToSignIn,
  onShowTerms,
  onShowPrivacy
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    portfolioUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Basic Validation Logic
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Meteor Account Creation Logic
    Accounts.createUser({
      email: formData.email,
      password: formData.password,
      profile: {
        userName: formData.portfolioUrl, 
        fullName: formData.name,
      }
    }, (error) => {
      if (error) {
        // If the email is already taken or password is too weak
        setError(`Registration Failed: ${error.reason}`); 
      } else {
        console.log('User created successfully')
        onSignUp();
      }
    });
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans relative">
      {/* Dev Bypass - Top Right Corner */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => {
            // Mock login for development bypass
            Meteor.loginWithPassword('test@example.com', 'password', (err) => {
              if (err) {
                // If user doesn't exist, create them
                Accounts.createUser({
                  email: 'test@example.com',
                  password: 'password',
                  profile: { name: 'Test User' }
                }, () => onSignUp());
              } else {
                onSignUp();
              }
            });
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-bold transition-colors border border-slate-200"
        >
          <Shield className="w-3.5 h-3.5" />
          Dev Bypass
        </button>
      </div>

      {/* Left side - Matching Branding with Aspirational Text */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-16 text-white w-full text-center">
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-10 h-10 text-yellow-300" />
            </div>
            <span className="text-4xl font-black tracking-tight">MeFolio</span>
          </div>

          <h1 className="text-5xl font-extrabold mb-8 leading-[1.1]">
            Your Professional<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-300">
              Identity, Reimagined.
            </span>
          </h1>

          <p className="text-xl opacity-80 mb-12 max-w-lg leading-relaxed mx-auto">
            Build an interactive showcase that tells your story better than a static resume ever could.
          </p>

          <div className="space-y-6 max-w-lg text-left">
            {[
              { icon: <Rocket className="w-6 h-6" />, title: 'Get Noticed Instantly', desc: 'Stand out in a crowded market with a portfolio that recruiters enjoy exploring.' },
              { icon: <Trophy className="w-6 h-6" />, title: 'Prove Your Competence', desc: 'Let your work speak for itself with live code previews and interactive project challenges.' },
              { icon: <BarChart3 className="w-6 h-6" />, title: 'Data-Driven Growth', desc: 'Understand your audience with real-time insights into who is viewing your work and why.' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm text-yellow-200">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-lg">{item.title}</p>
                  <p className="text-sm opacity-70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">MeFolio</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Start Your Journey</h2>
            <p className="text-gray-500 text-base">Start building your interactive portfolio today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Full name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-base shadow-sm group-hover:border-gray-200"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-base shadow-sm group-hover:border-gray-200"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Portfolio URL</label>
              <div className="flex group">
                <span className="inline-flex items-center px-4 py-3 border-2 border-r-0 border-gray-100 bg-gray-50 text-gray-500 rounded-l-xl text-base font-medium">mefolio.dev/</span>
                <input
                  name="portfolioUrl"
                  type="text"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-100 rounded-r-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-base shadow-sm group-hover:border-gray-200"
                  placeholder="yourname"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-base shadow-sm group-hover:border-gray-200"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 ml-1">Confirm password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-base shadow-sm group-hover:border-gray-200"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer ml-1">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 mt-0.5" required />
              <span className="text-xs text-gray-600 font-medium">
                I agree to the{' '}
                <button type="button" onClick={onShowTerms} className="font-bold text-indigo-600 hover:text-indigo-700 underline">Terms</button>
                {' '}and{' '}
                <button type="button" onClick={onShowPrivacy} className="font-bold text-indigo-600 hover:text-indigo-700 underline">Privacy Policy</button>
              </span>
            </label>

            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-base hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] mt-2">
              Create account
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-slate-50 text-gray-400 font-bold">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 py-2.5 px-4 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group">
                <Github className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                <span className="font-bold text-gray-700 text-sm">GitHub</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-2.5 px-4 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group">
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

          <p className="mt-8 text-center text-gray-500 font-medium">
            Already have an account?{' '}
            <button onClick={onSwitchToSignIn} className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
