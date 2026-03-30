import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    if (token) {
      // Verify token and get user data
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.auth.getProfile();
      setUser(response.data);
    } catch (error) {
      // Token is invalid, clear it
      logout();
    }
  };

  // Enhanced Registration with OTP
  const registerWithOTP = async (userData) => {
    try {
      setLoading(true);
      const response = await api.auth.registerWithOTP(userData);
      return { 
        success: true, 
        message: 'OTP sent to your phone number',
        data: response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyRegistrationOTP = async (phone, otp, email) => {
    try {
      setLoading(true);
      const response = await api.auth.verifyRegistrationOTP({ phone, otp, email });
      
      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      }
      
      return { success: false, error: 'Verification failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'OTP verification failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Login with OTP
  const loginWithOTP = async (phone) => {
    try {
      setLoading(true);
      const response = await api.auth.loginWithOTP(phone);
      const success = response.data?.success;
      return { 
        success: success === true, 
        message: response.data?.message || 'OTP sent to your phone number',
        data: response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.response?.data?.message || 'Failed to send OTP' 
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOTP = async (phone, otp) => {
    try {
      setLoading(true);
      const response = await api.auth.verifyLoginOTP({ phone, otp });
      
      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  // Traditional login (existing)
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.auth.signin({ email, password });
      const { user: userData, token: authToken } = response.data.data;
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Traditional register (existing)
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.auth.signup(userData);
      const { user: newUser, token: authToken } = response.data.data;
      
      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.auth.updateProfile(profileData);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    
    // Enhanced auth methods
    registerWithOTP,
    verifyRegistrationOTP,
    loginWithOTP,
    verifyLoginOTP,
    
    // Traditional methods
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};