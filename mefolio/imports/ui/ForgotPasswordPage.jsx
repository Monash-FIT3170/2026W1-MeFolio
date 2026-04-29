import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Sparkles, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { Accounts } from 'meteor/accounts-base';

export function ForgotPasswordPage({
    onBackToLogin,
    onPasswordReset
})
{
    const [step, setStep] = useState('request');
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long.');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter.');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number.');
        }
        return null;
    };


    // Handle forgot password request
    const handleResetPassword = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
        setError(passwordError);
        return;
        }

        if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
        }

        // Show success message
        setSuccess('Password successfully reset! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
        if (onPasswordReset) {
            onPasswordReset();
        }
        }, 2000);
    };

    return (
        <div className='min-h-screen flex bg-slate-50 font-sans relative'>
            {/* Dev Bypass - Top Right Corner */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={onBackToLogin}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-xs font-bold transition-colors border border-slate-200"
                >
                    <Shield className="w-3.5 h-3.5" />
                    Dev Bypass
                </button>
            </div>
            
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 rounded-full blur-[120px] animate-pulse">
                    </div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 rounded-full blur-[120px]">
                    </div>
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
                        Reset Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-300">
                        Password.
                        </span>
                    </h1>

                    <p className="text-xl opacity-80 mb-12 max-w-lg leading-relaxed mx-auto">
                        Create a new password for your account.
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
                            <Sparkles className="w-8 h-8 text-indigo-600" />
                            <span className="text-3xl font-bold text-gray-900">MeFolio</span>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={onBackToLogin}
                            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-medium">Back to Login</span>
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                            Create New Password
                            </h2>
                            <p className="text-gray-500 text-lg">
                            Choose a strong password for your account.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {success}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            {/* New Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="new-password" className="text-sm font-bold text-gray-700 ml-1">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-bold text-gray-700 ml-1">
                                Confirm Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                id="confirm-password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-100 rounded-xl focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium text-lg shadow-sm group-hover:border-gray-200"
                                placeholder="••••••••"
                                required
                                />
                                <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements Summary */}
                        <div className="bg-blue-50 rounded-lg p-4 text-xs text-blue-800">
                            <p className="font-bold mb-2">Password Requirements:</p>
                            <ul className="space-y-1">
                                <li className={newPassword.length >= 8 ? "text-green-600" : "text-blue-800"}>
                                {newPassword.length >= 8 ? "✓" : "○"} At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : "text-blue-800"}>
                                {/[A-Z]/.test(newPassword) ? "✓" : "○"} At least one uppercase letter
                                </li>
                                <li className={/[0-9]/.test(newPassword) ? "text-green-600" : "text-blue-800"}>
                                {/[0-9]/.test(newPassword) ? "✓" : "○"} At least one number
                                </li>
                                <li className={newPassword === confirmPassword && newPassword !== "" ? "text-green-600" : "text-blue-800"}>
                                {newPassword === confirmPassword && newPassword !== "" ? "✓" : "○"} Passwords match
                                </li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
                            >
                            Reset Password
                        </button>
                    </form>

                    {/* Help Text */}
                    <p className="mt-8 text-center text-gray-500 text-sm">
                        Remember your password?{' '}
                        <button
                            onClick={onBackToLogin}
                            className="font-bold text-indigo-600 hover:text-indigo-700"
                        >
                            Back to Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
        