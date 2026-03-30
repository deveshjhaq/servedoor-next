import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../Header';
import Footer from '../Footer';

const GrievanceOfficer = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Contact & Grievance Officer - serveDoor</title>
        <meta name="description" content="Contact serveDoor grievance officer for compliance and legal escalations." />
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="bg-white border rounded-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact & Grievance Officer</h1>
          <p className="text-gray-600 mb-6">For legal, compliance, data protection, and customer grievance escalations.</p>

          <div className="space-y-4 text-gray-700">
            <p><span className="font-semibold text-gray-900">Officer Name:</span> Compliance Desk, serveDoor</p>
            <p><span className="font-semibold text-gray-900">Email:</span> grievance@servedoor.com</p>
            <p><span className="font-semibold text-gray-900">Phone:</span> +91 12345 67890</p>
            <p><span className="font-semibold text-gray-900">Address:</span> Mumbai, Maharashtra, India</p>
            <p><span className="font-semibold text-gray-900">Acknowledgement Timeline:</span> Within 48 hours of receiving a complete complaint.</p>
            <p><span className="font-semibold text-gray-900">Resolution Timeline:</span> Typically within 7-15 business days, subject to case complexity.</p>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-2">How to File a Grievance</h2>
          <p className="text-gray-700">Please include your registered phone number, order ID (if any), issue description, transaction details, and supporting documents/screenshots for faster review.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Review Process</h2>
          <p className="text-gray-700">Complaints are reviewed by relevant operations, payments, and compliance stakeholders. Additional information may be requested to complete investigation and resolution.</p>

          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Escalation</h2>
          <p className="text-gray-700">If unresolved within the stated timeline, you may request escalation by referencing the original complaint ID and prior communication trail. Final outcomes are communicated in writing through registered support channels.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GrievanceOfficer;
