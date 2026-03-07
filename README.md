# LMS-BE

A Learning Management System backend built with **NestJS**, **TypeORM**, **PostgreSQL**, and **Keycloak** for authentication.

## Tech Stack

- **Runtime:** Node.js 22
- **Framework:** NestJS 11
- **Language:** TypeScript 5
- **Database:** PostgreSQL (via TypeORM)
- **Authentication:** Keycloak (JWT / OIDC) with Passport
- **API Docs:** Swagger (available at `/api/docs`)
- **Containerization:** Docker (multi-stage build)

## Features

- **Keycloak Authentication** — Global JWT guard with `@Public()` decorator to opt out individual routes
- **Role-Based Access Control** — `@Roles()` decorator backed by a global `RolesGuard` (supports realm and client roles)
- **Lesson Completion Tracking** — Mark/unmark lessons as complete and query per-lesson or per-course progress
- **Course Progress** — Aggregated progress percentage across all lessons in a course
- **Swagger UI** — Interactive API documentation with Bearer token support

## Project Structure

```
src/
├── auth/               # Authentication module (Keycloak strategy, guards, decorators)
├── categories/         # Categories (entities, DTOs)
├── common/             # Shared DTOs, entities, interfaces
├── config/             # App configuration (Keycloak config)
├── courses/            # Course entity
├── database/           # TypeORM / PostgreSQL connection
├── enrollments/        # Enrollment entities & DTOs
├── lessons/            # Lesson entity
├── progress/           # Lesson completion & course progress tracking
├── users/              # User entities & DTOs
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## Prerequisites

- Node.js >= 22
- PostgreSQL
- Keycloak server (v26.x+ recommended)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/skill-wanderer/LMS-BE.git
cd LMS-BE
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=lms

# Keycloak
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=lms
KEYCLOAK_CLIENT_ID=lms-backend

# Application
PORT=3000
```

> See [docs/keycloak-setup.md](docs/keycloak-setup.md) for detailed Keycloak configuration steps.

### 4. Run the application

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The server starts at `http://localhost:3000` and Swagger docs are available at `http://localhost:3000/api/docs`.

## Docker

```bash
# Build image
docker build -t lms-be .

# Run container
docker run -p 3000:3000 --env-file .env lms-be
```

## API Endpoints

### Auth

| Method | Path            | Description                        |
|--------|-----------------|------------------------------------|
| `GET`  | `/auth/profile` | Get current user profile from token |

### Progress

| Method   | Path                                                     | Description                  |
|----------|----------------------------------------------------------|------------------------------|
| `POST`   | `/courses/{courseSlug}/lessons/{lessonSlug}/complete`    | Mark lesson as complete      |
| `DELETE`  | `/courses/{courseSlug}/lessons/{lessonSlug}/complete`    | Unmark lesson completion     |
| `GET`    | `/courses/{courseSlug}/lessons/{lessonSlug}/complete`    | Get lesson completion status |
| `GET`    | `/courses/{courseSlug}/progress`                         | Get course progress          |

> All endpoints (except those decorated with `@Public()`) require a valid Keycloak JWT Bearer token.

## Scripts

| Command              | Description                        |
|----------------------|------------------------------------|
| `npm run start:dev`  | Start in watch mode                |
| `npm run start:prod` | Start production build             |
| `npm run build`      | Compile TypeScript                 |
| `npm run lint`       | Lint and auto-fix                  |
| `npm run format`     | Format code with Prettier          |
| `npm test`           | Run unit tests                     |
| `npm run test:cov`   | Run tests with coverage            |
| `npm run test:e2e`   | Run end-to-end tests               |

## Documentation

- [Keycloak Setup Guide](docs/keycloak-setup.md)
- [Lesson Completion API](docs/lesson-completion-api.md)

## License

[Apache 2.0](LICENSE)