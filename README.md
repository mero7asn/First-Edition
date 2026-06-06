# First Edition (FE) - Limited Edition T-Shirt E-commerce Platform

A modern, premium e-commerce platform for limited-edition T-shirts with drop-based commerce, built with React, Node.js, Express, and MongoDB.

## Features

### Customer Features
- Browse limited-edition T-shirts
- View product drops with countdown timers
- Add products to cart and wishlist
- Secure checkout process
- User account management
- Order tracking
- Newsletter subscription
- Responsive design

### Admin Features
- Product management (CRUD operations)
- Drop management and scheduling
- Order management and tracking
- Customer management
- Coupon and promotion management
- Banner/CMS management
- Analytics dashboard
- Inventory control

## Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for emails
- Stripe for payments

### Frontend
- React 18
- React Router v6
- Context API for state management
- Axios for API calls
- React Icons
- React Toastify

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
copy .env.example .env
```

4. Update `.env` with your configurations:
- MongoDB URI
- JWT Secret
- Email credentials
- Stripe keys

5. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile

### Products
- GET `/api/products` - Get all products
- GET `/api/products/featured` - Get featured products
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders/my-orders` - Get user orders
- GET `/api/orders` - Get all orders (Admin)
- GET `/api/orders/:id` - Get single order
- PUT `/api/orders/:id` - Update order status (Admin)
- GET `/api/orders/stats` - Get order statistics (Admin)

### Drops
- GET `/api/drops` - Get all drops
- GET `/api/drops/:id` - Get single drop
- POST `/api/drops` - Create drop (Admin)
- PUT `/api/drops/:id` - Update drop (Admin)
- DELETE `/api/drops/:id` - Delete drop (Admin)
- POST `/api/drops/:id/subscribe` - Subscribe to drop notifications

### Coupons
- POST `/api/coupons/validate` - Validate coupon
- GET `/api/coupons` - Get all coupons (Admin)
- POST `/api/coupons` - Create coupon (Admin)
- PUT `/api/coupons/:id` - Update coupon (Admin)
- DELETE `/api/coupons/:id` - Delete coupon (Admin)

### CMS
- GET `/api/cms/banners/active` - Get active banners
- GET `/api/cms/banners` - Get all banners (Admin)
- POST `/api/cms/banners` - Create banner (Admin)
- PUT `/api/cms/banners/:id` - Update banner (Admin)
- DELETE `/api/cms/banners/:id` - Delete banner (Admin)
- POST `/api/cms/newsletter` - Subscribe to newsletter

## Database Models

- User
- Product
- Drop
- Order
- Coupon
- Review
- Banner
- Newsletter

## Project Structure

```
First Edition/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Default Admin Account

To create an admin account, register a user and manually update the role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/first-edition
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## License

MIT

## Contact

For support or inquiries, contact us at support@firstedition.com
