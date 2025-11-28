import { useState } from 'react';
import { X, Star, Camera, ThumbsUp, Utensils, Bike } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewAPI } from '../services/api';

const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  const [ratings, setRatings] = useState({
    food: 0,
    delivery: 0,
    overall: 0
  });
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState({
    food: 0,
    delivery: 0,
    overall: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Quick feedback tags like Swiggy
  const foodTags = [
    'Tasty', 'Fresh', 'Good Quantity', 'Worth the Price', 'Well Packed', 'Hot & Fresh'
  ];
  const deliveryTags = [
    'On Time', 'Polite', 'Followed Instructions', 'Safe Delivery', 'Quick'
  ];

  if (!isOpen || !order) return null;

  const handleRatingClick = (type, value) => {
    setRatings(prev => ({
      ...prev,
      [type]: value,
      overall: type === 'food' ? Math.round((value + (prev.delivery || value)) / 2) : Math.round((prev.food + value) / 2)
    }));
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ratings.food === 0) {
      toast.error('Please rate the food quality');
      return;
    }

    setIsSubmitting(true);

    try {
      // Include tags in comment
      const fullComment = selectedTags.length > 0
        ? `${comment}\n\nTags: ${selectedTags.join(', ')}`
        : comment;

      await reviewAPI.createReview({
        orderId: order._id,
        ratings: {
          food: ratings.food,
          delivery: ratings.delivery || ratings.food,
          overall: ratings.overall || ratings.food
        },
        comment: fullComment,
        images: []
      });

      toast.success('Review submitted successfully!');
      onReviewSubmitted?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return 'Tap to rate';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent!';
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    if (rating >= 2) return 'text-orange-500';
    if (rating >= 1) return 'text-red-500';
    return 'text-gray-400 dark:text-gray-500';
  };

  const renderStars = (type, value, hoveredValue) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        type="button"
        key={star}
        className="p-1 transition-transform hover:scale-110 focus:outline-none"
        onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [type]: star }))}
        onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [type]: 0 }))}
        onClick={() => handleRatingClick(type, star)}
      >
        <Star
          className={`w-10 h-10 transition-all ${
            star <= (hoveredValue || value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up-bounce">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-white">
            <h2 className="text-2xl font-bold">How was your order?</h2>
            <p className="text-white/80 text-sm mt-1">
              {order.restaurantId?.name} • Order #{order.orderNumber}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Food Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Utensils className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Food Quality</h3>
            </div>
            <div className="flex justify-center gap-1">
              {renderStars('food', ratings.food, hoveredRating.food)}
            </div>
            <p className={`text-sm mt-2 font-medium ${getRatingColor(ratings.food)}`}>
              {getRatingLabel(ratings.food)}
            </p>
          </div>

          {/* Food Tags - Show if food rated */}
          {ratings.food > 0 && (
            <div className="animate-fade-in">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">What did you like?</p>
              <div className="flex flex-wrap gap-2">
                {foodTags.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Rating */}
          <div className="text-center pt-4 border-t dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Bike className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Experience</h3>
            </div>
            <div className="flex justify-center gap-1">
              {renderStars('delivery', ratings.delivery, hoveredRating.delivery)}
            </div>
            <p className={`text-sm mt-2 font-medium ${getRatingColor(ratings.delivery)}`}>
              {getRatingLabel(ratings.delivery)}
            </p>
          </div>

          {/* Delivery Tags - Show if delivery rated */}
          {ratings.delivery > 0 && (
            <div className="animate-fade-in">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">How was the delivery?</p>
              <div className="flex flex-wrap gap-2">
                {deliveryTags.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="pt-4 border-t dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Write a detailed review (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Add Photo - Optional */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-orange-500 transition-colors cursor-pointer group">
            <Camera className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-500 transition-colors">
              Add photos (coming soon)
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || ratings.food === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              ratings.food > 0
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-[1.02]'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <ThumbsUp className="w-5 h-5" />
                Submit Review
              </>
            )}
          </button>

          {/* Skip Option */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
          >
            Maybe Later
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
