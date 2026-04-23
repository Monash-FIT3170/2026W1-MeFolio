import { useState } from 'react';
import { Eye, EyeOff, Github, Mail, Lock, Sparkles, Chrome, Shield } from 'lucide-react';

/**
 * FEAT-01: User Authentication UI
 * This component implements the visual requirements for the MeFolio login page,
 * including OAuth buttons (GitHub/Google), Email/Password fields, and a Dev Bypass.
 */
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
    console.log('Sign in attempt:', { email, password });
    onSignIn();
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
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

        <div className="relative z-10 flex flex-col justify-center px-20 text-white">
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <Sparkles className="w-10 h-10 text-yellow-300" />
            </div>
            <span className="text-4xl font-black tracking-tight">MeFolio</span>
          </div>

          <h1 className="text-6xl font-extrabold mb-8 leading-[1.1]">
            Your Career,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-300">
              Perfectly Visualized.
            </span>
          </h1>

          <p className="text-xl opacity-80 mb-12 max-w-lg leading-relaxed">
            The professional e-portfolio platform that turns your experience into an interactive journey for recruiters.
          </p>

          <div className="grid gap-6">
            {[
              { title: 'Interactive Projects', desc: 'Live demos and code snippets', icon: '🚀' },
              { title: 'AI Assistant', desc: 'Your 24/7 professional twin', icon: '🤖' },
              { title: 'Rich Analytics', desc: 'See who visits and what they like', icon: '📊' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                <div className="text-2xl">{item.icon}</div>
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

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-lg">Sign in to your professional dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Social Sign In Options */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
              >
                <Github className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                <span className="font-bold text-gray-700 text-sm">GitHub</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
              >
                <Chrome className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-700 text-sm">Google</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-slate-50 text-gray-400 font-bold">Or use email</span>
              </div>
            </div>

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
                <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
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
          </form>

          {/* Dev Bypass Section */}
          <div className="mt-8 p-6 bg-white border-2 border-dashed border-indigo-100 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2">
              <Shield className="w-4 h-4 text-indigo-200 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-indigo-900 mb-1">Developer Access</h3>
              <p className="text-xs text-indigo-400 mb-4 font-medium">Testing bypass for local development</p>
              <button
                onClick={onSignIn}
                className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-extrabold hover:bg-indigo-100 transition-colors"
              >
                Skip to Dashboard
              </button>
            </div>
          </div>

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
