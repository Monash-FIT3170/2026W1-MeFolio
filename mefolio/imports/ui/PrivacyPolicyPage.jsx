import React from 'react';

/**
 * FEAT-01: Privacy Policy Page
 * This component displays the professional privacy policy for MeFolio.
 */
export function PrivacyPolicyPage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={onBack} className="text-indigo-600 font-bold mb-6 hover:underline flex items-center gap-2">
          <span>&larr;</span> Back to Sign Up
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including your name, email address, and any professional data you include in your portfolio (e.g., resumes, project descriptions, and social links).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve our services.</li>
              <li>Personalize your experience and deliver the "AI Portfolio Twin" features.</li>
              <li>Analyze usage patterns and visitor engagement through our analytics dashboard.</li>
              <li>Communicate with you about updates, security, and support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share information with third-party service providers (such as hosting and database providers) who perform services on our behalf, subject to strict confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including hashed passwords and encrypted connections. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Your Rights and Choices</h2>
            <p>You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of the data we hold about you.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">6. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to track activity on our service and hold certain information to improve your user experience.</p>
          </section>
        </div>
        <p className="mt-10 text-sm text-gray-400">Last updated: April 30, 2026</p>
      </div>
    </div>
  );
}
