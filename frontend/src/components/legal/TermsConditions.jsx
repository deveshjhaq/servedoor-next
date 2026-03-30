import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../Header';
import Footer from '../Footer';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Terms & Conditions - serveDoor</title>
        <meta name="description" content="Read the terms and conditions for using serveDoor." />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="bg-white border rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h1>
          <p className="text-gray-600 mb-4">Last updated: March 30, 2026</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. Acceptance and Scope</h2>
          <p className="text-gray-700">By accessing or using serveDoor, you agree to these Terms, our Privacy Policy, and all applicable laws. These Terms apply to customers, restaurant partners, and delivery users accessing the platform.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Account Responsibility</h2>
          <p className="text-gray-700">You are responsible for maintaining the confidentiality of OTPs, login credentials, and session tokens. Any activity from your account is deemed authorized by you unless reported immediately as unauthorized.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. Orders, Pricing and Payments</h2>
          <p className="text-gray-700">Order confirmation is subject to restaurant acceptance and successful checkout. Prices, applicable taxes, platform fees, and delivery charges are shown at checkout. Payment settlement may be processed through third-party gateways.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Cancellations, Refunds and Chargebacks</h2>
          <p className="text-gray-700">Cancellation eligibility depends on order status and preparation stage. Refund eligibility and timelines are governed by our Refund/Cancellation Policy and payment partner processing timelines.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. Prohibited Conduct</h2>
          <p className="text-gray-700">Users must not engage in fraud, abuse promotions, reverse engineer services, scrape data without authorization, or interfere with platform integrity and availability.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Limitation of Liability</h2>
          <p className="text-gray-700">To the maximum extent permitted by law, serveDoor is not liable for indirect, incidental, consequential, or special damages arising from use of the platform.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Governing Law and Jurisdiction</h2>
          <p className="text-gray-700">These Terms are governed by the laws of India. Courts at Mumbai, Maharashtra shall have exclusive jurisdiction, subject to applicable consumer protection and e-commerce laws.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">8. Policy Updates</h2>
          <p className="text-gray-700">We may update these Terms to reflect legal, operational, or product changes. Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">9. Contact</h2>
          <p className="text-gray-700">For legal queries, contact support@servedoor.com or refer to the Contact/Grievance Officer page.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;
