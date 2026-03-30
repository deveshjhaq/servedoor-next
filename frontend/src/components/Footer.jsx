import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';

const Footer = () => {
  const footerSections = [
    {
      title: "Company",
      links: ["About Us", "Careers", "Team", "serveDoor One", "serveDoor Instamart", "serveDoor Genie"]
    },
    {
      title: "Contact",
      links: ["Help & Support", "Partner with us", "Ride with us"]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms & Conditions", to: "/terms-and-conditions" },
        { label: "Cookie Policy", to: "/cookie-policy" },
        { label: "Privacy Policy", to: "/privacy-policy" },
        { label: "Refund/Cancellation Policy", to: "/refund-cancellation-policy" },
        { label: "Shipping/Delivery Policy", to: "/shipping-delivery-policy" },
        { label: "Contact/Grievance Officer", to: "/grievance-officer" }
      ]
    },
    {
      title: "Available in:",
      links: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"]
    }
  ];

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold">serveDoor</h1>
            </div>
            <p className="text-gray-400 mb-6">
              Delivering happiness to your doorstep. Order from the best restaurants and get fresh food delivered fast.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {typeof link === 'string' ? (
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    ) : link.to.startsWith('/') ? (
                      <Link to={link.to} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.to} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-medium">Office Address</div>
                <div className="text-gray-400 text-sm">Mumbai, Maharashtra, India</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-medium">Phone Number</div>
                <div className="text-gray-400 text-sm">+91 1234567890</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-orange-500" />
              <div>
                <div className="font-medium">Email Address</div>
                <div className="text-gray-400 text-sm">support@servedoor.com</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
            <div className="text-sm font-semibold text-white mb-1">Grievance Officer</div>
            <div className="text-sm text-gray-400">Email: grievance@servedoor.com | Phone: +91 12345 67890</div>
            <Link to="/grievance-officer" className="inline-block mt-2 text-sm text-orange-400 hover:text-orange-300">
              View Contact & Escalation Details
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 serveDoor. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;