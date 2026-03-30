// Mock data for serveDoor food delivery app

export const restaurants = [
  {
    id: 1,
    name: "Pizza Palace",
    cuisine: "Italian, Pizza",
    rating: 4.3,
    deliveryTime: "30-40 mins",
    distance: "2.5 km",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=250&fit=crop",
    offer: "60% OFF UPTO ₹120",
    promoted: true,
    tags: ["Pizza", "Italian"]
  },
  {
    id: 2,
    name: "Burger Barn",
    cuisine: "American, Burgers",
    rating: 4.1,
    deliveryTime: "25-35 mins", 
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop",
    offer: "50% OFF UPTO ₹100",
    promoted: false,
    tags: ["Burgers", "American"]
  },
  {
    id: 3,
    name: "Spice Garden",
    cuisine: "Indian, North Indian",
    rating: 4.5,
    deliveryTime: "35-45 mins",
    distance: "3.2 km", 
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=250&fit=crop",
    offer: "40% OFF UPTO ₹80",
    promoted: true,
    tags: ["Indian", "Curry"]
  },
  {
    id: 4,
    name: "Sushi Central",
    cuisine: "Japanese, Sushi",
    rating: 4.4,
    deliveryTime: "40-50 mins",
    distance: "4.1 km",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=250&fit=crop",
    offer: "25% OFF UPTO ₹150",
    promoted: false,
    tags: ["Sushi", "Japanese"]
  },
  {
    id: 5,
    name: "Taco Fiesta",
    cuisine: "Mexican, Fast Food",
    rating: 4.2,
    deliveryTime: "20-30 mins",
    distance: "1.5 km",
    image: "https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&h=250&fit=crop",
    offer: "Buy 1 Get 1 FREE",
    promoted: false,
    tags: ["Mexican", "Tacos"]
  },
  {
    id: 6,
    name: "The Coffee House",
    cuisine: "Cafe, Beverages",
    rating: 4.0,
    deliveryTime: "15-25 mins",
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop",
    offer: "30% OFF UPTO ₹60",
    promoted: false,
    tags: ["Coffee", "Beverages"]
  }
];

export const cuisineCategories = [
  {
    id: 1,
    name: "Pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop"
  },
  {
    id: 2, 
    name: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop"
  },
  {
    id: 3,
    name: "Indian",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=150&h=150&fit=crop"
  },
  {
    id: 4,
    name: "Chinese",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=150&h=150&fit=crop"
  },
  {
    id: 5,
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop"
  },
  {
    id: 6,
    name: "Beverages", 
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop"
  }
];

export const banners = [
  {
    id: 1,
    title: "Free Delivery on First Order",
    subtitle: "Order now and get free delivery",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=300&fit=crop",
    cta: "Order Now"
  },
  {
    id: 2,
    title: "Weekend Special Offers",
    subtitle: "Up to 60% off on selected restaurants",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=300&fit=crop",
    cta: "Explore Deals"
  }
];

export const collections = [
  {
    id: 1,
    title: "What's on your mind?",
    items: cuisineCategories
  },
  {
    id: 2,
    title: "Top restaurant chains in your city",
    items: restaurants.filter(r => r.promoted)
  }
];

export const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore", 
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad"
];

export const userLocation = {
  city: "Mumbai",
  area: "Bandra West",
  coordinates: { lat: 19.0596, lng: 72.8295 }
};