import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';
import { reviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const ReviewList = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, page, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getRestaurantReviews(restaurantId, {
        page,
        limit: 10,
        sort: sortBy
      });
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewAPI.markHelpful(reviewId);
      toast.success('Thank you for your feedback!');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to mark review as helpful');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 w-16">
          {stars} Star{stars !== 1 && 's'}
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          {/* Overall Rating */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {stats.avgOverall?.toFixed(1) || '0.0'}
            </div>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(stats.avgOverall || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {renderRatingBar(5, stats.fiveStars || 0, stats.totalReviews)}
            {renderRatingBar(4, stats.fourStars || 0, stats.totalReviews)}
            {renderRatingBar(3, stats.threeStars || 0, stats.totalReviews)}
            {renderRatingBar(2, stats.twoStars || 0, stats.totalReviews)}
            {renderRatingBar(1, stats.oneStar || 0, stats.totalReviews)}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-semibold text-gray-700">Sort by:</span>
        <div className="flex gap-2">
          {[
            { label: 'Most Recent', value: '-createdAt' },
            { label: 'Highest Rated', value: '-ratings.overall' },
            { label: 'Most Helpful', value: '-helpfulCount' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Be the first to review this restaurant!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {review.customerId?.profilePicture ? (
                    <img
                      src={review.customerId.profilePicture}
                      alt={review.customerId.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.customerId?.name || 'Anonymous'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div className="flex flex-wrap gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Food:</span>
                  {renderStars(review.ratings.food)}
                </div>
                {review.ratings.delivery > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Delivery:</span>
                    {renderStars(review.ratings.delivery)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Overall:</span>
                  {renderStars(review.ratings.overall)}
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {review.comment}
                </p>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <button
                onClick={() => handleMarkHelpful(review._id)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>
                  Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                </span>
              </button>

              {/* Restaurant Response */}
              {review.restaurantResponse?.comment && (
                <div className="mt-4 ml-8 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Response from Restaurant
                  </p>
                  <p className="text-sm text-gray-700">
                    {review.restaurantResponse.comment}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.restaurantResponse.respondedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {reviews.length > 0 && (
        <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700 font-medium">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
