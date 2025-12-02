# CloudCare API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Tickets](#tickets)
- [Comments](#comments)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Rate Limiting](#rate-limiting)

## Authentication

### Register User
Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login
Authenticate and receive access tokens.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m",
    "tokenType": "Bearer"
  }
}
```

### Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
Get authenticated user's profile.

**Endpoint:** `GET /api/v1/auth/me`

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isActive": true
  }
}
```

## Tickets

### List Tickets
Get all tickets with optional filters and pagination.

**Endpoint:** `GET /api/v1/tickets`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `sortBy` (string: createdAt, updatedAt, priority, status)
- `sortOrder` (string: asc, desc)
- `status` (string: OPEN, IN_PROGRESS, RESOLVED, etc.)
- `priority` (string: LOW, MEDIUM, HIGH, CRITICAL)
- `search` (string: search in title and description)
- `category` (string)
- `tags` (comma-separated string)
- `startDate` (ISO date string)
- `endDate` (ISO date string)

**Example:**
```
GET /api/v1/tickets?status=OPEN&priority=HIGH&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticketNumber": "TCK-ABC123",
      "title": "Unable to login",
      "description": "Getting 401 error",
      "priority": "HIGH",
      "status": "OPEN",
      "category": "Authentication",
      "tags": ["login", "auth"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "createdBy": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      },
      "_count": {
        "comments": 2,
        "attachments": 0
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Create Ticket
Create a new support ticket.

**Endpoint:** `POST /api/v1/tickets`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "title": "Cannot access dashboard",
  "description": "When I try to access the dashboard, I get a 404 error. This started happening after the latest update.",
  "priority": "MEDIUM",
  "category": "Technical",
  "tags": ["dashboard", "404"],
  "dueDate": "2024-01-15T00:00:00.000Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "id": "uuid",
    "ticketNumber": "TCK-XYZ789",
    "title": "Cannot access dashboard",
    "status": "OPEN",
    "priority": "MEDIUM"
  }
}
```

### Get Ticket by ID
Get detailed information about a specific ticket.

**Endpoint:** `GET /api/v1/tickets/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticketNumber": "TCK-ABC123",
    "title": "Cannot access dashboard",
    "description": "Full description...",
    "priority": "MEDIUM",
    "status": "IN_PROGRESS",
    "createdBy": { "..." },
    "assignedTo": { "..." },
    "comments": [
      {
        "id": "uuid",
        "content": "We are looking into this issue",
        "isInternal": false,
        "author": { "..." },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "attachments": []
  }
}
```

### Update Ticket
Update ticket details.

**Endpoint:** `PUT /api/v1/tickets/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "assignedToId": "uuid",
  "priority": "HIGH"
}
```

**Permissions:**
- Users can update their own tickets (limited fields)
- Agents and Admins can update any ticket (all fields)

### Delete Ticket
Delete a ticket (Admin only).

**Endpoint:** `DELETE /api/v1/tickets/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`

### Get Ticket Statistics
Get ticket statistics for the current user.

**Endpoint:** `GET /api/v1/tickets/stats`

**Headers:** `Authorization: Bearer <access_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 42,
    "byStatus": {
      "open": 10,
      "inProgress": 8,
      "resolved": 20,
      "closed": 4
    },
    "byPriority": {
      "high": 5,
      "critical": 2
    }
  }
}
```

## Comments

### Add Comment
Add a comment to a ticket.

**Endpoint:** `POST /api/v1/tickets/:id/comments`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "content": "This issue has been resolved. Please verify.",
  "isInternal": false
}
```

**Note:** Only Agents and Admins can create internal comments.

**Response:** `201 Created`

## Error Handling

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## Pagination

Paginated responses include metadata:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window
- **Headers:** Standard rate limit headers are included

When rate limited:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```
