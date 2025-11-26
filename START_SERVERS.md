# 🚀 Starting the Food Delivery Platform

## ✅ Setup Complete!

All dependencies have been installed and configuration files created.

---

## 📋 Prerequisites

Before starting the servers, make sure:

1. **MongoDB is running**
   - If using local MongoDB, start it with: `mongod`
   - Or use MongoDB Compass to start MongoDB
   - Or use MongoDB Atlas (cloud database)

---

## 🏃 Starting the Servers

### Option 1: Manual Start (Recommended for Development)

Open **TWO** terminal windows:

#### Terminal 1 - Backend Server

```bash
cd "E:\Food Delivery\backend"
npm run dev
```

✅ Backend will start on: **http://localhost:5000**

#### Terminal 2 - Frontend Server

```bash
cd "E:\Food Delivery\frontend"
npm run dev
```

✅ Frontend will start on: **http://localhost:5173**

---

## 🌐 Access the Application

Once both servers are running, open your browser to:

**http://localhost:5173**

---

## 👥 Test Accounts

You'll need to create accounts first. Here's how:

### 1. Create a Customer Account
- Go to http://localhost:5173/signup
- Choose role: **Order Food (Customer)**
- Fill in details and signup

### 2. Create a Vendor Account
- Go to http://localhost:5173/signup
- Choose role: **Sell Food (Restaurant Owner)**
- Fill in details and signup

### 3. Create a Driver Account
- Go to http://localhost:5173/signup
- Choose role: **Deliver Orders (Driver)**
- Fill in details and signup

---

## 🎯 What to Test

### Customer Flow
1. Browse restaurants on homepage
2. Click on a restaurant
3. Add items to cart
4. Go to checkout
5. Complete order (use Mock Payment)
6. Track your order

### Vendor Flow
1. Login as vendor
2. View dashboard
3. Manage menu items
4. View and accept orders

### Driver Flow
1. Login as driver
2. Toggle availability
3. View available orders
4. Accept deliveries

---

## 🐛 Troubleshooting

### Backend Errors

**"Cannot connect to MongoDB"**
```bash
# Solution 1: Start MongoDB
mongod

# Solution 2: Use MongoDB Atlas
# Update MONGO_URI in backend/.env to your Atlas connection string
```

**"Port 5000 already in use"**
```bash
# Change port in backend/.env
PORT=5001
```

### Frontend Errors

**"Cannot connect to API"**
- Make sure backend is running on http://localhost:5000
- Check VITE_API_URL in frontend/.env

**"Port 5173 already in use"**
- Vite will automatically use the next available port
- Or close the process using port 5173

---

## 📦 Installed Packages

### Backend Dependencies ✅
- express, mongoose, jsonwebtoken
- socket.io, bcryptjs
- dotenv, cors, helmet
- razorpay, stripe
- jest, supertest (for testing)

### Frontend Dependencies ✅
- react, react-dom, react-router-dom
- axios, socket.io-client
- zustand (state management)
- tailwind css (styling)
- lucide-react (icons)
- react-hot-toast (notifications)

---

## ✨ What's Working

✅ **Backend API** - 62 endpoints ready
✅ **Socket.IO** - Real-time features active
✅ **Database** - MongoDB connection configured
✅ **Frontend** - 15 pages built and ready
✅ **Authentication** - Multi-role login/signup
✅ **Payment** - Mock payment for testing

---

## 🔥 Quick Commands Reference

```bash
# Backend
cd backend
npm run dev          # Start development server
npm test             # Run tests
npm start            # Production start

# Frontend
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 📚 Next Steps

1. ✅ Start both servers
2. ✅ Create test accounts
3. ✅ Test all features
4. 🔜 Customize as needed
5. 🔜 Deploy to production

---

## 🎊 You're Ready!

Everything is set up and ready to go. Just start the servers and begin testing!

**Happy Testing! 🚀**
