import React from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from './shared/OptimizedImage';

const PromotionalBanner = () => {
  const promos = [
    {
      id: 1,
      title: "Free Delivery",
      subtitle: "On orders above ₹199",
      description: "Get free delivery on your first order and save more!",
      bgColor: "bg-gradient-to-r from-green-500 to-green-600",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      title: "Weekend Special",
      subtitle: "Up to 60% OFF",
      description: "Enjoy massive discounts on selected restaurants this weekend",
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop"
    }
  ];

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Special Offers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`${promo.bgColor} rounded-xl p-6 text-white relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="mb-2">
                  <span className="text-sm font-medium opacity-90">{promo.subtitle}</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
                <p className="text-sm opacity-90 mb-4">{promo.description}</p>
                <Button
                  variant="secondary"
                  className="bg-white text-gray-800 hover:bg-gray-100"
                >
                  Order Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <div className="absolute right-0 top-0 w-32 h-32 opacity-20">
                <OptimizedImage
                  src={promo.image}
                  alt={promo.title}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;