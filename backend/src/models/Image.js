const mongoose = require('mongoose');

/**
 * Fallback image storage used when no cloud storage (Cloudinary) is configured.
 * Small images only (see upload.controller.js); served from GET /api/uploads/:id
 */
const imageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Image', imageSchema);
