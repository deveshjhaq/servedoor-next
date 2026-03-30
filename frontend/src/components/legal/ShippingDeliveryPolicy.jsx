import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../Header';
import Footer from '../Footer';

const ShippingDeliveryPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Shipping & Delivery Policy - serveDoor</title>
        <meta name="description" content="Read serveDoor shipping and delivery policy." />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="bg-white border rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipping & Delivery Policy</h1>
          <p className="text-gray-600 mb-4">Last updated: March 30, 2026</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. Delivery Coverage</h2>
          <p className="text-gray-700">Delivery availability depends on restaurant operating zones, partner availability, traffic conditions, weather, and local restrictions.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Delivery Timelines</h2>
          <p className="text-gray-700">Estimated times shown at checkout are indicative service estimates, not guaranteed commitments. Actual delivery may vary due to preparation delays, peak demand, and operational disruptions.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. Delivery Charges</h2>
          <p className="text-gray-700">Delivery and platform charges are displayed before order confirmation and may vary by distance, demand windows, and promotional eligibility.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Failed Delivery Attempts</h2>
          <p className="text-gray-700">If delivery cannot be completed due to unreachable contact details, incorrect address, or non-availability at handover, the order may be treated as fulfilled or cancelled per partner policy.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. Customer Responsibility</h2>
          <p className="text-gray-700">You are responsible for providing accurate address landmarks, maintaining reachable phone access, and ensuring timely handover response.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Support</h2>
          <p className="text-gray-700">For delivery-related issues, contact support@servedoor.com with order ID and registered phone number.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Governing Framework</h2>
          <p className="text-gray-700">This policy is interpreted with our Terms & Conditions and applicable Indian consumer and e-commerce regulations.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">8. Policy Updates</h2>
          <p className="text-gray-700">We may revise this policy for legal, operational, or partner-network changes. Updated versions will be posted on this page with the latest effective date.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingDeliveryPolicy;
