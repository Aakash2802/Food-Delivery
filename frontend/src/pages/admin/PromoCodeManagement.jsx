import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, Calendar, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const PromoCodeManagement = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'fixed',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: {
      total: '',
      perUser: 1
    },
    applicableFor: 'all',
    isActive: true
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPromos();
      setPromos(response.data || []);
    } catch (error) {
      toast.error('Failed to load promo codes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up data based on type
      const submitData = { ...formData };

      // If type is 'fixed', remove maxDiscount field
      if (submitData.type === 'fixed') {
        delete submitData.maxDiscount;
      }

      if (editingPromo) {
        await adminAPI.updatePromo(editingPromo._id, submitData);
        toast.success('Promo code updated successfully');
      } else {
        await adminAPI.createPromo(submitData);
        toast.success('Promo code created successfully');
      }
      fetchPromos();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save promo code');
    }
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) {
      return;
    }
    try {
      await adminAPI.deletePromo(promoId);
      toast.success('Promo code deleted successfully');
      fetchPromos();
    } catch (error) {
      toast.error('Failed to delete promo code');
    }
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description,
      type: promo.type,
      value: promo.value,
      minOrderValue: promo.minOrderValue,
      maxDiscount: promo.maxDiscount || '',
      validFrom: promo.validFrom?.split('T')[0] || '',
      validUntil: promo.validUntil?.split('T')[0] || '',
      usageLimit: promo.usageLimit,
      applicableFor: promo.applicableFor,
      isActive: promo.isActive
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
    setFormData({
      code: '',
      description: '',
      type: 'fixed',
      value: '',
      minOrderValue: '',
      maxDiscount: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      usageLimit: {
        total: '',
        perUser: 1
      },
      applicableFor: 'all',
      isActive: true
    });
  };

  const getTypeColor = (type) => {
    return type === 'percentage' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800';
  };

  const isExpired = (validUntil) => {
    return new Date(validUntil) < new Date();
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promo Code Management</h1>
            <p className="text-gray-600 mt-1">Create and manage discount promo codes</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Promo Code</span>
          </button>
        </div>

        {/* Promo Codes List */}
        {promos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No promo codes found</p>
            <p className="text-gray-400 mt-2">Create your first promo code to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
              <div
                key={promo._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{promo.code}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getTypeColor(promo.type)}`}>
                      {promo.type === 'percentage' ? `${promo.value}% OFF` : `₹${promo.value} OFF`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">{promo.description}</p>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Tag className="w-4 h-4 mr-2" />
                    <span>Min Order: ₹{promo.minOrderValue}</span>
                  </div>
                  {promo.maxDiscount && (
                    <div className="flex items-center text-gray-700">
                      <Tag className="w-4 h-4 mr-2" />
                      <span>Max Discount: ₹{promo.maxDiscount}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      Valid till: {new Date(promo.validUntil).toLocaleDateString()}
                      {isExpired(promo.validUntil) && (
                        <span className="text-red-600 ml-2">(Expired)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      Used: {promo.usageCount || 0} / {promo.usageLimit?.total || 'Unlimited'}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {promo.applicableFor === 'all' ? 'All Users' : promo.applicableFor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="input"
                    placeholder="SAVE50"
                    disabled={!!editingPromo}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input"
                    placeholder={formData.type === 'percentage' ? '20' : '100'}
                  />
                </div>

                {/* Min Order Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="input"
                    placeholder="200"
                  />
                </div>

                {/* Max Discount (for percentage) */}
                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Discount Amount
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className="input"
                      placeholder="500"
                    />
                  </div>
                )}

                {/* Valid From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="input"
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="input"
                  />
                </div>

                {/* Total Usage Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit.total}
                    onChange={(e) => setFormData({
                      ...formData,
                      usageLimit: { ...formData.usageLimit, total: e.target.value }
                    })}
                    className="input"
                    placeholder="1000"
                  />
                </div>

                {/* Per User Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per User Limit *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usageLimit.perUser}
                    onChange={(e) => setFormData({
                      ...formData,
                      usageLimit: { ...formData.usageLimit, perUser: e.target.value }
                    })}
                    className="input"
                    placeholder="3"
                  />
                </div>

                {/* Applicable For */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicable For *
                  </label>
                  <select
                    required
                    value={formData.applicableFor}
                    onChange={(e) => setFormData({ ...formData, applicableFor: e.target.value })}
                    className="input"
                  >
                    <option value="all">All Users</option>
                    <option value="new_users">New Users Only</option>
                    <option value="specific_restaurants">Specific Restaurants</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    placeholder="Get ₹50 off on orders above ₹200"
                  />
                </div>

                {/* Is Active */}
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingPromo ? 'Update' : 'Create'} Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement;
