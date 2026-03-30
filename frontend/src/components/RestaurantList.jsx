import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import { Button } from './ui/button';
import { SearchX } from 'lucide-react';
import { SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import EmptyState from './shared/EmptyState';
import { RestaurantCardSkeleton } from './shared/PageSkeleton';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [userLocation, setUserLocation] = useState(null);

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'promoted', name: 'Promoted' },
    { id: 'rating', name: 'Rating 4.0+' },
    { id: 'delivery', name: 'Fast Delivery' },
    { id: 'offers', name: 'Great Offers' }
  ];

  useEffect(() => {
    // Get user location for distance calculation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedFilter, userLocation]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: 1,
        limit: 20
      };

      // Add filter parameters
      switch (selectedFilter) {
        case 'promoted':
          params.promoted = true;
          break;
        case 'rating':
          params.rating = 4.0;
          break;
        case 'delivery':
          // This would need backend logic to filter by delivery time
          break;
        case 'offers':
          // This would need backend logic to filter by offers
          break;
        default:
          break;
      }

      // Add location for distance calculation
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await api.restaurants.getAll(params);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      // Fallback to empty array
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterId) => {
    setSelectedFilter(filterId);
  };

  if (loading) {
    return (
      <section className="py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Restaurants near you</h2>
            <Button variant="outline" className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Loading Skeleton */}
          <div className="flex space-x-4 mb-8 overflow-x-auto">
            {filters.map((filter) => (
              <div key={filter.id} className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <RestaurantCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Restaurants near you</h2>
          <Button variant="outline" className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              onClick={() => handleFilter(filter.id)}
              className={`whitespace-nowrap ${
                selectedFilter === filter.id
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-orange-500 border-gray-300'
              }`}
            >
              {filter.name}
            </Button>
          ))}
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>

        {restaurants.length === 0 && !loading && (
          <EmptyState
            icon={<SearchX className="w-8 h-8" />}
            title="No restaurants found"
            description="Try adjusting your filters or check back later"
            action={
              <Button variant="outline" onClick={() => setSelectedFilter('all')}>
                Clear Filters
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
};

export default RestaurantList;