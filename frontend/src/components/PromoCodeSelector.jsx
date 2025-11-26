import { useState, useEffect } from 'react';
import { Tag, X, Percent, Check, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { promoAPI } from '../services/api';

const PromoCodeSelector = ({ orderValue, restaurantId, onApplyPromo, appliedPromo }) => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (showAvailable) {
      fetchAvailablePromos();
    }
  }, [showAvailable]);

  useEffect(() => {
    if (appliedPromo) {
      setPromoCode(appliedPromo.code);
    }
  }, [appliedPromo]);

  const fetchAvailablePromos = async () => {
    try {
      setLoading(true);
      const response = await promoAPI.getActive();
      setPromos(response.data || []);
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAndApplyPromo = async (code) => {
    if (!code) {
      toast.error('Please enter a promo code');
      return;
    }

    try {
      setValidating(true);
      const response = await promoAPI.validate({
        code,
        orderValue,
        restaurantId
      });

      if (response.success) {
        onApplyPromo({
          code: response.data.code,
          description: response.data.description,
          discount: response.data.discount
        });
        toast.success(`Promo code applied! You saved ₹${response.data.discount}`);
        setShowAvailable(false);
      }
    } catch (error) {
      toast.error(error.message || 'Invalid promo code');
      onApplyPromo(null);
    } finally {
      setValidating(false);
    }
  };

  const handleApplyCode = () => {
    validateAndApplyPromo(promoCode.toUpperCase());
  };

  const handleSelectPromo = (promo) => {
    setPromoCode(promo.code);
    validateAndApplyPromo(promo.code);
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    onApplyPromo(null);
    toast.success('Promo code removed');
  };

  const isPromoApplicable = (promo) => {
    return orderValue >= promo.minOrderValue;
  };

  const calculateDiscount = (promo) => {
    if (promo.type === 'percentage') {
      const discount = (orderValue * promo.value) / 100;
      return promo.maxDiscount ? Math.min(discount, promo.maxDiscount) : discount;
    } else {
      return Math.min(promo.value, orderValue);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-gray-900">Promo Code</h3>
        </div>
        {appliedPromo && (
          <button
            onClick={handleRemovePromo}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {/* Promo Code Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="input flex-1"
          disabled={!!appliedPromo}
        />
        {appliedPromo ? (
          <button
            disabled
            className="btn bg-green-600 text-white cursor-not-allowed flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Applied</span>
          </button>
        ) : (
          <button
            onClick={handleApplyCode}
            disabled={!promoCode || validating}
            className="btn btn-primary"
          >
            {validating ? 'Validating...' : 'Apply'}
          </button>
        )}
      </div>

      {/* Applied Promo Display */}
      {appliedPromo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">{appliedPromo.code}</p>
              <p className="text-sm text-green-700">{appliedPromo.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">You saved</p>
              <p className="text-xl font-bold text-green-700">₹{appliedPromo.discount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Available Promos */}
      <button
        onClick={() => setShowAvailable(!showAvailable)}
        className="w-full flex items-center justify-between text-sm text-red-600 hover:text-red-700 font-medium"
      >
        <span>View available promo codes</span>
        {showAvailable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Available Promos List */}
      {showAvailable && (
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : promos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No promo codes available</p>
          ) : (
            promos.map((promo) => {
              const applicable = isPromoApplicable(promo);
              const discount = calculateDiscount(promo);

              return (
                <div
                  key={promo._id}
                  className={`border rounded-lg p-3 ${
                    applicable
                      ? 'border-red-200 bg-red-50 hover:bg-red-100 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  } transition-colors`}
                  onClick={() => applicable && handleSelectPromo(promo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Percent className="w-4 h-4 text-red-600" />
                        <h4 className="font-bold text-gray-900">{promo.code}</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{promo.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {promo.type === 'percentage' ? (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {promo.value}% OFF
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            ₹{promo.value} OFF
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Min: ₹{promo.minOrderValue}
                        </span>
                        {promo.maxDiscount && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            Max: ₹{promo.maxDiscount}
                          </span>
                        )}
                      </div>
                    </div>
                    {applicable && (
                      <div className="ml-3 text-right">
                        <p className="text-xs text-gray-600">Save</p>
                        <p className="text-lg font-bold text-green-600">₹{discount.toFixed(0)}</p>
                      </div>
                    )}
                  </div>
                  {!applicable && (
                    <p className="text-xs text-red-600 mt-2">
                      Add ₹{(promo.minOrderValue - orderValue).toFixed(0)} more to use this code
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCodeSelector;
