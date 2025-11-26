const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt.utils');
const { asyncHandler } = require('../middleware/error.middleware');
const { sanitizeUser } = require('../utils/helpers');

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email
        ? 'User already exists with this email'
        : 'User already exists with this phone number'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role || 'customer'
  });

  // Generate tokens
  const tokens = generateTokens(user._id, user.role);

  // Save refresh token
  user.refreshTokens.push({
    token: tokens.refreshToken,
    createdAt: new Date()
  });
  await user.save();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: sanitizeUser(user),
      tokens
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.'
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate tokens
  const tokens = generateTokens(user._id, user.role);

  // Save refresh token
  user.refreshTokens.push({
    token: tokens.refreshToken,
    createdAt: new Date()
  });

  // Limit refresh tokens to last 5
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      tokens
    }
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }

  // Find user and check if refresh token exists
  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'User not found or inactive'
    });
  }

  const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);

  if (!tokenExists) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not found or has been revoked'
    });
  }

  // Generate new tokens
  const tokens = generateTokens(user._id, user.role);

  // Remove old refresh token and add new one
  user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
  user.refreshTokens.push({
    token: tokens.refreshToken,
    createdAt: new Date()
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      tokens
    }
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken && req.user.refreshTokens) {
    // Remove specific refresh token
    req.user.refreshTokens = req.user.refreshTokens.filter(
      t => t.token !== refreshToken
    );
    await req.user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user)
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, profilePicture, addresses } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (phone) updateFields.phone = phone;
  if (profilePicture) updateFields.profilePicture = profilePicture;
  if (addresses) updateFields.addresses = addresses;

  // Check if phone is already used by another user
  if (phone && phone !== req.user.phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already in use'
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updateFields,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: sanitizeUser(updatedUser)
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;

  // Clear all refresh tokens (force re-login on all devices)
  user.refreshTokens = [];

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login again.'
  });
});

/**
 * @desc    Add address
 * @route   POST /api/auth/addresses
 * @access  Private
 */
exports.addAddress = asyncHandler(async (req, res) => {
  const { label, street, city, state, zipCode, country, coordinates, instructions, isDefault } = req.body;

  // Validate coordinates if provided
  if (coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates must be an array of [longitude, latitude]'
      });
    }

    const [lon, lat] = coordinates;
    if (isNaN(lon) || isNaN(lat) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }
  }

  const newAddress = {
    label,
    street,
    city,
    state,
    zipCode,
    country: country || 'India',
    location: {
      type: 'Point',
      coordinates: coordinates // [longitude, latitude]
    },
    instructions,
    isDefault: isDefault || false
  };

  // If this is set as default, unset other defaults
  if (newAddress.isDefault) {
    req.user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  req.user.addresses.push(newAddress);
  await req.user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: {
      addresses: req.user.addresses
    }
  });
});

/**
 * @desc    Update address
 * @route   PUT /api/auth/addresses/:addressId
 * @access  Private
 */
exports.updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = req.user.addresses.id(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  const { label, street, city, state, zipCode, coordinates, instructions, isDefault } = req.body;

  if (label) address.label = label;
  if (street) address.street = street;
  if (city) address.city = city;
  if (state) address.state = state;
  if (zipCode) address.zipCode = zipCode;
  if (instructions !== undefined) address.instructions = instructions;
  if (coordinates) address.location.coordinates = coordinates;

  if (isDefault) {
    req.user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  }

  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: {
      addresses: req.user.addresses
    }
  });
});

/**
 * @desc    Delete address
 * @route   DELETE /api/auth/addresses/:addressId
 * @access  Private
 */
exports.deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = req.user.addresses.id(addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  address.remove();
  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: {
      addresses: req.user.addresses
    }
  });
});
