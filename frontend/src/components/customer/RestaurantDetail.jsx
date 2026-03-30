import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Clock, MapPin, ChevronLeft, Search, Check, Info, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';
import OptimizedImage from '../shared/OptimizedImage';
import { MenuSectionSkeleton } from '../shared/PageSkeleton';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearCartModal, setShowClearCartModal] = useState({ show: false, newRestaurantId: null, newItem: null });

  // Refs for scroll spy navigation
  const sectionRefs = useRef({});

  useEffect(() => {
    fetchRestaurantDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const response = await api.restaurants.getById(id);
      if (response.data) {
        setRestaurant(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant details:', error);
      toast({
        title: "Error",
        description: "Could not load restaurant details",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Scroll Spy to highlight active category in the sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // offset for sticky headers

      let currentActive = null;
      Object.entries(sectionRefs.current).forEach(([category, element]) => {
        if (element && element.offsetTop <= scrollPosition) {
          currentActive = category;
        }
      });

      if (currentActive !== activeCategory) {
        setActiveCategory(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const scrollToCategory = (category) => {
    setActiveCategory(category);
    const element = sectionRefs.current[category];
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120, // offset for sticky navigation
        behavior: 'smooth'
      });
    }
  };

  const getCartItem = (menuItemId) => {
    return cart?.items?.find((item) => item.menuItemId === menuItemId);
  };

  const handleAddToCart = async (menuItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    // Attempt to add. CartContext handles single-restaurant enforcement
    try {
      const result = await addToCart(restaurant.id || restaurant._id, restaurant.name, menuItem, 1);
      
      if (result && result.requireCartClear) {
        // Show conflict modal
        setShowClearCartModal({ show: true, newRestaurantId: restaurant.id, newItem: menuItem });
        return;
      }

      if (result && result.success) {
        toast({
          title: "Added",
          description: `${menuItem.name} added to cart`,
        });
      }
    } catch (error) {
      console.error('Cart add error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive"
      });
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    await updateQuantity(cartItemId, newQuantity);
  };

  const handleClearCartAndAdd = async () => {
    try {
      await clearCart();
      setShowClearCartModal({ show: false, newRestaurantId: null, newItem: null });
      // Add the item now that the cart is empty
      const { newItem } = showClearCartModal;
      if (newItem) {
        await handleAddToCart(newItem);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="h-64 bg-gray-200 animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <div className="w-1/3 h-10 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="w-1/4 h-6 bg-gray-200 rounded mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block col-span-1 space-y-4">
              {[1, 2, 3, 4].map(k => <div key={k} className="h-4 bg-gray-200 rounded w-full animate-pulse" />)}
            </div>
            <div className="col-span-1 md:col-span-3 space-y-8">
              {[1, 2].map(k => (
                <MenuSectionSkeleton key={k} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  // Group menu items by category
  const menuList = restaurant.menu || [];
  const validMenuItems = menuList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = [...new Set(validMenuItems.map(item => item.category))].filter(Boolean);
  
  // Set initial active category if none set
  if (categories.length > 0 && !activeCategory) {
    setActiveCategory(categories[0]);
  }

  const groupedMenu = categories.reduce((acc, category) => {
    acc[category] = validMenuItems.filter(item => item.category === category);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>{restaurant?.name ? `${restaurant.name} - serveDoor` : 'Restaurant - serveDoor'}</title>
        <meta
          name="description"
          content={restaurant?.cuisine || 'Explore menu items, prices and order online on serveDoor.'}
        />
      </Helmet>
      <Header />
      
      {/* Hero Banner Section */}
      <div className="relative bg-gray-900 border-b border-gray-200 pt-16">
        {/* Abstract pattern background if no banner image */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none z-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 40 L40 0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-300 hover:text-white transition-colors mb-6 font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Restaurants
          </button>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end mb-6">
            <div className="w-full md:w-56 h-40 md:h-56 rounded-2xl overflow-hidden shadow-2xl shrink-0 bg-gray-800 border-4 border-gray-800">
              <OptimizedImage 
                src={restaurant.image} 
                alt={restaurant.name}
                width={224}
                height={224}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{restaurant.name}</h1>
                <div className="bg-green-600 px-3 py-1.5 rounded-lg flex items-center shadow-lg">
                  <span className="text-white font-bold text-lg">{restaurant.rating}</span>
                  <Star className="w-4 h-4 ml-1 fill-white text-white" />
                </div>
              </div>
              
              <p className="text-gray-300 text-lg mb-4 opacity-90">{restaurant.cuisine}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-medium">
                <div className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
                  <Clock className="w-4 h-4 mr-1.5 text-orange-400" />
                  {restaurant.deliveryTime}
                </div>
                {restaurant.location?.area && (
                  <div className="flex items-center bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
                    <MapPin className="w-4 h-4 mr-1.5 text-orange-400" />
                    {restaurant.location.area}, {restaurant.location.city}
                  </div>
                )}
                {restaurant.offers?.map((offer, i) => (
                  <div key={i} className="flex items-center bg-orange-500/10 text-orange-300 px-3 py-1.5 rounded-full border border-orange-500/20">
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    {offer}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="md:w-64 shrink-0">
            <div className="sticky top-24">
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search in menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                />
              </div>

              {categories.length > 0 ? (
                <div className="hidden md:flex flex-col gap-1 border-l-2 border-gray-100 pl-4 py-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Menu Categories</h3>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => scrollToCategory(category)}
                      className={`text-left text-sm py-2 px-3 rounded-lg transition-colors duration-200 ${
                        activeCategory === category 
                        ? 'text-orange-600 font-bold bg-orange-50 -ml-4 pl-7 border-l-2 border-orange-500' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium'
                      }`}
                    >
                      {category} ({groupedMenu[category].length})
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-orange-50 rounded-xl text-sm text-orange-800 flex items-start">
                  <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                  <p>No items found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items List */}
          <div className="flex-1 pb-24">
            {categories.map((category) => (
              <div 
                key={category}
                id={category}
                ref={el => sectionRefs.current[category] = el}
                className="mb-12 scroll-mt-28"
              >
                <div className="flex items-center gap-4 mb-6 sticky top-[72px] bg-gray-50/95 backdrop-blur z-20 py-2 border-b border-gray-200">
                  <h2 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{category}</h2>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {groupedMenu[category].length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groupedMenu[category].map((item) => {
                    const cartItem = getCartItem(item.id || item._id);
                    const quantity = cartItem ? cartItem.quantity : 0;
                    const isVeg = item.isVeg !== undefined ? item.isVeg : true;

                    return (
                      <div key={item.id || item._id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all flex gap-4">
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3.5 h-3.5 border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center rounded-sm shrink-0`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                              </div>
                              {item.isBestSeller && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm">Bestseller</span>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 truncate">{item.name}</h3>
                            <p className="font-semibold text-gray-700 text-sm mb-2">₹{item.price.toFixed(2)}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed opacity-80">{item.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="w-32 h-32 shrink-0 relative flex flex-col items-center">
                          <OptimizedImage 
                            src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'} 
                            alt={item.name}
                            width={128}
                            height={112}
                            className="w-full h-28 object-cover rounded-xl shadow-sm"
                          />
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center pb-4">
                              <span className="text-black font-bold text-xs uppercase tracking-widest bg-white/80 px-2 py-1 rounded shadow-sm">Sold Out</span>
                            </div>
                          )}
                          
                          <div className="absolute -bottom-3 w-full px-2">
                            {item.isAvailable && (
                              quantity > 0 ? (
                                <div className="bg-white border text-green-700 border-green-600 rounded-lg shadow-sm flex items-center justify-between h-[34px] overflow-hidden">
                                  <button 
                                    onClick={() => handleUpdateQuantity(cartItem._id || cartItem.id, quantity - 1)}
                                    className="w-1/3 h-full flex items-center justify-center font-bold text-lg hover:bg-green-50 transition-colors active:bg-green-100"
                                  >
                                    -
                                  </button>
                                  <span className="w-1/3 text-center text-sm font-bold">{quantity}</span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(cartItem._id || cartItem.id, quantity + 1)}
                                    className="w-1/3 h-full flex items-center justify-center font-bold text-lg hover:bg-green-50 transition-colors active:bg-green-100"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => handleAddToCart(item)}
                                  className="w-full h-[34px] bg-white border border-gray-300 text-green-700 font-bold text-sm rounded-lg shadow-sm hover:shadow-md hover:border-green-600 transition-all active:scale-[0.98] uppercase tracking-wide"
                                >
                                  Add
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      
      {/* Footer spacer for fixed cart summary if needed */}
      <Footer />

      {/* Clear Cart Conflict Modal */}
      {showClearCartModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" style={{ animation: 'ratingPop 0.3s ease-out' }}>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Replace cart item?</h3>
            <p className="text-sm text-center text-gray-500 mb-6">
              Your cart contains items from a different restaurant. Do you want to discard the selection and add items from <strong>{restaurant.name}</strong>?
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 py-5 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                onClick={() => setShowClearCartModal({ show: false, newRestaurantId: null, newItem: null })}
              >
                No, Keep it
              </Button>
              <Button 
                className="flex-1 py-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={handleClearCartAndAdd}
              >
                Yes, Replace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
