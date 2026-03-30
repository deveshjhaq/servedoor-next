import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ 
    items: [], 
    totalAmount: 0,
    deliveryFee: 0,
    taxes: 0,
    discount: 0,
    finalAmount: 0,
    restaurantId: null,
    restaurantName: null,
    appliedCoupon: null
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Cart settings
  const MIN_ORDER_VALUE = 100;
  const DELIVERY_FEE = 30;
  const FREE_DELIVERY_ABOVE = 300;
  const TAX_RATE = 0.05; // 5% GST
  const SINGLE_RESTAURANT_ENFORCEMENT = true;

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      clearCart();
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.cart.get();
      const cartData = response.data || {};
      
      setCart({
        items: cartData.items || [],
        totalAmount: cartData.totalAmount || 0,
        deliveryFee: cartData.deliveryFee || 0,
        taxes: cartData.taxes || 0,
        discount: cartData.discount || 0,
        finalAmount: cartData.finalAmount || 0,
        restaurantId: cartData.restaurantId || null,
        restaurantName: cartData.restaurantName || null,
        appliedCoupon: cartData.appliedCoupon || null
      });
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (restaurantId, restaurantName, menuItem, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    // Single restaurant enforcement
    if (SINGLE_RESTAURANT_ENFORCEMENT && 
        cart.restaurantId && 
        cart.restaurantId !== restaurantId) {
      return {
        success: false,
        error: 'You can only order from one restaurant at a time. Clear your cart to order from a different restaurant.',
        requireCartClear: true
      };
    }

    try {
      const response = await api.cart.addItem({
        restaurantId,
        restaurantName,
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        price: menuItem.price,
        quantity,
        isVeg: menuItem.isVeg || false
      });
      
      if (response.data.success) {
        await loadCart(); // Refresh cart
        toast.success(`${menuItem.name} added to cart`);
        return { 
          success: true,
          message: `${menuItem.name} added to cart`
        };
      }
      
      toast.error(response.data.message || 'Failed to add item to cart');
      return {
        success: false,
        error: response.data.message || 'Failed to add item to cart'
      };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add item to cart',
      };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      const response = await api.cart.updateQuantity(itemId, quantity);
      
      if (response.data.success) {
        await loadCart(); // Refresh cart
        return { success: true };
      }
      
      toast.error(response.data.message || 'Failed to update quantity');
      return {
        success: false,
        error: response.data.message || 'Failed to update quantity'
      };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quantity');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update quantity',
      };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.cart.removeItem(itemId);
      
      if (response.data.success) {
        await loadCart(); // Refresh cart
        toast.success('Item removed from cart');
        return { success: true };
      }
      
      toast.error(response.data.message || 'Failed to remove item from cart');
      return {
        success: false,
        error: response.data.message || 'Failed to remove item from cart'
      };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove item from cart');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove item from cart',
      };
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated) {
        await api.cart.clear();
      }
      
      setCart({
        items: [],
        totalAmount: 0,
        deliveryFee: 0,
        taxes: 0,
        discount: 0,
        finalAmount: 0,
        restaurantId: null,
        restaurantName: null,
        appliedCoupon: null
      });
      
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear cart');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clear cart',
      };
    }
  };

  const applyCoupon = async (couponCode) => {
    if (cart.totalAmount < MIN_ORDER_VALUE) {
      return {
        success: false,
        error: `Minimum order value is ₹${MIN_ORDER_VALUE}`
      };
    }

    try {
      const response = await api.cart.applyCoupon(couponCode);
      
      if (response.data.success) {
        await loadCart(); // Refresh cart with coupon applied
        toast.success(`Coupon ${couponCode} applied successfully`);
        return { 
          success: true,
          message: `Coupon ${couponCode} applied successfully`,
          discount: response.data.discount
        };
      }
      
      toast.error(response.data.message || 'Invalid coupon code');
      return {
        success: false,
        error: response.data.message || 'Invalid coupon code'
      };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to apply coupon',
      };
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await api.cart.removeCoupon();
      
      if (response.data.success) {
        await loadCart(); // Refresh cart
        toast.success('Coupon removed successfully');
        return { 
          success: true,
          message: 'Coupon removed successfully'
        };
      }
      
      toast.error(response.data.message || 'Failed to remove coupon');
      return {
        success: false,
        error: response.data.message || 'Failed to remove coupon'
      };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove coupon');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove coupon',
      };
    }
  };

  // Utility functions
  const cartItemCount = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items]
  );

  const computedSubtotal = useMemo(
    () => cart.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    [cart.items]
  );

  const getCartItemCount = useCallback(() => cartItemCount, [cartItemCount]);

  const getCartItemById = useCallback((itemId) => {
    return cart.items.find(item => item.id === itemId);
  }, [cart.items]);

  const isMinOrderMet = useCallback(() => {
    return cart.totalAmount >= MIN_ORDER_VALUE;
  }, [cart.totalAmount]);

  const getDeliveryFee = () => {
    if (cart.totalAmount >= FREE_DELIVERY_ABOVE) {
      return 0;
    }
    return DELIVERY_FEE;
  };

  const getTaxAmount = () => {
    return Math.round(cart.totalAmount * TAX_RATE);
  };

  const getFinalAmount = () => {
    const deliveryFee = getDeliveryFee();
    const taxAmount = getTaxAmount();
    return cart.totalAmount + deliveryFee + taxAmount - cart.discount;
  };

  const canProceedToCheckout = () => {
    return cart.items.length > 0 && isMinOrderMet();
  };

  const getCartSummary = () => {
    return {
      itemsCount: getCartItemCount(),
      subtotal: cart.totalAmount,
      deliveryFee: getDeliveryFee(),
      taxes: getTaxAmount(),
      discount: cart.discount,
      total: getFinalAmount(),
      savings: cart.totalAmount >= FREE_DELIVERY_ABOVE ? DELIVERY_FEE : 0
    };
  };

  const value = {
    // State
    cart,
    loading,
    
    // Settings
    MIN_ORDER_VALUE,
    DELIVERY_FEE,
    FREE_DELIVERY_ABOVE,
    TAX_RATE,
    
    // Methods
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    
    // Utility methods
    cartItemCount,
    computedSubtotal,
    getCartItemCount,
    getCartItemById,
    isMinOrderMet,
    getDeliveryFee,
    getTaxAmount,
    getFinalAmount,
    canProceedToCheckout,
    getCartSummary,
    
    // Refresh
    refreshCart: loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};