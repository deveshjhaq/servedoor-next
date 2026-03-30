import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../Header';
import Footer from '../Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Privacy Policy - serveDoor</title>
        <meta name="description" content="Read how serveDoor collects, uses, and protects your data." />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="bg-white border rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-gray-600 mb-4">Last updated: March 30, 2026</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. Data We Collect</h2>
          <p className="text-gray-700">We collect account details, address and order information, communication records, payment metadata (not full card details), and device/session logs required for service delivery, fraud prevention, and support.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Purpose and Legal Basis</h2>
          <p className="text-gray-700">We process personal data for contract performance (order and delivery), legitimate interests (safety, analytics, fraud checks), legal compliance, and where required, your consent, in line with applicable Indian data protection requirements.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. Data Sharing</h2>
          <p className="text-gray-700">Relevant data is shared with restaurants, delivery partners, payment processors, and regulated service providers strictly on a need-to-know basis under contractual confidentiality controls.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Security</h2>
          <p className="text-gray-700">We apply role-based access controls, secure transport, token-based authentication, monitoring, and incident response procedures to protect personal data.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. Data Retention</h2>
          <p className="text-gray-700">We retain data only for as long as necessary for service operation, legal obligations, dispute resolution, and fraud prevention. Retention durations may vary by data category.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Your Rights</h2>
          <p className="text-gray-700">Subject to applicable law, you may request access, correction, deletion, account deactivation, and grievance redressal. We may require identity verification before processing requests.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Cross-Border Processing</h2>
          <p className="text-gray-700">Some service providers may process data outside your state or country. Where such processing occurs, we apply contractual and operational safeguards consistent with applicable law.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">8. Policy Updates</h2>
          <p className="text-gray-700">We may revise this Privacy Policy from time to time. Material updates will be reflected through the updated date on this page.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">9. Contact</h2>
          <p className="text-gray-700">For privacy requests or concerns, contact support@servedoor.com or grievance@servedoor.com.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
