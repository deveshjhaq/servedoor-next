import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { MapPin, Search, ShoppingCart, User, X, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import EnhancedAuth from './customer/EnhancedAuth';
import MyOrders from './customer/MyOrders';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ area: 'Bandra West', city: 'Mumbai' });
  const [showAuth, setShowAuth] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();

  const cartCount = getCartItemCount();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await api.location.detectFromCoordinates({
              lat: latitude,
              lng: longitude,
            });
            setUserLocation({
              area: response.data.area,
              city: response.data.city,
            });
          } catch (error) {
            console.log('Location detection failed, using default');
          }
        },
        () => {
          console.log('Location access denied, using default');
        }
      );
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <>
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Location */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">serveDoor</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5 text-orange-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{userLocation.area}</span>
                <span className="text-xs text-gray-500">{userLocation.city}</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for restaurant, item or more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <span>Hi, {user?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-orange-500"
                  onClick={() => setShowOrders(true)}
                  data-testid="my-orders-btn"
                  aria-label="Open my orders"
                >
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-orange-500"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-orange-500"
                onClick={() => setShowAuth(true)}
                data-testid="signin-button"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              className="relative text-gray-600 hover:text-orange-500"
              onClick={() => !isAuthenticated && setShowAuth(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6">
              Get App
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for restaurant, item or more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </form>
        </div>
      </div>
    </header>

    {/* Auth Modal */}
    {showAuth && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]" data-testid="auth-modal">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setShowAuth(false)}
            data-testid="auth-modal-close"
            aria-label="Close sign in dialog"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <EnhancedAuth onBack={() => setShowAuth(false)} />
        </div>
      </div>
    )}

    {/* My Orders Panel */}
    {showOrders && <MyOrders onClose={() => setShowOrders(false)} />}
    </>
  );
};

export default Header;