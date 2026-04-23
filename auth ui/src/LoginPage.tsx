import { useState } from 'react';
import { Eye, EyeOff, Github, Mail, Lock, Sparkles, Shield, Layout, LineChart, Bot } from 'lucide-react';

export function LoginPage({
  onSignIn,
  onSwitchToSignUp
}: {
  onSignIn: () => void;
  onSwitchToSignUp: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans relative">
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

      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white w-full">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-10 h-10 text-white" />
            <span className="text-3xl font-bold">MeFolio</span>
          </div>

          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Build Your Interactive Portfolio
          </h1>

          <p className="text-xl opacity-90 mb-8 max-w-lg leading-relaxed">
            Transform your professional presence with real-time analytics, AI-powered interactions, and engaging project showcases.
          </p>

          <div className="space-y-8 max-w-lg">
            {[
              { icon: <Layout className="w-6 h-6" />, title: 'Interactive Project Showcases', desc: 'Add mini-challenges and live code snippets to prove your skills' },
              { icon: <LineChart className="w-6 h-6" />, title: 'Real-Time Visitor Analytics', desc: "Track who's viewing your portfolio and what they're interested in" },
              { icon: <Bot className="w-6 h-6" />, title: 'AI Portfolio Twin', desc: 'Let an AI chatbot answer questions about your experience 24/7' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  {item.icon}
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">{item.title}</p>
                  <p className="text-sm opacity-80 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">MeFolio</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</button>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
              Sign in
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm group">
                <Github className="w-5 h-5 group-hover:text-indigo-600" />
                <span className="font-medium text-gray-700 text-sm">GitHub</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700 text-sm">Google</span>
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignUp} className="font-medium text-indigo-600 hover:text-indigo-700">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}
