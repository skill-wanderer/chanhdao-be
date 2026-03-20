# chanhdao-be

Backend API for **[chanhdao.vn](https://chanhdao.vn)** — a platform for learning Buddhism with AI technology support.

Built with **NestJS**, **TypeORM**, **PostgreSQL**, and **Keycloak** for authentication.

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
- **Quiz Score Management** — Submit and retrieve quiz scores per lesson
- **Public Submissions API** — Accept and store public form submissions in PostgreSQL (`jsonb`)
- **Swagger UI** — Interactive API documentation with Bearer token support

## Project Structure

```
src/
├── auth/               # Authentication module (Keycloak strategy, guards, decorators)
├── config/             # App configuration (Keycloak config)
├── database/           # TypeORM / PostgreSQL connection
├── progress/           # Lesson completion tracking
├── quiz-scores/        # Quiz score submission and retrieval
├── submissions/        # Public submissions (contact type stored as jsonb)
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
git clone https://github.com/JimmyYouhei/chanhdao-be.git
cd chanhdao-be
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
DB_NAME=chanhdao

# Keycloak
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=chanhdao
KEYCLOAK_CLIENT_ID=chanhdao-backend
# Optional explicit OIDC endpoints (recommended in production)
# KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/chanhdao
# KEYCLOAK_JWKS_URI=http://localhost:8080/realms/chanhdao/protocol/openid-connect/certs

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
docker build -t chanhdao-be .

# Run container
docker run -p 3000:3000 --env-file .env chanhdao-be
```

## API Endpoints

### Auth

| Method | Path            | Description                          |
|--------|-----------------|--------------------------------------|
| `GET`  | `/auth/profile` | Get current user profile from token  |

### Progress

| Method   | Path                                                     | Description                  |
|----------|----------------------------------------------------------|------------------------------|
| `POST`   | `/courses/{courseSlug}/lessons/{lessonSlug}/complete`    | Mark lesson as complete      |
| `DELETE` | `/courses/{courseSlug}/lessons/{lessonSlug}/complete`    | Unmark lesson completion     |
| `GET`    | `/courses/{courseSlug}/lessons/{lessonSlug}/complete`    | Get lesson completion status |
| `GET`    | `/courses/{courseSlug}/progress`                         | Get course progress          |

### Quiz Scores

| Method | Path                                                          | Description               |
|--------|---------------------------------------------------------------|---------------------------|
| `POST` | `/courses/{courseSlug}/lessons/{lessonSlug}/quiz-scores`      | Submit a quiz score       |
| `GET`  | `/courses/{courseSlug}/lessons/{lessonSlug}/quiz-scores`      | Get quiz scores for lesson|

### Submissions

| Method | Path             | Description                                         |
|--------|------------------|-----------------------------------------------------|
| `POST` | `/submissions`   | Submit public payload (`type` + `content` as jsonb)|

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
- [Quiz Score API](docs/quiz-score-api.md)
- [Submissions API](docs/submissions-api.md)

## License

[Apache 2.0](LICENSE)