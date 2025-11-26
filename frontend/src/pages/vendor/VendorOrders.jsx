import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, restaurantAPI } from '../../services/api';
import socketService from '../../services/socket';
import Navbar from '../../components/Navbar';

const VendorOrders = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'assigned', label: 'Assigned to Driver' },
    { value: 'picked', label: 'Picked Up' },
    { value: 'en_route', label: 'On the Way' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchRestaurant();
    fetchOrders();
    setupSocketListeners();

    return () => {
      socketService.off('order:new');
      socketService.off('order:statusUpdated');
    };
  }, []);

  const fetchRestaurant = async () => {
    try {
      const response = await restaurantAPI.getByVendor();
      if (response.data) {
        setRestaurant(response.data);
        socketService.joinRestaurant(response.data._id);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('order:new', (order) => {
      toast.success(`New order #${order.orderNumber}!`, {
        duration: 5000,
        icon: '🔔'
      });
      setOrders(prevOrders => [order, ...prevOrders]);
    });

    socketService.on('order:statusUpdated', (data) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === data.orderId
            ? { ...order, status: data.status }
            : order
        )
      );
    });
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchOrders();
      setShowModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    await handleUpdateStatus(orderId, 'confirmed');
  };

  const handleRejectOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to reject this order?')) {
      await handleUpdateStatus(orderId, 'cancelled');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready'
    };
    return statusFlow[currentStatus];
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Customer</p>
                    <p className="font-medium text-gray-900">
                      {order.customerId?.name || order.contactPhone || 'Customer'}
                    </p>
                    {(order.customerId?.phone || order.contactPhone) && (
                      <p className="text-sm text-gray-600">
                        {order.customerId?.phone || order.contactPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                    <p className="font-medium text-gray-900">
                      {order.deliveryAddress?.street || order.deliveryAddress?.label || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.deliveryAddress?.city || order.deliveryAddress?.area || ''}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Items</p>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-900">
                          {item.quantity}x {item.menuItemId?.name || item.name}
                        </span>
                        <span className="font-medium text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{order.pricing?.total?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="btn btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>

                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          className="btn bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order._id)}
                          className="btn bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {['confirmed', 'preparing'].includes(order.status) && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status))}
                        className="btn btn-primary"
                      >
                        Mark as {getNextStatus(order.status)?.replace(/_/g, ' ')}
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button className="btn bg-green-600 text-white hover:bg-green-700">
                        <Clock className="w-4 h-4 mr-2" />
                        Waiting for Driver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Customer Details</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.customerId?.name || 'Customer'}
                </p>
                {selectedOrder.customerId?.email && (
                  <p className="text-sm text-gray-600">
                    {selectedOrder.customerId.email}
                  </p>
                )}
                {(selectedOrder.customerId?.phone || selectedOrder.contactPhone) && (
                  <p className="text-sm text-gray-600">
                    {selectedOrder.customerId?.phone || selectedOrder.contactPhone}
                  </p>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.menuItemId?.name || item.name}
                        </p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.pricing?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>₹{selectedOrder.pricing?.deliveryFee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span>₹{selectedOrder.pricing?.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{selectedOrder.pricing?.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Close
                </button>
                {getNextStatus(selectedOrder.status) && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder._id, getNextStatus(selectedOrder.status))}
                    className="btn btn-primary flex-1"
                  >
                    Mark as {getNextStatus(selectedOrder.status)?.replace(/_/g, ' ')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
