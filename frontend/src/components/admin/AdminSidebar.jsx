import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAdmin } from '../../contexts/AdminContext';
import {
  LayoutDashboard, Users, Store, ShoppingBag, 
  Image, Gift, Settings, LogOut, Menu, X
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { admin, logoutAdmin } = useAdmin();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'restaurants',
      label: 'Restaurants',
      icon: Store
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag
    },
    {
      id: 'banners',
      label: 'Banners',
      icon: Image
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: Gift
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const handleLogout = () => {
    logoutAdmin();
    window.location.href = '/';
  };

  const handleMenuClick = (itemId) => {
    setActiveTab(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        ${className}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static
        inset-y-0 left-0
        z-40
        w-64
        bg-white
        border-r border-gray-200
        transition-transform duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">serveDoor</h2>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                  ${
                    isActive 
                      ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {admin?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {admin?.phone}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;