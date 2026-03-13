# QA Impact Analyzer API Documentation

Base URL: `http://localhost:8000`

All authenticated endpoints require: `Authorization: Bearer <token>`

---

## Authentication

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "is_active": true,
    "is_admin": false
  }
}
```

**Errors:**
- `400` Email already registered
- `400` Username already taken
- `400` Password must be at least 8 characters

---

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):** Same as register response.

**Errors:**
- `401` Invalid email or password

---

### GET /api/auth/me
Get current user profile.

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "is_active": true,
  "is_admin": false
}
```

---

## Defects

### POST /api/defects/upload
Upload defects from a CSV file.

**Content-Type:** `multipart/form-data`

**Parameters:**
- `file`: CSV file (required)

**CSV Format:**
```
title,description,severity,module,status,reporter,related_features
Bug title,Bug description,High,Login,Open,QA Team,"['auth', 'session']"
```

**Response (201):**
```json
{
  "message": "Successfully uploaded 15 defects",
  "created": 15,
  "skipped": 2,
  "errors": []
}
```

---

### GET /api/defects
List defects with optional filtering.

**Query Parameters:**
- `skip` (int, default=0): Pagination offset
- `limit` (int, default=50, max=200): Page size
- `module` (string): Filter by module name (partial match)
- `severity` (string): Filter by severity (Critical/High/Medium/Low)
- `search` (string): Search in title and description

**Response (200):** Array of Defect objects.

---

### GET /api/defects/{id}
Get a specific defect.

**Response (200):**
```json
{
  "id": 1,
  "title": "Login failure with special characters",
  "description": "...",
  "severity": "Critical",
  "module": "Login",
  "status": "Open",
  "reporter": "QA Team",
  "related_features": ["auth", "session"],
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

---

### GET /api/defects/stats
Get defect statistics.

**Response (200):**
```json
{
  "total": 45,
  "with_embeddings": 43,
  "severity_distribution": {
    "Critical": 5,
    "High": 12,
    "Medium": 20,
    "Low": 8
  },
  "status_distribution": {
    "Open": 25,
    "In Progress": 8,
    "Resolved": 10,
    "Closed": 2
  },
  "module_distribution": {
    "Login": 8,
    "Payment": 7,
    "Search": 5
  }
}
```

---

### POST /api/defects/seed
Seed the database with 20 sample defects.

**Response (200):**
```json
{
  "message": "Seeded 20 defects",
  "total": 20
}
```

---

## Analysis

### POST /api/analysis/similar-defects
Find defects semantically similar to the query text.

**Request:**
```json
{
  "query": "Login page redesign causing authentication issues",
  "module": "Login",
  "top_k": 10
}
```

**Response (200):** Array of defects with `similarity_score` field:
```json
[
  {
    "id": 1,
    "title": "Login failure with special characters",
    "description": "...",
    "severity": "Critical",
    "module": "Login",
    "status": "Open",
    "reporter": "QA Team",
    "related_features": ["auth", "session"],
    "similarity_score": 0.8547,
    "created_at": "2024-01-15T10:30:00"
  }
]
```

---

### POST /api/analysis/impact
Analyze the impact of a change.

**Request:**
```json
{
  "query": "Refactoring login authentication flow",
  "module": "Login",
  "similar_defects": []
}
```

**Response (200):**
```json
{
  "impact_score": 67.3,
  "risk_level": "High",
  "affected_areas": ["Login", "Authentication", "Session Management"],
  "potential_side_effects": [
    "User authentication flow may be affected",
    "Session management logic needs review"
  ],
  "severity_distribution": {
    "Critical": 2,
    "High": 4,
    "Medium": 3,
    "Low": 1
  },
  "recommendation": "HIGH RISK: Thorough testing recommended..."
}
```

---

### POST /api/analysis/test-cases
Generate test cases for a change.

**Request:**
```json
{
  "query": "Adding social login (Google OAuth)",
  "module": "Login",
  "similar_defects": [],
  "num_cases": 5
}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "정상 로그인 검증 (Valid Login Verification)",
    "description": "유효한 자격 증명으로 로그인 시 정상 처리되는지 확인",
    "steps": [
      "로그인 페이지로 이동",
      "유효한 이메일 주소 입력",
      "올바른 비밀번호 입력",
      "로그인 버튼 클릭",
      "메인 대시보드 표시 확인"
    ],
    "expected_result": "사용자가 성공적으로 로그인되고 대시보드로 리다이렉트된다",
    "priority": "Critical",
    "test_type": "Functional",
    "module": "Login",
    "tags": ["login", "authentication", "happy-path"]
  }
]
```

---

### GET /api/analysis/history
Get analysis history for the current user.

**Query Parameters:**
- `skip` (int, default=0)
- `limit` (int, default=20)

**Response (200):** Array of ImpactAnalysis records.

---

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message"
}
```

**Common HTTP Status Codes:**
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `422` Unprocessable Entity - Validation error
- `500` Internal Server Error - Server error
