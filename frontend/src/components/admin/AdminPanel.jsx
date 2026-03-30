import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import RestaurantManagement from './RestaurantManagement';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';
import BannerManagement from './BannerManagement';
import CouponManagement from './CouponManagement';
import SystemSettings from './SystemSettings';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext';
import { Toaster } from '../ui/toaster';
import { Loader2 } from 'lucide-react';

const AdminPanelContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const { admin, token, getAdminProfile } = useAdmin();

  useEffect(() => {
    const checkAdminAuth = async () => {
      const savedToken = localStorage.getItem('adminToken');
      const savedAdmin = localStorage.getItem('adminUser');
      
      if (savedToken && savedAdmin) {
        try {
          await getAdminProfile();
        } catch (error) {
          console.error('Failed to get admin profile:', error);
          // Token might be expired, will show login
        }
      }
      
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <span className="text-lg font-medium text-gray-600">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (!admin || !token) {
    return <AdminLogin onLoginSuccess={() => setIsLoading(false)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'restaurants':
        return <RestaurantManagement />;
      case 'users':
        return <UserManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'banners':
        return <BannerManagement />;
      case 'coupons':
        return <CouponManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 lg:ml-0">
        <main className="min-h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  return (
    <AdminProvider>
      <AdminPanelContent />
      <Toaster />
    </AdminProvider>
  );
};

export default AdminPanel;