const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.log('❌ Validation failed:', errors);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  signup: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().lowercase().trim().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('customer', 'vendor', 'driver').default('customer')
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required()
  }),

  // Restaurant schemas
  createRestaurant: Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().max(1000),
    ownerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    cuisines: Joi.array().items(Joi.string().trim()),
    location: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string(),
      zipCode: Joi.string(),
      coordinates: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
      }).required()
    }).required(),
    contactInfo: Joi.object({
      phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
      email: Joi.string().email()
    }).required(),
    pricing: Joi.string().valid('$', '$$', '$$$', '$$$$'),
    deliveryTime: Joi.object({
      min: Joi.number().min(10).required(),
      max: Joi.number().min(Joi.ref('min')).required()
    }).required(),
    deliveryFee: Joi.number().min(0),
    minimumOrder: Joi.number().min(0),
    commissionRate: Joi.number().min(0).max(100)
  }),

  updateRestaurant: Joi.object({
    name: Joi.string().trim().min(2).max(200),
    description: Joi.string().max(1000),
    cuisines: Joi.array().items(Joi.string().trim()),
    isActive: Joi.boolean(),
    isOpen: Joi.boolean(),
    pricing: Joi.string().valid('$', '$$', '$$$', '$$$$'),
    deliveryFee: Joi.number().min(0),
    minimumOrder: Joi.number().min(0),
    commissionRate: Joi.number().min(0).max(100)
  }).min(1),

  // Menu item schemas
  createMenuItem: Joi.object({
    name: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().max(1000),
    category: Joi.string().trim().required(),
    price: Joi.number().min(0).required(),
    originalPrice: Joi.number().min(0),
    isVeg: Joi.boolean(),
    isVegan: Joi.boolean(),
    spiceLevel: Joi.string().valid('mild', 'medium', 'hot', 'extra-hot'),
    isAvailable: Joi.boolean(),
    preparationTime: Joi.number().min(1),
    customizations: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      options: Joi.array().items(Joi.object({
        label: Joi.string().required(),
        price: Joi.number().min(0).default(0),
        isDefault: Joi.boolean()
      })),
      isRequired: Joi.boolean(),
      maxSelections: Joi.number().min(1)
    }))
  }),

  // Order schemas
  createOrder: Joi.object({
    restaurantId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    items: Joi.array().items(Joi.object({
      menuItemId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
      quantity: Joi.number().min(1).required(),
      customizations: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        selectedOptions: Joi.array().items(Joi.string())
      })),
      specialInstructions: Joi.string().max(500)
    })).min(1).required(),
    deliveryAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string(),
      zipCode: Joi.string(),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
      }).required(),
      instructions: Joi.string().max(500)
    }).required(),
    contactPhone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
    paymentMethod: Joi.string().valid('cod', 'card', 'upi', 'wallet', 'razorpay', 'mock').required(),
    promoCode: Joi.string().uppercase().trim()
  }),

  updateOrderStatus: Joi.object({
    status: Joi.string().valid(
      'pending', 'confirmed', 'preparing', 'ready',
      'assigned', 'picked', 'en_route', 'delivered',
      'cancelled', 'rejected'
    ).required(),
    note: Joi.string().max(500),
    preparationTime: Joi.number().min(1)
  }),

  // Review schemas
  createReview: Joi.object({
    orderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    ratings: Joi.object({
      food: Joi.number().min(1).max(5).required(),
      delivery: Joi.number().min(1).max(5),
      overall: Joi.number().min(1).max(5).required()
    }).required(),
    comment: Joi.string().max(1000)
  }),

  // Driver location update
  updateLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }),

  // Promo code schemas
  createPromoCode: Joi.object({
    code: Joi.string().uppercase().trim().max(50).required(),
    description: Joi.string().max(500),
    type: Joi.string().valid('percentage', 'fixed').required(),
    value: Joi.number().min(0).required(),
    maxDiscount: Joi.number().min(0),
    minOrderValue: Joi.number().min(0),
    applicableFor: Joi.string().valid('all', 'new_users', 'specific_restaurants'),
    restaurants: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    validFrom: Joi.date().required(),
    validUntil: Joi.date().greater(Joi.ref('validFrom')).required(),
    usageLimit: Joi.object({
      total: Joi.number().min(1),
      perUser: Joi.number().min(1)
    })
  }),

  // Query parameter schemas
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  }),

  restaurantFilters: Joi.object({
    search: Joi.string().trim(),
    cuisine: Joi.string().trim(),
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    radius: Joi.number().min(1).max(50).default(10),
    minRating: Joi.number().min(0).max(5),
    pricing: Joi.string().valid('$', '$$', '$$$', '$$$$'),
    isOpen: Joi.boolean(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sort: Joi.string().valid('rating', 'distance', 'deliveryTime')
  })
};

module.exports = {
  validate,
  schemas
};
