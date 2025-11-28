import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, XCircle, Clock, MapPin, Phone, Mail, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const RestaurantApprovals = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchRestaurants();
  }, [filter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllRestaurants();
      let filteredData = response.data || [];

      // Apply filter
      if (filter === 'pending') {
        filteredData = filteredData.filter(r => !r.isApproved && r.status !== 'rejected');
      } else if (filter === 'approved') {
        filteredData = filteredData.filter(r => r.isApproved);
      } else if (filter === 'rejected') {
        filteredData = filteredData.filter(r => r.status === 'rejected');
      }

      setRestaurants(filteredData);
    } catch (error) {
      toast.error('Failed to load restaurants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (restaurantId) => {
    try {
      await adminAPI.approveRestaurant(restaurantId);
      toast.success('Restaurant approved successfully');
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to approve restaurant');
      console.error(error);
    }
  };

  const handleReject = async (restaurantId) => {
    try {
      await adminAPI.rejectRestaurant(restaurantId);
      toast.success('Restaurant rejected');
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to reject restaurant');
      console.error(error);
    }
  };

  const getStatusBadge = (restaurant) => {
    if (restaurant.isApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    } else if (restaurant.status === 'rejected') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Restaurant Approvals
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <Store className="w-4 h-4 mr-2" />
                Review and approve restaurant registration requests
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-4 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-md">
            {[
              { label: 'Pending', value: 'pending', icon: Clock },
              { label: 'Approved', value: 'approved', icon: CheckCircle },
              { label: 'Rejected', value: 'rejected', icon: XCircle },
              { label: 'All', value: 'all', icon: Store }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  filter === tab.value
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant List */}
        {restaurants.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-16 text-center animate-fade-in">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Store className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No {filter !== 'all' ? filter : ''} restaurants found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'pending' && 'There are no pending restaurant approvals at the moment.'}
              {filter === 'approved' && 'No approved restaurants yet.'}
              {filter === 'rejected' && 'No rejected restaurants.'}
              {filter === 'all' && 'No restaurants in the system yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {restaurants.map((restaurant, index) => (
              <div
                key={restaurant._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  {/* Restaurant Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {restaurant.images?.[0] ? (
                          <img
                            src={restaurant.images[0]}
                            alt={restaurant.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center">
                            <Store className="w-10 h-10 text-red-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{restaurant.description}</p>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(restaurant)}
                            {restaurant.isOpen && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Open
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 mr-2 text-red-600" />
                          {restaurant.contactNumber}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4 mr-2 text-red-600" />
                          {restaurant.email}
                        </div>
                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 text-red-600 mt-0.5" />
                          <span>{restaurant.address?.street}, {restaurant.address?.city}, {restaurant.address?.state} - {restaurant.address?.zipCode}</span>
                        </div>
                      </div>

                      {/* Restaurant Details */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Star className="w-4 h-4 mr-2 text-yellow-500" />
                          Rating: {restaurant.rating?.average?.toFixed(1) || 'N/A'} ({restaurant.rating?.count || 0} reviews)
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong className="text-gray-900 dark:text-white">Cuisine:</strong> {restaurant.cuisineType?.join(', ') || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong className="text-gray-900 dark:text-white">Delivery Time:</strong> {restaurant.deliveryTime?.min || 0} - {restaurant.deliveryTime?.max || 0} mins
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <strong className="text-gray-900 dark:text-white">Min Order:</strong> ₹{restaurant.minimumOrder || 0}
                        </div>
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Owner Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <strong className="text-gray-900 dark:text-white">Name:</strong> {restaurant.ownerId?.name || 'N/A'}
                        </div>
                        <div>
                          <strong className="text-gray-900 dark:text-white">Email:</strong> {restaurant.ownerId?.email || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Registered: {new Date(restaurant.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!restaurant.isApproved && restaurant.status !== 'rejected' && (
                    <div className="lg:ml-6 mt-4 lg:mt-0 flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4">
                      <button
                        onClick={() => handleApprove(restaurant._id)}
                        className="flex-1 lg:w-40 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(restaurant._id)}
                        className="flex-1 lg:w-40 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantApprovals;
