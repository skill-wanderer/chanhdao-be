# Quiz Score API

API endpoints for submitting and retrieving per-user quiz scores.

All endpoints require a valid Keycloak JWT access token in the `Authorization` header.

```
Authorization: Bearer <access_token>
```

---

## Endpoints

| Method | Path                                                              | Description              |
|--------|-------------------------------------------------------------------|--------------------------|
| `POST` | `/api/courses/{courseSlug}/lessons/{lessonSlug}/quiz/score`        | Submit quiz score        |
| `GET`  | `/api/courses/{courseSlug}/lessons/{lessonSlug}/quiz/score`        | Get quiz score           |

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
  "scorePercentage": 80
}
```

| Field             | Type    | Required | Description                                       |
|-------------------|---------|----------|---------------------------------------------------|
| `score`           | integer | yes      | Number of correct answers                         |
| `totalQuestions`   | integer | yes      | Total number of questions in the quiz             |
| `scorePercentage` | integer | yes      | Calculated percentage (0–100), rounded to nearest |

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
  "submittedAt": "2026-03-08T14:30:00.000Z"
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
  "submittedAt": "2026-03-08T15:00:00.000Z"
}
```

**`400 Bad Request`** — Invalid request body (e.g., missing fields, score > totalQuestions, negative values):

```json
{
  "statusCode": 400,
  "message": "score must not exceed totalQuestions"
}
```

**`401 Unauthorized`** — Missing or invalid access token.

**`404 Not Found`** — Course or lesson slug does not exist, or lesson has no quiz.

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

**`404 Not Found`** — Course or lesson slug does not exist, or lesson has no quiz.

---

## Notes

- **Pass threshold**: A score is considered passing when `scorePercentage >= 70`. The `passed` boolean in the response is derived from this rule on the BE side.
- **Idempotent update**: Re-submitting overwrites the previous score. Only the latest attempt is stored.
- **Validation**: The BE should verify that `score <= totalQuestions`, both values are non-negative integers, and `scorePercentage` matches the computed value (`Math.round((score / totalQuestions) * 100)`).
- **Quiz existence**: The BE should return `404` if the referenced lesson does not have a quiz attached.
- **Frontend context**: The FE calls `POST` from the `QuizSection.vue` component after the user clicks "Submit Score". The `courseSlug` and `lessonSlug` come from the route params (`/courses/{courseSlug}/lessons/{lessonSlug}`).
