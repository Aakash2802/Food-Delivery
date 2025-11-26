const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');
const addressController = require('../controllers/address.controller');

// All routes require authentication and customer role
router.use(authMiddleware);
router.use(roleMiddleware('customer'));

// GET /api/addresses - Get all addresses
router.get('/', addressController.getAddresses);

// GET /api/addresses/:id - Get single address
router.get('/:id', addressController.getAddress);

// POST /api/addresses - Create new address
router.post('/', addressController.createAddress);

// PUT /api/addresses/:id - Update address
router.put('/:id', addressController.updateAddress);

// DELETE /api/addresses/:id - Delete address
router.delete('/:id', addressController.deleteAddress);

// PATCH /api/addresses/:id/default - Set as default address
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
