# Submissions API

API endpoint for collecting public submissions and storing payloads as `jsonb` in PostgreSQL.

This endpoint is designed for multiple submission categories in the future.
For now, only `contact` type is supported.

---

## Overview

- **Base URL:** `/api`
- **Create Endpoint:** `POST /api/submissions`
- **Read Endpoint:** `GET /api/submissions/type/{type}`
- **Authentication:** Create is public. Read requires a Keycloak bearer token.
- **Database Table:** `submissions`
- **Payload Column:** `content` (`jsonb`)

---

## Endpoint

### Submit Form Payload

```
POST /api/submissions
```

### Request Headers

| Header         | Value              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

### Request Body

```json
{
  "type": "contact",
  "content": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "I want to know more about your courses."
  }
}
```

| Field     | Type   | Required | Description                                                      |
|-----------|--------|----------|------------------------------------------------------------------|
| `type`    | string | yes      | Submission category. Allowed values now: `contact`              |
| `content` | object | yes      | Flexible payload stored directly in DB as `jsonb`               |

---

## Success Response

### `201 Created`

```json
{
  "id": "d4a4a649-35b3-4f4c-92cb-26cdf8f17b6f",
  "type": "contact",
  "content": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "I want to know more about your courses."
  },
  "createdAt": "2026-03-20T09:00:00.000Z"
}
```

---

### Get Form Submissions By Type

```
GET /api/submissions/type/contact
```

### Request Headers

| Header          | Value                    |
|-----------------|--------------------------|
| `Authorization` | `Bearer <access_token>`  |

### Path Params

| Param  | Type   | Required | Description                                      |
|--------|--------|----------|--------------------------------------------------|
| `type` | string | yes      | Submission category. Allowed values now: `contact` |

### Success Response

### `200 OK`

```json
[
  {
    "id": "d4a4a649-35b3-4f4c-92cb-26cdf8f17b6f",
    "type": "contact",
    "content": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "message": "I want to know more about your courses."
    },
    "createdAt": "2026-03-20T09:00:00.000Z"
  }
]
```

The list is ordered newest first.

---

## Error Responses

### `400 Bad Request`

Returned when input is invalid:
- `type` missing or not allowed by enum
- `content` missing or not an object
- path `type` is not allowed by enum

Example:

```json
{
  "statusCode": 400,
  "message": [
    "type must be one of the following values: contact",
    "content must be an object"
  ],
  "error": "Bad Request"
}
```

---

## Notes

- Current accepted type is `contact` only.
- The `content` object is intentionally flexible for future submission types.
- Suggested next step for stricter validation: add type-specific DTO validation (for example, require `name`, `email`, and `message` when `type = contact`).
