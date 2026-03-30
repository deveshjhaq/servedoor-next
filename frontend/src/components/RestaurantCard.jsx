import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/use-toast';
import OptimizedImage from './shared/OptimizedImage';

const RestaurantCard = ({ restaurant }) => {
  const {
    id,
    name,
    cuisine,
    rating,
    deliveryTime,
    distance,
    image,
    offer,
    promoted
  } = restaurant;

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    // Direct addition of a default item from card is nice for UX, but it's better if they just go to the menu
    navigate(`/restaurant/${id || restaurant._id}`);
  };

  const handleViewRestaurant = () => {
    navigate(`/restaurant/${id || restaurant._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      {/* Restaurant Image */}
      <div className="relative" onClick={handleViewRestaurant}>
        <OptimizedImage
          src={image}
          alt={name}
          width={400}
          height={250}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {promoted && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            Promoted
          </div>
        )}
        {offer && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="text-white font-bold text-sm">{offer}</span>
          </div>
        )}
      </div>

      {/* Restaurant Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="font-bold text-lg text-gray-800 truncate flex-1 mr-2 cursor-pointer hover:text-orange-500"
            onClick={handleViewRestaurant}
          >
            {name}
          </h3>
          <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded text-xs">
            <Star className="w-3 h-3 mr-1 fill-current" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 truncate">{cuisine}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{deliveryTime}</span>
          </div>
          {distance && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{distance}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          View Menu
        </Button>
      </div>
    </div>
  );
};

export default React.memo(RestaurantCard);