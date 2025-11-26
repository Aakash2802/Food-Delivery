const Address = require('../models/Address');
const asyncHandler = require('../utils/asyncHandler');

// Get all addresses for logged-in user
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: addresses
  });
});

// Get single address
const getAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  res.status(200).json({
    success: true,
    data: address
  });
});

// Create new address
const createAddress = asyncHandler(async (req, res) => {
  const {
    label,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    latitude,
    longitude,
    isDefault
  } = req.body;

  // Validate required fields
  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Location coordinates are required'
    });
  }

  // Validate coordinate ranges
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
    });
  }

  // Check if this is the first address, make it default
  const addressCount = await Address.countDocuments({ userId: req.user._id });
  const shouldBeDefault = addressCount === 0 ? true : (isDefault || false);

  const address = await Address.create({
    userId: req.user._id,
    label,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    location: {
      type: 'Point',
      coordinates: [lon, lat]
    },
    isDefault: shouldBeDefault
  });

  res.status(201).json({
    success: true,
    message: 'Address created successfully',
    data: address
  });
});

// Update address
const updateAddress = asyncHandler(async (req, res) => {
  let address = await Address.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  const {
    label,
    fullName,
    phone,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
    latitude,
    longitude,
    isDefault
  } = req.body;

  // Update fields
  if (label) address.label = label;
  if (fullName) address.fullName = fullName;
  if (phone) address.phone = phone;
  if (addressLine1) address.addressLine1 = addressLine1;
  if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
  if (landmark !== undefined) address.landmark = landmark;
  if (city) address.city = city;
  if (state) address.state = state;
  if (pincode) address.pincode = pincode;

  if (latitude && longitude) {
    address.location = {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
    };
  }

  if (isDefault !== undefined) {
    address.isDefault = isDefault;
  }

  await address.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: address
  });
});

// Delete address
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  const wasDefault = address.isDefault;
  await address.deleteOne();

  // If deleted address was default, make another one default
  if (wasDefault) {
    const nextAddress = await Address.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// Set address as default
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    userId: req.user._id
  });

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  address.isDefault = true;
  await address.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated successfully',
    data: address
  });
});

module.exports = {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
