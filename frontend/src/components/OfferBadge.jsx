import { Tag, Percent, Truck } from 'lucide-react';

const OfferBadge = ({ offer, compact = false }) => {
  if (!offer || !offer.isActive) return null;

  // Check if offer is still valid
  const now = new Date();
  const validUntil = new Date(offer.validUntil);
  if (now > validUntil) return null;

  const getOfferText = () => {
    switch (offer.discountType) {
      case 'percentage':
        return `${offer.discountValue}% OFF`;
      case 'flat':
        return `₹${offer.discountValue} OFF`;
      case 'freeDelivery':
        return 'FREE DELIVERY';
      default:
        return 'OFFER';
    }
  };

  const getOfferIcon = () => {
    switch (offer.discountType) {
      case 'freeDelivery':
        return <Truck className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'percentage':
        return <Percent className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Tag className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-lg font-bold text-xs shadow-md">
        {getOfferIcon()}
        <span>{getOfferText()}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-3 shadow-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getOfferIcon()}
          <span className="font-black text-lg">{getOfferText()}</span>
        </div>
        {offer.code && (
          <div className="bg-white bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold border border-white border-opacity-30">
            {offer.code}
          </div>
        )}
      </div>

      {offer.description && (
        <p className="text-white text-opacity-90 text-xs mb-2">
          {offer.description}
        </p>
      )}

      {offer.minOrderValue > 0 && (
        <p className="text-white text-opacity-80 text-xs">
          Min. order: ₹{offer.minOrderValue}
        </p>
      )}
    </div>
  );
};

export default OfferBadge;
