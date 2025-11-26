import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Package, DollarSign, TrendingUp, Activity, Clock, CheckCircle, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    pendingApprovals: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data || {});
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      subtitle: 'Registered users',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Restaurants',
      value: stats.totalRestaurants || 0,
      subtitle: `${stats.pendingApprovals || 0} pending approval`,
      icon: Store,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      subtitle: 'All time',
      icon: Package,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toFixed(0)}`,
      subtitle: 'Platform earnings',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-x-hidden w-full">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-full">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Monitor and manage your food delivery platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 card-hover animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    {stat.subtitle.includes('₹') && <TrendingUp className="w-3 h-3 mr-1" />}
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </div>
              <div className={`h-1 rounded-full bg-gradient-to-r ${stat.color}`}></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'User Management', desc: 'Manage users, approve vendors, and handle user-related tasks', icon: Users, color: 'from-blue-500 to-blue-600', path: '/admin/users' },
            { title: 'Restaurant Approvals', desc: 'Review and approve restaurant registration requests', icon: Store, color: 'from-purple-500 to-purple-600', path: '/admin/restaurants' },
            { title: 'Order Monitoring', desc: 'Monitor all orders and resolve issues', icon: Package, color: 'from-green-500 to-green-600', path: '/admin/orders' },
            { title: 'Promo Codes', desc: 'Create and manage promotional codes and discounts', icon: Tag, color: 'from-pink-500 to-rose-600', path: '/admin/promo-codes' }
          ].map((action, index) => (
            <div
              key={action.title}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 animate-slide-in-right"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`inline-block p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{action.title}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {action.desc}
              </p>
              <button
                onClick={() => navigate(action.path)}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transform hover:scale-105 transition-all shadow-md"
              >
                Access Now
              </button>
            </div>
          ))}
        </div>

        {/* Platform Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-red-600" />
            Platform Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Activity Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Active Users</h3>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-4xl font-bold text-blue-600 mb-2">{stats.activeDrivers || 0}</p>
              <p className="text-sm text-gray-600">Drivers online now</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Pending Tasks</h3>
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-green-600 mb-2">{stats.pendingApprovals || 0}</p>
              <p className="text-sm text-gray-600">Awaiting approval</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Success Rate</h3>
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-4xl font-bold text-purple-600 mb-2">98%</p>
              <p className="text-sm text-gray-600">Order completion</p>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Platform Performance</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Performance charts coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
