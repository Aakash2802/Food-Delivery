import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, DollarSign, Package, TrendingUp, MapPin, ToggleLeft, ToggleRight, Activity, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { driverAPI, orderAPI } from '../../services/api';
import socketService from '../../services/socket';
import useAuthStore from '../../store/useAuthStore';
import Navbar from '../../components/Navbar';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todayEarnings: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    totalDistance: 0
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAvailableOrders();
    setupSocketListeners();
    startLocationUpdates();

    return () => {
      socketService.off('order:assigned');
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await driverAPI.getStats();
      setStats({
        todayEarnings: response.data?.today?.todayEarnings || 0,
        completedDeliveries: response.data?.today?.todayDeliveries || 0,
        pendingDeliveries: response.data?.activeOrders || 0,
        totalDistance: response.data?.today?.todayDistance || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await driverAPI.getOrders();
      const orders = response.data || [];
      setAvailableOrders(orders.filter(order =>
        ['ready', 'assigned'].includes(order.status)
      ));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('order:assigned', (order) => {
      toast.success(`New delivery assigned! Order #${order.orderNumber}`, {
        duration: 5000
      });
      fetchAvailableOrders();
      fetchStats();
    });
  };

  const startLocationUpdates = () => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Update location via socket for active orders
          availableOrders.forEach(order => {
            if (['picked_up', 'out_for_delivery'].includes(order.status)) {
              socketService.updateDriverLocation(latitude, longitude, order._id);
            }
          });
        },
        (error) => {
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await driverAPI.toggleAvailability({ isAvailable: !isAvailable });
      setIsAvailable(!isAvailable);
      toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for deliveries`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_pickup':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Today's Earnings",
      value: `₹${stats.todayEarnings.toFixed(0)}`,
      subtitle: 'Today',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      action: () => navigate('/driver/orders', { state: { filter: 'completed' } })
    },
    {
      title: 'Completed',
      value: stats.completedDeliveries,
      subtitle: 'Deliveries today',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: () => navigate('/driver/orders', { state: { filter: 'completed' } })
    },
    {
      title: 'Active Orders',
      value: availableOrders.length,
      subtitle: 'In progress',
      icon: Car,
      color: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      action: () => navigate('/driver/orders', { state: { filter: 'active' } })
    },
    {
      title: 'Distance',
      value: `${stats.totalDistance.toFixed(1)} km`,
      subtitle: 'Today',
      icon: MapPin,
      color: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      action: () => navigate('/driver/orders', { state: { filter: 'all' } })
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-x-hidden w-full">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-full">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Driver Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <Car className="w-4 h-4 mr-2" />
                Welcome, {user?.name}
              </p>
            </div>

            {/* Availability Toggle */}
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg mt-4 md:mt-0 ${
                isAvailable
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
              }`}
            >
              {isAvailable ? (
                <>
                  <ToggleRight className="w-6 h-6" />
                  <span>🟢 Available</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-6 h-6" />
                  <span>⚫ Unavailable</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 card-hover animate-scale-in cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={stat.action}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    {stat.title === "Today's Earnings" && <TrendingUp className="w-3 h-3 mr-1" />}
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.iconBg} dark:bg-opacity-20 p-3 rounded-xl`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
              <div className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}></div>
            </div>
          ))}
        </div>

        {/* Status Banner */}
        <div className={`rounded-2xl p-6 mb-8 border animate-fade-in ${
          isAvailable
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
            : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                isAvailable
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/50 dark:to-emerald-800/50'
                  : 'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700'
              }`}>
                {isAvailable ? (
                  <Navigation className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Activity className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Driver Status</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  You are currently {isAvailable ? 'available' : 'unavailable'} for deliveries
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                isAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`}></div>
                <span className="font-semibold text-sm">
                  {isAvailable ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Package className="w-6 h-6 mr-2 text-red-600" />
              Available Orders
            </h2>
            <button
              onClick={() => navigate('/driver/orders')}
              className="text-red-600 hover:text-red-700 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
            >
              View All →
            </button>
          </div>

          {!isAvailable && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-5 mb-6 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-800/50 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-yellow-900 dark:text-yellow-200 font-semibold">
                  You are currently unavailable. Toggle availability to receive new orders.
                </p>
              </div>
            </div>
          )}

          {availableOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No orders available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {isAvailable
                  ? 'You will be notified when new orders are available'
                  : 'Turn on availability to receive orders'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableOrders.map((order, index) => (
                <div
                  key={order._id}
                  onClick={() => navigate('/driver/orders')}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-red-600 cursor-pointer transition-all hover:shadow-md animate-slide-in-right dark:bg-gray-700/50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {order.restaurantId?.name || 'Restaurant'}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Pickup
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.restaurantId?.address?.city || 'Restaurant'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 flex items-center">
                        <Navigation className="w-3 h-3 mr-1" />
                        Delivery
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.deliveryAddress?.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-600">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white">
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

export default DriverDashboard;
