const Restaurant = require('../models/Restaurant');
const { asyncHandler } = require('../middleware/error.middleware');
const { calculateDistance, isRestaurantOpen, paginate, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all restaurants with filters
 * @route   GET /api/restaurants
 * @access  Public
 */
exports.getRestaurants = asyncHandler(async (req, res) => {
  const {
    search,
    cuisine,
    latitude,
    longitude,
    radius = 10,
    minRating,
    pricing,
    isOpen,
    page = 1,
    limit = 20,
    sort = 'rating'
  } = req.query;

  const query = { isActive: true, isApproved: true };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Cuisine filter
  if (cuisine) {
    query.cuisines = { $in: [cuisine] };
  }

  // Rating filter
  if (minRating) {
    query['rating.average'] = { $gte: parseFloat(minRating) };
  }

  // Pricing filter
  if (pricing) {
    query.pricing = pricing;
  }

  // Open status filter
  if (isOpen === 'true') {
    query.isOpen = true;
  }

  // Build sort criteria
  let sortCriteria = {};
  switch (sort) {
    case 'rating':
      sortCriteria = { 'rating.average': -1 };
      break;
    case 'deliveryTime':
      sortCriteria = { 'deliveryTime.min': 1 };
      break;
    case 'distance':
      sortCriteria = {}; // Distance sorting is handled by $near
      break;
    default:
      sortCriteria = { 'rating.average': -1 };
  }

  // Handle geolocation filtering
  let restaurants;
  let total;

  if (latitude && longitude) {
    const radiusInMeters = parseFloat(radius) * 1000;

    try {
      // Use $geoWithin for counting (compatible with countDocuments)
      const countQuery = {
        ...query,
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(longitude), parseFloat(latitude)],
              radiusInMeters / 6378100 // Convert meters to radians (Earth's radius in meters)
            ]
          }
        }
      };

      total = await Restaurant.countDocuments(countQuery);

      // Use aggregation with $geoNear for finding and sorting by distance
      const aggregationPipeline = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            distanceField: 'distance',
            maxDistance: radiusInMeters,
            spherical: true,
            query: query
          }
        },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
      ];

      // Add sorting if not sorting by distance
      if (Object.keys(sortCriteria).length > 0) {
        aggregationPipeline.splice(1, 0, { $sort: sortCriteria });
      }

      restaurants = await Restaurant.aggregate(aggregationPipeline);
    } catch (error) {
      // Fallback to regular query without geolocation if geo queries fail
      console.log('Geolocation query failed, using standard query:', error.message);
      total = await Restaurant.countDocuments(query);

      restaurants = await Restaurant.find(query)
        .sort(sortCriteria)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-__v')
        .lean();
    }
  } else {
    // No geolocation filtering - use standard query
    total = await Restaurant.countDocuments(query);

    let restaurantsQuery = Restaurant.find(query);

    if (Object.keys(sortCriteria).length > 0) {
      restaurantsQuery = restaurantsQuery.sort(sortCriteria);
    }

    restaurantsQuery = paginate(restaurantsQuery, page, limit);

    restaurants = await restaurantsQuery.select('-__v').lean();
  }

  // Calculate distance for each restaurant if coordinates provided (only for non-geo queries)
  if (latitude && longitude && restaurants.length > 0 && !restaurants[0].distance) {
    restaurants.forEach(restaurant => {
      if (restaurant.location && restaurant.location.coordinates && restaurant.location.coordinates.coordinates) {
        const [lon, lat] = restaurant.location.coordinates.coordinates;

        // Validate coordinates exist
        if (lat && lon) {
          restaurant.distance = calculateDistance(
            { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            { latitude: lat, longitude: lon }
          );
        }
      }
    });
  }

  res.status(200).json({
    success: true,
    ...buildPaginationResponse(restaurants, page, limit, total)
  });
});

/**
 * @desc    Get restaurant by ID
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
exports.getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .populate('ownerId', 'name email phone')
    .select('-__v');

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  if (!restaurant.isActive || !restaurant.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Restaurant is not available'
    });
  }

  // Check if currently open
  const currentlyOpen = isRestaurantOpen(restaurant.openingHours);

  res.status(200).json({
    success: true,
    data: {
      restaurant: {
        ...restaurant.toObject(),
        isCurrentlyOpen: currentlyOpen
      }
    }
  });
});

/**
 * @desc    Create new restaurant (Admin only)
 * @route   POST /api/admin/restaurants
 * @access  Private (Admin)
 */
exports.createRestaurant = asyncHandler(async (req, res) => {
  const restaurantData = req.body;

  // Check if owner exists and is a vendor
  const User = require('../models/User');
  const owner = await User.findById(restaurantData.ownerId);

  if (!owner || owner.role !== 'vendor') {
    return res.status(400).json({
      success: false,
      message: 'Owner must be a vendor'
    });
  }

  // Check if owner already has a restaurant
  const existingRestaurant = await Restaurant.findOne({ ownerId: restaurantData.ownerId });
  if (existingRestaurant) {
    return res.status(400).json({
      success: false,
      message: 'Owner already has a restaurant'
    });
  }

  const restaurant = await Restaurant.create(restaurantData);

  // Link restaurant to owner
  owner.restaurantId = restaurant._id;
  await owner.save();

  res.status(201).json({
    success: true,
    message: 'Restaurant created successfully',
    data: {
      restaurant
    }
  });
});

/**
 * @desc    Update restaurant (Admin/Vendor)
 * @route   PUT /api/admin/restaurants/:id
 * @access  Private (Admin) or PUT /api/vendor/restaurant
 */
exports.updateRestaurant = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id || req.user.restaurantId;

  if (!restaurantId) {
    return res.status(400).json({
      success: false,
      message: 'Restaurant ID is required'
    });
  }

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  // Update fields
  const allowedUpdates = [
    'name', 'description', 'images', 'cuisines', 'location',
    'contactInfo', 'openingHours', 'pricing', 'deliveryTime',
    'deliveryFee', 'minimumOrder', 'tags', 'preparationCapacity'
  ];

  // Admin can also update these fields
  if (req.user.role === 'admin') {
    allowedUpdates.push('isActive', 'isApproved', 'commissionRate');
  }

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      restaurant[key] = req.body[key];
    }
  });

  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Restaurant updated successfully',
    data: {
      restaurant
    }
  });
});

/**
 * @desc    Delete restaurant (Admin only)
 * @route   DELETE /api/admin/restaurants/:id
 * @access  Private (Admin)
 */
exports.deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  // Soft delete
  restaurant.isActive = false;
  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Restaurant deleted successfully'
  });
});

/**
 * @desc    Toggle restaurant open/close status (Vendor)
 * @route   PATCH /api/vendor/restaurant/status
 * @access  Private (Vendor)
 */
exports.toggleRestaurantStatus = asyncHandler(async (req, res) => {
  if (!req.user.restaurantId) {
    return res.status(400).json({
      success: false,
      message: 'You do not have a restaurant'
    });
  }

  const restaurant = await Restaurant.findById(req.user.restaurantId);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();

  res.status(200).json({
    success: true,
    message: `Restaurant ${restaurant.isOpen ? 'opened' : 'closed'} successfully`,
    data: restaurant
  });
});

/**
 * @desc    Get vendor's restaurant
 * @route   GET /api/vendor/restaurant
 * @access  Private (Vendor)
 */
exports.getVendorRestaurant = asyncHandler(async (req, res) => {
  // Find restaurant by ownerId (vendor's user ID)
  const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'You do not have a restaurant'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      restaurant
    }
  });
});

/**
 * @desc    Create vendor's restaurant
 * @route   POST /api/vendor/restaurant
 * @access  Private (Vendor)
 */
exports.createVendorRestaurant = asyncHandler(async (req, res) => {
  const User = require('../models/User');

  // Check if vendor already has a restaurant
  if (req.user.restaurantId) {
    return res.status(400).json({
      success: false,
      message: 'You already have a restaurant'
    });
  }

  const existingRestaurant = await Restaurant.findOne({ ownerId: req.user._id });
  if (existingRestaurant) {
    return res.status(400).json({
      success: false,
      message: 'You already have a restaurant'
    });
  }

  // Use vendor's ID as ownerId
  const restaurantData = {
    ...req.body,
    ownerId: req.user._id,
    isApproved: false, // Require admin approval
    isActive: true
  };

  const restaurant = await Restaurant.create(restaurantData);

  // Link restaurant to vendor
  const vendor = await User.findById(req.user._id);
  vendor.restaurantId = restaurant._id;
  await vendor.save();

  res.status(201).json({
    success: true,
    message: 'Restaurant created successfully. Pending admin approval.',
    data: {
      restaurant
    }
  });
});

/**
 * @desc    Update restaurant commission (Admin only)
 * @route   PATCH /api/admin/restaurants/:id/commission
 * @access  Private (Admin)
 */
exports.updateCommission = asyncHandler(async (req, res) => {
  const { commissionRate } = req.body;

  if (!commissionRate || commissionRate < 0 || commissionRate > 100) {
    return res.status(400).json({
      success: false,
      message: 'Commission rate must be between 0 and 100'
    });
  }

  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  restaurant.commissionRate = commissionRate;
  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Commission rate updated successfully',
    data: {
      restaurantId: restaurant._id,
      commissionRate: restaurant.commissionRate
    }
  });
});

/**
 * @desc    Approve restaurant (Admin only)
 * @route   PATCH /api/admin/restaurants/:id/approve
 * @access  Private (Admin)
 */
exports.approveRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  restaurant.isApproved = true;
  restaurant.approvedAt = new Date();
  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Restaurant approved successfully',
    data: {
      restaurant
    }
  });
});

/**
 * @desc    Reject restaurant (Admin only)
 * @route   PATCH /api/admin/restaurants/:id/reject
 * @access  Private (Admin)
 */
exports.rejectRestaurant = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  restaurant.isApproved = false;
  restaurant.rejectionReason = reason;
  await restaurant.save();

  res.status(200).json({
    success: true,
    message: 'Restaurant rejected',
    data: {
      restaurant
    }
  });
});
