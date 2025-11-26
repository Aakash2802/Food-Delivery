import { useState } from 'react';
import { X, Star, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewAPI } from '../services/api';

const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  const [ratings, setRatings] = useState({
    food: 0,
    delivery: 0,
    overall: 0
  });
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [hoveredRating, setHoveredRating] = useState({
    food: 0,
    delivery: 0,
    overall: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleRatingClick = (type, value) => {
    setRatings(prev => ({
      ...prev,
      [type]: value,
      overall: type === 'food' ? value : prev.overall
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ratings.food === 0) {
      toast.error('Please rate the food quality');
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewAPI.createReview({
        orderId: order._id,
        ratings: {
          food: ratings.food,
          delivery: ratings.delivery || ratings.food,
          overall: ratings.overall || ratings.food
        },
        comment,
        images
      });

      toast.success('Review submitted successfully!');
      onReviewSubmitted?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (type, value, hoveredValue) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-8 h-8 cursor-pointer transition-all ${
          star <= (hoveredValue || value)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
        onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [type]: star }))}
        onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [type]: 0 }))}
        onClick={() => handleRatingClick(type, star)}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rate Your Experience</h2>
            <p className="text-sm text-gray-600 mt-1">
              Order #{order.orderNumber} from {order.restaurantId?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Food Rating */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Food Quality *
            </label>
            <div className="flex gap-2">
              {renderStars('food', ratings.food, hoveredRating.food)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {ratings.food === 0 && 'Rate the food quality'}
              {ratings.food === 1 && 'Poor'}
              {ratings.food === 2 && 'Fair'}
              {ratings.food === 3 && 'Good'}
              {ratings.food === 4 && 'Very Good'}
              {ratings.food === 5 && 'Excellent'}
            </p>
          </div>

          {/* Delivery Rating */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Delivery Experience
            </label>
            <div className="flex gap-2">
              {renderStars('delivery', ratings.delivery, hoveredRating.delivery)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {ratings.delivery === 0 && 'Rate the delivery service'}
              {ratings.delivery === 1 && 'Poor'}
              {ratings.delivery === 2 && 'Fair'}
              {ratings.delivery === 3 && 'Good'}
              {ratings.delivery === 4 && 'Very Good'}
              {ratings.delivery === 5 && 'Excellent'}
            </p>
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Overall Rating
            </label>
            <div className="flex gap-2">
              {renderStars('overall', ratings.overall, hoveredRating.overall)}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Write a Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this restaurant..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Add Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-500 transition-colors cursor-pointer">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">Click to upload food photos</p>
              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || ratings.food === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
