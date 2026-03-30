import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Order settings
  const CANCELLATION_TIME_LIMIT = 10; // 10 minutes
  const CURRENCY = 'INR';
  const CURRENCY_SYMBOL = '₹';

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      resetOrders();
    }
  }, [isAuthenticated]);

  const resetOrders = () => {
    setOrders([]);
    setCurrentOrder(null);
  };

  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      const response = await api.orders.getAll(params);
      setOrders(response.data.orders || []);
      return { success: true };
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch orders'
      };
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await api.orders.create(orderData);
      
      if (response.data.success) {
        const newOrder = response.data.data;
        setOrders(prev => [newOrder, ...prev]);
        setCurrentOrder(newOrder);
        
        return { 
          success: true, 
          order: newOrder,
          message: 'Order placed successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to create order'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to place order'
      };
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.orders.getById(orderId);
      
      if (response.data.success) {
        const order = response.data.data;
        setCurrentOrder(order);
        return { success: true, order };
      }
      
      return {
        success: false,
        error: response.data.message || 'Order not found'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch order details'
      };
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId, reason = 'Customer request') => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Check if cancellation is allowed
      if (!canCancelOrder(order)) {
        return { 
          success: false, 
          error: `Orders can only be cancelled within ${CANCELLATION_TIME_LIMIT} minutes of placing` 
        };
      }

      setLoading(true);
      const response = await api.orders.cancel(orderId, reason);
      
      if (response.data.success) {
        // Update order status in local state
        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? { ...o, status: 'cancelled', cancellationReason: reason }
            : o
        ));
        
        return { 
          success: true, 
          message: 'Order cancelled successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to cancel order'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel order'
      };
    } finally {
      setLoading(false);
    }
  };

  const trackOrder = async (orderId) => {
    try {
      const response = await api.orders.track(orderId);
      
      if (response.data.success) {
        return { 
          success: true, 
          tracking: response.data.tracking 
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to get tracking information'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to track order'
      };
    }
  };

  const addRating = async (orderId, rating, review = '') => {
    try {
      const response = await api.orders.addRating(orderId, {
        rating,
        review,
        ratedAt: new Date().toISOString()
      });
      
      if (response.data.success) {
        // Update order in local state
        setOrders(prev => prev.map(o => 
          o.id === orderId 
            ? { ...o, rating, review, hasRated: true }
            : o
        ));
        
        return { 
          success: true, 
          message: 'Thank you for your feedback!'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to submit rating'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit rating'
      };
    }
  };

  const reorder = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.orders.reorder(orderId);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: 'Items added to cart successfully'
        };
      }
      
      return {
        success: false,
        error: response.data.message || 'Failed to reorder'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reorder'
      };
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.orders.getInvoice(orderId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Invoice downloaded successfully' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to download invoice'
      };
    }
  };

  // Utility functions
  const canCancelOrder = (order) => {
    if (!order || order.status === 'cancelled' || order.status === 'delivered') {
      return false;
    }
    
    // Check if within cancellation time limit
    const orderTime = new Date(order.createdAt);
    const currentTime = new Date();
    const timeDifference = (currentTime - orderTime) / (1000 * 60); // in minutes
    
    return timeDifference <= CANCELLATION_TIME_LIMIT && 
           ['placed', 'confirmed'].includes(order.status);
  };

  const getOrderStatus = (status) => {
    const statusMap = {
      placed: { label: 'Order Placed', color: 'blue' },
      confirmed: { label: 'Confirmed', color: 'green' },
      preparing: { label: 'Preparing', color: 'yellow' },
      on_way: { label: 'On the Way', color: 'purple' },
      delivered: { label: 'Delivered', color: 'green' },
      cancelled: { label: 'Cancelled', color: 'red' }
    };
    
    return statusMap[status] || { label: status, color: 'gray' };
  };

  const getActiveOrders = () => {
    return orders.filter(order => 
      ['placed', 'confirmed', 'preparing', 'on_way'].includes(order.status)
    );
  };

  const getPastOrders = () => {
    return orders.filter(order => 
      ['delivered', 'cancelled'].includes(order.status)
    );
  };

  const value = {
    // State
    orders,
    currentOrder,
    loading,
    
    // Settings
    CANCELLATION_TIME_LIMIT,
    CURRENCY,
    CURRENCY_SYMBOL,
    
    // Methods
    createOrder,
    getOrderById,
    cancelOrder,
    trackOrder,
    addRating,
    reorder,
    downloadInvoice,
    
    // Utility methods
    canCancelOrder,
    getOrderStatus,
    getActiveOrders,
    getPastOrders,
    
    // Refresh
    refreshOrders: fetchOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};