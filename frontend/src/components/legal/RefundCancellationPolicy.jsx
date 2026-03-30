import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../Header';
import Footer from '../Footer';

const RefundCancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Refund & Cancellation Policy - serveDoor</title>
        <meta name="description" content="Read serveDoor refund and cancellation policy." />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="bg-white border rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund & Cancellation Policy</h1>
          <p className="text-gray-600 mb-4">Last updated: March 30, 2026</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. Order Cancellation</h2>
          <p className="text-gray-700">Orders may be cancelled before restaurant confirmation. After confirmation or once preparation has started, cancellation may be restricted to prevent wastage and partner loss.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Eligible Refund Cases</h2>
          <p className="text-gray-700">Refunds may be approved for duplicate charges, failed payment debits, non-delivery, post-payment order rejection, or materially wrong/missing items after verification.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. Processing Timelines</h2>
          <p className="text-gray-700">Approved refunds are initiated within 3-7 business days. Final settlement time depends on your bank, card network, wallet provider, or UPI service.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Exclusions and Limitations</h2>
          <p className="text-gray-700">Refunds may be denied where claims are unsupported, raised after unreasonable delay, or based only on taste preference without quality defects. Convenience fees and promotional discounts may be non-refundable unless required by law.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. Dispute Escalation</h2>
          <p className="text-gray-700">If you disagree with a refund decision, you may request escalation with order ID and supporting evidence at grievance@servedoor.com for secondary review.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Support</h2>
          <p className="text-gray-700">For refund and cancellation support, contact support@servedoor.com with your order details.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Governing Framework</h2>
          <p className="text-gray-700">This policy is interpreted in accordance with applicable Indian consumer, payments, and e-commerce laws, and read together with our Terms & Conditions.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">8. Policy Updates</h2>
          <p className="text-gray-700">We may update this policy to reflect legal or operational changes. The latest version will always be available on this page with an updated date.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundCancellationPolicy;
