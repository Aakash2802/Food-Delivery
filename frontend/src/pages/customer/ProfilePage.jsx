import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, Edit2, Save, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, orderAPI } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import Navbar from '../../components/Navbar';
import LoyaltyCard from '../../components/LoyaltyCard';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    fetchOrders();
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setEditing(false);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

          {/* Loyalty Card - Full Width */}
          {user?.role === 'customer' && (
            <div className="mb-6">
              <LoyaltyCard />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                </div>

                {!editing ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-gray-700">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{user?.email}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-700">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{user?.phone || 'Not provided'}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-700">
                        <Package className="w-5 h-5 text-gray-400" />
                        <span className="text-sm">{orders.length} Total Orders</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditing(true)}
                      className="btn btn-primary w-full mt-6 flex items-center justify-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                  {orders.length > 5 && (
                    <button
                      onClick={() => navigate('/orders')}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                    <button
                      onClick={() => navigate('/')}
                      className="btn btn-primary mt-4"
                    >
                      Start Ordering
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order._id}
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-red-600 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-900">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.restaurantId?.name || 'Restaurant'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
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
                          <p className="text-sm text-gray-600">
                            {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                          </p>
                          <p className="font-bold text-gray-900">
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
