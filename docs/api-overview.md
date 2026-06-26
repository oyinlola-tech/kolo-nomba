# API Overview

This document describes the API principles, authentication, versioning, response format, and conventions used across all Kolo API endpoints.

---

## Base URL

```
Development: http://localhost:4000/api/v1
Production:  https://api.kolosavings.com/api/v1
```

All API endpoints are prefixed with `/api/v1`.

---

## API Principles

1. **RESTful** — Resources are accessed via standard HTTP methods
2. **Stateless** — Each request contains all information needed to process it
3. **JSON-only** — All request and response bodies are JSON
4. **Versioned** — All endpoints under `/api/v1/`
5. **Authenticated** — Most endpoints require JWT authentication
6. **Validated** — All inputs are validated with Zod schemas
7. **Rate Limited** — Requests are rate-limited per IP and per endpoint

---

## Authentication

Most endpoints require authentication via a Bearer JWT access token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Types

| Token | Location | Lifetime | Purpose |
|---|---|---|---|
| Access Token | `Authorization` header (Bearer) | 15 minutes | API authentication |
| Refresh Token | `HttpOnly` cookie (`refreshToken`) | 7 days | Obtain new access tokens |

### Refresh Flow

```
1. POST /auth/refresh  (cookie sent automatically)
2. Response includes new access token
3. Access token stored in memory (not localStorage)
```

### Authentication Flow

```
Register → Verify OTP → Login → { accessToken, refreshToken cookie }
                                    │
                         Every API call:
                         Authorization: Bearer <accessToken>
                                    │
                          When 401 received:
                          POST /auth/refresh (cookie)
                          → new accessToken
                          → retry original request
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "AUTH_ERROR",
  "statusCode": 401,
  "errors": {
    "email": ["Invalid email format"]
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Users retrieved",
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|---|---|---|
| 200 | OK | Successful GET, PATCH, PUT requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Validation errors, malformed input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., duplicate email) |
| 422 | Unprocessable Entity | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| Global | 100 requests | 1 minute |
| Register | 3 requests | 15 minutes |
| Login | 5 requests | 1 minute |
| Refresh | 10 requests | 1 minute |
| Verify OTP | 5 requests | 5 minutes |
| Resend OTP | 3 requests | 5 minutes |

---

## Standard Headers

### Request Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | For auth endpoints | `Bearer <accessToken>` |
| `Content-Type` | Yes | `application/json` |
| `X-Request-ID` | No | Client-generated request ID (for tracing) |

### Response Headers

| Header | Description |
|---|---|
| `X-Request-ID` | Request ID for tracing |
| `X-RateLimit-Limit` | Rate limit quota |
| `X-RateLimit-Remaining` | Remaining requests |
| `X-RateLimit-Reset` | Time when quota resets |
| `Set-Cookie` | `refreshToken` cookie (HttpOnly, Secure, SameSite=Strict) |

---

## Common Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 20, max: 100) |
| `search` | string | Search term for filtering |
| `sortBy` | string | Field to sort by |
| `sortOrder` | asc / desc | Sort direction |

---

## Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `AUTH_ERROR` | 401 | Authentication failed |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `PAYMENT_ERROR` | 402 | Payment processing failed |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Example API Call

### Request

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "chioma@example.com",
  "password": "mySecurePassword123!"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "firstName": "Chioma",
      "lastName": "Okafor",
      "email": "chioma@example.com",
      "phone": "+2348012345678",
      "role": "MEMBER",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "role": "MEMBER"
  }
}
```

---

## Pagination Utility

All list endpoints support pagination:

```json
{
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

Query parameters: `?page=1&limit=20&search=term&sortBy=createdAt&sortOrder=desc`
