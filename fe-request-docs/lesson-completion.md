# Lesson Completion API

API endpoints for tracking lesson completion progress per user.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Mark Lesson as Complete](#mark-lesson-as-complete)
   - [Unmark Lesson Completion](#unmark-lesson-completion)
   - [Get Lesson Completion Status](#get-lesson-completion-status)
   - [Get Course Completions](#get-course-completions)
4. [Data Models](#data-models)
5. [Error Responses](#error-responses)

---

## Overview

These endpoints manage per-user lesson completion state. The frontend sends a **Bearer token** (Keycloak access token) in the `Authorization` header. The backend must validate this JWT against the Keycloak realm to extract the user identity.

**Base URL:** `/api`

---

## Authentication

All endpoints require a valid Keycloak JWT access token.

```
Authorization: Bearer <access_token>
```

The backend should:
1. Validate the JWT signature against the Keycloak realm's public key  
   (`{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs`)
2. Verify the token is not expired
3. Extract the user ID from the `sub` claim

**Unauthorized requests** must return `401`.

---

## Endpoints

### Mark Lesson as Complete

Marks a specific lesson as completed for the authenticated user.

```
POST /api/courses/{courseSlug}/lessons/{lessonSlug}/complete
```

#### Path Parameters

| Parameter    | Type   | Description                        |
|-------------|--------|------------------------------------|
| `courseSlug`  | string | URL slug of the course             |
| `lessonSlug` | string | URL slug of the lesson             |

#### Request Headers

| Header          | Value                    |
|----------------|--------------------------|
| `Authorization` | `Bearer <access_token>`  |

#### Request Body

None.

#### Success Response

**Status:** `201 Created`

```json
{
  "courseSlug": "manual-software-testing-black-box-techniques",
  "lessonSlug": "what-is-software-testing",
  "completedAt": "2026-03-07T10:30:00.000Z"
}
```

#### Notes

- If the lesson is already marked as complete, the endpoint should return `200 OK` (idempotent) with the existing completion record.

---

### Unmark Lesson Completion

Removes the completion status for a specific lesson for the authenticated user.

```
DELETE /api/courses/{courseSlug}/lessons/{lessonSlug}/complete
```

#### Path Parameters

| Parameter    | Type   | Description                        |
|-------------|--------|------------------------------------|
| `courseSlug`  | string | URL slug of the course             |
| `lessonSlug` | string | URL slug of the lesson             |

#### Request Headers

| Header          | Value                    |
|----------------|--------------------------|
| `Authorization` | `Bearer <access_token>`  |

#### Success Response

**Status:** `204 No Content`

No response body.

#### Notes

- If the lesson is not currently marked as complete, the endpoint should return `204` anyway (idempotent).

---

### Get Lesson Completion Status

Returns whether a specific lesson is completed by the authenticated user.

```
GET /api/courses/{courseSlug}/lessons/{lessonSlug}/complete
```

#### Path Parameters

| Parameter    | Type   | Description                        |
|-------------|--------|------------------------------------|
| `courseSlug`  | string | URL slug of the course             |
| `lessonSlug` | string | URL slug of the lesson             |

#### Request Headers

| Header          | Value                    |
|----------------|--------------------------|
| `Authorization` | `Bearer <access_token>`  |

#### Success Response

**Status:** `200 OK`

```json
{
  "completed": true,
  "completedAt": "2026-03-07T10:30:00.000Z"
}
```

If not completed:

```json
{
  "completed": false,
  "completedAt": null
}
```

---

### Get Course Progress

Returns the completion status of all lessons in a course for the authenticated user. Used by the frontend to display progress bars and completion indicators in the sidebar.

```
GET /api/courses/{courseSlug}/progress
```

#### Path Parameters

| Parameter    | Type   | Description                        |
|-------------|--------|------------------------------------|
| `courseSlug`  | string | URL slug of the course             |

#### Request Headers

| Header          | Value                    |
|----------------|--------------------------|
| `Authorization` | `Bearer <access_token>`  |

#### Success Response

**Status:** `200 OK`

```json
{
  "courseSlug": "manual-software-testing-black-box-techniques",
  "totalLessons": 10,
  "completedLessons": 3,
  "progressPercent": 30,
  "lessons": [
    {
      "lessonSlug": "what-is-software-testing",
      "completed": true,
      "completedAt": "2026-03-07T10:30:00.000Z"
    },
    {
      "lessonSlug": "equivalence-partitioning",
      "completed": true,
      "completedAt": "2026-03-07T11:15:00.000Z"
    },
    {
      "lessonSlug": "boundary-value-analysis",
      "completed": false,
      "completedAt": null
    }
  ]
}
```

---

## Data Models

### LessonCompletion (DB Schema Suggestion)

| Column        | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| `id`          | UUID      | Primary key                              |
| `user_id`     | string    | Keycloak user `sub` claim                |
| `course_slug` | string    | Course identifier                        |
| `lesson_slug` | string    | Lesson identifier                        |
| `completed_at`| timestamp | When the lesson was marked complete      |

**Unique constraint:** `(user_id, course_slug, lesson_slug)`

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Standard Error Codes

| Status | Meaning               | When                                          |
|--------|-----------------------|-----------------------------------------------|
| `401`  | Unauthorized          | Missing or invalid access token                |
| `500`  | Internal Server Error | Unexpected server error                        |

---

## Frontend Integration Notes

The frontend calls these endpoints from the lesson page (`/courses/{courseSlug}/lessons/{lessonSlug}`):

- **On page load:** optionally call `GET .../complete` to hydrate the completion state (or use the course completions endpoint for the full sidebar).
- **On "Mark as Complete" click:** calls `POST .../complete`. On success, the button changes to a green "Completed" state.
- **On "Completed" click (toggle off):** calls `DELETE .../complete`. On success, the button reverts to "Mark as Complete".
- **Authorization header:** The frontend sends the Keycloak access token stored in the `kc_access_token` cookie.
- **Unauthenticated users:** The frontend shows a login modal and does **not** call the API. The backend does not receive unauthenticated requests for these endpoints.
