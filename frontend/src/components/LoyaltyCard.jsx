import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Trophy, TrendingUp, Gift, ChevronRight } from 'lucide-react';
import { loyaltyAPI } from '../services/api';
import toast from 'react-hot-toast';

const LoyaltyCard = () => {
  const navigate = useNavigate();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await loyaltyAPI.getSummary();
      if (response.success) {
        setLoyaltyData(response.data);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'platinum':
        return 'from-gray-700 to-gray-900';
      case 'gold':
        return 'from-yellow-500 to-yellow-700';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      default:
        return 'from-orange-600 to-orange-800';
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'platinum':
        return 'bg-gray-800 text-white';
      case 'gold':
        return 'bg-yellow-500 text-gray-900';
      case 'silver':
        return 'bg-gray-400 text-gray-900';
      default:
        return 'bg-orange-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  const { loyalty, recentTransactions, config } = loyaltyData;
  const progressToNextTier = loyalty.nextTier
    ? ((loyalty.totalEarned - (loyalty.tier === 'bronze' ? 0 : loyalty.tier === 'silver' ? 500 : 2000)) / loyalty.pointsToNextTier) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Main Loyalty Card */}
      <div className={`bg-gradient-to-br ${getTierColor(loyalty.tier)} rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-24 translate-y-24"></div>
        </div>

        <div className="relative z-10">
          {/* Tier Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Loyalty Tier</p>
                <p className="text-2xl font-bold uppercase">{loyalty.tier}</p>
              </div>
            </div>
            <div className={`${getTierBadgeColor(loyalty.tier)} px-4 py-2 rounded-full font-bold text-sm`}>
              {loyalty.tierMultiplier}x Rewards
            </div>
          </div>

          {/* Coins Balance */}
          <div className="mb-6">
            <div className="flex items-baseline space-x-2 mb-2">
              <Coins className="w-6 h-6 text-yellow-300" />
              <span className="text-5xl font-black">{loyalty.balance}</span>
              <span className="text-xl opacity-75">Coins</span>
            </div>
            <p className="text-sm opacity-90">
              Worth ₹{loyalty.balance * loyalty.coinValue} in discounts
            </p>
          </div>

          {/* Progress to Next Tier */}
          {loyalty.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Progress to {loyalty.nextTier}</span>
                <span className="font-semibold">{loyalty.pointsToNextTier} coins away</span>
              </div>
              <div className="h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{loyalty.totalEarned}</p>
          <p className="text-xs text-gray-500 mt-1">Since you joined</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total Redeemed</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{loyalty.totalRedeemed}</p>
          <p className="text-xs text-gray-500 mt-1">Saved ₹{loyalty.totalRedeemed}</p>
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-yellow-500" />
          How to Earn Coins
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Order above ₹{config.minOrderForCoins}</span>
            <span className="font-semibold text-green-600">{(config.earnRate * 100).toFixed(0)}% cashback</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Your tier multiplier</span>
            <span className="font-semibold text-blue-600">{loyalty.tierMultiplier}x</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">1 Coin = ₹1 discount</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions && recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">Recent Activity</h4>
            {recentTransactions.length > 5 && (
              <button
                onClick={() => navigate('/loyalty/activity')}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCard;
