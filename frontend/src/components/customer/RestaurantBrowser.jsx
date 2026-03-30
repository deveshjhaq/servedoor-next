import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import RestaurantCard from '../RestaurantCard';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import useDebounce from '../../hooks/useDebounce';
import api from '../../services/api';
import {
  Search, Filter, MapPin, Star, Clock, Leaf, 
  ChefHat, SlidersHorizontal, X, Loader2
} from 'lucide-react';

const RestaurantBrowser = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    foodType: 'all', // veg, non-veg, all
    rating: 'all',
    deliveryTime: 'all',
    priceRange: 'all',
    offers: false,
    sortBy: 'popularity'
  });

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const categoryOptions = [
    { value: 'all', label: 'All Restaurants' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'burger', label: 'Burgers' },
    { value: 'indian', label: 'Indian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'italian', label: 'Italian' },
    { value: 'dessert', label: 'Desserts' },
    { value: 'beverage', label: 'Beverages' }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'rating', label: 'Rating' },
    { value: 'delivery_time', label: 'Delivery Time' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' }
  ];

  useEffect(() => {
    fetchUserLocation();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [restaurants, filters, debouncedSearchQuery]);

  const fetchUserLocation = () => {
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
              lat: latitude,
              lng: longitude,
              area: response.data.area,
              city: response.data.city,
            });
          } catch (error) {
            console.log('Location detection failed');
          }
        },
        () => {
          console.log('Location access denied');
        }
      );
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      
      const response = await api.restaurants.getAll(params);
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...restaurants];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(restaurant => 
        restaurant.tags?.some(tag => 
          tag.toLowerCase().includes(filters.category.toLowerCase())
        ) ||
        restaurant.cuisine.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    // Food type filter (veg/non-veg)
    if (filters.foodType !== 'all') {
      // This would require menu data to properly filter
      // For now, we'll use tags as a proxy
      if (filters.foodType === 'veg') {
        filtered = filtered.filter(restaurant => 
          restaurant.tags?.includes('Vegetarian') ||
          restaurant.name.toLowerCase().includes('veg')
        );
      }
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(restaurant => restaurant.rating >= minRating);
    }

    // Delivery time filter
    if (filters.deliveryTime !== 'all') {
      const maxTime = parseInt(filters.deliveryTime);
      filtered = filtered.filter(restaurant => {
        const timeRange = restaurant.deliveryTime.match(/\d+/);
        return timeRange && parseInt(timeRange[0]) <= maxTime;
      });
    }

    // Offers filter
    if (filters.offers) {
      filtered = filtered.filter(restaurant => restaurant.offer);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'delivery_time':
          const aTime = parseInt(a.deliveryTime.match(/\d+/)?.[0] || 60);
          const bTime = parseInt(b.deliveryTime.match(/\d+/)?.[0] || 60);
          return aTime - bTime;
        case 'popularity':
        default:
          return b.promoted ? 1 : -1;
      }
    });

    setFilteredRestaurants(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      foodType: 'all',
      rating: 'all',
      deliveryTime: 'all',
      priceRange: 'all',
      offers: false,
      sortBy: 'popularity'
    });
    setSearchQuery('');
  };

  const handleAddToCart = async (restaurant) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    // For demo, we'll add a default menu item
    // In real implementation, this would navigate to restaurant menu
    const defaultMenuItem = {
      id: 'default-item',
      name: 'Special Item',
      price: 199,
      isVeg: true
    };

    const result = await addToCart(
      restaurant.id, 
      restaurant.name, 
      defaultMenuItem
    );
    
    if (result.success) {
      toast({
        title: "Added to Cart!",
        description: result.message
      });
    } else if (result.requireCartClear) {
      toast({
        title: "Different Restaurant",
        description: result.error,
        variant: "destructive",
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Handle cart clear and retry
              console.log('Clear cart and retry');
            }}
          >
            Clear Cart
          </Button>
        )
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.foodType !== 'all') count++;
    if (filters.rating !== 'all') count++;
    if (filters.deliveryTime !== 'all') count++;
    if (filters.offers) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Restaurants</h2>
          {userLocation && (
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{userLocation.area}, {userLocation.city}</span>
            </div>
          )}
        </div>
        <Badge variant="secondary">
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search restaurants, cuisines, or dishes..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-1 bg-orange-100 text-orange-800">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
            
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Food Type
                  </label>
                  <Select value={filters.foodType} onValueChange={(value) => handleFilterChange('foodType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Rating
                  </label>
                  <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Rating</SelectItem>
                      <SelectItem value="4.0">4.0+ ⭐</SelectItem>
                      <SelectItem value="4.2">4.2+ ⭐</SelectItem>
                      <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Delivery Time
                  </label>
                  <Select value={filters.deliveryTime} onValueChange={(value) => handleFilterChange('deliveryTime', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="30">Under 30 mins</SelectItem>
                      <SelectItem value="45">Under 45 mins</SelectItem>
                      <SelectItem value="60">Under 1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.offers}
                    onChange={(e) => handleFilterChange('offers', e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Offers Available</span>
                </label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filters.category === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('category', 'all')}
          className={filters.category === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          All
        </Button>
        <Button
          variant={filters.rating === '4.0' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('rating', filters.rating === '4.0' ? 'all' : '4.0')}
          className={filters.rating === '4.0' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          <Star className="w-3 h-3 mr-1" />
          4.0+
        </Button>
        <Button
          variant={filters.deliveryTime === '30' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('deliveryTime', filters.deliveryTime === '30' ? 'all' : '30')}
          className={filters.deliveryTime === '30' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          <Clock className="w-3 h-3 mr-1" />
          Fast Delivery
        </Button>
        <Button
          variant={filters.foodType === 'veg' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange('foodType', filters.foodType === 'veg' ? 'all' : 'veg')}
          className={filters.foodType === 'veg' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          <Leaf className="w-3 h-3 mr-1" />
          Pure Veg
        </Button>
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onAddToCart={() => handleAddToCart(restaurant)}
          />
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 
              `No results for "${searchQuery}". Try different keywords or adjust your filters.` :
              'Try adjusting your filters to see more restaurants.'
            }
          </p>
          <Button onClick={clearFilters} className="bg-orange-500 hover:bg-orange-600">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantBrowser;