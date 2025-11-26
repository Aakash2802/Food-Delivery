# Testing Guide

## Overview

This guide covers the complete testing setup for the Food Delivery Backend API. We use Jest as the testing framework with Supertest for API integration testing.

---

## Prerequisites

```bash
npm install
```

This will install all required dependencies including:
- **jest** - Testing framework
- **supertest** - HTTP assertion library
- **mongodb-memory-server** - In-memory MongoDB for testing

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx jest src/tests/unit/models/User.test.js
```

### Run Tests with Verbose Output
```bash
npx jest --verbose
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

---

## Test Structure

```
backend/src/tests/
├── setup.js                           # Global test setup
├── helpers/
│   └── testHelpers.js                 # Reusable test utilities
├── unit/
│   ├── models/
│   │   ├── User.test.js              # User model tests
│   │   ├── Restaurant.test.js        # (To be created)
│   │   ├── MenuItem.test.js          # (To be created)
│   │   └── Order.test.js             # (To be created)
│   └── middleware/
│       ├── auth.test.js              # Auth middleware tests
│       ├── role.test.js              # (To be created)
│       └── validation.test.js        # (To be created)
└── integration/
    ├── auth.integration.test.js      # Auth API integration tests
    ├── restaurant.integration.test.js # (To be created)
    ├── menu.integration.test.js      # (To be created)
    ├── order.integration.test.js     # (To be created)
    └── payment.integration.test.js   # (To be created)
```

---

## What's Already Tested

### ✅ Unit Tests

#### User Model Tests (15 test cases)
- User creation for all roles (customer, vendor, driver)
- Password hashing
- Required field validation
- Email format validation
- Duplicate email prevention
- Password comparison method
- Address management
- Driver-specific features

#### Auth Middleware Tests (8 test cases)
- Valid token authentication
- Missing token rejection
- Invalid token format rejection
- Expired token rejection
- Inactive user rejection
- Optional authentication

### ✅ Integration Tests

#### Auth API Tests (12 test cases)
- User signup
- User login
- Get profile
- Update profile
- Add address
- Change password
- Logout

---

## Test Helpers

Located in `src/tests/helpers/testHelpers.js`:

### `createTestUser(role, additionalData)`
Creates a test user with specified role.

```javascript
const user = await createTestUser('customer');
const driver = await createTestUser('driver', {
  vehicle: { type: 'bike', number: 'KA01AB1234' }
});
```

### `generateTestToken(userId, role)`
Generates JWT token for testing.

```javascript
const token = generateTestToken(user._id, user.role);
```

### `createTestRestaurant(vendorId, additionalData)`
Creates a test restaurant.

```javascript
const restaurant = await createTestRestaurant(vendor._id);
```

### `createTestMenuItem(restaurantId, additionalData)`
Creates a test menu item.

```javascript
const menuItem = await createTestMenuItem(restaurant._id, {
  name: 'Special Pizza',
  price: 299
});
```

### `createTestOrder(customerId, restaurantId, items, additionalData)`
Creates a test order.

```javascript
const order = await createTestOrder(customer._id, restaurant._id, items);
```

### Mock Request/Response
```javascript
const req = mockRequest({ body: { email: 'test@example.com' } });
const res = mockResponse();
const next = mockNext();
```

---

## Writing New Tests

### Unit Test Example

```javascript
const Model = require('../../../models/ModelName');

describe('ModelName Tests', () => {
  describe('Feature Name', () => {
    it('should do something', async () => {
      // Arrange
      const data = { /* test data */ };

      // Act
      const result = await Model.create(data);

      // Assert
      expect(result).toBeDefined();
      expect(result.field).toBe(expectedValue);
    });
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../../app');
const { createTestUser, generateTestToken } = require('../helpers/testHelpers');

describe('API Endpoint Tests', () => {
  it('should return data', async () => {
    const user = await createTestUser('customer');
    const token = generateTestToken(user._id, user.role);

    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* data */ });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Testing Checklist

### ✅ Completed
- [x] Test setup configuration
- [x] Test helpers
- [x] User model tests
- [x] Auth middleware tests
- [x] Auth API integration tests

### 🚧 Pending

#### Unit Tests
- [ ] Restaurant model tests
- [ ] MenuItem model tests
- [ ] Order model tests
- [ ] Review model tests
- [ ] PromoCode model tests
- [ ] Role middleware tests
- [ ] Validation middleware tests
- [ ] Error middleware tests

#### Integration Tests
- [ ] Restaurant API tests (11 endpoints)
- [ ] Menu API tests (9 endpoints)
- [ ] Order API tests (8 endpoints)
- [ ] Payment API tests (5 endpoints)
- [ ] Driver API tests (7 endpoints)
- [ ] Admin API tests (12 endpoints)

#### End-to-End Tests
- [ ] Complete order flow (browse → order → payment → delivery)
- [ ] Multi-user scenarios
- [ ] Concurrent order handling
- [ ] Payment webhook handling

---

## Code Coverage Goals

### Current Status
- **Statements**: TBD (run `npm test`)
- **Branches**: TBD
- **Functions**: TBD
- **Lines**: TBD

### Target
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

---

## Best Practices

### 1. Test Independence
Each test should be independent and not rely on other tests.

```javascript
// ✅ Good
it('should create user', async () => {
  const user = await createTestUser('customer');
  expect(user).toBeDefined();
});

// ❌ Bad - Relies on previous test
it('should update that user', async () => {
  // Where is 'user' defined?
  user.name = 'Updated';
});
```

### 2. Clean Database Between Tests
The `setup.js` automatically clears all collections after each test.

### 3. Use Descriptive Test Names
```javascript
// ✅ Good
it('should reject signup with duplicate email', async () => {});

// ❌ Bad
it('test signup', async () => {});
```

### 4. Test Both Success and Failure Cases
```javascript
describe('User Login', () => {
  it('should login with valid credentials', async () => {});
  it('should fail with invalid password', async () => {});
  it('should fail with non-existent email', async () => {});
});
```

### 5. Mock External Services
```javascript
// Mock payment gateway
jest.mock('razorpay');
```

---

## Common Test Patterns

### Testing Protected Routes
```javascript
const user = await createTestUser('customer');
const token = generateTestToken(user._id, user.role);

const response = await request(app)
  .get('/api/protected-route')
  .set('Authorization', `Bearer ${token}`);
```

### Testing Role-Based Access
```javascript
const customer = await createTestUser('customer');
const admin = await createTestUser('admin');

const customerToken = generateTestToken(customer._id, 'customer');
const adminToken = generateTestToken(admin._id, 'admin');

// Customer should fail
const response1 = await request(app)
  .get('/api/admin/dashboard')
  .set('Authorization', `Bearer ${customerToken}`);
expect(response1.status).toBe(403);

// Admin should succeed
const response2 = await request(app)
  .get('/api/admin/dashboard')
  .set('Authorization', `Bearer ${adminToken}`);
expect(response2.status).toBe(200);
```

### Testing Validation
```javascript
it('should validate email format', async () => {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'invalid-email',
      // ... other fields
    });

  expect(response.status).toBe(400);
  expect(response.body.errors).toBeDefined();
});
```

---

## Debugging Tests

### Run Single Test
```bash
npx jest -t "should create user successfully"
```

### Show Console Logs
```bash
npx jest --verbose --no-coverage
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## Next Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Run Existing Tests**
   ```bash
   npm test
   ```

3. **Add More Tests**
   - Follow the patterns in existing test files
   - Use test helpers for common operations
   - Aim for 80%+ code coverage

4. **Set Up CI/CD**
   - Configure GitHub Actions or similar
   - Run tests on every commit
   - Block merges if tests fail

---

## Troubleshooting

### "MongoDB Memory Server failed to start"
- Increase timeout in jest.config.js
- Check available disk space

### "jest is not recognized"
```bash
npx jest
# or
npm test
```

### "Test timeout"
- Increase timeout: `jest.setTimeout(30000)`
- Check for unresolved promises

### "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check import paths

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

---

**Ready to test!** 🚀

Start with:
```bash
npm test
```
