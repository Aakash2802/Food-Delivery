import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, RotateCcw } from 'lucide-react';
import { orderAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import useCartStore from '../../store/useCartStore';
import { showToast } from '../../utils/toast';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { clearCart, addItem } = useCartStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = (e, order) => {
    e.stopPropagation(); // Prevent navigation to order details

    // Clear existing cart
    clearCart();

    // Create restaurant object from order
    const restaurant = {
      _id: order.restaurantId?._id || order.restaurantId,
      name: order.restaurantId?.name || 'Restaurant'
    };

    // Add each item from the order to cart
    order.items.forEach((item) => {
      const cartItem = {
        menuItemId: item.menuItemId?._id || item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        customizations: item.customizations || []
      };
      addItem(cartItem, restaurant);
    });

    showToast.success(`${order.items.length} items added to cart!`);
    navigate('/cart');
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/profile')}
              className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order History</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">View all your orders</p>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No orders yet</p>
                <button
                  onClick={() => navigate('/')}
                  className="btn btn-primary"
                >
                  Start Ordering
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-red-600 dark:hover:border-red-500 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.restaurantId?.name || 'Restaurant'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        ₹{order.pricing?.total?.toFixed(2)}
                      </p>
                    </div>

                    {/* Reorder Button - Show for delivered or cancelled orders */}
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <button
                        onClick={(e) => handleReorder(e, order)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reorder
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
