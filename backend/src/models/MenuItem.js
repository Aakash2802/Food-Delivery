const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot'],
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    min: [1, 'Preparation time must be at least 1 minute'],
    default: 15
  },
  customizations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    options: [{
      label: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        default: 0,
        min: [0, 'Option price cannot be negative']
      },
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    isRequired: {
      type: Boolean,
      default: false
    },
    maxSelections: {
      type: Number,
      default: 1,
      min: [1, 'Max selections must be at least 1']
    }
  }],
  nutritionInfo: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative']
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative']
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative']
    }
  },
  allergens: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  popularity: {
    type: Number,
    default: 0
  },
  orderCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ popularity: -1 });
menuItemSchema.index({ orderCount: -1 });

// Calculate discount percentage virtual
menuItemSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Method to increment order count
menuItemSchema.methods.incrementOrderCount = async function() {
  this.orderCount += 1;
  this.popularity = this.orderCount; // Simple popularity calculation
  await this.save();
};

// Ensure toJSON includes virtuals
menuItemSchema.set('toJSON', { virtuals: true });
menuItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
