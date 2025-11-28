import { useState, useEffect } from 'react';
import { Package, Search, Clock, MapPin, Phone, User, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const OrderMonitoring = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
    // Set up polling to refresh orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const response = await adminAPI.getLiveOrders(params);
      setOrders(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      if (loading) {
        toast.error('Failed to load orders');
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-orange-100 text-orange-800';
      case 'assigned':
        return 'bg-indigo-100 text-indigo-800';
      case 'picked':
        return 'bg-cyan-100 text-cyan-800';
      case 'en_route':
        return 'bg-teal-100 text-teal-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Live Order Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor all active orders in real-time</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="assigned">Assigned</option>
              <option value="picked">Picked</option>
              <option value="en_route">En Route</option>
            </select>

            {/* Clear Filter */}
            <button
              onClick={() => setStatusFilter('')}
              className="btn btn-secondary"
            >
              Clear Filter
            </button>

            {/* Auto-refresh indicator */}
            <div className="flex items-center justify-end text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1 animate-pulse" />
              Auto-refreshing every 10s
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No active orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {formatStatus(order.status)}
                  </span>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Restaurant Info */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Store className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Restaurant</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.restaurantId?.name || 'N/A'}</p>
                    {order.restaurantId?.contactNumber && (
                      <a
                        href={`tel:${order.restaurantId.contactNumber}`}
                        className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center mt-1"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {order.restaurantId.contactNumber}
                      </a>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Customer</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.customerId?.name || 'N/A'}</p>
                    {order.customerId?.phone && (
                      <a
                        href={`tel:${order.customerId.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center mt-1"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        {order.customerId.phone}
                      </a>
                    )}
                  </div>

                  {/* Driver Info */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <p className="font-semibold text-gray-900 dark:text-white">Driver</p>
                    </div>
                    {order.driverId ? (
                      <>
                        <p className="font-medium text-gray-900 dark:text-white">{order.driverId.name}</p>
                        {order.driverId.phone && (
                          <a
                            href={`tel:${order.driverId.phone}`}
                            className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center mt-1"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            {order.driverId.phone}
                          </a>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Not assigned yet</p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <p className="font-semibold text-gray-900 dark:text-white">Delivery Address</p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </p>
                </div>

                {/* Order Items */}
                <div className="border-t dark:border-gray-700 pt-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Order Items</p>
                  <div className="space-y-1">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.quantity}x {item.menuItemId?.name || item.name}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ₹{((item.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                      {order.paymentInfo?.method || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{order.pricing?.total?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Active</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Preparing</p>
            <p className="text-2xl font-bold text-purple-600">
              {orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">In Transit</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => ['picked', 'en_route'].includes(o.status)).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Awaiting Pickup</p>
            <p className="text-2xl font-bold text-orange-600">
              {orders.filter(o => ['ready', 'assigned'].includes(o.status)).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderMonitoring;
