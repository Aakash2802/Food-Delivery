# 🧪 API Testing Guide - Food Delivery Platform

## 🎯 Quick Test Commands (Copy & Paste)

### Setup
```bash
# 1. Start backend
cd "E:\Food Delivery\backend"
npm run dev

# 2. Test health
curl http://localhost:5000/health
```

---

## ✅ Auth API Tests

### 1. **Signup Customer**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Customer\",\"email\":\"john@example.com\",\"phone\":\"+919876543210\",\"password\":\"Password@123\",\"role\":\"customer\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Customer",
      "email": "john@example.com",
      "role": "customer"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  }
}
```

### 2. **Signup Vendor**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Vendor Singh\",\"email\":\"vendor@restaurant.com\",\"phone\":\"+919876543211\",\"password\":\"Password@123\",\"role\":\"vendor\"}"
```

### 3. **Signup Admin**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin User\",\"email\":\"admin@fooddelivery.com\",\"phone\":\"+919876543212\",\"password\":\"Admin@123\",\"role\":\"admin\"}"
```

### 4. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"Password@123\"}"
```

**Save the accessToken from response!**

### 5. **Get Profile (Protected)**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 6. **Add Address**
```bash
curl -X POST http://localhost:5000/api/auth/addresses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"label\":\"Home\",\"street\":\"123 MG Road\",\"city\":\"Bangalore\",\"state\":\"Karnataka\",\"zipCode\":\"560001\",\"coordinates\":[77.5946,12.9716],\"isDefault\":true}"
```

---

## 🏪 Restaurant API Tests

### 1. **Create Restaurant (Admin Only)**

First, login as admin and get token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@fooddelivery.com\",\"password\":\"Admin@123\"}"
```

Then create restaurant:
```bash
curl -X POST http://localhost:5000/api/admin/restaurants \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Spice Garden\",\"description\":\"Authentic Indian cuisine\",\"ownerId\":\"VENDOR_USER_ID_HERE\",\"cuisines\":[\"Indian\",\"North Indian\"],\"location\":{\"street\":\"45 Brigade Road\",\"city\":\"Bangalore\",\"state\":\"Karnataka\",\"zipCode\":\"560025\",\"coordinates\":{\"type\":\"Point\",\"coordinates\":[77.6088,12.9734]}},\"contactInfo\":{\"phone\":\"+919876543211\",\"email\":\"contact@spicegarden.com\"},\"pricing\":\"$$\",\"deliveryTime\":{\"min\":30,\"max\":45},\"deliveryFee\":30,\"minimumOrder\":100,\"commissionRate\":18}"
```

### 2. **Get All Restaurants (Public)**
```bash
curl "http://localhost:5000/api/restaurants?latitude=12.9716&longitude=77.5946&radius=10"
```

### 3. **Get Restaurant by ID**
```bash
curl http://localhost:5000/api/restaurants/RESTAURANT_ID_HERE
```

### 4. **Search Restaurants**
```bash
curl "http://localhost:5000/api/restaurants?search=indian&minRating=4&isOpen=true"
```

### 5. **Update Restaurant (Vendor)**

Login as vendor:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"vendor@restaurant.com\",\"password\":\"Password@123\"}"
```

Update restaurant:
```bash
curl -X PUT http://localhost:5000/api/vendor/restaurant \
  -H "Authorization: Bearer VENDOR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"description\":\"Updated description\",\"deliveryFee\":25}"
```

### 6. **Toggle Restaurant Open/Close (Vendor)**
```bash
curl -X PATCH http://localhost:5000/api/vendor/restaurant/status \
  -H "Authorization: Bearer VENDOR_ACCESS_TOKEN"
```

---

## 🍽️ Menu API Tests

### 1. **Create Menu Item (Vendor)**
```bash
curl -X POST http://localhost:5000/api/vendor/menu \
  -H "Authorization: Bearer VENDOR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Chicken Biryani\",\"description\":\"Fragrant basmati rice with marinated chicken\",\"category\":\"Main Course\",\"price\":299,\"isVeg\":false,\"spiceLevel\":\"medium\",\"preparationTime\":25,\"customizations\":[{\"name\":\"Size\",\"options\":[{\"label\":\"Regular\",\"price\":0,\"isDefault\":true},{\"label\":\"Large\",\"price\":100}],\"isRequired\":true,\"maxSelections\":1}]}"
```

### 2. **Get Restaurant Menu (Public)**
```bash
curl "http://localhost:5000/api/restaurants/RESTAURANT_ID/menu"
```

### 3. **Get Menu with Filters**
```bash
curl "http://localhost:5000/api/restaurants/RESTAURANT_ID/menu?category=Main%20Course&isVeg=true&isAvailable=true"
```

### 4. **Update Menu Item (Vendor)**
```bash
curl -X PUT http://localhost:5000/api/vendor/menu/MENU_ITEM_ID \
  -H "Authorization: Bearer VENDOR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"price\":279,\"isAvailable\":true}"
```

### 5. **Toggle Menu Item Availability (Vendor)**
```bash
curl -X PATCH http://localhost:5000/api/vendor/menu/MENU_ITEM_ID/availability \
  -H "Authorization: Bearer VENDOR_ACCESS_TOKEN"
```

### 6. **Search Menu Items (Public)**
```bash
curl "http://localhost:5000/api/menu/search?query=biryani&latitude=12.9716&longitude=77.5946&radius=10"
```

---

## 🧪 Complete Test Flow

### **Step-by-Step Test Scenario**

#### 1. **Create Admin User**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin User\",\"email\":\"admin@app.com\",\"phone\":\"+919999999999\",\"password\":\"Admin@123\",\"role\":\"admin\"}"
```
**Save:** `ADMIN_TOKEN`

#### 2. **Create Vendor User**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Restaurant Owner\",\"email\":\"owner@rest.com\",\"phone\":\"+919999999998\",\"password\":\"Owner@123\",\"role\":\"vendor\"}"
```
**Save:** `VENDOR_ID` and `VENDOR_TOKEN`

#### 3. **Create Customer User**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@email.com\",\"phone\":\"+919999999997\",\"password\":\"User@123\",\"role\":\"customer\"}"
```
**Save:** `CUSTOMER_TOKEN`

#### 4. **Admin Creates Restaurant**
```bash
curl -X POST http://localhost:5000/api/admin/restaurants \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Restaurant\",\"ownerId\":\"VENDOR_ID\",\"cuisines\":[\"Indian\"],\"location\":{\"street\":\"Test St\",\"city\":\"Bangalore\",\"coordinates\":{\"coordinates\":[77.5946,12.9716]}},\"contactInfo\":{\"phone\":\"+919999999998\"},\"pricing\":\"$$\",\"deliveryTime\":{\"min\":30,\"max\":45}}"
```
**Save:** `RESTAURANT_ID`

#### 5. **Vendor Adds Menu Items**
```bash
curl -X POST http://localhost:5000/api/vendor/menu \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Paneer Butter Masala\",\"category\":\"Main Course\",\"price\":249,\"isVeg\":true,\"preparationTime\":20}"
```

#### 6. **Customer Browses Restaurants**
```bash
curl "http://localhost:5000/api/restaurants?latitude=12.9716&longitude=77.5946"
```

#### 7. **Customer Views Menu**
```bash
curl "http://localhost:5000/api/restaurants/RESTAURANT_ID/menu"
```

---

## 🔍 Testing with Thunder Client (VS Code)

### Install Thunder Client
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search "Thunder Client"
4. Install

### Import Collection

Create `thunder-collection.json`:
```json
{
  "client": "Thunder Client",
  "collectionName": "Food Delivery API",
  "dateExported": "2025-01-15",
  "folders": [
    {
      "name": "Auth",
      "requests": []
    },
    {
      "name": "Restaurants",
      "requests": []
    },
    {
      "name": "Menu",
      "requests": []
    }
  ]
}
```

### Environment Variables
Create environment in Thunder Client:
```json
{
  "name": "Development",
  "data": {
    "baseUrl": "http://localhost:5000",
    "adminToken": "",
    "vendorToken": "",
    "customerToken": "",
    "restaurantId": "",
    "menuItemId": ""
  }
}
```

---

## ✅ Expected Status Codes

| Operation | Success Code | Error Codes |
|-----------|-------------|-------------|
| GET (single) | 200 | 404, 401 |
| GET (list) | 200 | 401 |
| POST (create) | 201 | 400, 401, 403 |
| PUT (update) | 200 | 400, 401, 403, 404 |
| PATCH (partial) | 200 | 400, 401, 403, 404 |
| DELETE | 200 | 401, 403, 404 |

---

## 🐛 Common Errors & Solutions

### Error: "MongooseServerSelectionError"
**Solution:** Start MongoDB
```bash
net start MongoDB
```

### Error: "Invalid token"
**Solution:** Get new token via login endpoint

### Error: "Restaurant not found"
**Solution:** Use correct restaurant ID from creation response

### Error: "You do not have a restaurant"
**Solution:** Admin must create restaurant for vendor first

---

## 📝 Testing Checklist

### Auth APIs
- [ ] Signup customer
- [ ] Signup vendor
- [ ] Signup admin
- [ ] Login
- [ ] Get profile
- [ ] Add address
- [ ] Update profile
- [ ] Change password

### Restaurant APIs
- [ ] Create restaurant (admin)
- [ ] Get all restaurants
- [ ] Get restaurant by ID
- [ ] Search restaurants
- [ ] Update restaurant (vendor)
- [ ] Toggle open/close (vendor)
- [ ] Update commission (admin)

### Menu APIs
- [ ] Create menu item (vendor)
- [ ] Get restaurant menu
- [ ] Get menu with filters
- [ ] Update menu item (vendor)
- [ ] Toggle availability (vendor)
- [ ] Delete menu item (vendor)
- [ ] Search menu items

---

## 🎯 Next Steps

After testing these APIs:
1. Create Order APIs
2. Create Payment APIs
3. Create Driver APIs
4. Create Admin Dashboard APIs
5. Implement Socket.IO for real-time updates

---

**Happy Testing! 🚀**

**Note:** Replace placeholder values (ADMIN_TOKEN, RESTAURANT_ID, etc.) with actual values from API responses.
