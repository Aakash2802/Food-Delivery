import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI, restaurantAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const VendorMenu = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'hidden'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVeg: true,
    isAvailable: true
  });

  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Fast Food', 'Chinese', 'Italian', 'Indian'];

  useEffect(() => {
    fetchRestaurant();
    fetchMenu();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const response = await restaurantAPI.getByVendor();
      if (response.data?.restaurant) {
        setRestaurant(response.data.restaurant);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getByVendor();
      if (response.data?.restaurant) {
        // For vendor menu management, fetch ALL items (available and hidden)
        // Pass isAvailable=false to disable the default filter
        const menuResponse = await menuAPI.getRestaurantMenu(response.data.restaurant._id, { isAvailable: 'false' });
        setMenuItems(menuResponse.data?.menuItems || []);
      }
    } catch (error) {
      toast.error('Failed to load menu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category: item.category,
        isVeg: item.isVeg !== false,
        isAvailable: item.isAvailable !== false
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories[0],
        isVeg: true,
        isAvailable: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isVeg: true,
      isAvailable: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!restaurant) {
      toast.error('Restaurant not found');
      return;
    }

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        restaurantId: restaurant._id
      };

      if (editingItem) {
        await menuAPI.update(editingItem._id, itemData);
        toast.success('Menu item updated successfully');
      } else {
        await menuAPI.create(itemData);
        toast.success('Menu item created successfully');
      }

      handleCloseModal();
      fetchMenu();
    } catch (error) {
      toast.error(error.message || 'Failed to save menu item');
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      await menuAPI.update(itemId, { isAvailable: !currentStatus });
      toast.success('Availability updated');
      fetchMenu();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await menuAPI.delete(itemId);
      toast.success('Menu item deleted');
      fetchMenu();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{restaurant?.name}</p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                availabilityFilter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                availabilityFilter === 'available'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Available ({menuItems.filter(item => item.isAvailable).length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('hidden')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                availabilityFilter === 'hidden'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Hidden ({menuItems.filter(item => !item.isAvailable).length})
            </button>
          </div>
        </div>

        {/* Menu Items Grid */}
        {menuItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No menu items yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary"
            >
              Add Your First Item
            </button>
          </div>
        ) : (() => {
          const filteredItems = menuItems.filter(item => {
            if (availabilityFilter === 'available') return item.isAvailable;
            if (availabilityFilter === 'hidden') return !item.isAvailable;
            return true; // 'all'
          });

          if (filteredItems.length === 0) {
            return (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <EyeOff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No hidden dishes</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">All your menu items are currently available to customers.</p>
                <button
                  onClick={() => setAvailabilityFilter('all')}
                  className="btn btn-secondary mt-4"
                >
                  View All Items
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
              <div
                key={item._id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
                  !item.isAvailable ? 'opacity-60' : ''
                }`}
              >
                {/* Item Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                  {item.images?.[0]?.url ? (
                    <img
                      src={item.images[0].url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🍽️</span>
                  )}
                </div>

                <div className="p-4">
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <span className={`w-3 h-3 rounded-full ${
                          item.isVeg ? 'bg-green-600' : 'bg-red-600'
                        }`}></span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{item.price}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                      className="flex-1 btn btn-secondary text-sm flex items-center justify-center space-x-1"
                    >
                      {item.isAvailable ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Show</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenModal(item)}
                      className="btn btn-secondary text-sm p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn bg-red-600 text-white hover:bg-red-700 text-sm p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          );
        })()}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vegetarian</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingItem ? 'Update' : 'Add'} Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMenu;
