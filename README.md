# OpenJob RESTful API

A RESTful API for a job portal platform, built with **Node.js**, **Express 5**, and **PostgreSQL**. It handles users, companies, job categories, job postings, applications, bookmarks, profiles, and document uploads.

The project demonstrates a production-style backend setup: JWT authentication with refresh tokens, request validation, Redis caching, RabbitMQ message publishing, database migrations, centralized error handling, and a domain-oriented folder structure.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [API Endpoints](#api-endpoints)
- [Response Format](#response-format)
- [Caching](#caching)
- [Message Broker](#message-broker)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Features

### Authentication & Security
- **JWT authentication** with an access token (3-hour expiry) and a refresh token
- **Refresh token rotation** stored in the `authentications` table
- **Logout** that invalidates the refresh token
- **Password hashing** with bcrypt
- **Protected endpoints** via `Authorization: Bearer <access_token>`; authorization is currently token-based, so role and resource-ownership checks are not enforced per endpoint yet
- **Request validation** using Joi (body and query parameters)
- **CORS** enabled

### Core Domain
- **Users** — registration, profile detail, and profile update with `user` / `company` roles
- **Companies** — full CRUD, owned by a user
- **Categories** — full CRUD for job categories
- **Jobs** — full CRUD with job type, experience level, location type, city, salary range, salary visibility, and open/closed status
- **Job search** — filter by job title and company name (case-insensitive partial match)
- **Applications** — apply for a job, list applications, update status (`pending`, `reviewed`, `accepted`, `rejected`), and delete applications
- **Duplicate prevention** — a user can only apply once to the same job (unique constraint)
- **Bookmarks** — save, view, and remove bookmarked jobs
- **Profile** — aggregated view of the authenticated user's profile, applications, and bookmarks
- **Documents** — upload PDF files (max 5 MB) stored on local disk under `src/services/documents/files`, list, preview inline, and delete documents

### Infrastructure
- **PostgreSQL** with connection pooling (`pg`)
- **Versioned migrations** using `node-pg-migrate`
- **Redis caching** with a cache-aside pattern, TTL, and cache invalidation on writes; cache logic currently lives directly in the repositories/services rather than a separate abstraction layer
- **RabbitMQ** message publishing for new job applications (durable queue); this repository implements the producer, while the consumer lives in [OpenJob-Consumer](https://github.com/fath0ny/OpenJob-Consumer)
- **Centralized error handling** with custom exception classes
- **Standardized JSON response envelope**
- **ESLint** for code quality

---

## Tech Stack

| Category | Technology |
| --- | --- |
| Runtime | Node.js (ES Modules) |
| Framework | Express.js 5 |
| Database | PostgreSQL |
| DB Client | `pg` (connection pool) |
| Migrations | `node-pg-migrate` |
| Cache | Redis (`redis`) |
| Message Broker | RabbitMQ (`amqplib`) |
| Authentication | `jsonwebtoken`, `bcrypt` |
| Validation | `joi` |
| File Upload | `multer` |
| ID Generation | `nanoid` |
| Configuration | `dotenv` |
| Middleware | `cors` |
| Tooling | ESLint, Nodemon, Git |

---

## Architecture

The codebase is organized by domain. Each domain owns its routes, controller, repository, and validator.

```
.
├── migrations/                     # Versioned PostgreSQL migrations
├── src/
│   ├── cache/
│   │   └── redis-service.js        # Redis client wrapper
│   ├── exceptions/                 # Custom error classes
│   ├── middlewares/
│   │   ├── auth.js                 # Bearer token verification
│   │   ├── error.js                # Centralized error handler
│   │   └── validate.js             # Joi body/query validation
│   ├── routes/
│   │   └── index.js                # Route aggregator
│   ├── security/
│   │   └── token-manager.js        # JWT sign/verify helpers
│   ├── services/
│   │   ├── applications/
│   │   ├── authentication/
│   │   ├── bookmarks/
│   │   ├── categories/
│   │   ├── companies/
│   │   ├── documents/
│   │   ├── jobs/
│   │   ├── profile/
│   │   └── users/
│   ├── utils/
│   │   └── response.js             # Standard response helper
│   ├── server/
│   │   └── index.js                # Express app setup
│   └── server.js                   # Entry point
├── eslint.config.js
├── package.json
└── .env
```

Each service typically contains:

```
<service>/
├── controller/       # Request handling and response shaping
├── repositories/     # SQL queries and cache interaction
├── routes/           # Endpoint definitions
├── validator/        # Joi schemas
└── producers/        # RabbitMQ publishers (applications only)
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (ES Modules support)
- PostgreSQL
- Redis
- RabbitMQ (optional; application creation still succeeds if publishing fails)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/fath0ny/OpenJob-RESTful-API.git
cd OpenJob-RESTful-API

# 2. Install dependencies
npm install

# 3. Create the database
createdb openjob

# 4. Configure environment variables
cp .env.example .env   # or create .env manually
# then edit .env with your local credentials

# 5. Run database migrations
npm run migrate up -- --envPath .env

# 6. Start the development server
npm run start:dev
```

The server will be available at `http://localhost:3000` by default (configurable via `HOST` and `PORT`).

---

## Environment Variables

Create a `.env` file in the project root:

```env
# PostgreSQL
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=openjob
PGHOST=localhost
PGPORT=5432

# Server
HOST=localhost
PORT=3000

# JWT
ACCESS_TOKEN_KEY=your-access-token-secret
REFRESH_TOKEN_KEY=your-refresh-token-secret

# Redis
REDIS_HOST=localhost

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Optional: single AMQP connection string (takes precedence over RABBITMQ_*)
# AMQP_URL=amqp://guest:guest@localhost:5672
```

| Variable | Description | Required |
| --- | --- | --- |
| `PGUSER` | PostgreSQL username | Yes |
| `PGPASSWORD` | PostgreSQL password | Yes |
| `PGDATABASE` | PostgreSQL database name | Yes |
| `PGHOST` | PostgreSQL host | Yes |
| `PGPORT` | PostgreSQL port | Yes |
| `HOST` | Server host | Yes |
| `PORT` | Server port | Yes |
| `ACCESS_TOKEN_KEY` | Secret key for access tokens | Yes |
| `REFRESH_TOKEN_KEY` | Secret key for refresh tokens | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `RABBITMQ_HOST` | RabbitMQ host | No* |
| `RABBITMQ_PORT` | RabbitMQ port (default `5672`) | No* |
| `RABBITMQ_USER` | RabbitMQ username | No* |
| `RABBITMQ_PASSWORD` | RabbitMQ password | No* |
| `AMQP_URL` | Full AMQP URL, overrides `RABBITMQ_*` | No |
| `MAIL_*` | Reserved for future email notifications (not used yet) | No |

\* Required only if you want new-application events to be published successfully.

---

## Database Migrations

Migrations are managed with `node-pg-migrate` and located in `migrations/`.

```bash
# Apply all pending migrations
npm run migrate up -- --envPath .env

# Roll back the latest migration
npm run migrate down -- --envPath .env

# Create a new migration file
npx node-pg-migrate create add-some-column
```

If you prefer a single connection string, set `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/openjob
```

---

## API Endpoints

Base URL: `http://localhost:3000`

Endpoints marked with 🔒 require an `Authorization: Bearer <access_token>` header.

### Users

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/users` | Register a new user | — |
| `GET` | `/users/:id` | Get user by ID | — |
| `PUT` | `/users/:id` | Update user | 🔒 |

### Authentication

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/authentications` | Login and obtain access + refresh tokens | — |
| `PUT` | `/authentications` | Refresh the access token | — |
| `DELETE` | `/authentications` | Logout (invalidate refresh token) | 🔒 |

### Companies

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/companies` | List companies | — |
| `GET` | `/companies/:id` | Get company by ID (cached) | — |
| `POST` | `/companies` | Create a company | 🔒 |
| `PUT` | `/companies/:id` | Update a company | 🔒 |
| `DELETE` | `/companies/:id` | Delete a company | 🔒 |

### Categories

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/categories` | List categories | — |
| `GET` | `/categories/:id` | Get category by ID | — |
| `POST` | `/categories` | Create a category | 🔒 |
| `PUT` | `/categories/:id` | Update a category | 🔒 |
| `DELETE` | `/categories/:id` | Delete a category | 🔒 |

### Jobs

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/jobs?title=&company-name=` | List jobs with optional filters | — |
| `GET` | `/jobs/company/:companyId` | List jobs by company | — |
| `GET` | `/jobs/category/:categoryId` | List jobs by category | — |
| `GET` | `/jobs/:id` | Get job by ID | — |
| `POST` | `/jobs` | Create a job | 🔒 |
| `PUT` | `/jobs/:id` | Update a job | 🔒 |
| `DELETE` | `/jobs/:id` | Delete a job | 🔒 |

### Applications

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/applications` | Apply for a job | 🔒 |
| `GET` | `/applications` | List all applications | 🔒 |
| `GET` | `/applications/user/:userId` | List applications by user (cached) | 🔒 |
| `GET` | `/applications/job/:jobId` | List applications by job (cached) | 🔒 |
| `GET` | `/applications/:id` | Get application by ID (cached) | 🔒 |
| `PUT` | `/applications/:id` | Update application status | 🔒 |
| `DELETE` | `/applications/:id` | Delete an application | 🔒 |

### Bookmarks

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/jobs/:jobId/bookmark` | Bookmark a job | 🔒 |
| `GET` | `/jobs/:jobId/bookmark/:id` | Get a bookmark by ID | 🔒 |
| `DELETE` | `/jobs/:jobId/bookmark` | Remove a bookmark | 🔒 |
| `GET` | `/bookmarks` | List the current user's bookmarks (cached) | 🔒 |

### Profile

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/profile` | Get the current user's profile | 🔒 |
| `GET` | `/profile/applications` | Get the current user's applications | 🔒 |
| `GET` | `/profile/bookmarks` | Get the current user's bookmarks | 🔒 |

### Documents

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/documents` | Upload a PDF (`multipart/form-data`, field: `document`) | 🔒 |
| `GET` | `/documents` | List documents | — |
| `GET` | `/documents/:id` | Preview a PDF inline | — |
| `DELETE` | `/documents/:id` | Delete a document and its file | 🔒 |

Uploaded files are stored on local disk under `src/services/documents/files`; object storage is not used yet.

---

## Response Format

All responses use a consistent envelope:

```json
{
  "code": 200,
  "status": "success",
  "message": "Jobs berhasil ditampilkan",
  "data": {}
}
```

On error:

```json
{
  "code": 404,
  "status": "failed",
  "message": "Job tidak ditemukan",
  "data": null
}
```

### Status Codes

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Resource created |
| `400` | Validation error / bad request |
| `401` | Missing or invalid token / invalid credentials |
| `403` | Forbidden (reserved for authorization rules) |
| `404` | Resource not found |
| `500` | Internal server error |

---

## Caching

Redis is used as a cache-aside layer for read-heavy endpoints:

- Company detail: `companies:<id>`
- User detail: `users:<id>`
- Application detail: `applications:<id>`
- Applications by user: `applications:user:<userId>`
- Applications by job: `applications:job:<jobId>`
- User bookmarks: `bookmarks:<userId>`

Cached responses are returned with an `X-Data-Source: cache` header, while fresh database reads return `X-Data-Source: database`. Cache entries are invalidated automatically on create, update, and delete operations. The cache logic is wired directly into the repositories and services; it is not yet extracted into a dedicated abstraction layer.

---

## Message Broker

When a new job application is created, the API publishes an event to RabbitMQ:

- **Exchange/queue:** `applications:new` (durable)
- **Payload:** `{ "application_id": "<id>" }`

Publishing is non-blocking: failures are logged and do not fail the HTTP request. The publisher is implemented directly in `src/services/applications/producers/application-queue-service.js` and invoked from the application flow, without a separate messaging abstraction. This repository covers the **producer** side only; the consumer that processes the queue is maintained separately in [OpenJob-Consumer](https://github.com/fath0ny/OpenJob-Consumer).

---

## Database Schema

| Table | Description |
| --- | --- |
| `users` | User accounts (`id`, `name`, `email`, `password`, `role`) |
| `authentications` | Active refresh tokens |
| `companies` | Companies owned by users |
| `categories` | Job categories |
| `jobs` | Job postings linked to companies and categories |
| `applications` | Job applications with status and optional document metadata |
| `bookmarks` | Saved jobs per user |
| `documents` | Uploaded PDF metadata and storage path |

Key constraints:

- Unique email per user
- Unique category name
- Unique application per `(job_id, user_id)`
- Cascading deletes for jobs, applications, and bookmarks tied to their parent records

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start the server with Nodemon |
| `npm run start:prod` | Start the server with `NODE_ENV=production` |
| `npm run migrate` | Run `node-pg-migrate` |
| `npm run lint` | Lint the `src` directory with ESLint |

Automated tests are not included in this repository, so `npm run lint` is currently the only automated quality check.

---

## License

This project is licensed under the **ISC License**.

---

## Author

**fath0ny**
GitHub: [https://github.com/fath0ny](https://github.com/fath0ny)

Repository: [https://github.com/fath0ny/OpenJob-RESTful-API](https://github.com/fath0ny/OpenJob-RESTful-API)
