import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  const checkAdminPhone = async (phone) => {
    try {
      setLoading(true);
      const response = await api.admin.verifyPhone({ phone });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Verification failed',
        is_admin: false
      };
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (phone, otp, password) => {
    try {
      setLoading(true);
      const response = await api.admin.login({ phone, otp, password });
      
      if (response.data.success) {
        const { admin: adminData, token: authToken } = response.data.data;
        
        setAdmin(adminData);
        setToken(authToken);
        localStorage.setItem('adminToken', authToken);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const getAdminProfile = async () => {
    try {
      const response = await api.admin.getProfile();
      setAdmin(response.data.admin);
      return response.data.admin;
    } catch (error) {
      logoutAdmin();
      throw error;
    }
  };

  const value = {
    admin,
    token,
    loading,
    isAdmin: !!admin,
    checkAdminPhone,
    loginAdmin,
    logoutAdmin,
    getAdminProfile,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};