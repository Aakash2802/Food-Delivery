import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Wallet, Loader, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '../../services/api';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import Navbar from '../../components/Navbar';
import PromoCodeSelector from '../../components/PromoCodeSelector';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, restaurant, clearCart, getTotal } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [scheduleOrder, setScheduleOrder] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Check for corrupted cart data on mount
  useEffect(() => {
    if (items.length > 0 && (!restaurant || !restaurant._id)) {
      toast.error('Your cart has invalid data. Clearing cart...');
      console.error('Corrupted cart data - restaurant:', restaurant, 'items:', items);
      clearCart();
      navigate('/');
    }
  }, []);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // [longitude, latitude]
    }
  });

  const subtotal = getTotal();
  const deliveryFee = 40;
  const discount = appliedPromo?.discount || 0;
  const gst = (subtotal - discount) * 0.05;
  const total = subtotal + deliveryFee + gst - discount;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Load user addresses
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      setSelectedAddress(user.addresses[0]);
    } else {
      setShowAddressForm(true);
    }
  }, [user, items, navigate]);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const address = { ...newAddress, id: Date.now().toString() };
    setAddresses([...addresses, address]);
    setSelectedAddress(address);
    setShowAddressForm(false);
    toast.success('Address added successfully');
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    let addressToUse = selectedAddress;

    // If address form is shown and filled, auto-save it first
    if (showAddressForm && newAddress.street && newAddress.city && newAddress.state && newAddress.postalCode) {
      const address = { ...newAddress, id: Date.now().toString() };
      setAddresses([...addresses, address]);
      setSelectedAddress(address);
      setShowAddressForm(false);
      addressToUse = address;
      toast.success('Address saved successfully');
    }

    if (!addressToUse && !(showAddressForm && newAddress.street)) {
      toast.error('Please fill in your delivery address');
      return;
    }

    // Validate scheduling if enabled
    if (scheduleOrder && (!scheduledDate || !scheduledTime)) {
      toast.error('Please select date and time for scheduled delivery');
      return;
    }

    setLoading(true);

    try {
      // Validate restaurant exists
      if (!restaurant || !restaurant._id) {
        toast.error('Restaurant information is missing. Please add items to cart first.');
        console.error('Restaurant object:', restaurant);
        setLoading(false);
        return;
      }

      console.log('Creating order for restaurant:', restaurant._id);
      console.log('Applied promo:', appliedPromo);

      // Create order
      const orderData = {
        restaurantId: restaurant._id,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations || []
        })),
        deliveryAddress: {
          street: addressToUse.street,
          city: addressToUse.city,
          state: addressToUse.state,
          zipCode: addressToUse.postalCode,
          location: addressToUse.location || {
            type: 'Point',
            coordinates: [78.1198, 9.9252] // Madurai coordinates [longitude, latitude]
          }
        },
        contactPhone: user?.phone || '+919876543210',
        paymentMethod: paymentMethod  // Send selected payment method directly
      };

      // Add promo code if applied
      if (appliedPromo?.code) {
        orderData.promoCode = appliedPromo.code;
      }

      // Add scheduled delivery time if enabled
      if (scheduleOrder && scheduledDate && scheduledTime) {
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        orderData.scheduledFor = scheduledDateTime.toISOString();
      }

      const orderResponse = await orderAPI.create(orderData);
      console.log('📦 Full order response:', orderResponse);
      console.log('📦 orderResponse.data:', orderResponse.data);

      const order = orderResponse.data?.order || orderResponse.data;
      console.log('📦 Extracted order:', order);
      console.log('📦 Order ID:', order?._id);

      if (!order || !order._id) {
        throw new Error('Order was created but order ID is missing from response');
      }

      if (paymentMethod === 'cod') {
        // Cash on Delivery - Order placed successfully
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order/${order._id}`);
        return;
      }

      // Online Payment
      if (paymentMethod === 'mock') {
        // Mock payment for testing
        const mockPayment = await paymentAPI.mock({ orderId: order._id });
        if (mockPayment.success) {
          toast.success('Payment successful! Order placed.');
          clearCart();
          navigate(`/order/${order._id}`);
        }
        return;
      }

      // Razorpay Integration
      if (paymentMethod === 'razorpay') {
        const res = await loadRazorpay();
        if (!res) {
          toast.error('Razorpay SDK failed to load');
          return;
        }

        const paymentData = await paymentAPI.createOrder({ orderId: order._id });
        const razorpayOrder = paymentData.data.paymentOrder;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Food Delivery',
          description: `Order #${razorpayOrder.orderNumber}`,
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              const verifyData = {
                orderId: order._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              };

              const result = await paymentAPI.verify(verifyData);
              if (result.success) {
                toast.success('Payment successful!');
                clearCart();
                navigate(`/order/${order._id}`);
              }
            } catch (error) {
              toast.error('Payment verification failed');
              console.error(error);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone
          },
          theme: {
            color: '#DC2626'
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }

    } catch (error) {
      console.error('Order creation error:', error);
      console.error('Error response:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order';
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        console.error('Validation errors:', validationErrors);
        toast.error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Delivery Address</span>
                  </h2>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      + Add New
                    </button>
                  )}
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="input"
                        required
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="input"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="input"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="btn btn-primary">
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved Addresses */}
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id || address._id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddress === address
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">
                        {address.street}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.postalCode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Delivery */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Schedule Delivery</span>
                  </h2>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleOrder}
                      onChange={(e) => setScheduleOrder(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {scheduleOrder && (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-gray-600 mb-4">
                      Schedule your order for a specific date and time
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Date Picker */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Select Date
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>

                      {/* Time Picker */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Select Time
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {scheduledDate && scheduledTime && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-green-800">
                          <strong>Scheduled for:</strong> {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <PromoCodeSelector
                orderValue={subtotal}
                restaurantId={restaurant?._id}
                onApplyPromo={setAppliedPromo}
                appliedPromo={appliedPromo}
              />

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Method</span>
                </h2>

                <div className="space-y-3">
                  <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer ${
                    paymentMethod === 'razorpay' ? 'border-red-600 bg-red-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <Wallet className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="font-medium">Razorpay (UPI, Cards, Wallets)</span>
                  </label>

                  <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer ${
                    paymentMethod === 'cod' ? 'border-red-600 bg-red-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                    <span className="font-medium">Cash on Delivery</span>
                  </label>

                  {import.meta.env.VITE_USE_MOCK_PAYMENT === 'true' && (
                    <label className={`flex items-center p-4 rounded-lg border-2 cursor-pointer ${
                      paymentMethod === 'mock' ? 'border-red-600 bg-red-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="mock"
                        checked={paymentMethod === 'mock'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">Mock Payment (Testing)</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({items.length} items)</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>

                  {appliedPromo && discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount ({appliedPromo.code})</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-700">
                    <span>GST (5%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    {appliedPromo && discount > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        You saved ₹{discount.toFixed(2)} with {appliedPromo.code}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Place Order</span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
