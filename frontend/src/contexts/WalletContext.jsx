import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Wallet settings
  const MINIMUM_BALANCE = 100; // ₹100
  const MINIMUM_ADD_AMOUNT = 50; // ₹50
  const MAXIMUM_ADD_AMOUNT = 10000; // ₹10,000

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletData();
    } else {
      resetWallet();
    }
  }, [isAuthenticated]);

  const resetWallet = () => {
    setBalance(0);
    setTransactions([]);
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        api.wallet.getBalance(),
        api.wallet.getTransactions({ limit: 10 })
      ]);
      
      setBalance(balanceRes.data.balance || 0);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMoney = async (amount, paymentMethod = 'online') => {
    if (amount < MINIMUM_ADD_AMOUNT) {
      return {
        success: false,
        error: `Minimum add amount is ₹${MINIMUM_ADD_AMOUNT}`
      };
    }

    if (amount > MAXIMUM_ADD_AMOUNT) {
      return {
        success: false,
        error: `Maximum add amount is ₹${MAXIMUM_ADD_AMOUNT}`
      };
    }

    try {
      setLoading(true);
      const response = await api.wallet.addMoney(amount, paymentMethod);
      
      if (response.data.success) {
        // Update balance and transactions
        await fetchWalletData();
        return { 
          success: true, 
          message: `₹${amount} added to wallet successfully`,
          paymentUrl: response.data.paymentUrl // For payment gateway redirect
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to add money'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add money to wallet'
      };
    } finally {
      setLoading(false);
    }
  };

  const useWalletBalance = async (amount) => {
    if (amount > balance) {
      return {
        success: false,
        error: 'Insufficient wallet balance'
      };
    }

    if (balance - amount < 0) {
      return {
        success: false,
        error: 'Cannot use entire wallet balance. Please maintain minimum balance.'
      };
    }

    try {
      const response = await api.wallet.useWallet(amount);
      
      if (response.data.success) {
        setBalance(prev => prev - amount);
        return { success: true };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to use wallet balance'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to use wallet balance'
      };
    }
  };

  const canUseWallet = (amount) => {
    return balance >= amount && amount > 0;
  };

  const getAvailableBalance = () => {
    return Math.max(0, balance);
  };

  const getTransactionHistory = async (params = {}) => {
    try {
      setLoading(true);
      const response = await api.wallet.getTransactions(params);
      setTransactions(response.data.transactions || []);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch transactions'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    balance,
    transactions,
    loading,
    
    // Settings
    MINIMUM_BALANCE,
    MINIMUM_ADD_AMOUNT,
    MAXIMUM_ADD_AMOUNT,
    
    // Methods
    addMoney,
    useWalletBalance,
    canUseWallet,
    getAvailableBalance,
    getTransactionHistory,
    refreshWallet: fetchWalletData,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};