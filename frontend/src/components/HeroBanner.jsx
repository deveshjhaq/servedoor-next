import React from 'react';
import { Button } from './ui/button';
import { MapPin, Search } from 'lucide-react';

const HeroBanner = () => {
  return (
    <section className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white py-16 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Craving? We've got you covered!
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover the best food & drinks from restaurants near you
          </p>
          
          <div className="bg-white rounded-lg p-2 max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
            <div className="flex items-center flex-1 px-4 py-2 text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              <span>Mumbai, Maharashtra</span>
            </div>
            <div className="flex items-center flex-1 px-4 py-2 border-t md:border-t-0 md:border-l border-gray-200">
              <Search className="w-5 h-5 mr-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for restaurant or food"
                className="flex-1 outline-none text-gray-700"
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md">
              Find Food
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-orange-100">Restaurants</div>
            </div>
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-orange-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">25 mins</div>
              <div className="text-orange-100">Avg Delivery Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-orange-100">Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;