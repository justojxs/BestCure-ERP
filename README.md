# BestCure ERP

A full-stack veterinary medicine distribution platform built with the MERN stack. Handles inventory tracking, order processing, billing, and analytics with role-based access for admins, staff, and clinic customers.

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Admin Dashboard** — Real-time KPIs, revenue trends, low stock alerts, top sellers
- **Inventory Management** — CRUD with batch tracking, expiry monitoring, search/filter
- **Order Processing** — Transactional order creation with atomic stock deduction (MongoDB sessions), GST calculation, accept/reject workflow
- **Billing** — Invoice generation from accepted orders with tax breakdown
- **Customer Portal** — Self-service ordering, order history, isolated per-customer data
- **Auth** — JWT authentication, three roles (admin/staff/customer), protected routes on both ends

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, React Router 7, Recharts, Lucide Icons |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB (Atlas or local) |
| Auth | JWT, bcryptjs |
| Build | Vite 6 |
| Testing | Jest 29, Supertest, mongodb-memory-server |
| CI/CD | GitHub Actions |
| Infra | Docker, Docker Compose |

## Project Structure

```
bestcure-erp/
├── backend/
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth, error handling, validation
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routers
│   ├── utils/               # AppError, asyncHandler, logger
│   ├── validators/          # express-validator chains
│   ├── __tests__/           # Integration tests
│   ├── seed.js              # DB seeder
│   └── server.js            # Entry point
├── frontend/
│   ├── components/          # Layout, Logo, StatCard, etc.
│   ├── context/             # Auth context
│   ├── hooks/               # useApi, useMutation
│   ├── pages/               # Dashboard, Inventory, Orders, etc.
│   ├── services/            # API client
│   ├── App.jsx              # Router
│   └── index.css            # Design system
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/ci.yml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Setup

```bash
git clone https://github.com/justojxs/BestCure-ERP.git
cd BestCure-ERP
npm install
cp .env.example .env
# edit .env with your MongoDB URI and a JWT secret
```

### Environment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/bestcure_erp` |
| `PORT` | Server port | `5001` |
| `JWT_SECRET` | Signing secret for JWTs | — |
| `NODE_ENV` | `development` / `production` / `test` | `development` |

### Seed the Database

```bash
npm run seed            # idempotent — only inserts if collections are empty
npm run seed -- --reset # wipe and re-seed
```

Creates 4 users, 12 products, 25 orders.

### Run Development

```bash
npm run dev
```

Starts Vite (port 3000) and Express (port 5001) concurrently.

### Run with Docker

```bash
docker compose up --build
```

App available at `http://localhost:5001`.

## API

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Current user profile |

### Products

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | Private | List (with filter/search) |
| GET | `/api/products/:id` | Private | Single product |
| POST | `/api/products` | Admin, Staff | Create |
| PUT | `/api/products/:id` | Admin, Staff | Update |
| DELETE | `/api/products/:id` | Admin | Delete |

### Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/orders` | Private | List (customers see own only) |
| GET | `/api/orders/:id` | Private | Single order |
| POST | `/api/orders` | Customer | Create order |
| PUT | `/api/orders/:id/status` | Admin, Staff | Accept/reject |

### Analytics

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/analytics/dashboard` | Admin | Dashboard KPIs |

## Testing

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

Uses mongodb-memory-server (replica set) so no external DB is needed.

**39 tests** across 3 suites: auth (9), products (13), orders (17).

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `umesh@bestcure.com` | `demo1234` |
| Staff | `ojas@bestcure.com` | `demo1234` |
| Customer | `happypaws@clinic.com` | `demo1234` |

## Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Start dev server (frontend + backend) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Lint everything |
| `npm run seed` | Seed database |

## License

MIT
