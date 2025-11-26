# Test Directory Structure

This directory contains all tests for the Food Delivery Backend.

## 📁 Structure

```
tests/
├── setup.js                           # Global test setup & teardown
├── README.md                          # This file
├── helpers/
│   └── testHelpers.js                 # Reusable test utilities
├── unit/
│   ├── models/                        # Model tests
│   │   ├── User.test.js              ✅ Complete (15 tests)
│   │   ├── Restaurant.test.js        ✅ Complete (25 tests)
│   │   ├── MenuItem.test.js          📅 TODO
│   │   ├── Order.test.js             📅 TODO
│   │   ├── Review.test.js            📅 TODO
│   │   └── PromoCode.test.js         📅 TODO
│   ├── middleware/                    # Middleware tests
│   │   ├── auth.test.js              ✅ Complete (8 tests)
│   │   ├── role.test.js              📅 TODO
│   │   ├── validation.test.js        📅 TODO
│   │   └── error.test.js             📅 TODO
│   └── utils/                         # Utility function tests
│       └── helpers.test.js           ✅ Complete (15 tests)
└── integration/                       # API integration tests
    ├── auth.integration.test.js      ✅ Complete (12 tests)
    ├── restaurant.integration.test.js ✅ Complete (14 tests)
    ├── menu.integration.test.js      📅 TODO
    ├── order.integration.test.js     📅 TODO
    ├── payment.integration.test.js   📅 TODO
    ├── driver.integration.test.js    📅 TODO
    └── admin.integration.test.js     📅 TODO
```

## ✅ Completed Tests (89 tests)

### Unit Tests (63 tests)
1. **User Model** (15 tests)
   - User creation for all roles
   - Password hashing & verification
   - Validation & constraints
   - Address management
   - Driver features

2. **Restaurant Model** (25 tests)
   - Restaurant creation & validation
   - Geolocation features
   - Opening hours management
   - Rating system
   - Commission management
   - Status management
   - Search and filters
   - Delivery settings
   - Images management

3. **Auth Middleware** (8 tests)
   - Token authentication
   - Token validation
   - User verification
   - Optional authentication

4. **Helper Functions** (15 tests)
   - Distance calculation
   - Delivery time estimation
   - Order pricing calculation
   - Restaurant opening hours check
   - Order number generation
   - Currency formatting
   - Discount calculation
   - Coordinate validation
   - Phone number sanitization
   - OTP generation

### Integration Tests (26 tests)
1. **Auth API** (12 tests)
   - User signup & validation
   - User login & authentication
   - Profile management
   - Address CRUD
   - Password change
   - Logout

2. **Restaurant API** (14 tests)
   - Browse restaurants
   - Filter by cuisine, location, rating
   - Search by name
   - Pagination
   - Get restaurant details
   - Create restaurant (admin)
   - Update restaurant (vendor)
   - Delete restaurant (admin)
   - Toggle status

## 📊 Coverage Status

### Current Coverage
```
Test Suites:   6 passed
Test Cases:    89 passed
Models:        2/6 complete (33%)
Middleware:    1/5 complete (20%)
Utils:         1/1 complete (100%)
APIs:          2/7 complete (29%)
```

### Target Coverage
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suite
```bash
# Unit tests
npx jest src/tests/unit/models/User.test.js
npx jest src/tests/unit/models/Restaurant.test.js
npx jest src/tests/unit/utils/helpers.test.js

# Integration tests
npx jest src/tests/integration/auth.integration.test.js
npx jest src/tests/integration/restaurant.integration.test.js
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm test -- --coverage
```

## 🎓 Test Helpers Available

Located in `helpers/testHelpers.js`:

### User & Authentication
```javascript
createTestUser(role, additionalData)
generateTestToken(userId, role)
```

### Data Creation
```javascript
createTestRestaurant(vendorId, additionalData)
createTestMenuItem(restaurantId, additionalData)
createTestOrder(customerId, restaurantId, items, additionalData)
```

### Mock Objects
```javascript
mockRequest(overrides)
mockResponse()
mockNext()
```

## 📝 Writing New Tests

### 1. Unit Test Template
```javascript
const Model = require('../../../models/ModelName');

describe('ModelName Tests', () => {
  describe('Feature', () => {
    it('should do something', async () => {
      // Arrange
      const data = { /* test data */ };

      // Act
      const result = await Model.create(data);

      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

### 2. Integration Test Template
```javascript
const request = require('supertest');
const app = require('../../app');
const { createTestUser, generateTestToken } = require('../helpers/testHelpers');

describe('API Endpoint Tests', () => {
  it('should handle request', async () => {
    const user = await createTestUser('customer');
    const token = generateTestToken(user._id, user.role);

    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
```

## 🎯 Next Tests to Write

### Priority 1 (High Impact)
- [ ] MenuItem model tests
- [ ] Order model tests
- [ ] Menu API integration tests
- [ ] Order API integration tests

### Priority 2 (Complete Coverage)
- [ ] Review model tests
- [ ] PromoCode model tests
- [ ] Role middleware tests
- [ ] Validation middleware tests
- [ ] Payment API integration tests
- [ ] Driver API integration tests
- [ ] Admin API integration tests

### Priority 3 (Advanced)
- [ ] End-to-end tests
- [ ] Performance tests
- [ ] Load tests
- [ ] Security tests

## 🐛 Debugging Tests

### Run Single Test
```bash
npx jest -t "should create a customer user"
```

### Verbose Output
```bash
npx jest --verbose
```

### With Console Logs
```bash
npx jest --no-coverage --verbose
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Documentation

- **[TESTING_GUIDE.md](../../TESTING_GUIDE.md)** - Complete testing guide
- **[TESTING_STATUS.md](../../TESTING_STATUS.md)** - Current status
- **setup.js** - Test configuration

## ✨ Best Practices

1. **Test Independence** - Each test should be independent
2. **Descriptive Names** - Use clear, descriptive test names
3. **AAA Pattern** - Arrange, Act, Assert
4. **Clean Database** - Setup cleans database between tests
5. **Use Helpers** - Leverage test helpers for common operations
6. **Mock External** - Mock external services (payment gateways, etc.)
7. **Test Both Paths** - Test success and failure cases
8. **Edge Cases** - Include boundary and edge case tests

## 🎉 Current Achievement

**89 tests passing!** 🚀

Keep adding more tests to reach 80%+ coverage!

---

**For detailed guide:** See [TESTING_GUIDE.md](../../TESTING_GUIDE.md)
**For status:** See [TESTING_STATUS.md](../../TESTING_STATUS.md)
