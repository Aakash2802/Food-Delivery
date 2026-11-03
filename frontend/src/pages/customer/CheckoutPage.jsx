import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Wallet, Loader, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI, restaurantAPI, addressAPI } from '../../services/api';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import Navbar from '../../components/Navbar';
import PromoCodeSelector from '../../components/PromoCodeSelector';
import { calculatePricing } from '../../utils/pricing';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, restaurant, clearCart, getTotal } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [scheduleOrder, setScheduleOrder] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  // Unpaid online order from a previous attempt - reused on retry so closing
  // the payment window doesn't leave a new unpaid order behind each time
  const [pendingOnlineOrderId, setPendingOnlineOrderId] = useState(null);
  const [minimumOrder, setMinimumOrder] = useState(restaurant?.minimumOrder || 0);
  const [restaurantDeliveryFee, setRestaurantDeliveryFee] = useState(restaurant?.deliveryFee || 0);

  // Fetch the restaurant's current minimum order and delivery fee
  // (carts saved earlier may not have them)
  useEffect(() => {
    if (!restaurant?._id) return;
    restaurantAPI.getById(restaurant._id)
      .then((res) => {
        const data = res.data?.restaurant || res.data || res;
        setMinimumOrder(data?.minimumOrder || 0);
        setRestaurantDeliveryFee(data?.deliveryFee || 0);
      })
      .catch(() => {});
  }, [restaurant?._id]);

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
      coordinates: [78.1198, 9.9252] // [longitude, latitude] - Madurai, same default as the rest of the app
    }
  });

  // Saved addresses live in /api/addresses (addressLine1/pincode); map them to the
  // shape the order API expects (street/zipCode via postalCode)
  const toCheckoutAddress = (a) => ({
    _id: a._id,
    id: a._id,
    label: a.label,
    isDefault: a.isDefault,
    street: [a.addressLine1, a.addressLine2].filter(Boolean).join(', '),
    city: a.city,
    state: a.state,
    postalCode: a.pincode,
    location: a.location
  });

  const saveNewAddress = async () => {
    const [longitude, latitude] = newAddress.location.coordinates;
    try {
      const res = await addressAPI.create({
        label: 'Home',
        fullName: user?.name,
        phone: user?.phone,
        addressLine1: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.postalCode,
        latitude,
        longitude,
        isDefault: addresses.length === 0
      });
      const saved = toCheckoutAddress(res.data?.address || res.data);
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddress(saved);
      setShowAddressForm(false);
      toast.success('Address saved');
      return saved;
    } catch (error) {
      // Still let the order go through with the typed address
      const local = { ...newAddress, id: Date.now().toString() };
      setAddresses((prev) => [...prev, local]);
      setSelectedAddress(local);
      setShowAddressForm(false);
      toast.error(error?.message || 'Could not save address; using it for this order only');
      return local;
    }
  };

  const subtotal = getTotal();
  const discount = appliedPromo?.discount || 0;
  // Same formula the backend charges (see utils/pricing.js)
  const { deliveryFee, taxes: gst, platformFee, total } =
    calculatePricing(subtotal, restaurantDeliveryFee, discount);
  // Minimum order applies to item subtotal (excludes delivery fee and GST)
  const amountToMinimum = minimumOrder - subtotal;
  const belowMinimum = amountToMinimum > 0;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

  }, [items, navigate]);

  // Load saved addresses (fall back to the ones embedded on the user profile)
  useEffect(() => {
    if (!user) return;
    addressAPI.getAll()
      .then((res) => (res.data || []).map(toCheckoutAddress))
      .catch(() => [])
      .then((saved) => {
        const list = saved.length
          ? saved
          : (user.addresses || []).map((a) => ({ ...a, id: a._id, postalCode: a.zipCode }));
        setAddresses(list);
        setSelectedAddress(list.find((a) => a.isDefault) || list[0] || null);
        setShowAddressForm(list.length === 0);
      });
  }, [user?._id]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    await saveNewAddress();
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
      addressToUse = await saveNewAddress();
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

      let order;
      if (paymentMethod === 'razorpay' && pendingOnlineOrderId) {
        order = { _id: pendingOnlineOrderId };
      } else {
        const orderResponse = await orderAPI.create(orderData);
        order = orderResponse.data?.order || orderResponse.data;

        if (!order || !order._id) {
          throw new Error('Order was created but order ID is missing from response');
        }
        if (paymentMethod === 'razorpay') setPendingOnlineOrderId(order._id);
      }

      const finishPaidOrder = () => {
        toast.success('Payment successful!');
        setPendingOnlineOrderId(null);
        clearCart();
        navigate(`/order/${order._id}`);
      };

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
        const paymentData = await paymentAPI.createOrder({ orderId: order._id });
        const razorpayOrder = paymentData.data.paymentOrder;

        // Backend running with USE_MOCK_PAYMENT=true: no real gateway to open
        if (razorpayOrder.isMock) {
          const result = await paymentAPI.verify({
            orderId: order._id,
            razorpay_order_id: razorpayOrder.id,
            razorpay_payment_id: `mock_pay_${Date.now()}`
          });
          if (result.success) finishPaidOrder();
          return;
        }

        const res = await loadRazorpay();
        if (!res) {
          toast.error('Razorpay SDK failed to load');
          return;
        }

        const options = {
          key: razorpayOrder.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
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
              if (result.success) finishPaidOrder();
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
          },
          modal: {
            ondismiss: () => toast('Payment cancelled. You can try again - your order is saved.')
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', (response) => {
          toast.error(response.error?.description || 'Payment failed. Please try again.');
        });
        paymentObject.open();
      }

    } catch (error) {
      console.error('Order creation error:', error);
      console.error('Error response:', error.response?.data);

      const errorMessage = error?.message || error.message || 'Failed to place order';
      const validationErrors = error?.errors;

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
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
                    <span>GST (9%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Platform Fee</span>
                    <span>₹{platformFee.toFixed(2)}</span>
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

                {belowMinimum && (
                  <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3">
                    Add ₹{amountToMinimum.toFixed(2)} more to place this order.
                    Minimum order is ₹{minimumOrder} (item subtotal, excluding delivery fee and GST).
                  </p>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || belowMinimum}
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
