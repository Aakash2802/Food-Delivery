# 📝 Common Commands Cheatsheet

Quick reference for development commands.

---

## 🚀 Backend Commands

### Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
```

### Development
```bash
npm run dev          # Start with nodemon (auto-restart on changes)
npm start            # Start production mode
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Generate coverage report
```

### Database
```bash
npm run seed         # Seed database with sample data (when created)
```

---

## 🎨 Frontend Commands (When Created)

### Setup
```bash
cd frontend
npm install
cp .env.example .env
```

### Development
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🗄️ MongoDB Commands

### Start MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### MongoDB Shell
```bash
mongo                              # Connect to MongoDB
mongosh                            # New MongoDB shell

# Inside mongo shell:
show dbs                           # List databases
use food-delivery                  # Switch to database
show collections                   # List collections
db.users.find().pretty()           # Query users
db.restaurants.countDocuments()    # Count documents
db.orders.find({status: 'pending'}) # Filter orders
db.dropDatabase()                  # Drop current database (CAREFUL!)
```

### MongoDB Compass (GUI)
```
Connection String: mongodb://localhost:27017
Database: food-delivery
```

---

## 🔧 Git Commands

### Initial Setup
```bash
cd "E:\Food Delivery"
git init
git add .
git commit -m "Initial commit: Backend foundation"
```

### Daily Workflow
```bash
git status                         # Check status
git add .                          # Stage all changes
git commit -m "Add auth controller" # Commit with message
git log --oneline                  # View commit history
```

### Branching
```bash
git checkout -b feature/payment    # Create new branch
git checkout main                  # Switch to main
git merge feature/payment          # Merge branch
git branch -d feature/payment      # Delete branch
```

### Remote Repository (GitHub)
```bash
git remote add origin <repo-url>   # Add remote
git push -u origin main            # Push to remote
git pull origin main               # Pull from remote
```

---

## 🐳 Docker Commands (When Dockerfiles Ready)

### Build Images
```bash
# Backend
cd backend
docker build -t food-delivery-backend .

# Frontend
cd frontend
docker build -t food-delivery-frontend .
```

### Run Containers
```bash
# Backend
docker run -p 5000:5000 --env-file .env food-delivery-backend

# Frontend
docker run -p 5173:5173 food-delivery-frontend
```

### Docker Compose (When docker-compose.yml Ready)
```bash
docker-compose up -d               # Start all services
docker-compose down                # Stop all services
docker-compose logs -f backend     # View backend logs
docker-compose ps                  # List running containers
```

---

## 🧪 API Testing Commands (cURL)

### Health Check
```bash
curl http://localhost:5000/health
```

### Auth Endpoints (When Created)
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "password": "Password@123",
    "role": "customer"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password@123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Restaurant Endpoints (When Created)
```bash
# List restaurants
curl "http://localhost:5000/api/restaurants?latitude=12.9716&longitude=77.5946&radius=5"

# Get restaurant details
curl http://localhost:5000/api/restaurants/RESTAURANT_ID
```

---

## 🔍 Debugging Commands

### Check Port Usage
```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :5000
lsof -i :5173
```

### Kill Process on Port
```bash
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

### View Logs
```bash
# Backend logs (if running with pm2)
pm2 logs backend

# View last 100 lines
tail -n 100 backend/logs/app.log
```

### Check Node/npm Versions
```bash
node --version
npm --version
mongod --version
```

---

## 📦 Package Management

### Update Dependencies
```bash
npm update                    # Update all packages
npm outdated                  # Check outdated packages
npm audit                     # Security audit
npm audit fix                 # Fix vulnerabilities
```

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🧹 Cleanup Commands

### Clear Node Modules
```bash
# Windows
rmdir /s node_modules
del package-lock.json

# Mac/Linux
rm -rf node_modules package-lock.json
```

### Clear MongoDB Database
```bash
mongo food-delivery --eval "db.dropDatabase()"
```

---

## 🚢 Deployment Commands

### Build Production
```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ folder
npx serve -s dist -p 3000
```

### Environment Variables
```bash
# Export variables (Linux/Mac)
export NODE_ENV=production
export PORT=5000

# Windows CMD
set NODE_ENV=production
set PORT=5000

# Windows PowerShell
$env:NODE_ENV="production"
$env:PORT="5000"
```

---

## 🔐 SSL/HTTPS (Production)

### Generate SSL Certificate (Let's Encrypt)
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

### Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/food-delivery
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx      # Reload nginx
```

---

## 📊 Monitoring Commands

### Check Memory Usage
```bash
# Process memory
ps aux | grep node

# System memory
free -m                          # Linux
top                              # All systems
```

### Database Stats
```bash
mongo food-delivery --eval "db.stats()"
```

---

## 🎯 Quick Start Commands

### First Time Setup
```bash
# 1. Navigate to project
cd "E:\Food Delivery\backend"

# 2. Install dependencies
npm install

# 3. Create .env from example
cp .env.example .env

# 4. Start MongoDB (if local)
net start MongoDB

# 5. Run backend
npm run dev
```

### Daily Development
```bash
# Terminal 1: Backend
cd "E:\Food Delivery\backend"
npm run dev

# Terminal 2: Frontend (when created)
cd "E:\Food Delivery\frontend"
npm run dev

# Terminal 3: MongoDB
mongosh
```

---

## 🆘 Troubleshooting Commands

### Reset Everything
```bash
# Stop all processes
# Kill node processes on ports 5000, 5173

# Delete node_modules
cd backend
rm -rf node_modules package-lock.json
npm install

# Clear MongoDB
mongo food-delivery --eval "db.dropDatabase()"

# Restart MongoDB
net stop MongoDB
net start MongoDB

# Restart backend
npm run dev
```

### Check Logs
```bash
# Backend console logs
# Already visible in terminal

# MongoDB logs
# Windows: C:\Program Files\MongoDB\Server\6.0\log\mongod.log
# Linux: /var/log/mongodb/mongod.log
```

---

## 💡 Pro Tips

### Use pm2 for Production
```bash
npm install -g pm2
pm2 start src/server.js --name food-delivery-backend
pm2 logs
pm2 restart food-delivery-backend
pm2 stop food-delivery-backend
```

### Use Thunder Client / Postman
- Install Thunder Client extension in VS Code
- Import API collection
- Save common requests

### Use MongoDB Compass
- Visual database browser
- Query builder
- Import/Export data

---

## 🔖 Bookmarks

Save these URLs:
- Backend API: http://localhost:5000/api
- Frontend: http://localhost:5173
- Health Check: http://localhost:5000/health
- MongoDB Compass: mongodb://localhost:27017

---

**Last Updated:** January 2025
**Tip:** Bookmark this file for quick reference!
