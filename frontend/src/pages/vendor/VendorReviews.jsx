import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, TrendingUp, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewAPI, restaurantAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const VendorReviews = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchReviews();
    }
  }, [restaurant, page, sortBy]);

  const fetchRestaurant = async () => {
    try {
      const response = await restaurantAPI.getByVendor();
      if (response.data?.restaurant) {
        setRestaurant(response.data.restaurant);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      toast.error('Failed to load restaurant');
    }
  };

  const fetchReviews = async () => {
    if (!restaurant) return;

    try {
      setLoading(true);
      const response = await reviewAPI.getRestaurantReviews(restaurant._id, {
        page,
        limit: 10,
        sort: sortBy
      });
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToReview = async (reviewId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await reviewAPI.respondToReview(reviewId, { comment: responseText });
      toast.success('Response posted successfully');
      setRespondingTo(null);
      setResponseText('');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to post response');
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
        <span className="text-sm font-medium text-gray-600 w-20">
          {stars} Star{stars !== 1 && 's'}
        </span>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-12 text-right font-semibold">{count}</span>
      </div>
    );
  };

  if (loading && !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Restaurant Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You need to create a restaurant first
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Customer Reviews
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and respond to customer feedback for {restaurant.name}
          </p>
        </div>

        {/* Rating Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Rating Overview
          </h2>

          {stats ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-8 border-2 border-yellow-200 dark:border-yellow-800">
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-3">
                  {stats.avgOverall?.toFixed(1) || '0.0'}
                </div>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 ${
                        star <= Math.round(stats.avgOverall || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
                  {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Rating Distribution</h3>
                {renderRatingBar(5, stats.fiveStars || 0, stats.totalReviews)}
                {renderRatingBar(4, stats.fourStars || 0, stats.totalReviews)}
                {renderRatingBar(3, stats.threeStars || 0, stats.totalReviews)}
                {renderRatingBar(2, stats.twoStars || 0, stats.totalReviews)}
                {renderRatingBar(1, stats.oneStar || 0, stats.totalReviews)}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No reviews yet</p>
            </div>
          )}

          {/* Additional Stats */}
          {stats && stats.avgFood && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Food Quality</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.avgFood?.toFixed(1)}
                    </span>
                    {renderStars(Math.round(stats.avgFood))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Delivery Service</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.avgDelivery?.toFixed(1) || 'N/A'}
                    </span>
                    {stats.avgDelivery && renderStars(Math.round(stats.avgDelivery))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Helpful Reviews</p>
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="w-8 h-8 text-green-600" />
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {reviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sort by:</span>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Most Recent', value: '-createdAt' },
                { label: 'Highest Rated', value: '-ratings.overall' },
                { label: 'Lowest Rated', value: 'ratings.overall' },
                { label: 'Most Helpful', value: '-helpfulCount' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                    sortBy === option.value
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">No reviews yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Reviews from customers will appear here
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {review.customerId?.profilePicture ? (
                      <img
                        src={review.customerId.profilePicture}
                        alt={review.customerId.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                        {review.customerId?.name || 'Anonymous Customer'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {review.ratings.overall}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ratings Breakdown */}
                <div className="flex flex-wrap gap-6 mb-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Food Quality</span>
                    {renderStars(review.ratings.food)}
                  </div>
                  {review.ratings.delivery > 0 && (
                    <div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Delivery</span>
                      {renderStars(review.ratings.delivery)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <ThumbsUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {review.helpfulCount || 0} found helpful
                    </span>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <div className="mb-4">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 mb-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="w-28 h-28 rounded-lg object-cover shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                      />
                    ))}
                  </div>
                )}

                {/* Restaurant Response */}
                {review.restaurantResponse?.comment ? (
                  <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-l-4 border-purple-500">
                    <p className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Your Response
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {review.restaurantResponse.comment}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.restaurantResponse.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {respondingTo === review._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your response..."
                          className="input w-full min-h-[100px] resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespondToReview(review._id)}
                            className="btn btn-primary"
                          >
                            Post Response
                          </button>
                          <button
                            onClick={() => {
                              setRespondingTo(null);
                              setResponseText('');
                            }}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingTo(review._id)}
                        className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Respond to Review</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {reviews.length > 0 && (
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              Previous
            </button>
            <span className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold bg-white dark:bg-gray-800 rounded-xl shadow-md">
              Page {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={reviews.length < 10}
              className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorReviews;
