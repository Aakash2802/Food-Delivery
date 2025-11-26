import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, DollarSign, TrendingUp, Clock, Eye, Settings, Activity, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI, orderAPI } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import socketService from '../../services/socket';
import Navbar from '../../components/Navbar';
import CreateRestaurantModal from '../../components/CreateRestaurantModal';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    avgRating: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRestaurant();
    fetchStats();
    setupSocketListeners();

    return () => {
      socketService.off('order:new');
      socketService.off('order:statusUpdated');
    };
  }, []);

  const fetchRestaurant = async () => {
    try {
      // Get vendor's restaurant
      const response = await restaurantAPI.getByVendor();
      if (response.data?.restaurant) {
        setRestaurant(response.data.restaurant);
        socketService.joinRestaurant(response.data.restaurant._id);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all orders
      const ordersResponse = await orderAPI.getAll();
      const orders = ordersResponse.data || [];

      // Calculate stats
      const today = new Date().setHours(0, 0, 0, 0);
      const todayOrders = orders.filter(
        order => new Date(order.createdAt).setHours(0, 0, 0, 0) === today
      );

      const pendingOrders = orders.filter(
        order => ['pending', 'confirmed', 'preparing'].includes(order.status)
      );

      const todayRevenue = todayOrders.reduce(
        (sum, order) => sum + (order.pricing?.total || 0),
        0
      );

      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        todayRevenue: todayRevenue,
        avgRating: restaurant?.rating?.average || 0
      });

      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('order:new', (order) => {
      toast.success(`New order #${order.orderNumber} received!`);
      fetchStats();
    });

    socketService.on('order:statusUpdated', () => {
      fetchStats();
    });
  };

  const handleToggleStatus = async () => {
    if (!restaurant) return;

    try {
      const response = await restaurantAPI.toggleVendorStatus();
      setRestaurant(response.data);
      toast.success(`Restaurant ${response.data.isOpen ? 'opened' : 'closed'} successfully`);
    } catch (error) {
      toast.error('Failed to update restaurant status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center animate-fade-in">
            <div className="bg-gradient-to-br from-red-100 to-orange-100 p-6 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Store className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No Restaurant Found
            </h2>
            <p className="text-gray-600 mb-8">
              You need to create a restaurant to start receiving orders
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transform hover:scale-105 transition-all shadow-lg"
            >
              Create Restaurant
            </button>
          </div>
        </div>

        <CreateRestaurantModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchRestaurant();
            fetchStats();
          }}
        />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: 'All time',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: () => navigate('/vendor/orders')
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      subtitle: 'Awaiting action',
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      action: () => navigate('/vendor/orders?status=pending')
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toFixed(0)}`,
      subtitle: 'Today',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      action: () => navigate('/vendor/orders')
    },
    {
      title: 'Average Rating',
      value: (restaurant.rating?.average || 0).toFixed(1),
      subtitle: `${restaurant.rating?.count || 0} reviews`,
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      action: () => navigate('/vendor/reviews')
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-x-hidden w-full">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-full">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Vendor Dashboard
              </h1>
              <p className="text-gray-600 flex items-center">
                <Store className="w-4 h-4 mr-2" />
                {restaurant.name}
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={handleToggleStatus}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
                  restaurant.isOpen
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                }`}
              >
                {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
              </button>

              <button
                onClick={() => navigate('/vendor/menu')}
                className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center space-x-2 shadow-md"
              >
                <Settings className="w-4 h-4" />
                <span>Manage Menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 card-hover animate-scale-in cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={stat.action}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    {stat.title === "Today's Revenue" && <TrendingUp className="w-3 h-3 mr-1" />}
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
              <div className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}></div>
            </div>
          ))}
        </div>

        {/* Restaurant Status Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-200 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Restaurant Status</h3>
                <p className="text-gray-600 text-sm">
                  Your restaurant is currently {restaurant.isOpen ? 'accepting' : 'not accepting'} orders
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="font-semibold text-sm">
                  {restaurant.isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="w-6 h-6 mr-2 text-red-600" />
              Recent Orders
            </h2>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-2 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
            >
              <span>View All</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here when customers place them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/vendor/orders`)}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-red-600 cursor-pointer transition-all hover:shadow-md animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.items?.length} items • {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Order Total
                    </p>
                    <p className="font-bold text-xl text-gray-900">
                      ₹{order.pricing?.total?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
