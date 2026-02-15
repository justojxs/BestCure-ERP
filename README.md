<p align="center">
  <img src="frontend/favicon.svg" width="80" />
</p>

<h1 align="center">BestCure ERP</h1>

<p align="center">
  <strong>A production-grade veterinary medicine distribution platform built with the MERN stack</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node.js" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

---

## Overview

BestCure ERP is a full-stack ERP system designed for veterinary medicine distributors. It manages the end-to-end workflow of inventory tracking, order processing, billing, and analytics — with role-based access for **admins**, **staff**, and **clinic customers**.

Built as a real-world demonstration of production engineering practices: ACID-compliant order transactions, role-based authorization, structured logging, rate limiting, CI/CD, and comprehensive testing.

---

## Features

### 🏥 Admin Dashboard
- Real-time KPIs: revenue, orders, inventory value, fulfillment rate
- Revenue trend charts (12-month) and order status distribution
- Low stock alerts with severity levels
- Top-selling products and supplier breakdown

### 📦 Inventory Management
- Full CRUD for veterinary products
- Batch tracking, expiry date monitoring, category filtering
- Low-stock and expiry alerts
- Search and sort with server-side filtering

### 🛒 Order Processing
- Transactional order creation with **atomic stock deduction** (MongoDB sessions)
- Automatic GST (18%) calculation
- Accept/reject workflow with stock rollback on rejection
- Order status filtering and pagination

### 💰 Billing
- Invoice generation from accepted orders
- Line-item breakdown with tax calculation
- Customer-wise billing history

### 🏪 Customer Portal
- Self-service product browsing and ordering
- Order history with status tracking
- Isolated access — customers only see their own data

### 🔐 Authentication & Authorization
- JWT-based authentication with role-based access control (RBAC)
- Three roles: `admin`, `staff`, `customer`
- Protected routes on both frontend and backend
- Separate rate limiting for auth endpoints

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Recharts, Lucide Icons |
| **Backend** | Node.js, Express 5, Mongoose 9 |
| **Database** | MongoDB (Atlas or local) |
| **Auth** | JWT, bcryptjs |
| **Build** | Vite 6 |
| **Testing** | Jest 29, Supertest, mongodb-memory-server |
| **CI/CD** | GitHub Actions |
| **Infra** | Docker, Docker Compose |
| **Security** | Helmet, express-rate-limit, CORS, input validation (express-validator) |
| **Logging** | Custom structured logger (JSON in prod, colorized in dev) |

---

## Architecture

```
bestcure-erp/
├── backend/
│   ├── controllers/        # Route handlers (business logic)
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/          # Express middleware
│   │   ├── authMiddleware.js    # JWT verification + RBAC
│   │   ├── errorHandler.js      # Centralized error handling
│   │   └── validate.js          # express-validator results check
│   ├── models/              # Mongoose schemas
│   │   ├── Order.js             # With compound indexes
│   │   ├── Product.js           # With virtuals (isLowStock, isExpired)
│   │   └── User.js              # With password hashing
│   ├── routes/              # Express routers
│   │   ├── analyticsRoutes.js   # 12-query parallel aggregation pipeline
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── utils/               # Shared utilities
│   │   ├── AppError.js          # Custom error class
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   └── logger.js            # Structured logger
│   ├── validators/          # express-validator rule chains
│   ├── __tests__/           # Integration tests
│   ├── seed.js              # Database seeder (idempotent)
│   └── server.js            # Entry point, middleware setup
├── frontend/
│   ├── components/          # Shared React components
│   │   ├── BestCureLogo.jsx     # Custom SVG brand logo
│   │   └── Layout.jsx           # Sidebar layout + navigation
│   ├── context/
│   │   └── AuthContext.jsx      # Auth state management
│   ├── pages/               # Route-level page components
│   │   ├── Dashboard.jsx        # Admin analytics dashboard
│   │   ├── Inventory.jsx        # Product management
│   │   ├── Orders.jsx           # Order processing (admin/staff)
│   │   ├── Billing.jsx          # Invoice management
│   │   ├── CustomerPortal.jsx   # Customer-facing ordering
│   │   ├── OrderHistory.jsx     # Customer order history
│   │   └── Login.jsx            # Authentication page
│   ├── services/
│   │   └── api.js               # API client module
│   ├── App.jsx              # Router + protected routes
│   ├── index.css            # Design system + global styles
│   └── index.html           # Entry HTML
├── Dockerfile               # Multi-stage production build
├── docker-compose.yml       # Full-stack dev/prod compose
├── .github/workflows/ci.yml # CI pipeline (lint + test + build)
├── eslint.config.js         # ESLint flat config
├── jest.config.js           # Test configuration
├── vite.config.ts           # Vite build configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bestcure-erp.git
cd bestcure-erp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Environment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/bestcure_erp` |
| `PORT` | Server port | `5001` |
| `JWT_SECRET` | JWT signing secret (use a long random string) | — |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |

### Seed the Database

```bash
npm run seed          # Seed with demo data (idempotent)
npm run seed -- --reset  # Reset and re-seed
```

This creates:
- **4 users**: 1 admin, 1 staff, 2 clinic customers (password: `demo1234`)
- **12 products**: across 5 categories
- **25 orders**: with realistic dates and varying statuses

### Running Development

```bash
npm run dev
```

This starts both the **Vite dev server** (port 3000) and the **Express API** (port 5001) concurrently.

### Running with Docker

```bash
# Start the full stack
docker compose up --build

# Or in detached mode
docker compose up -d --build
```

The app will be available at `http://localhost:5001`.

---

## API Documentation

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Private | Get current user profile |

### Products

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/products` | Private | List products (with filter/search) |
| `GET` | `/api/products/:id` | Private | Get single product |
| `POST` | `/api/products` | Admin, Staff | Create a product |
| `PUT` | `/api/products/:id` | Admin, Staff | Update a product |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |

### Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/orders` | Private | List orders (customers see own) |
| `GET` | `/api/orders/:id` | Private | Get single order |
| `POST` | `/api/orders` | Customer | Create a new order |
| `PUT` | `/api/orders/:id/status` | Admin, Staff | Accept or reject an order |

### Analytics

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/analytics/dashboard` | Admin | Comprehensive dashboard KPIs |

### Health

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/health` | Public | Server health check |

---

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Tests use **mongodb-memory-server** for isolated, in-memory database testing — no external MongoDB required.

### Test Coverage

| Suite | Tests | Coverage |
|-------|-------|----------|
| Auth API | 9 | Login, validation, profile retrieval, token verification |
| Products API | 14 | CRUD, RBAC, filtering, validation |
| Orders API | 18 | Transactions, stock, GST, status workflow, customer isolation |

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `umesh@bestcure.com` | `demo1234` |
| Staff | `ojas@bestcure.com` | `demo1234` |
| Customer | `happypaws@clinic.com` | `demo1234` |
| Customer | `citypet@clinic.com` | `demo1234` |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (frontend + backend) |
| `npm run build` | Production build (Vite) |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint frontend + backend |
| `npm run seed` | Seed database with demo data |

---

## Deployment

### Vercel / Railway / Render

1. Set environment variables in the platform dashboard
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Ensure `NODE_ENV=production`

### Docker

```bash
docker compose up -d --build
```

---

## License

MIT © [Ojas Gupta](https://github.com/justojxs)
