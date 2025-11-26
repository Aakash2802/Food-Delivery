import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigation, Phone, CheckCircle, Package, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { driverAPI, orderAPI } from '../../services/api';
import socketService from '../../services/socket';
import Navbar from '../../components/Navbar';

const DriverOrders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(location.state?.filter || 'active');

  const filterOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'all', label: 'All Orders' }
  ];

  useEffect(() => {
    fetchOrders();
    setupSocketListeners();

    return () => {
      socketService.off('order:assigned');
      socketService.off('order:statusUpdated');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await driverAPI.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('order:assigned', (order) => {
      toast.success(`New delivery assigned! Order #${order.orderNumber}`);
      fetchOrders();
    });

    socketService.on('order:statusUpdated', () => {
      fetchOrders();
    });
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await driverAPI.acceptOrder(orderId);
      toast.success('Order accepted!');
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to accept order');
    }
  };

  const handlePickup = async (orderId) => {
    try {
      await driverAPI.updateOrderStatus(orderId, { status: 'picked' });
      toast.success('Order picked up!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleStartDelivery = async (orderId) => {
    try {
      await driverAPI.updateOrderStatus(orderId, { status: 'en_route' });
      toast.success('Started delivery!');
      fetchOrders();

      // Start location updates
      if ('geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            socketService.updateDriverLocation(latitude, longitude, orderId);
          },
          (error) => console.error('Location error:', error),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCompleteDelivery = async (orderId) => {
    if (!window.confirm('Confirm delivery completion?')) {
      return;
    }

    try {
      await driverAPI.updateOrderStatus(orderId, { status: 'delivered' });
      toast.success('Delivery completed!');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to complete delivery');
    }
  };

  const handleNavigate = (address) => {
    if (!address) return;

    // Handle GeoJSON format: location.coordinates = [longitude, latitude]
    let lat, lng;
    if (address.location?.coordinates) {
      // GeoJSON format: [longitude, latitude]
      lng = address.location.coordinates[0];
      lat = address.location.coordinates[1];
    } else if (address.latitude && address.longitude) {
      // Direct format
      lat = address.latitude;
      lng = address.longitude;
    } else {
      toast.error('Location coordinates not available');
      return;
    }

    const destination = `${lat},${lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  const getFilteredOrders = () => {
    switch (filter) {
      case 'active':
        return orders.filter(order =>
          ['ready', 'assigned', 'picked', 'en_route'].includes(order.status)
        );
      case 'completed':
        return orders.filter(order => order.status === 'delivered');
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked':
      case 'en_route':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (order) => {
    switch (order.status) {
      case 'ready':
        return (
          <button
            onClick={() => handleAcceptOrder(order._id)}
            className="btn btn-primary w-full flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Accept Order</span>
          </button>
        );
      case 'assigned':
        return (
          <button
            onClick={() => handlePickup(order._id)}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Mark as Picked Up</span>
          </button>
        );

      case 'picked':
        return (
          <button
            onClick={() => handleStartDelivery(order._id)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Start Delivery</span>
          </button>
        );

      case 'en_route':
        return (
          <button
            onClick={() => handleCompleteDelivery(order._id)}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete Delivery</span>
          </button>
        );

      case 'delivered':
        return (
          <span className="text-green-600 font-semibold">Completed</span>
        );

      default:
        return null;
    }
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm p-6 overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Restaurant & Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Pickup Location */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <p className="font-semibold text-gray-900">Pickup</p>
                      </div>
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => handleNavigate(order.restaurantId?.address)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      {order.restaurantId?.name || 'Restaurant'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.restaurantId?.address?.street}
                      {order.restaurantId?.address?.area && `, ${order.restaurantId.address.area}`}
                      {order.restaurantId?.address?.city && `, ${order.restaurantId.address.city}`}
                    </p>
                    {order.restaurantId?.contactNumber && (
                      <a
                        href={`tel:${order.restaurantId.contactNumber}`}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 mt-2"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.restaurantId.contactNumber}</span>
                      </a>
                    )}
                  </div>

                  {/* Delivery Location */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-gray-900">Deliver To</p>
                      </div>
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => handleNavigate(order.deliveryAddress)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Navigation className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      {order.customerId?.name || 'Customer'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                    {order.customerId?.phone && (
                      <a
                        href={`tel:${order.customerId.phone}`}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center space-x-1 mt-2"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.customerId.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Order Items</p>
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <p key={index} className="text-sm text-gray-900">
                            {item.quantity}x {item.menuItemId?.name || item.name}
                          </p>
                        ))}
                      </div>
                    </div>
                    {order.distance > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Distance</p>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <p className="text-lg font-bold text-purple-600">
                            {order.distance.toFixed(1)} km
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{order.pricing?.total?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => handlePickup(order._id)}
                        className="btn btn-secondary flex items-center space-x-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>Mark Picked Up</span>
                      </button>
                    )}
                    {getActionButton(order)}
                  </div>
                </div>

                {/* Earnings */}
                {order.status === 'delivered' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Delivery Fee Earned: ₹{order.pricing?.deliveryFee?.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOrders;
