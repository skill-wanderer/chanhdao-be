# Keycloak Configuration Guide

This guide walks through setting up Keycloak for the LMS backend.

---

## Prerequisites

- Keycloak server running (v26.x+ recommended)
- Admin access to the Keycloak Admin Console

---

## 1. Create the Realm

1. Open the Keycloak Admin Console (`http://localhost:8080/admin`)
2. Click the realm dropdown (top-left) → **Create realm**
3. Set **Realm name** to `lms`
4. Click **Create**

---

## 2. Create the Backend Client

1. In the `lms` realm, go to **Clients** → **Create client**
2. Configure the client:

| Setting | Value |
|---|---|
| **Client ID** | `lms-backend` |
| **Client type** | `OpenID Connect` |
| **Client authentication** | `On` (confidential) |

3. Click **Next**, then configure access:

| Setting | Value |
|---|---|
| **Standard flow** | `On` |
| **Direct access grants** | `On` (for testing — disable in production) |

4. Click **Save**

### Valid Redirect URIs

Under the client **Settings** tab, add:

```
http://localhost:3000/*
```

> Add your production URLs here when deploying.

---

## 3. Create Realm Roles

Go to **Realm roles** → **Create role** and create the following roles:

| Role | Description |
|---|---|
| `admin` | Full system administration |
| `instructor` | Can manage courses and lessons |
| `student` | Can enroll in and access courses |

---

## 4. Create a Test User

1. Go to **Users** → **Add user**
2. Fill in user details:

| Field | Example |
|---|---|
| **Username** | `testuser` |
| **Email** | `test@example.com` |
| **Email verified** | `On` |
| **First name** | `Test` |
| **Last name** | `User` |

3. Click **Create**
4. Go to the **Credentials** tab → **Set password**
   - Set a password and toggle **Temporary** to `Off`
5. Go to the **Role mapping** tab → **Assign role**
   - Assign `admin`, `instructor`, or `student` as needed

---

## 5. Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
# Keycloak Configuration
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=lms
KEYCLOAK_CLIENT_ID=lms-backend

# Application
PORT=3000
```

| Variable | Description | Default |
|---|---|---|
| `KEYCLOAK_BASE_URL` | Base URL of your Keycloak server | `http://localhost:8080` |
| `KEYCLOAK_REALM` | The Keycloak realm name | `lms` |
| `KEYCLOAK_CLIENT_ID` | Client ID for the backend | `lms-backend` |
| `PORT` | Application port | `3000` |

---

## 6. How Authentication Works

```
Client                    LMS Backend                 Keycloak
  │                           │                          │
  │  1. Login (direct or UI)  │                          │
  │──────────────────────────────────────────────────────>│
  │                           │                          │
  │  2. Access Token (JWT)    │                          │
  │<──────────────────────────────────────────────────────│
  │                           │                          │
  │  3. Request + Bearer Token│                          │
  │──────────────────────────>│                          │
  │                           │  4. Fetch JWKS (cached)  │
  │                           │─────────────────────────>│
  │                           │  5. Public Keys          │
  │                           │<─────────────────────────│
  │                           │                          │
  │                           │  6. Validate JWT (RS256) │
  │                           │  7. Extract user + roles │
  │  8. Response              │                          │
  │<──────────────────────────│                          │
```

1. The client obtains a JWT access token from Keycloak (via login page, direct grant, etc.)
2. The client sends requests to the LMS API with `Authorization: Bearer <token>`
3. The backend fetches Keycloak's public keys (JWKS) and caches them
4. The JWT is validated using RS256 signature verification
5. User info and roles are extracted from the token payload
6. Realm roles and client roles (`lms-backend`) are merged and available for authorization

---

## 7. Testing Authentication

### Get a Token (Direct Access Grant)

```bash
curl -X POST http://localhost:8080/realms/lms/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=lms-backend" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "username=testuser" \
  -d "password=testpassword"
```

> Find the client secret in: **Clients** → `lms-backend` → **Credentials** tab

### Call the Profile Endpoint

```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

Expected response:

```json
{
  "id": "keycloak-user-uuid",
  "email": "test@example.com",
  "emailVerified": true,
  "username": "testuser",
  "firstName": "Test",
  "lastName": "User",
  "name": "Test User",
  "roles": ["admin", "student"]
}
```

### Swagger UI

Open `http://localhost:3000/api/docs`, click the **Authorize** button, and paste your access token.

---

## 8. Role-Based Access Control

The backend supports role-based authorization using Keycloak roles:

```typescript
// Require specific roles
@Roles('admin')
@Get('admin-only')
adminRoute(@CurrentUser() user: AuthenticatedUser) { ... }

// Require one of multiple roles
@Roles('admin', 'instructor')
@Get('manage')
manageRoute(@CurrentUser() user: AuthenticatedUser) { ... }

// Public route (no auth required)
@Public()
@Get('health')
health() { return { status: 'ok' }; }
```

Both **realm roles** and **client roles** (from the `lms-backend` client) are checked.

---

## 9. Keycloak Endpoints Reference

These are auto-derived from the environment variables:

| Endpoint | URL |
|---|---|
| **Issuer** | `{KEYCLOAK_BASE_URL}/realms/{REALM}` |
| **JWKS** | `{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/certs` |
| **Token** | `{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/token` |
| **User Info** | `{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/userinfo` |
| **OpenID Config** | `{KEYCLOAK_BASE_URL}/realms/{REALM}/.well-known/openid-configuration` |
