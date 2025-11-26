# Food Delivery Platform

A full-stack food delivery application built with MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time order tracking, multiple user roles, and a modern UI.

## Features

- Browse restaurants and menus with real-time updates
- Multi-role support (Customer, Vendor, Driver, Admin)
- Real-time order tracking with Socket.IO
- Secure JWT authentication
- Modern responsive UI with Tailwind CSS
- Interactive maps and location tracking
- Loyalty points system

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Zustand, Socket.IO Client
**Backend:** Node.js, Express, MongoDB, Socket.IO, JWT

## Quick Start

### Prerequisites
- Node.js v14+
- MongoDB

### Installation

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Create .env files (see .env.example)
5. Seed database: `node backend/create-demo-accounts.js && node backend/seed-madurai-data.js`
6. Start backend: `cd backend && npm start`
7. Start frontend: `cd frontend && npm run dev`

### Demo Accounts
- Customer: customer@demo.com / password123
- Vendor: vendor@demo.com / password123
- Driver: driver@demo.com / password123
- Admin: admin@demo.com / password123

## License
MIT
