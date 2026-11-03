const crypto = require('crypto');
const Image = require('../models/Image');
const config = require('../config/env');
const { asyncHandler } = require('../middleware/error.middleware');

// Without Cloudinary, images are kept in MongoDB - keep them small
const MAX_DB_IMAGE_BYTES = 1 * 1024 * 1024;

const cloudinaryConfigured = () =>
  Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret);

/**
 * Signed upload to Cloudinary through its REST API (no SDK needed)
 */
const uploadToCloudinary = async (file, folder) => {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  const timestamp = Math.floor(Date.now() / 1000);
  // Params to sign: sorted alphabetically, joined with &, followed by the secret
  const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Cloudinary upload failed');
  }
  return result.secure_url;
};

/**
 * @desc    Upload an image (restaurant / menu item photos)
 * @route   POST /api/uploads
 * @access  Private (Vendor/Admin)
 */
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file received (send it as form field "image")'
    });
  }

  if (cloudinaryConfigured()) {
    const url = await uploadToCloudinary(req.file, 'food-delivery');
    return res.status(201).json({
      success: true,
      data: { url, provider: 'cloudinary' }
    });
  }

  if (req.file.size > MAX_DB_IMAGE_BYTES) {
    return res.status(400).json({
      success: false,
      message: 'Image must be under 1 MB (configure Cloudinary for larger images)'
    });
  }

  const image = await Image.create({
    data: req.file.buffer,
    contentType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user._id
  });

  // Absolute URL so the frontend (on a different domain) can use it directly
  const url = `${req.protocol}://${req.get('host')}/api/uploads/${image._id}`;

  res.status(201).json({
    success: true,
    data: { url, provider: 'database' }
  });
});

/**
 * @desc    Serve an uploaded image
 * @route   GET /api/uploads/:id
 * @access  Public
 */
exports.getImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);

  if (!image) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  res.set({
    'Content-Type': image.contentType,
    'Content-Length': image.size,
    'Cache-Control': 'public, max-age=31536000, immutable',
    // Helmet defaults to same-origin; the frontend lives on another domain
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  res.send(image.data);
});
