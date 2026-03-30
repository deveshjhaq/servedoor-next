import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import ConfirmDialog from '../shared/ConfirmDialog';
import EmptyState from '../shared/EmptyState';
import {
  ShoppingCart, Plus, Minus, Trash2, X, Tag,
  Truck, Receipt, AlertCircle, CheckCircle
} from 'lucide-react';

const SmartCart = ({ isOpen, onClose }) => {
  const [couponCode, setCouponCode] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const { 
    cart,
    getCartItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    isMinOrderMet,
    canProceedToCheckout,
    getCartSummary,
    MIN_ORDER_VALUE,
    FREE_DELIVERY_ABOVE
  } = useCart();
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const cartSummary = getCartSummary();

  const handleQuantityChange = async (itemId, newQuantity) => {
    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast({
        title: "Item Removed",
        description: `${itemName} removed from cart`
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleClearCart = async () => {
    const result = await clearCart();
    if (result.success) {
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart"
      });
      setShowClearConfirm(false);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    const result = await applyCoupon(couponCode);
    if (result.success) {
      toast({
        title: "Coupon Applied",
        description: result.message
      });
      setCouponCode('');
    } else {
      toast({
        title: "Invalid Coupon",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleRemoveCoupon = async () => {
    const result = await removeCoupon();
    if (result.success) {
      toast({
        title: "Coupon Removed",
        description: result.message
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Your Cart</h2>
            {cartSummary.itemsCount > 0 && (
              <Badge className="bg-orange-100 text-orange-800">
                {cartSummary.itemsCount} item{cartSummary.itemsCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex-1">
          {cart.items.length === 0 ? (
            /* Empty Cart */
            <EmptyState
              icon={<ShoppingCart className="w-12 h-12" />}
              title="Your cart is empty"
              description="Add items from restaurants to get started"
              action={
                <Button 
                  onClick={onClose}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Continue Shopping
                </Button>
              }
            />
          ) : (
            <div className="p-4 space-y-4">
              {/* Restaurant Info */}
              {cart.restaurantName && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{cart.restaurantName}</h3>
                      <p className="text-sm text-gray-600">Order from this restaurant</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClearConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    {/* Veg/Non-Veg indicator */}
                    <div className={`w-3 h-3 border-2 flex items-center justify-center ${
                      item.isVeg ? 'border-green-500' : 'border-red-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.isVeg ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.menuItemName}</h4>
                      <p className="text-sm text-gray-600">₹{item.price}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id, item.menuItemName)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="border border-gray-200 rounded-lg p-3">
                {cart.appliedCoupon ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {cart.appliedCoupon.code}
                      </span>
                      <span className="text-sm text-gray-600">
                        (-₹{cart.discount})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button type="submit" variant="outline">
                      Apply
                    </Button>
                  </form>
                )}
              </div>

              {/* Order Requirements */}
              {!isMinOrderMet() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Add ₹{MIN_ORDER_VALUE - cartSummary.subtotal} more for minimum order
                    </span>
                  </div>
                </div>
              )}

              {/* Free Delivery Indicator */}
              {cartSummary.subtotal < FREE_DELIVERY_ABOVE && cartSummary.subtotal > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Add ₹{FREE_DELIVERY_ABOVE - cartSummary.subtotal} more for free delivery
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout */}
        {cart.items.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            {/* Bill Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{cartSummary.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>
                  {cartSummary.deliveryFee === 0 ? (
                    <span className="text-green-600 line-through">₹{cartSummary.savings}</span>
                  ) : (
                    `₹${cartSummary.deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes & Fees</span>
                <span>₹{cartSummary.taxes}</span>
              </div>
              {cartSummary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{cartSummary.discount}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{cartSummary.total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={!canProceedToCheckout() || !isAuthenticated}
              onClick={() => {
                // Navigate to checkout
                console.log('Proceeding to checkout...');
              }}
            >
              {!isAuthenticated ? (
                'Login to Checkout'
              ) : !isMinOrderMet() ? (
                `Add ₹${MIN_ORDER_VALUE - cartSummary.subtotal} more`
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Receipt className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                </div>
              )}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Cart?"
        description="This will remove all items from your cart. This action cannot be undone."
        confirmLabel="Clear Cart"
        destructive
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={handleClearCart}
      />
    </div>
  );
};

export default SmartCart;