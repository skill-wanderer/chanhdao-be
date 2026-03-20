# Submissions API (Public Contact Form)

API endpoint for sending public form submissions to the backend.

This API is designed to support multiple submission types over time.
For now, only `contact` is supported.

---

## Overview

- **Base URL:** `/api`
- **Endpoint:** `POST /api/submissions`
- **Authentication:** Not required (public endpoint)
- **Storage:** `content` is stored in PostgreSQL as `jsonb`

---

## Endpoint

### Submit Public Form

```
POST /api/submissions
```

Create a new submission record.

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

| Field      | Type   | Required | Description                                                                 |
|------------|--------|----------|-----------------------------------------------------------------------------|
| `type`     | string | yes      | Submission category. Current allowed value: `contact`                       |
| `content`  | object | yes      | Flexible payload for the selected type. Stored directly as `jsonb` in DB   |

---

## Responses

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

### `400 Bad Request`

Returned when request body is invalid, for example:
- missing `type`
- `type` is not one of allowed enum values
- missing `content`
- `content` is not an object

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

## FE Integration Notes

- This endpoint is **public**, so do not attach bearer token by default.
- Keep FE validation for contact form fields (`name`, `email`, `message`) to improve UX.
- Backend currently validates only the top-level schema (`type`, `content`) and stores `content` as-is.
- If additional submission types are added later, FE can reuse this endpoint by sending a different `type` and matching `content` shape.

---

## Suggested FE API Function

```ts
type SubmissionType = 'contact';

interface CreateSubmissionRequest {
  type: SubmissionType;
  content: Record<string, unknown>;
}

interface SubmissionResponse {
  id: string;
  type: SubmissionType;
  content: Record<string, unknown>;
  createdAt: string;
}

export async function submitContact(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<SubmissionResponse> {
  const body: CreateSubmissionRequest = {
    type: 'contact',
    content: payload,
  };

  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
}
```
