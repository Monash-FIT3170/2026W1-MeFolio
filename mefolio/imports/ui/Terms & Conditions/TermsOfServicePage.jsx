import React from 'react';

/**
 * FEAT-01: Terms of Service Page
 * This component displays the professional terms of service for MeFolio.
 */
export function TermsOfServicePage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={onBack} className="text-indigo-600 font-bold mb-6 hover:underline flex items-center gap-2">
          <span>&larr;</span> Back to Sign Up
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose prose-indigo max-w-none text-gray-600 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using MeFolio, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. User Content</h2>
            <p>You retain all ownership rights to the content you upload to MeFolio. However, by posting content, you grant MeFolio a worldwide, non-exclusive, royalty-free license to host, display, and distribute your content as part of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Acceptable Use</h2>
            <p>You agree not to use MeFolio to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload or distribute any content that is illegal, harmful, or offensive.</li>
              <li>Interfere with or disrupt the integrity or performance of the service.</li>
              <li>Attempt to gain unauthorized access to the service or its related systems.</li>
              <li>Use AI features to generate spam or deceptive content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">5. Service Availability</h2>
            <p>MeFolio is provided "as is" and "as available." We do not guarantee that the service will be uninterrupted or error-free. We reserve the right to modify or discontinue the service at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">6. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users of the service.</p>
          </section>
        </div>
        <p className="mt-10 text-sm text-gray-400">Last updated: April 30, 2026</p>
      </div>
    </div>
  );
}
