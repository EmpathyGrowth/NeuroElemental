# NeuroElemental API Documentation

Complete reference for the NeuroElemental REST API.

## Base URL

```
Development: http://localhost:3000/api
Production: https://neuroelemental.com/api
```

## Authentication

All authenticated endpoints require a valid session cookie from Supabase authentication.

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Authentication Flow

1. Sign up: `POST /auth/signup`
2. Sign in: `POST /auth/signin`
3. Use returned session token in subsequent requests

## Common Response Formats

### Success Response

```json
{
  "data": { /* response data */ },
  "message": "Success message"
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Validation error |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found |
| 500  | Internal Server Error |

---

## Courses API

### List All Courses

Get a list of all available courses.

**Endpoint:** `GET /api/courses`

**Auth Required:** No

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category slug |
| difficulty | string | Filter by difficulty level |
| limit | number | Number of results (default: 20) |
| offset | number | Pagination offset (default: 0) |

**Success Response (200):**

```json
[
  {
    "id": "course-123",
    "slug": "intro-to-neuroelemental",
    "title": "Introduction to NeuroElemental",
    "description": "Learn the basics of NeuroElemental",
    "price_usd": 99.00,
    "difficulty_level": "beginner",
    "instructor_id": "user-456",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

**Example:**

```bash
curl http://localhost:3000/api/courses?difficulty=beginner&limit=10
```

---

### Get Course by ID

Get detailed information about a specific course.

**Endpoint:** `GET /api/courses/[id]`

**Auth Required:** No

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Course ID |

**Success Response (200):**

```json
{
  "id": "course-123",
  "slug": "intro-to-neuroelemental",
  "title": "Introduction to NeuroElemental",
  "description": "Comprehensive introduction...",
  "price_usd": 99.00,
  "difficulty_level": "beginner",
  "duration_hours": 10,
  "instructor": {
    "id": "user-456",
    "full_name": "John Smith",
    "avatar_url": "https://..."
  },
  "modules": [
    {
      "id": "module-1",
      "title": "Getting Started",
      "order_index": 1,
      "lessons_count": 5
    }
  ],
  "enrollment_count": 234,
  "average_rating": 4.8,
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Course not found

**Example:**

```bash
curl http://localhost:3000/api/courses/course-123
```

---

### Create Course

Create a new course (admin only).

**Endpoint:** `POST /api/courses`

**Auth Required:** Yes (Admin)

**Request Body:**

```json
{
  "slug": "intro-to-neuroelemental",
  "title": "Introduction to NeuroElemental",
  "description": "Learn the basics...",
  "price_usd": 99.00,
  "difficulty_level": "beginner",
  "duration_hours": 10,
  "requirements": ["Basic understanding of neuroscience"],
  "learning_objectives": ["Understand core concepts", "Apply techniques"]
}
```

**Validation Rules:**

| Field | Type | Rules |
|-------|------|-------|
| slug | string | Required, lowercase, alphanumeric with hyphens, 1-100 chars |
| title | string | Required, 1-200 chars |
| description | string | Optional |
| price_usd | number | Required, >= 0 |
| difficulty_level | enum | Optional, one of: beginner, intermediate, advanced |
| duration_hours | number | Optional, >= 0 |

**Success Response (201):**

```json
{
  "id": "course-789",
  "slug": "intro-to-neuroelemental",
  "title": "Introduction to NeuroElemental",
  "created_by": "user-456",
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `409 Conflict` - Course slug already exists

**Example:**

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "intro-to-neuroelemental",
    "title": "Introduction to NeuroElemental",
    "price_usd": 99.00
  }'
```

---

## User Profile API

### Get Current User Profile

Get the authenticated user's profile.

**Endpoint:** `GET /api/profile`

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "full_name": "Jane Doe",
  "role": "student",
  "avatar_url": "https://...",
  "bio": "Passionate learner...",
  "location": "San Francisco, CA",
  "timezone": "America/Los_Angeles",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

**Example:**

```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token>"
```

---

### Update User Profile

Update the authenticated user's profile.

**Endpoint:** `PUT /api/profile`

**Auth Required:** Yes

**Request Body:**

```json
{
  "full_name": "Jane Smith",
  "bio": "Updated bio...",
  "avatar_url": "https://...",
  "location": "New York, NY",
  "timezone": "America/New_York"
}
```

**Validation Rules:**

| Field | Type | Rules |
|-------|------|-------|
| full_name | string | Optional, 1-100 chars |
| bio | string | Optional, max 500 chars |
| avatar_url | string | Optional, valid URL |
| location | string | Optional, max 100 chars |
| timezone | string | Optional, valid timezone |

**Success Response (200):**

```json
{
  "id": "user-123",
  "full_name": "Jane Smith",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Not authenticated

**Example:**

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith",
    "bio": "Updated bio"
  }'
```

---

## Events API

### List Events

Get a list of upcoming events.

**Endpoint:** `GET /api/events`

**Auth Required:** No

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by event type |
| upcoming | boolean | Only show future events (default: true) |
| limit | number | Number of results (default: 20) |

**Success Response (200):**

```json
[
  {
    "id": "event-123",
    "title": "NeuroElemental Workshop",
    "description": "Hands-on workshop...",
    "event_type": "workshop",
    "start_date": "2024-02-01T14:00:00Z",
    "end_date": "2024-02-01T17:00:00Z",
    "location": "San Francisco, CA",
    "is_virtual": false,
    "max_participants": 50,
    "registered_count": 23,
    "price_usd": 49.00
  }
]
```

---

### Register for Event

Register the authenticated user for an event.

**Endpoint:** `POST /api/events/[id]/register`

**Auth Required:** Yes

**Success Response (201):**

```json
{
  "registration_id": "reg-456",
  "event_id": "event-123",
  "user_id": "user-123",
  "status": "confirmed",
  "registered_at": "2024-01-15T10:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Event full or already registered
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Event not found

---

## Lessons API

### Get Lesson

Get lesson content (enrolled users only).

**Endpoint:** `GET /api/lessons/[lessonId]`

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "id": "lesson-123",
  "title": "Introduction to Concepts",
  "content": "Lesson content in markdown...",
  "video_url": "https://...",
  "duration_minutes": 15,
  "order_index": 1,
  "resources": [
    {
      "title": "Worksheet",
      "url": "https://...",
      "type": "pdf"
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Lesson not found

---

### Mark Lesson Complete

Mark a lesson as completed.

**Endpoint:** `POST /api/lessons/[lessonId]/complete`

**Auth Required:** Yes

**Success Response (200):**

```json
{
  "lesson_id": "lesson-123",
  "user_id": "user-123",
  "completed_at": "2024-01-15T10:00:00Z",
  "progress_percentage": 25
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Lesson not found

---

## Assessments API

### Submit Assessment

Submit answers for an assessment.

**Endpoint:** `POST /api/assessments/[id]/submit`

**Auth Required:** Yes

**Request Body:**

```json
{
  "answers": [
    {
      "question_id": "q1",
      "answer": "option_a"
    },
    {
      "question_id": "q2",
      "answer": "The answer is..."
    }
  ]
}
```

**Success Response (200):**

```json
{
  "submission_id": "sub-789",
  "score": 85,
  "total_points": 100,
  "passed": true,
  "graded_at": "2024-01-15T10:00:00Z",
  "feedback": "Great work! Review section 3 for improvement."
}
```

**Error Responses:**

- `400 Bad Request` - Invalid submission
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enrolled or already submitted
- `404 Not Found` - Assessment not found

---

## Admin API

Admin endpoints require admin role.

### Get All Users

**Endpoint:** `GET /api/admin/users`

**Auth Required:** Yes (Admin)

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role |
| search | string | Search by name or email |
| limit | number | Results per page |
| offset | number | Pagination offset |

**Success Response (200):**

```json
[
  {
    "id": "user-123",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "role": "student",
    "created_at": "2024-01-01T00:00:00Z",
    "last_sign_in": "2024-01-15T09:00:00Z"
  }
]
```

---

### Update User Role

**Endpoint:** `PUT /api/admin/users/[id]/role`

**Auth Required:** Yes (Admin)

**Request Body:**

```json
{
  "role": "instructor"
}
```

**Success Response (200):**

```json
{
  "id": "user-123",
  "role": "instructor",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

## Performance Metrics API

### Get Metrics

Get performance and usage metrics (admin only).

**Endpoint:** `GET /api/metrics`

**Auth Required:** Yes (Admin)

**Success Response (200):**

```json
{
  "metrics": {
    "counters": {
      "api.requests.total": 1234,
      "db.queries.total": 5678
    },
    "gauges": {
      "active.users": 42
    },
    "eventCount": 500
  },
  "performance": {
    "api:courses-create": {
      "count": 10,
      "avg": 45.2,
      "min": 23.1,
      "max": 89.4
    }
  },
  "timestamp": 1705320000000
}
```

---

### Clear Metrics

Clear all collected metrics (admin only).

**Endpoint:** `DELETE /api/metrics`

**Auth Required:** Yes (Admin)

**Success Response (200):**

```json
{
  "message": "Metrics cleared successfully"
}
```

---

## Rate Limiting

API requests are rate limited to prevent abuse:

- Anonymous users: 100 requests/hour
- Authenticated users: 1000 requests/hour
- Admin users: Unlimited

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1705320000
```

---

## Pagination

Paginated endpoints support the following parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| limit | 20 | Items per page (max: 100) |
| offset | 0 | Number of items to skip |

Response includes pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Webhooks

NeuroElemental can send webhooks for important events:

- `course.enrolled` - User enrolls in a course
- `lesson.completed` - User completes a lesson
- `assessment.submitted` - User submits an assessment
- `payment.succeeded` - Payment is successful
- `payment.failed` - Payment fails

Configure webhooks in the admin dashboard at `/admin/webhooks`.

---

## SDKs and Libraries

Official client libraries:

- **JavaScript/TypeScript**: `@neuroelemental/sdk`
- **Python**: `neuroelemental-python`

Example usage:

```typescript
import { NeuroElementalClient } from '@neuroelemental/sdk'

const client = new NeuroElementalClient({
  apiKey: process.env.NEUROELEMENTAL_API_KEY
})

const courses = await client.courses.list()
```

---

## Changelog

### v1.0.0 (2024-01-15)

- Initial API release
- Courses, Users, Events, Lessons endpoints
- Authentication and authorization
- Performance monitoring

---

## Support

For API support:

- Documentation: https://docs.neuroelemental.com
- Email: api@neuroelemental.com
- Discord: https://discord.gg/neuroelemental

Report issues at: https://github.com/neuroelemental/issues
