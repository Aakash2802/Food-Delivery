import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Filter, Award, TrendingUp, Zap, ChefHat, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';
import OfferBadge from '../../components/OfferBadge';

const HomePage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    cuisines: '',
    minRating: 0,
    pricing: '',
    latitude: 9.9252,  // Default to Madurai
    longitude: 78.1198,
    radius: 10  // Default 10 km
  });
  const [showFilters, setShowFilters] = useState(false);

  const cuisineOptions = ['All', 'Indian', 'Chinese', 'Italian', 'Fast Food', 'Mexican', 'Thai', 'Japanese'];
  const pricingOptions = ['All', '$', '$$', '$$$'];

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

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
    // Update search query and trigger restaurant fetch
    setSearchQuery(query);
    // Fetch restaurants with search query
    const fetchWithSearch = async () => {
      try {
        setLoading(true);
        const queryParams = { ...filters };

        if (query && query.trim()) {
          queryParams.search = query.trim();
        }

        const response = await restaurantAPI.getAll(queryParams);
        const restaurantData = Array.isArray(response.data)
          ? response.data
          : (response.data?.restaurants || response.restaurants || []);
        setRestaurants(restaurantData);
      } catch (error) {
        toast.error('Failed to load restaurants');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWithSearch();
  };

  const handleCuisineFilter = (cuisine) => {
    setFilters({ ...filters, cuisines: cuisine === 'All' ? '' : cuisine });
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Massive Hero Banner - Madurai Special */}
      <div className="relative bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
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

            {/* Right Image - Animated Food Collage */}
            <div className="hidden md:block relative animate-slide-in-right">
              <div className="relative w-full h-96">
                {/* Main Food Image */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-3xl shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 overflow-hidden animate-float">
                  <img
                    src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600"
                    alt="Madurai Biryani"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white font-bold text-lg">Madurai Special Biryani</p>
                  </div>
                </div>

                {/* Secondary Food Image */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-3xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 overflow-hidden" style={{ animationDelay: '0.3s' }}>
                  <img
                    src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500"
                    alt="South Indian Dosa"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white font-bold">Crispy Dosa</p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute top-10 left-10 bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-black text-lg shadow-2xl animate-bounce-slow">
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

      {/* Cuisine Categories Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-red-50 to-yellow-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Madurai Cuisines</h2>
            <p className="text-gray-600">From traditional to fusion - we've got it all!</p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {cuisineOptions.map((cuisine, index) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineFilter(cuisine)}
                  className={`px-8 py-4 rounded-2xl whitespace-nowrap transition-all font-bold transform hover:scale-105 animate-fade-in ${
                    (filters.cuisines === cuisine || (cuisine === 'All' && !filters.cuisines))
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 animate-slide-in-left">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Price Range
                </label>
                <select
                  value={filters.pricing}
                  onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                >
                  {pricingOptions.map((price) => (
                    <option key={price} value={price === 'All' ? '' : price}>
                      {price === 'All' ? 'Any Price' : price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Distance (km)
                </label>
                <select
                  value={filters.radius}
                  onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none transition-all"
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

      {/* Restaurants Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-red-600" />
              Top Restaurants in Madurai
            </h2>
            <p className="text-gray-600 mt-2">
              {restaurants.length} {restaurants.length === 1 ? 'restaurant' : 'restaurants'} available
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

        {restaurants.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl p-16 max-w-md mx-auto">
              <UtensilsCrossed className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <p className="text-gray-500 text-2xl font-bold mb-3">No restaurants found</p>
              <p className="text-gray-400 text-lg">Try adjusting your filters or location</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant._id}
                onClick={() => handleRestaurantClick(restaurant._id)}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer card-hover animate-fade-in group flex flex-col"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Restaurant Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {restaurant.isOpen ? (
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center space-x-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        <span>OPEN</span>
                      </span>
                    ) : (
                      <span className="bg-gray-800 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        CLOSED
                      </span>
                    )}
                  </div>

                  {/* Offer Badge */}
                  {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="absolute top-4 right-4">
                      <OfferBadge offer={restaurant.offers[0]} compact={true} />
                    </div>
                  )}

                  {/* Pricing Badge - Move to bottom right if offers exist */}
                  {(!restaurant.offers || restaurant.offers.length === 0) && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-2 rounded-full font-black text-sm shadow-lg">
                      {restaurant.pricing || '$$'}
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {restaurant.cuisines?.join(' • ') || 'Various cuisines'}
                    </p>

                    {/* Active Offers - Fixed Height */}
                    <div className="mb-4 h-[80px] flex flex-col justify-center">
                      {restaurant.offers && restaurant.offers.length > 0 ? (
                        <div className="space-y-2 w-full">
                          {/* Show only first offer to maintain consistent height */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-200">
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
                        <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm italic">
                          No active offers
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-2 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        <span className="font-bold text-gray-900 text-lg">
                          {restaurant.rating?.average?.toFixed(1) || '4.0'}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({restaurant.rating?.count || 0})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">
                          {restaurant.deliveryTime?.min || 30}-{restaurant.deliveryTime?.max || 45} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Always at bottom */}
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-500 font-medium">
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
