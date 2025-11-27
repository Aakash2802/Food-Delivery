import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, ShoppingCart, Plus, Minus, Award, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI, menuAPI } from '../../services/api';
import useCartStore from '../../store/useCartStore';
import Navbar from '../../components/Navbar';
import ReviewList from '../../components/ReviewList';
import OfferBadge from '../../components/OfferBadge';
import { triggerFlyToCart } from '../../components/FlyToCart';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCartStore();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both restaurant details and menu in parallel
      const [restaurantRes, menuRes] = await Promise.all([
        restaurantAPI.getById(id),
        menuAPI.getRestaurantMenu(id)
      ]);

      console.log('Restaurant API Response:', restaurantRes);
      console.log('Menu API Response:', menuRes);

      // Handle different response structures
      const restaurantData = restaurantRes.data?.restaurant || restaurantRes.data || restaurantRes;
      const menuData = menuRes.data?.menuItems || menuRes.menuItems || menuRes.data || [];

      console.log('Parsed restaurant data:', restaurantData);
      console.log('Parsed menu data:', menuData);

      // Set restaurant data first
      setRestaurant(restaurantData);

      // Then set menu items
      setMenuItems(menuData);
    } catch (error) {
      toast.error('Failed to load restaurant data');
      console.error('fetchData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredMenuItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item, e) => {
    const quantity = quantities[item._id] || 1;

    const cartItem = {
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.images?.[0]?.url,
      customizations: []
    };

    if (!restaurant || !restaurant._id) {
      toast.error('Restaurant information not loaded. Please wait...');
      return;
    }

    // Trigger fly to cart animation
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      triggerFlyToCart(rect.left + rect.width / 2, rect.top, item.images?.[0]?.url);
    }

    addItem(cartItem, {
      _id: restaurant._id,
      name: restaurant.name
    });

    toast.success(`${item.name} added to cart`);
    setQuantities({ ...quantities, [item._id]: 1 });
  };

  const updateQuantity = (itemId, change) => {
    const currentQty = quantities[itemId] || 1;
    const newQty = Math.max(1, currentQty + change);
    setQuantities({ ...quantities, [itemId]: newQty });
  };

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar />

      {/* Restaurant Header - Enhanced */}
      <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Restaurant Image */}
            <div className="relative group">
              <img
                src={restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'}
                alt={restaurant.name}
                className="w-full md:w-80 h-64 object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                <Award className="w-4 h-4 text-red-600" />
                <span className="text-sm font-bold text-red-600">{restaurant.pricing || '$$'}</span>
              </div>
              {!restaurant.isOpen && (
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-2xl flex items-center justify-center">
                  <span className="bg-white px-6 py-3 rounded-full font-bold text-gray-900 text-lg">
                    Closed
                  </span>
                </div>
              )}
            </div>

            {/* Restaurant Info - Enhanced */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {restaurant.name}
                  </h1>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    {restaurant.cuisines?.join(' • ')}
                  </p>
                  {restaurant.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-2xl">
                      {restaurant.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats - Enhanced */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-6">
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      {restaurant.rating?.average?.toFixed(1) || '4.0'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {restaurant.rating?.count || 0} ratings
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      {restaurant.deliveryTime?.min}-{restaurant.deliveryTime?.max}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">mins</span>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {restaurant.location?.city || restaurant.address?.city || 'Madurai'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">location</span>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-2 mb-1">
                    <Phone className="w-5 h-5 text-green-500" />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {restaurant.contactInfo?.phone || restaurant.contactNumber || 'N/A'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">contact</span>
                </div>
              </div>

              {/* Additional Info */}
              {restaurant.minimumOrder && (
                <div className="bg-white dark:bg-gray-700 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Minimum Order:</span> ₹{restaurant.minimumOrder} •
                    <span className="font-semibold ml-2">Delivery Fee:</span> ₹{restaurant.deliveryFee || 0}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Offers Section */}
          {restaurant.offers && restaurant.offers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Award className="w-6 h-6 mr-2 text-green-600" />
                Available Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurant.offers.map((offer, idx) => (
                  <OfferBadge key={idx} offer={offer} compact={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Section - Enhanced */}
      <div className="container mx-auto px-4 py-8">
        {/* Category Filter - Enhanced */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Leaf className="w-6 h-6 mr-2 text-green-600" />
            Our Menu
          </h2>
          <div className="sticky top-16 bg-white dark:bg-gray-800 bg-opacity-95 backdrop-blur-sm py-4 z-30 rounded-2xl shadow-lg px-4 transition-colors duration-300">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-semibold transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items - Enhanced */}
        {filteredMenuItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <ShoppingCart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-xl font-semibold">No items available</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Check back later for delicious items!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredMenuItems.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-4 md:p-6 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {item.isVeg !== undefined && (
                            <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                              item.isVeg ? 'border-green-600' : 'border-red-600'
                            }`}>
                              <span className={`block w-2.5 h-2.5 rounded-full ${
                                item.isVeg ? 'bg-green-600' : 'bg-red-600'
                              }`}></span>
                            </div>
                          )}
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{item.price}
                        </span>
                        {item.discountPercentage > 0 && (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full">
                            {item.discountPercentage}% OFF
                          </span>
                        )}
                        {item.preparationTime && (
                          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            {item.preparationTime} mins
                          </span>
                        )}
                      </div>

                      {item.isAvailable ? (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          {/* Quantity Selector */}
                          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-2 md:px-3 py-2 shadow-inner">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-base md:text-lg w-6 md:w-8 text-center text-gray-900 dark:text-white">
                              {quantities[item._id] || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors p-1"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={(e) => handleAddToCart(item, e)}
                            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold flex items-center space-x-2 hover:from-red-700 hover:to-orange-700 transform hover:scale-105 transition-all shadow-lg text-sm md:text-base active:scale-95"
                          >
                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      ) : (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold px-3 md:px-4 py-2 rounded-xl text-sm md:text-base">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item Image */}
                  {item.images?.[0] ? (
                    <img
                      src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                      alt={item.name}
                      className="w-full sm:w-32 md:w-40 h-32 md:h-40 object-cover rounded-2xl flex-shrink-0 shadow-lg"
                    />
                  ) : (
                    <div className="w-full sm:w-32 md:w-40 h-32 md:h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
                      <Leaf className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {restaurant && (
        <div className="mt-12">
          <ReviewList restaurantId={id} />
        </div>
      )}

      {/* Floating Cart Button - Enhanced */}
      {items.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => navigate('/cart')}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-5 rounded-2xl shadow-2xl hover:from-red-700 hover:to-orange-700 flex items-center space-x-3 transform hover:scale-110 transition-all animate-pulse"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            </div>
            <span className="font-bold text-lg">
              View Cart
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;
