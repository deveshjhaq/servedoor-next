import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../Header';
import Footer from '../Footer';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Cookie Policy - serveDoor</title>
        <meta name="description" content="Learn how serveDoor uses cookies and similar technologies." />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="bg-white border rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          <p className="text-gray-600 mb-4">Last updated: March 30, 2026</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. What Are Cookies</h2>
          <p className="text-gray-700">Cookies are small text files placed on your device to enable core platform features, preserve preferences, and improve performance and security.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Cookie Categories</h2>
          <p className="text-gray-700">We use essential cookies for authentication and checkout continuity, functional cookies for user preferences, and limited analytics cookies to understand product usage.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. Consent and Controls</h2>
          <p className="text-gray-700">Where required by law, non-essential cookies are used only with your consent. You can change browser settings or withdraw consent at any time, though some site features may be affected.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Cookie Duration</h2>
          <p className="text-gray-700">Certain cookies are session-based and expire when your browser closes, while others are persistent for defined periods to support remember-me and reliability features.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. Legal Notice</h2>
          <p className="text-gray-700">Cookie usage is governed by this policy and our Privacy Policy, interpreted in accordance with applicable Indian laws.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Policy Updates</h2>
          <p className="text-gray-700">We may revise this Cookie Policy for legal, technical, or operational reasons. Material changes will be reflected via the updated date on this page.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Contact</h2>
          <p className="text-gray-700">For cookie-related concerns, contact support@servedoor.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
