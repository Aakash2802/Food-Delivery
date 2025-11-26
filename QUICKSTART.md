# 🚀 Quick Start Guide - Food Delivery Platform

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ MongoDB installed and running (`mongod --version`)
- ✅ npm or yarn installed (`npm --version`)
- ✅ Git installed (`git --version`)

## 🏁 Quick Setup (5 Minutes)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd "E:\Food Delivery\backend"

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

**Minimum .env configuration:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=my_super_secret_jwt_key_12345
JWT_REFRESH_SECRET=my_refresh_secret_key_12345
USE_MOCK_PAYMENT=true
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend server
npm run dev
```

✅ Backend should now be running on `http://localhost:5000`

Test it: Open `http://localhost:5000/health` in your browser

---

### Step 2: Frontend Setup (Coming Next)

```bash
# Navigate to frontend directory
cd "E:\Food Delivery\frontend"

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 📊 What's Been Created So Far

### ✅ Backend (Completed)

#### 1. **Folder Structure**
```
backend/src/
├── config/          # Database & environment configuration
├── models/          # MongoDB schemas (User, Restaurant, MenuItem, Order, etc.)
├── middleware/      # Auth, validation, error handling
├── utils/           # Helper functions (JWT, calculations)
├── app.js          # Express app setup
└── server.js       # Server entry point
```

#### 2. **MongoDB Models** (6 collections)
- ✅ **User** - Customers, vendors, drivers, admins with role-based fields
- ✅ **Restaurant** - Restaurant profiles with geolocation
- ✅ **MenuItem** - Menu items with customizations & pricing
- ✅ **Order** - Order management with status tracking
- ✅ **Review** - Ratings & reviews system
- ✅ **PromoCode** - Discount codes with usage limits

#### 3. **Middleware**
- ✅ Authentication (JWT token verification)
- ✅ Role-based access control (customer/vendor/driver/admin)
- ✅ Input validation (Joi schemas)
- ✅ Error handling (centralized)
- ✅ Rate limiting (protect against abuse)

#### 4. **Configuration**
- ✅ Database connection with MongoDB
- ✅ Environment variables setup
- ✅ Security headers (Helmet)
- ✅ CORS configuration

---

## 🔜 What's Next to Build

### Step 3: Create Controllers & Routes

**Need to create:**
1. `src/controllers/` - Business logic for each feature
2. `src/routes/` - Express route definitions
3. Connect routes in `src/app.js`

### Step 4: Socket.IO Integration

**Need to create:**
1. `src/socket/socket.handler.js` - Socket.IO setup
2. Real-time event handlers for:
   - Order status updates
   - Driver location tracking
   - Live notifications

### Step 5: Frontend Development

**Need to create:**
1. React + Vite project structure
2. Components (Auth, Restaurant, Cart, Order, Map)
3. Pages (Home, Restaurant Detail, Checkout, Tracking, Admin)
4. API service integration
5. Socket.IO client integration

---

## 🧪 Testing the Backend

### 1. Test Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### 2. Test Database Connection

Open MongoDB Compass or mongo shell:
```bash
mongo
use food-delivery
db.users.find()
```

---

## 📝 Next Development Tasks

### Priority 1: Complete Backend (2-3 days)
- [ ] Create auth controller & routes (signup/login/refresh)
- [ ] Create restaurant controller & routes (CRUD operations)
- [ ] Create menu controller & routes (CRUD operations)
- [ ] Create order controller & routes (create/update/track)
- [ ] Create payment controller (mock & Razorpay integration)
- [ ] Create admin controller (dashboard, analytics)
- [ ] Test all APIs with Postman/Thunder Client

### Priority 2: Socket.IO (1 day)
- [ ] Setup Socket.IO server
- [ ] Implement order status events
- [ ] Implement driver location tracking
- [ ] Test with Socket.IO client

### Priority 3: Frontend (3-4 days)
- [ ] Setup React + Vite + Tailwind
- [ ] Create authentication flow
- [ ] Create restaurant browsing & menu view
- [ ] Create cart & checkout flow
- [ ] Create order tracking with map
- [ ] Create admin panel

### Priority 4: Integration & Testing (1-2 days)
- [ ] Connect frontend with backend APIs
- [ ] Test real-time features
- [ ] Test payment flow
- [ ] Bug fixes and polish

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
```bash
# Start MongoDB service
# Windows:
net start MongoDB

# Mac/Linux:
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows: Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Environment Variables Not Loading

**Problem:** Server starts but crashes with "Missing required environment variable"

**Solution:**
- Ensure `.env` file exists in `backend/` directory
- Check that `.env` is not in `.gitignore` (well, it should be, but copy from `.env.example`)
- Restart the server after changing `.env`

---

## 📚 Useful Commands

### Backend Development
```bash
npm run dev         # Start with nodemon (auto-restart)
npm start          # Start production mode
npm test           # Run tests
npm run seed       # Seed database with sample data (once created)
```

### Database Management
```bash
# Connect to MongoDB
mongo

# Show databases
show dbs

# Use food-delivery database
use food-delivery

# Show collections
show collections

# Query users
db.users.find().pretty()

# Drop database (careful!)
db.dropDatabase()
```

---

## 🎯 Quick Feature Checklist

Track your progress:

**Backend Core:**
- [x] MongoDB Models
- [x] Authentication Middleware
- [x] Validation System
- [ ] Auth Routes (signup/login)
- [ ] Restaurant CRUD
- [ ] Menu CRUD
- [ ] Order Management
- [ ] Payment Integration
- [ ] Socket.IO Events

**Frontend Core:**
- [ ] Project Setup
- [ ] Auth Pages
- [ ] Restaurant Listing
- [ ] Menu & Cart
- [ ] Checkout Flow
- [ ] Order Tracking
- [ ] Admin Panel

**Integration:**
- [ ] API Integration
- [ ] WebSocket Integration
- [ ] Payment Testing
- [ ] End-to-End Testing

---

## 💡 Development Tips

1. **Use Thunder Client/Postman** - Test APIs as you build them
2. **MongoDB Compass** - Visualize your database
3. **React DevTools** - Debug React components
4. **Console Logging** - Liberally log during development
5. **Git Commits** - Commit after each feature
6. **Code Comments** - Document complex logic

---

## 🆘 Need Help?

1. Check the main [README.md](README.md)
2. Review [API Documentation](docs/API.md) (once created)
3. Look at model schemas in `backend/src/models/`
4. Check middleware logic in `backend/src/middleware/`

---

## ✨ You're Ready!

Backend foundation is set up. Now you need to:
1. ✅ Test health endpoint
2. ✅ Verify MongoDB connection
3. 🚧 Create route handlers (next step)
4. 🚧 Build frontend
5. 🚧 Integrate everything

**Estimated time to MVP:** 6-8 weeks with 3 developers

Good luck building your food delivery platform! 🚀🍔

---

**Created:** January 2025
**Status:** Backend Foundation Complete, Routes & Frontend Pending
