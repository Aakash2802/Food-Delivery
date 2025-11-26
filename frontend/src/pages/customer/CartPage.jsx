import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import Navbar from '../../components/Navbar';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    restaurant,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount
  } = useCartStore();

  const [promoCode, setPromoCode] = useState('');

  const subtotal = getTotal();
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + deliveryFee + gst;

  const handleQuantityChange = (index, change) => {
    const item = items[index];
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
      removeItem(index);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(index, newQuantity);
    }
  };

  const handleRemoveItem = (index) => {
    removeItem(index);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    navigate('/checkout');
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      toast.success('Promo code will be applied at checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add items from a restaurant to get started
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Cart</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Restaurant Info */}
              {restaurant && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <h3 className="font-bold text-lg text-gray-900">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
                  </p>
                </div>
              )}

              {/* Items List */}
              {items.map((item, index) => (
                <div
                  key={`${item.menuItemId}-${index}`}
                  className="bg-white rounded-lg shadow-sm p-4"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {item.name}
                          </h3>
                          {item.customizations && item.customizations.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.customizations.map(c => c.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{item.price * item.quantity}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3 bg-gray-100 rounded-lg px-3 py-2">
                          <button
                            onClick={() => handleQuantityChange(index, -1)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(index, 1)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Bill Details
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>GST (5%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="input flex-1"
                      placeholder="Enter code"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="btn btn-secondary"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You can apply promo codes at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
