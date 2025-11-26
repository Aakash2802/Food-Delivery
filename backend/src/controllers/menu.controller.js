const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { asyncHandler } = require('../middleware/error.middleware');
const { paginate, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get restaurant menu
 * @route   GET /api/restaurants/:restaurantId/menu
 * @access  Public
 */
exports.getRestaurantMenu = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { category, isVeg, isAvailable = 'true', page = 1, limit = 50 } = req.query;

  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }

  const query = { restaurantId };

  // Filters
  if (category) {
    query.category = category;
  }

  if (isVeg === 'true') {
    query.isVeg = true;
  }

  if (isAvailable === 'true') {
    query.isAvailable = true;
  }

  // Get total count
  const total = await MenuItem.countDocuments(query);

  // Execute query with pagination
  let menuQuery = MenuItem.find(query)
    .sort({ category: 1, popularity: -1, name: 1 })
    .select('-__v');

  menuQuery = paginate(menuQuery, page, limit);

  const menuItems = await menuQuery.lean();

  // Group by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        cuisines: restaurant.cuisines
      },
      menuItems,
      groupedByCategory: groupedMenu
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Get menu item by ID
 * @route   GET /api/menu/:itemId
 * @access  Public
 */
exports.getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.itemId)
    .populate('restaurantId', 'name cuisines rating');

  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      menuItem
    }
  });
});

/**
 * @desc    Create menu item (Vendor)
 * @route   POST /api/vendor/menu
 * @access  Private (Vendor)
 */
exports.createMenuItem = asyncHandler(async (req, res) => {
  if (!req.user.restaurantId) {
    return res.status(400).json({
      success: false,
      message: 'You do not have a restaurant'
    });
  }

  const menuItemData = {
    ...req.body,
    restaurantId: req.user.restaurantId
  };

  const menuItem = await MenuItem.create(menuItemData);

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: {
      menuItem
    }
  });
});

/**
 * @desc    Update menu item (Vendor)
 * @route   PUT /api/vendor/menu/:itemId
 * @access  Private (Vendor)
 */
exports.updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.itemId);

  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  // Check ownership
  if (menuItem.restaurantId.toString() !== req.user.restaurantId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this item'
    });
  }

  // Update fields
  const allowedUpdates = [
    'name', 'description', 'category', 'images', 'price', 'originalPrice',
    'isVeg', 'isVegan', 'isGlutenFree', 'spiceLevel', 'isAvailable',
    'preparationTime', 'customizations', 'nutritionInfo', 'allergens', 'tags'
  ];

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      menuItem[key] = req.body[key];
    }
  });

  await menuItem.save();

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: {
      menuItem
    }
  });
});

/**
 * @desc    Toggle menu item availability (Vendor)
 * @route   PATCH /api/vendor/menu/:itemId/availability
 * @access  Private (Vendor)
 */
exports.toggleAvailability = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.itemId);

  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  // Check ownership
  if (menuItem.restaurantId.toString() !== req.user.restaurantId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this item'
    });
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  res.status(200).json({
    success: true,
    message: `Menu item ${menuItem.isAvailable ? 'marked as available' : 'marked as unavailable'}`,
    data: {
      itemId: menuItem._id,
      isAvailable: menuItem.isAvailable
    }
  });
});

/**
 * @desc    Delete menu item (Vendor)
 * @route   DELETE /api/vendor/menu/:itemId
 * @access  Private (Vendor)
 */
exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.itemId);

  if (!menuItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }

  // Check ownership
  if (menuItem.restaurantId.toString() !== req.user.restaurantId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this item'
    });
  }

  await menuItem.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

/**
 * @desc    Get vendor's menu items
 * @route   GET /api/vendor/menu
 * @access  Private (Vendor)
 */
exports.getVendorMenuItems = asyncHandler(async (req, res) => {
  if (!req.user.restaurantId) {
    return res.status(400).json({
      success: false,
      message: 'You do not have a restaurant'
    });
  }

  const { category, isAvailable, page = 1, limit = 50 } = req.query;

  const query = { restaurantId: req.user.restaurantId };

  if (category) {
    query.category = category;
  }

  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  }

  const total = await MenuItem.countDocuments(query);

  let menuQuery = MenuItem.find(query)
    .sort({ category: 1, name: 1 })
    .select('-__v');

  menuQuery = paginate(menuQuery, page, limit);

  const menuItems = await menuQuery.lean();

  // Get categories
  const categories = await MenuItem.distinct('category', { restaurantId: req.user.restaurantId });

  res.status(200).json({
    success: true,
    data: {
      menuItems,
      categories
    },
    ...buildPaginationResponse(menuItems, page, limit, total)
  });
});

/**
 * @desc    Search menu items across restaurants
 * @route   GET /api/menu/search
 * @access  Public
 */
exports.searchMenuItems = asyncHandler(async (req, res) => {
  const { query: searchQuery, latitude, longitude, radius = 10, page = 1, limit = 20 } = req.query;

  if (!searchQuery) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  // Text search on menu items
  const menuItems = await MenuItem.find({
    $text: { $search: searchQuery },
    isAvailable: true
  })
    .populate('restaurantId', 'name location rating isOpen')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .lean();

  // Filter by restaurant location if coordinates provided
  let filteredItems = menuItems;
  if (latitude && longitude) {
    const { calculateDistance } = require('../utils/helpers');
    filteredItems = menuItems.filter(item => {
      if (item.restaurantId && item.restaurantId.location && item.restaurantId.location.coordinates) {
        const [lon, lat] = item.restaurantId.location.coordinates.coordinates;
        if (lat && lon) {
          const distance = calculateDistance(
            { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            { latitude: lat, longitude: lon }
          );
          return distance <= parseFloat(radius) * 1000; // Convert km to meters
        }
      }
      return false;
    });
  }

  res.status(200).json({
    success: true,
    data: {
      menuItems: filteredItems,
      count: filteredItems.length
    }
  });
});

/**
 * @desc    Bulk update menu items availability (Vendor)
 * @route   PATCH /api/vendor/menu/bulk-availability
 * @access  Private (Vendor)
 */
exports.bulkUpdateAvailability = asyncHandler(async (req, res) => {
  const { itemIds, isAvailable } = req.body;

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Item IDs array is required'
    });
  }

  if (typeof isAvailable !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isAvailable must be a boolean'
    });
  }

  // Update all items belonging to vendor's restaurant
  const result = await MenuItem.updateMany(
    {
      _id: { $in: itemIds },
      restaurantId: req.user.restaurantId
    },
    {
      $set: { isAvailable }
    }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} menu items updated`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});
