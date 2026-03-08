# Quiz Score API

API endpoints for submitting and retrieving per-user quiz scores.

All endpoints require a valid Keycloak JWT access token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

---

## Endpoints

| Method | Path                                                              | Description       |
|--------|-------------------------------------------------------------------|--------------------|
| `POST` | `/api/courses/{courseSlug}/lessons/{lessonSlug}/quiz/score`        | Submit quiz score  |
| `GET`  | `/api/courses/{courseSlug}/lessons/{lessonSlug}/quiz/score`        | Get quiz score     |

---

## Submit Quiz Score

```
POST /api/courses/{courseSlug}/lessons/{lessonSlug}/quiz/score
```

Submits the authenticated user's quiz score for a specific lesson. If a score already exists, it is updated (latest attempt wins).

### Path Parameters

| Parameter    | Type   | Description            |
|-------------|--------|------------------------|
| `courseSlug` | string | URL slug of the course |
| `lessonSlug` | string | URL slug of the lesson |

### Request Body

```json
{
  "score": 4,
  "totalQuestions": 5,
  "scorePercentage": 80,
  "passPercentage": 50,
  "answers": {
    "0": "A",
    "1": "B",
    "2": "C",
    "3": "A",
    "4": "D"
  }
}
```

| Field             | Type    | Required | Validation                                                    |
|-------------------|---------|----------|---------------------------------------------------------------|
| `score`           | integer | yes      | >= 0, must not exceed `totalQuestions`                         |
| `totalQuestions`   | integer | yes      | >= 1                                                          |
| `scorePercentage` | integer | yes      | 0–100, must equal `Math.round((score / totalQuestions) * 100)` |
| `passPercentage`  | integer | yes      | 0–100, threshold for passing (e.g. 50 or 70)                  |
| `answers`         | object  | no       | Map of question index (string) to selected option key (string) |

### Responses

**`201 Created`** — Score submitted for the first time:

```json
{
  "courseSlug": "manual-software-testing-black-box-techniques",
  "lessonSlug": "module-1-summary-and-takeaway",
  "score": 4,
  "totalQuestions": 5,
  "scorePercentage": 80,
  "passed": true,
  "submittedAt": "2026-03-08T14:30:00.000Z",
  "answers": {
    "0": "A",
    "1": "B",
    "2": "C",
    "3": "A",
    "4": "D"
  }
}
```

**`200 OK`** — Score updated (user re-submitted after retaking the quiz):

```json
{
  "courseSlug": "manual-software-testing-black-box-techniques",
  "lessonSlug": "module-1-summary-and-takeaway",
  "score": 5,
  "totalQuestions": 5,
  "scorePercentage": 100,
  "passed": true,
  "submittedAt": "2026-03-08T15:00:00.000Z",
  "answers": {
    "0": "A",
    "1": "B",
    "2": "C",
    "3": "A",
    "4": "D"
  }
}
```

**`400 Bad Request`** — Validation errors:

```json
{
  "statusCode": 400,
  "message": "score must not exceed totalQuestions"
}
```

```json
{
  "statusCode": 400,
  "message": "scorePercentage must match computed value (expected 80)"
}
```

**`401 Unauthorized`** — Missing or invalid access token.

---

## Get Quiz Score

```
GET /api/courses/{courseSlug}/lessons/{lessonSlug}/quiz/score
```

Returns the authenticated user's latest quiz score for a specific lesson.

### Path Parameters

| Parameter    | Type   | Description            |
|-------------|--------|------------------------|
| `courseSlug` | string | URL slug of the course |
| `lessonSlug` | string | URL slug of the lesson |

### Responses

**`200 OK`** — Score exists:

```json
{
  "courseSlug": "manual-software-testing-black-box-techniques",
  "lessonSlug": "module-1-summary-and-takeaway",
  "score": 4,
  "totalQuestions": 5,
  "scorePercentage": 80,
  "passed": true,
  "submittedAt": "2026-03-08T14:30:00.000Z"
}
```

**`200 OK`** — No score submitted yet:

```json
{
  "score": null,
  "totalQuestions": null,
  "scorePercentage": null,
  "passed": null,
  "submittedAt": null
}
```

**`401 Unauthorized`** — Missing or invalid access token.

---

## Notes

- **Pass threshold**: `scorePercentage >= passPercentage` → `passed: true`. The FE sends the `passPercentage` per quiz (e.g. 50 for Module 1). The BE uses this to compute the `passed` flag.
- **Idempotent update**: Re-submitting overwrites the previous score. Only the latest attempt is stored.
- **Validation**: The BE verifies that `score <= totalQuestions`, both values are non-negative integers, and `scorePercentage` matches `Math.round((score / totalQuestions) * 100)`.
- **Response field**: `submittedAt` reflects the original submission time for first-time scores, and the update time for re-submissions.
