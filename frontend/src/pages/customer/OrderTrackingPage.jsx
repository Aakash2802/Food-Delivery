import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, CheckCircle, XCircle, Package, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import socketService from '../../services/socket';
import Navbar from '../../components/Navbar';
import ReviewModal from '../../components/ReviewModal';
import OrderTrackingMap from '../../components/OrderTrackingMap';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'preparing', label: 'Preparing', icon: Package },
    { key: 'ready_for_pickup', label: 'Ready', icon: Package },
    { key: 'picked_up', label: 'Picked Up', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchOrderDetails();
    setupSocketListeners();

    return () => {
      socketService.off('order:statusUpdated');
      socketService.off('driver:locationUpdated');
    };
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(id);
      console.log('📦 Order response:', response);

      // Handle different response structures
      const orderData = response.data?.order || response.data;
      console.log('📦 Extracted order data:', orderData);

      if (!orderData || !orderData.status) {
        throw new Error('Invalid order data received');
      }

      setOrder(orderData);

      // Track order via socket
      socketService.trackOrder(id);
    } catch (error) {
      toast.error('Failed to load order details');
      console.error('Order fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Order status updates
    socketService.on('order:statusUpdated', (data) => {
      if (data.orderId === id) {
        setOrder(prevOrder => ({
          ...prevOrder,
          status: data.status,
          statusHistory: data.statusHistory
        }));
        toast.success(`Order ${data.status.replace(/_/g, ' ')}`);
      }
    });

    // Driver location updates
    socketService.on('driver:locationUpdated', (data) => {
      if (data.orderId === id) {
        setDriverLocation(data.location);
      }
    });
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderAPI.cancel(id, { reason: 'Customer requested cancellation' });
      toast.success('Order cancelled successfully');
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const getEstimatedDeliveryTime = () => {
    if (!order) return 'Calculating...';

    const createdAt = new Date(order.createdAt);
    const estimatedMinutes = order.restaurantId?.deliveryTime?.max || 45;
    const estimatedTime = new Date(createdAt.getTime() + estimatedMinutes * 60000);

    return estimatedTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !order || !order.status) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();
  const canCancel = ['pending', 'confirmed'].includes(order.status || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-600 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="text-lg font-bold text-red-600">
                  {getEstimatedDeliveryTime()}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-4 py-2 rounded-full font-semibold ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {order.status?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
              </span>

              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Order Progress */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h2>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200">
                  <div
                    className="bg-red-600 transition-all duration-500"
                    style={{
                      height: `${(currentStep / (statusSteps.length - 1)) * 100}%`
                    }}
                  />
                </div>

                {/* Status Steps */}
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.key} className="relative flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                          isCompleted
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="ml-4">
                          <p className={`font-semibold ${
                            isCurrent ? 'text-red-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && order.status !== 'delivered' && (
                            <p className="text-sm text-gray-600 mt-1">
                              In progress...
                            </p>
                          )}
                          {step.key === 'delivered' && order.status === 'delivered' && (
                            <p className="text-sm text-green-600 mt-1">
                              Completed
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Live Map Tracking - Show for active deliveries */}
          {order.status !== 'cancelled' && order.status !== 'delivered' && order.driverId && (
            <div className="mb-6">
              <OrderTrackingMap order={order} />
            </div>
          )}

          {/* Restaurant & Driver Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Restaurant */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">Restaurant</h3>
              <p className="font-semibold text-lg">
                {order.restaurantId?.name || 'Restaurant'}
              </p>
              {order.restaurantId?.contactNumber && (
                <a
                  href={`tel:${order.restaurantId.contactNumber}`}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 mt-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{order.restaurantId.contactNumber}</span>
                </a>
              )}
            </div>

            {/* Driver */}
            {order.driverId && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3">Delivery Partner</h3>
                <p className="font-semibold text-lg">
                  {order.driverId?.name || 'Driver'}
                </p>
                {order.driverId?.phone && (
                  <a
                    href={`tel:${order.driverId.phone}`}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 mt-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{order.driverId.phone}</span>
                  </a>
                )}
                {driverLocation && (
                  <p className="text-sm text-gray-600 mt-2">
                    Location updated: {new Date().toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Delivery Address</span>
            </h3>
            <p className="text-gray-700">
              {order.deliveryAddress?.street}<br />
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.postalCode}
            </p>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>

            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.menuItemId?.name || item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{order.pricing?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>₹{order.pricing?.deliveryFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes (9% GST)</span>
                  <span>₹{order.pricing?.taxes?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Platform Fee</span>
                  <span>₹{order.pricing?.platformFee?.toFixed(2)}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.pricing?.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{order.pricing?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Order Button - Show only if delivered */}
          {order.status === 'delivered' && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                How was your experience?
              </h3>
              <p className="text-gray-600 mb-4">
                Share your feedback about the food quality and delivery service
              </p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Star className="w-5 h-5" />
                Rate This Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={order}
        onReviewSubmitted={() => {
          setShowReviewModal(false);
          toast.success('Thank you for your review!');
        }}
      />
    </div>
  );
};

export default OrderTrackingPage;
