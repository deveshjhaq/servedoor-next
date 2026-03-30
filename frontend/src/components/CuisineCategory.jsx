import React, { useState, useEffect } from 'react';
import api from '../services/api';
import OptimizedImage from './shared/OptimizedImage';

const CuisineCategory = () => {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const response = await api.cuisines.getAll();
        setCuisines(response.data);
      } catch (error) {
        console.error('Failed to fetch cuisines:', error);
        // Fallback to mock data if API fails
        setCuisines([
          { id: 1, name: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop" },
          { id: 2, name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop" },
          { id: 3, name: "Indian", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=150&h=150&fit=crop" },
          { id: 4, name: "Chinese", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=150&h=150&fit=crop" },
          { id: 5, name: "Desserts", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop" },
          { id: 6, name: "Beverages", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCuisines();
  }, []);

  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What's on your mind?</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 animate-pulse mb-3"></div>
                <div className="w-12 h-4 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">What's on your mind?</h2>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {cuisines.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => {
                // Handle cuisine selection
                console.log('Selected cuisine:', category.name);
              }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-200">
                <OptimizedImage
                  src={category.image}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop';
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center group-hover:text-orange-500 transition-colors">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CuisineCategory;