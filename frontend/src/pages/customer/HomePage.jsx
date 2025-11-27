import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Clock, Filter, Award, TrendingUp, Zap, ChefHat, UtensilsCrossed, Percent, ChevronDown, Sparkles, Check, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI, menuAPI, promoAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';
import OfferBadge from '../../components/OfferBadge';
import useCartStore from '../../store/useCartStore';
import useParallax from '../../hooks/useParallax';
import { Plus } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addItem);
  const parallaxOffset = useParallax(0.3); // 0.3 = 30% parallax effect
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [promoCodes, setPromoCodes] = useState([]);
  const [filters, setFilters] = useState({
    cuisines: '',
    minRating: 0,
    pricing: '',
    latitude: 9.9252,  // Default to Madurai
    longitude: 78.1198,
    radius: 10  // Default 10 km
  });
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    vegOnly: false,
    rating4Plus: false,
    fastDelivery: false,
    hasOffers: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Rating: High to Low' },
    { value: 'deliveryTime', label: 'Delivery Time' },
    { value: 'costLowHigh', label: 'Cost: Low to High' },
    { value: 'costHighLow', label: 'Cost: High to Low' }
  ];

  const cuisineOptions = ['All', 'Indian', 'Chinese', 'Italian', 'Fast Food', 'Mexican', 'Thai', 'Japanese'];
  const pricingOptions = ['All', '$', '$$', '$$$'];

  // Add to cart from search results
  const handleAddToCart = (dish, e) => {
    e.stopPropagation();
    const restaurant = dish.restaurantId;
    if (!restaurant || !restaurant._id) {
      toast.error('Restaurant info missing');
      return;
    }
    const cartItem = {
      menuItemId: dish._id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      image: dish.images?.[0] || '',
      customizations: []
    };
    addToCart(cartItem, {
      _id: restaurant._id,
      name: restaurant.name,
      image: restaurant.image || ''
    });
    toast.success(`${dish.name} added to cart!`);
  };

  useEffect(() => {
    fetchRestaurants();
    fetchPromoCodes();
  }, [filters]);

  const fetchPromoCodes = async () => {
    try {
      const response = await promoAPI.getActive();
      setPromoCodes(response.data || []);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const queryParams = {};

      if (filters.latitude && filters.longitude) {
        queryParams.latitude = filters.latitude;
        queryParams.longitude = filters.longitude;
        queryParams.radius = filters.radius;
      }

      if (filters.cuisines && filters.cuisines !== 'All') {
        queryParams.cuisines = filters.cuisines;
      }

      if (filters.minRating > 0) {
        queryParams.minRating = filters.minRating;
      }

      if (filters.pricing && filters.pricing !== 'All') {
        queryParams.pricing = filters.pricing;
      }

      const response = await restaurantAPI.getAll(queryParams);
      console.log('API Response:', response); // Debug log
      // API returns { success, data: [...], pagination }
      // axios interceptor already extracted response.data, so response = { success, data: [...], pagination }
      const restaurantData = Array.isArray(response.data)
        ? response.data
        : (response.data?.restaurants || response.restaurants || []);
      console.log('Restaurant data:', restaurantData); // Debug log
      setRestaurants(restaurantData);
    } catch (error) {
      toast.error('Failed to load restaurants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query || !query.trim()) {
      // Clear search results and show all restaurants
      setSearchResults([]);
      setIsSearching(false);
      fetchRestaurants();
      return;
    }

    // Search for dishes like Swiggy
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setIsSearching(true);
        const response = await menuAPI.search(query.trim());
        const dishes = response.data?.menuItems || [];
        setSearchResults(dishes);
      } catch (error) {
        toast.error('Failed to search dishes');
        console.error(error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    fetchRestaurants();
  };

  const handleCuisineFilter = (cuisine) => {
    setFilters({ ...filters, cuisines: cuisine === 'All' ? '' : cuisine });
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  // Filter and sort restaurants
  const getFilteredRestaurants = () => {
    let filtered = [...restaurants];

    // Apply quick filters
    if (quickFilters.vegOnly) {
      filtered = filtered.filter(r => r.isVeg || r.cuisines?.some(c =>
        c.toLowerCase().includes('veg') || c.toLowerCase().includes('south indian')
      ));
    }
    if (quickFilters.rating4Plus) {
      filtered = filtered.filter(r => (r.rating?.average || 0) >= 4.0);
    }
    if (quickFilters.fastDelivery) {
      filtered = filtered.filter(r => (r.deliveryTime?.min || 30) <= 30);
    }
    if (quickFilters.hasOffers) {
      filtered = filtered.filter(r => r.offers && r.offers.length > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'deliveryTime':
        filtered.sort((a, b) => (a.deliveryTime?.min || 30) - (b.deliveryTime?.min || 30));
        break;
      case 'costLowHigh':
        filtered.sort((a, b) => {
          const priceA = a.pricing === '$' ? 1 : a.pricing === '$$' ? 2 : 3;
          const priceB = b.pricing === '$' ? 1 : b.pricing === '$$' ? 2 : 3;
          return priceA - priceB;
        });
        break;
      case 'costHighLow':
        filtered.sort((a, b) => {
          const priceA = a.pricing === '$' ? 1 : a.pricing === '$$' ? 2 : 3;
          const priceB = b.pricing === '$' ? 1 : b.pricing === '$$' ? 2 : 3;
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded mb-4"></div>
        <div className="flex justify-between mb-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar />

      {/* Massive Hero Banner - Madurai Special */}
      <div className="relative bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-white overflow-hidden">
        {/* Animated Background Pattern with Parallax */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
        >
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-orange-300 rounded-full blur-2xl animate-bounce-slow"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <div className="inline-block mb-6 animate-slide-in-left">
                <span className="bg-white bg-opacity-20 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold border-2 border-white border-opacity-30 flex items-center space-x-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  <span>Authentic Madurai Flavors</span>
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in">
                <span className="block mb-2">Craving</span>
                <span className="block text-yellow-300">Madurai Food?</span>
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-white opacity-90 animate-slide-in-right">
                Get your favorite dishes delivered hot & fresh from top Madurai restaurants!
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-10 animate-scale-in">
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-4 text-center border border-white border-opacity-30">
                  <div className="flex justify-center mb-2">
                    <Zap className="w-8 h-8 text-yellow-300" />
                  </div>
                  <p className="text-sm font-bold">Fast Delivery</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-4 text-center border border-white border-opacity-30">
                  <div className="flex justify-center mb-2">
                    <Award className="w-8 h-8 text-yellow-300" />
                  </div>
                  <p className="text-sm font-bold">Top Rated</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-4 text-center border border-white border-opacity-30">
                  <div className="flex justify-center mb-2">
                    <ChefHat className="w-8 h-8 text-yellow-300" />
                  </div>
                  <p className="text-sm font-bold">Best Chefs</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="animate-fade-in">
                <SearchBar
                  onSearch={handleSearch}
                  placeholder="Search for restaurants, cuisines, or dishes in Madurai..."
                  autoFocus={false}
                />
              </div>
            </div>

            {/* Right Image - Animated Food Collage with Parallax */}
            <div className="hidden md:block relative animate-slide-in-right">
              <div className="relative w-full h-96">
                {/* Main Food Image with Parallax */}
                <div
                  className="absolute top-0 right-0 w-80 h-80 bg-white rounded-3xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 overflow-hidden animate-float"
                  style={{ transform: `rotate(6deg) translateY(${parallaxOffset * -0.2}px)` }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600"
                    alt="Madurai Biryani"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white font-bold text-lg">Madurai Special Biryani</p>
                  </div>
                </div>

                {/* Secondary Food Image with Parallax */}
                <div
                  className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-3xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 overflow-hidden"
                  style={{ transform: `rotate(-6deg) translateY(${parallaxOffset * -0.4}px)`, animationDelay: '0.3s' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500"
                    alt="South Indian Dosa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white font-bold">Crispy Dosa</p>
                  </div>
                </div>

                {/* Floating Badge with Parallax */}
                <div
                  className="absolute top-10 left-10 bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-black text-lg shadow-2xl animate-bounce-slow"
                  style={{ transform: `translateY(${parallaxOffset * -0.6}px)` }}
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-6 h-6 fill-current" />
                    <span>5 Restaurants</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" fillOpacity="0.1"/>
            <path d="M0 40L60 46.7C120 53 240 67 360 70C480 73 600 65 720 63.3C840 62 960 67 1080 70C1200 73 1320 73 1380 73.3L1440 73.3V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V40Z" fill="white" fillOpacity="0.2"/>
            <path d="M0 80L60 76.7C120 73 240 67 360 63.3C480 60 600 60 720 63.3C840 67 960 73 1080 76.7C1200 80 1320 80 1380 80H1440V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V80Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* What's on your mind? - Swiggy Style */}
      <div className="bg-white dark:bg-gray-800 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What's on your mind?</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { name: 'Biryani', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Biryani.png' },
              { name: 'Dosa', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Dosa.png' },
              { name: 'Pizza', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Pizza.png' },
              { name: 'Burger', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Burger.png' },
              { name: 'Chinese', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Chinese.png' },
              { name: 'Rolls', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Rolls.png' },
              { name: 'Idli', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Idli.png' },
              { name: 'Paratha', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Paratha.png' },
              { name: 'Thali', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Thali.png' },
              { name: 'Noodles', image: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/PC_Mweb/Noodles.png' },
            ].map((item) => (
              <div
                key={item.name}
                onClick={() => handleSearch(item.name)}
                className="flex flex-col items-center cursor-pointer group flex-shrink-0"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-2 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'; }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 transition-colors">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offers Banner Carousel */}
      <div className="bg-gradient-to-r from-orange-100 via-red-50 to-yellow-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 py-8 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            Best Offers For You
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {promoCodes.length > 0 ? promoCodes.map((promo, index) => {
              const gradients = [
                'from-purple-600 to-indigo-600',
                'from-green-600 to-teal-600',
                'from-red-600 to-orange-600',
                'from-blue-600 to-cyan-600',
                'from-pink-600 to-rose-600',
              ];
              const bg = gradients[index % gradients.length];
              const title = promo.type === 'percentage'
                ? `${promo.value}% OFF`
                : `₹${promo.value} OFF`;
              const subtitle = promo.minOrderValue > 0
                ? `Orders above ₹${promo.minOrderValue}`
                : promo.description;

              return (
                <div
                  key={promo._id}
                  onClick={() => {
                    navigator.clipboard.writeText(promo.code);
                    toast.success(`Copied "${promo.code}" to clipboard!`);
                  }}
                  className={`bg-gradient-to-r ${bg} rounded-2xl p-6 min-w-[280px] flex-shrink-0 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-3xl font-black mb-1">{title}</p>
                      <p className="text-white/80 text-sm">{subtitle}</p>
                    </div>
                    <Award className="w-10 h-10 text-white/30" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold border-2 border-dashed border-white/50">
                      {promo.code}
                    </span>
                    <span className="text-xs text-white/70">Tap to copy</span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 dark:text-gray-400">No offers available</p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Pills & Sort */}
      <div className="bg-white dark:bg-gray-900 py-4 border-b dark:border-gray-700 sticky top-0 z-40 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
              {/* Veg Only */}
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, vegOnly: !prev.vegOnly }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm border-2 ${
                  quickFilters.vegOnly
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-green-600'
                }`}
              >
                <Leaf className="w-4 h-4" />
                Pure Veg
                {quickFilters.vegOnly && <Check className="w-4 h-4" />}
              </button>

              {/* Rating 4.0+ */}
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, rating4Plus: !prev.rating4Plus }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm border-2 ${
                  quickFilters.rating4Plus
                    ? 'bg-yellow-500 text-white border-yellow-500'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-yellow-500'
                }`}
              >
                <Star className="w-4 h-4" />
                Rating 4.0+
                {quickFilters.rating4Plus && <Check className="w-4 h-4" />}
              </button>

              {/* Fast Delivery */}
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm border-2 ${
                  quickFilters.fastDelivery
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-orange-500'
                }`}
              >
                <Clock className="w-4 h-4" />
                Fast Delivery
                {quickFilters.fastDelivery && <Check className="w-4 h-4" />}
              </button>

              {/* Offers */}
              <button
                onClick={() => setQuickFilters(prev => ({ ...prev, hasOffers: !prev.hasOffers }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm border-2 ${
                  quickFilters.hasOffers
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-purple-600'
                }`}
              >
                <Percent className="w-4 h-4" />
                Offers
                {quickFilters.hasOffers && <Check className="w-4 h-4" />}
              </button>

              {/* Cuisine Pills */}
              {cuisineOptions.slice(1).map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineFilter(cuisine)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium text-sm border-2 ${
                    filters.cuisines === cuisine
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 transition-all"
              >
                <span>Sort By</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 min-w-[200px] z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                        sortBy === option.value ? 'text-red-600 font-semibold' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-slide-in-left transition-colors duration-300">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Price Range
                </label>
                <select
                  value={filters.pricing}
                  onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {pricingOptions.map((price) => (
                    <option key={price} value={price === 'All' ? '' : price}>
                      {price === 'All' ? 'Any Price' : price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Distance (km)
                </label>
                <select
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results - Dishes (Like Swiggy) */}
      {isSearching && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Search className="w-8 h-8 mr-3 text-red-600" />
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {searchResults.length} {searchResults.length === 1 ? 'dish' : 'dishes'} found
              </p>
            </div>
            <button
              onClick={clearSearch}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-bold"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 max-w-md mx-auto">
                <Search className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold mb-3">No dishes found</p>
                <p className="text-gray-400 dark:text-gray-500 text-lg">Try searching for something else</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((dish, index) => (
                <div
                  key={dish._id}
                  onClick={() => navigate(`/restaurant/${dish.restaurantId?._id}`)}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Dish Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={dish.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {dish.isVeg ? (
                      <span className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">VEG</span>
                    ) : (
                      <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">NON-VEG</span>
                    )}
                    <div className="absolute bottom-3 right-3 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg shadow-lg">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{dish.price}</span>
                    </div>
                  </div>

                  {/* Dish Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">{dish.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-2">{dish.description}</p>

                    {/* Restaurant Info */}
                    <div className="flex items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-600 truncate">
                          {dish.restaurantId?.name || 'Restaurant'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          <span>{dish.restaurantId?.rating?.average || '4.0'}</span>
                          <span className="mx-2">•</span>
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{dish.preparationTime || 20} min</span>
                        </div>
                      </div>
                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(dish, e)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                        title="Add to cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restaurants Grid */}
      {!isSearching && (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-red-600" />
              Top Restaurants in Madurai
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} available
              {(quickFilters.vegOnly || quickFilters.rating4Plus || quickFilters.fastDelivery || quickFilters.hasOffers) && (
                <span className="text-red-600 ml-2">(filtered)</span>
              )}
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all font-bold shadow-lg transform hover:scale-105"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 max-w-md mx-auto">
              <UtensilsCrossed className="w-24 h-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
              <p className="text-gray-500 dark:text-gray-400 text-2xl font-bold mb-3">No restaurants found</p>
              <p className="text-gray-400 dark:text-gray-500 text-lg">Try adjusting your filters or location</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRestaurants.map((restaurant, index) => (
              <div
                key={restaurant._id}
                onClick={() => handleRestaurantClick(restaurant._id)}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer card-hover animate-fade-in group flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Restaurant Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Restaurant Badges - Top Row */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {/* Left Badges */}
                    <div className="flex flex-wrap gap-1.5 max-w-[60%]">
                      {restaurant.isOpen ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          OPEN
                        </span>
                      ) : (
                        <span className="bg-gray-800 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg">
                          CLOSED
                        </span>
                      )}
                      {/* Top Rated Badge */}
                      {(restaurant.rating?.average || 0) >= 4.5 && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Top Rated
                        </span>
                      )}
                    </div>

                    {/* Right Badge - Offer or Pricing */}
                    <div className="flex-shrink-0">
                      {restaurant.offers && restaurant.offers.length > 0 ? (
                        <OfferBadge offer={restaurant.offers[0]} compact={true} />
                      ) : (
                        <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full font-black text-xs shadow-lg">
                          {restaurant.pricing || '$$'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Left Badge - Fast Delivery only */}
                  {(restaurant.deliveryTime?.min || 30) <= 25 && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Fast
                      </span>
                    </div>
                  )}

                  {!restaurant.isOpen && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-white px-6 py-3 rounded-full font-bold text-gray-900 text-lg">
                        Closed
                      </span>
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {restaurant.cuisines?.join(' • ') || 'Various cuisines'}
                    </p>

                    {/* Active Offers - Fixed Height */}
                    <div className="mb-4 h-[80px] flex flex-col justify-center">
                      {restaurant.offers && restaurant.offers.length > 0 ? (
                        <div className="space-y-2 w-full">
                          {/* Show only first offer to maintain consistent height */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-green-700 text-sm">
                                  {restaurant.offers[0].discountType === 'percentage' ? `${restaurant.offers[0].discountValue}% OFF` :
                                   restaurant.offers[0].discountType === 'flat' ? `₹${restaurant.offers[0].discountValue} OFF` :
                                   'FREE DELIVERY'}
                                </span>
                                {restaurant.offers[0].minOrderValue > 0 && (
                                  <span className="text-gray-600 text-xs">above ₹{restaurant.offers[0].minOrderValue}</span>
                                )}
                              </div>
                              {restaurant.offers[0].code && (
                                <span className="bg-white border-2 border-dashed border-green-600 text-green-700 px-2 py-1 rounded font-black text-xs tracking-wider">
                                  {restaurant.offers[0].code}
                                </span>
                              )}
                            </div>
                          </div>
                          {restaurant.offers.length > 1 && (
                            <p className="text-xs text-green-600 font-semibold">
                              +{restaurant.offers.length - 1} more offer{restaurant.offers.length > 2 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400 dark:text-gray-500 text-sm italic">
                          No active offers
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-2 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-bold text-gray-900 dark:text-white text-lg">
                          {restaurant.rating?.average?.toFixed(1) || '4.0'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          ({restaurant.rating?.count || 0})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">
                          {restaurant.deliveryTime?.min || 30}-{restaurant.deliveryTime?.max || 45} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Always at bottom */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Min. ₹{restaurant.minimumOrder || 100}
                      </span>
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-red-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestaurantClick(restaurant._id);
                      }}
                    >
                      <span>Order Now</span>
                      <span className="text-2xl">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Footer - Developer Credit */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Designed & Developed by <span className="text-white font-semibold">Aakash</span> © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
