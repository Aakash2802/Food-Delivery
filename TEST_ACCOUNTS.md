# 🔐 TEST ACCOUNTS - Food Delivery Platform

**Date:** January 15, 2025
**Status:** All accounts ready for testing

---

## 👥 ALL TEST ACCOUNTS

### 1. 🧑‍💼 CUSTOMER ACCOUNT

**Create via Signup Page:** http://localhost:5173/signup

```
Name: John Customer
Email: customer@test.com
Phone: +91 9876543210
Role: Order Food (Customer)
Password: password123
```

**After Login:** Redirects to http://localhost:5173 (Homepage)

**What to test:**
- Browse restaurants
- View restaurant menu
- Add items to cart
- Checkout and place order
- Track order in real-time
- View order history in profile

---

### 2. 🏪 VENDOR ACCOUNT (Restaurant Owner)

**Create via Signup Page:** http://localhost:5173/signup

```
Name: Restaurant Owner
Email: vendor@test.com
Phone: +91 9876543211
Role: Sell Food (Restaurant Owner)
Password: password123
```

**After Login:** Redirects to http://localhost:5173/vendor (Vendor Dashboard)

**What to test:**
- View dashboard stats
- Add restaurant (if needed)
- Manage menu items (add/edit/delete)
- Toggle restaurant open/closed
- Receive order notifications
- Accept/reject orders
- Update order status

---

### 3. 🚗 DRIVER ACCOUNT (Delivery Partner)

**Create via Signup Page:** http://localhost:5173/signup

```
Name: John Driver
Email: driver@test.com
Phone: +91 9876543212
Role: Deliver Orders (Driver)
Password: password123
```

**After Login:** Redirects to http://localhost:5173/driver (Driver Dashboard)

**What to test:**
- Toggle availability on/off
- View available orders
- Accept deliveries
- Update delivery status
- Navigate to pickup/delivery locations
- Complete deliveries
- View earnings

---

### 4. 👨‍💼 ADMIN ACCOUNT

**Already Created in Database** ✅

```
Name: Admin User
Email: admin@test.com
Phone: +919876543213
Role: Admin
Password: password123
```

**After Login:** Redirects to http://localhost:5173/admin (Admin Dashboard)

**What to test:**
- View platform statistics
- Monitor all users
- View all restaurants
- Track total orders
- Monitor active drivers
- View platform revenue

---

## 🚀 QUICK LOGIN GUIDE

### Step 1: Go to Login Page
http://localhost:5173/login

### Step 2: Choose an account and login

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | password123 |
| Vendor | vendor@test.com | password123 |
| Driver | driver@test.com | password123 |
| Admin | admin@test.com | password123 |

---

## 📋 TESTING CHECKLIST

### ✅ Customer Testing

1. **Signup & Login**
   - [ ] Create customer account
   - [ ] Login successfully
   - [ ] Redirected to homepage

2. **Browse Restaurants**
   - [ ] View homepage
   - [ ] Use cuisine filters
   - [ ] Search for restaurants
   - [ ] Click on a restaurant

3. **Order Food**
   - [ ] View restaurant menu
   - [ ] Add items to cart
   - [ ] View cart
   - [ ] Update quantities
   - [ ] Proceed to checkout

4. **Checkout**
   - [ ] Add delivery address
   - [ ] Select payment method (Mock/COD)
   - [ ] Place order
   - [ ] See order confirmation

5. **Track Order**
   - [ ] View order tracking page
   - [ ] See order status updates
   - [ ] View estimated delivery time
   - [ ] See restaurant/driver info

6. **Profile**
   - [ ] View profile
   - [ ] See order history
   - [ ] Edit profile information

---

### ✅ Vendor Testing

1. **Signup & Login**
   - [ ] Create vendor account
   - [ ] Login successfully
   - [ ] Redirected to vendor dashboard

2. **Dashboard**
   - [ ] View today's stats
   - [ ] See recent orders
   - [ ] Toggle restaurant open/closed

3. **Menu Management**
   - [ ] Add new menu items
   - [ ] Edit existing items
   - [ ] Delete items
   - [ ] Toggle item availability
   - [ ] Set prices and categories

4. **Order Management**
   - [ ] View all orders
   - [ ] Accept new orders
   - [ ] Reject orders
   - [ ] Update order status (confirmed → preparing → ready)
   - [ ] View order details

5. **Real-time Features**
   - [ ] Receive new order notification
   - [ ] See order status updates

---

### ✅ Driver Testing

1. **Signup & Login**
   - [ ] Create driver account
   - [ ] Login successfully
   - [ ] Redirected to driver dashboard

2. **Dashboard**
   - [ ] View today's earnings
   - [ ] See completed deliveries count
   - [ ] View active orders
   - [ ] Toggle availability

3. **Delivery Management**
   - [ ] View available orders
   - [ ] Accept delivery
   - [ ] Navigate to restaurant
   - [ ] Mark as picked up
   - [ ] Navigate to customer
   - [ ] Complete delivery

4. **Real-time Features**
   - [ ] Receive order assignment notification
   - [ ] Location updates sent automatically

---

### ✅ Admin Testing

1. **Login**
   - [ ] Login as admin
   - [ ] Redirected to admin dashboard

2. **Platform Overview**
   - [ ] View total users
   - [ ] View total restaurants
   - [ ] View total orders
   - [ ] View total revenue
   - [ ] See active drivers
   - [ ] Monitor orders by status

---

## 🎯 COMPLETE TEST FLOW

### Full Order Flow Test

**You'll need all 4 accounts for this:**

1. **As Vendor:**
   - Login and add a restaurant
   - Add menu items
   - Set restaurant to "Open"

2. **As Customer:**
   - Login and browse restaurants
   - Select vendor's restaurant
   - Add items to cart
   - Complete checkout (use Mock Payment)
   - Go to order tracking page

3. **As Vendor:**
   - Receive order notification
   - Accept the order
   - Mark as "Preparing"
   - Mark as "Ready for Pickup"

4. **As Driver:**
   - Toggle availability ON
   - View the order
   - Accept the order
   - Mark as "Picked Up"
   - Mark as "Out for Delivery"
   - Complete delivery

5. **As Customer:**
   - Watch real-time status updates on tracking page
   - See order marked as "Delivered"

6. **As Admin:**
   - View the completed order in statistics
   - See updated revenue

---

## 🔧 TROUBLESHOOTING

### Can't see any restaurants?

**Solution:** You need to create a restaurant first as a vendor:
1. Login as vendor
2. Go to Menu Management
3. Add menu items
4. The restaurant will be created automatically

### Order not showing up?

**Solution:** Make sure:
1. Vendor account has created menu items
2. Restaurant is marked as "Open"
3. Customer is logged in when placing order

### Real-time features not working?

**Solution:** Check that:
1. Backend Socket.IO is running (you should see "🔌 Socket.IO initialized" in backend logs)
2. Frontend is connected (check browser console for connection messages)

---

## 💡 PRO TIPS

1. **Test in Different Browsers:** Open customer in one browser, vendor in another to test real-time features

2. **Watch Backend Logs:** Keep backend terminal visible to see real-time events

3. **Use Multiple Tabs:**
   - Tab 1: Customer view
   - Tab 2: Vendor dashboard
   - Tab 3: Driver dashboard
   - Tab 4: Admin dashboard

4. **Mock Payment:** When checking out, select "Mock Payment" for instant order placement without real payment

---

## 📊 CURRENT STATUS

✅ **Backend:** Running on http://localhost:5000
✅ **Frontend:** Running on http://localhost:5173
✅ **Database:** MongoDB connected
✅ **Socket.IO:** Active and ready
✅ **All Accounts:** Ready to use

---

## 🎉 READY TO TEST!

All accounts are created and ready. Start by creating customer, vendor, and driver accounts via the signup page, then login with the credentials above!

**Happy Testing! 🚀**
