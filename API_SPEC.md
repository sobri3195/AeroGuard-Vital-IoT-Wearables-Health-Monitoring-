# AeroGuard Vital - API Specification

## Base URL

```
Production: https://api.aeroguardvital.mil/api
Staging: https://api-staging.aeroguardvital.mil/api
Development: http://localhost:8080/api
```

## Authentication

All endpoints except `/auth/login` require Bearer token authentication.

```http
Authorization: Bearer <JWT_TOKEN>
```

### JWT Token Structure

```json
{
  "sub": "user_id",
  "username": "john.doe",
  "role": "medical",
  "permissions": ["read:vitals", "write:alerts"],
  "unit_id": "ALPHA-1",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Endpoints

### Authentication

#### POST /auth/login

Login with username and password.

**Request:**
```json
{
  "username": "john.doe",
  "password": "SecureP@ssw0rd",
  "twoFactorCode": "123456"
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_123",
    "username": "john.doe",
    "role": "medical",
    "permissions": ["read:vitals", "write:alerts"],
    "unitId": "ALPHA-1"
  }
}
```

**Response (2FA Required):**
```json
{
  "requiresTwoFactor": true,
  "message": "Two-factor authentication required"
}
```

#### POST /auth/logout

Logout and invalidate token.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### POST /auth/refresh

Refresh JWT token.

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Overview

#### GET /overview

Get dashboard overview metrics.

**Query Parameters:**
- `unitId` (optional): Filter by unit ID
- `from` (optional): ISO 8601 datetime
- `to` (optional): ISO 8601 datetime

**Response:**
```json
{
  "overview": {
    "totalPersonnel": 500,
    "onlinePersonnel": 487,
    "avgReadiness": 78,
    "activeAlerts": 12,
    "criticalAlerts": 2
  },
  "units": [
    {
      "unitId": "ALPHA-1",
      "unitName": "Alpha Company",
      "personnelCount": 50,
      "onlineCount": 48,
      "readinessIndex": 82,
      "activeAlerts": 1,
      "criticalAlerts": 0,
      "heatRisk": "medium",
      "fatigueRisk": "low",
      "lastUpdate": "2024-01-15T14:30:00Z"
    }
  ],
  "recentAlerts": [...],
  "environmentalStatus": [...],
  "systemHealth": {
    "gatewaysOnline": 10,
    "gatewaysTotal": 10,
    "devicesOnline": 487,
    "devicesTotal": 500,
    "avgLatency": 45
  }
}
```

---

### Team

#### GET /team/:unitId

Get team summary for a unit.

**Response:**
```json
{
  "unitId": "ALPHA-1",
  "unitName": "Alpha Company",
  "readinessIndex": 82,
  "fatigueRisk": "low",
  "heatRisk": "medium",
  "activeAlerts": 1,
  "personnelCount": 50,
  "onlineCount": 48,
  "metrics": {
    "avgHeartRate": 75,
    "avgSpo2": 97,
    "atRiskCount": 3
  }
}
```

#### GET /team/:unitId/personnel

Get personnel list for a unit.

**Response:**
```json
[
  {
    "id": "per_123",
    "pseudonymId": "P-1234",
    "name": null,
    "unitId": "ALPHA-1",
    "vitals": {
      "heartRate": 78,
      "respiratoryRate": 16,
      "spo2": 98,
      "skinTemp": 36.5,
      "timestamp": "2024-01-15T14:30:00Z"
    },
    "readinessIndex": 85,
    "fatigueScore": 1.2,
    "heatRisk": "low",
    "lastUpdate": "2024-01-15T14:30:00Z",
    "deviceId": "dev_456",
    "batteryLevel": 78,
    "isOnline": true
  }
]
```

---

### Person (Medical Staff Only)

#### GET /person/:pid/vitals

Get vital signs time series for a person.

**Authorization:** Requires `medical` role and valid consent.

**Query Parameters:**
- `from` (optional): ISO 8601 datetime
- `to` (optional): ISO 8601 datetime

**Response:**
```json
[
  {
    "timestamp": "2024-01-15T14:30:00Z",
    "heartRate": 78,
    "respiratoryRate": 16,
    "spo2": 98,
    "skinTemp": 36.5
  }
]
```

#### GET /person/:pid/recovery

Get recovery data for a person.

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "hrv": 65,
    "restingHr": 58,
    "sleepScore": 82,
    "hydrationLevel": 85,
    "recoveryScore": 88,
    "recommendation": "Excellent recovery. Ready for high-intensity training."
  }
]
```

#### GET /person/:pid/sleep

Get sleep data for a person.

**Response:**
```json
[
  {
    "date": "2024-01-14",
    "totalMinutes": 480,
    "deepMinutes": 120,
    "lightMinutes": 240,
    "remMinutes": 90,
    "awakeMinutes": 30,
    "sleepScore": 85,
    "fragmentations": 2
  }
]
```

#### GET /person/:pid/consent

Check consent status for a person.

**Response:**
```json
{
  "personId": "per_123",
  "granted": true,
  "grantedAt": "2024-01-10T09:00:00Z",
  "consentType": "medical"
}
```

#### POST /person/:pid/access

Request access to person data.

**Request:**
```json
{
  "purpose": "Medical assessment for heat injury evaluation"
}
```

**Response:**
```json
{
  "message": "Access request submitted",
  "status": "pending"
}
```

---

### Environment

#### GET /env/wbgt

Get environmental sensor data.

**Query Parameters:**
- `lat` (optional): Latitude
- `lng` (optional): Longitude
- `radius` (optional): Radius in meters
- `from` (optional): ISO 8601 datetime
- `to` (optional): ISO 8601 datetime

**Response:**
```json
[
  {
    "id": "env_123",
    "location": {
      "lat": 1.3521,
      "lng": 103.8198,
      "name": "Training Area Alpha"
    },
    "temperature": 32.5,
    "humidity": 75,
    "wbgt": 30.2,
    "heatIndex": 38.5,
    "noiseLevel": 65,
    "timestamp": "2024-01-15T14:30:00Z"
  }
]
```

#### GET /env/sensors

Get list of environmental sensors.

**Response:**
```json
[
  {
    "id": "sens_123",
    "name": "Training Area Alpha - Sensor 1",
    "location": {
      "lat": 1.3521,
      "lng": 103.8198
    },
    "status": "active",
    "lastSeen": "2024-01-15T14:30:00Z"
  }
]
```

---

### Alerts

#### GET /alerts

Get alerts list.

**Query Parameters:**
- `status` (optional): active, acknowledged, resolved, escalated
- `severity` (optional): info, warning, critical, emergency
- `unitId` (optional): Filter by unit

**Response:**
```json
[
  {
    "id": "alt_123",
    "type": "heat_stress",
    "severity": "critical",
    "status": "active",
    "personId": "per_123",
    "pseudonymId": "P-1234",
    "unitId": "ALPHA-1",
    "title": "Critical Heat Stress Detected",
    "message": "Personnel P-1234 has WBGT ≥32°C with HR >85% for 5+ minutes",
    "data": {
      "wbgt": 32.5,
      "heartRate": 145,
      "maxHeartRate": 170
    },
    "createdAt": "2024-01-15T14:25:00Z",
    "escalationLevel": 1
  }
]
```

#### POST /alerts/:id/ack

Acknowledge an alert.

**Request:**
```json
{
  "note": "Medical staff en route to location"
}
```

**Response:**
```json
{
  "id": "alt_123",
  "status": "acknowledged",
  "acknowledgedAt": "2024-01-15T14:26:00Z",
  "acknowledgedBy": "usr_456"
}
```

#### POST /alerts/:id/resolve

Resolve an alert.

**Request:**
```json
{
  "resolution": "Personnel moved to cooler area, vitals normalized"
}
```

**Response:**
```json
{
  "id": "alt_123",
  "status": "resolved",
  "resolvedAt": "2024-01-15T14:35:00Z",
  "resolvedBy": "usr_456"
}
```

#### GET /alerts/rules

Get alert rules.

**Response:**
```json
[
  {
    "id": "rule_123",
    "name": "Heat Stress Critical",
    "description": "Alert when WBGT ≥32 and HR >85% for 5+ minutes",
    "enabled": true,
    "conditions": [
      {
        "parameter": "wbgt",
        "operator": "gte",
        "value": 32
      },
      {
        "parameter": "heart_rate_percent",
        "operator": "gt",
        "value": 85,
        "duration": 300
      }
    ],
    "actions": [
      {
        "type": "notify",
        "target": ["medical", "commander"]
      }
    ],
    "priority": 1
  }
]
```

#### POST /alerts/rules

Create a new alert rule.

**Request:**
```json
{
  "name": "Low SpO2 Alert",
  "description": "Alert when SpO2 drops below 90%",
  "enabled": true,
  "conditions": [
    {
      "parameter": "spo2",
      "operator": "lt",
      "value": 90,
      "duration": 60
    }
  ],
  "actions": [
    {
      "type": "notify",
      "target": ["medical"]
    }
  ],
  "priority": 2
}
```

---

### Devices

#### GET /devices

Get devices list.

**Query Parameters:**
- `type` (optional): wearable, gateway, env_sensor
- `status` (optional): active, inactive, maintenance, lost

**Response:**
```json
[
  {
    "id": "dev_123",
    "deviceType": "wearable",
    "model": "Garmin Tactix 7",
    "firmwareVersion": "v3.2.1",
    "assignedTo": null,
    "pseudonymId": "P-1234",
    "unitId": "ALPHA-1",
    "status": "active",
    "batteryLevel": 78,
    "lastSeen": "2024-01-15T14:30:00Z"
  }
]
```

#### GET /devices/:id

Get device details.

#### PATCH /devices/:id

Update device information.

**Request:**
```json
{
  "status": "maintenance",
  "notes": "Battery replacement scheduled"
}
```

#### POST /devices/enroll

Enroll a new device.

**Request:**
```json
{
  "deviceType": "wearable",
  "model": "Garmin Tactix 7",
  "serialNumber": "GT7-12345678",
  "unitId": "ALPHA-1"
}
```

#### GET /devices/gateways

Get gateway list.

**Response:**
```json
[
  {
    "id": "gw_123",
    "name": "Gateway Alpha-1",
    "location": "Training Area Alpha",
    "status": "online",
    "cpu": 45,
    "memory": 62,
    "latency": 35,
    "connectedDevices": 48,
    "bufferedRecords": 0,
    "lastSync": "2024-01-15T14:30:00Z"
  }
]
```

---

### Reports

#### GET /reports

Get reports list.

**Query Parameters:**
- `type` (optional): weekly, monthly, incident
- `from` (optional): ISO 8601 datetime
- `to` (optional): ISO 8601 datetime

**Response:**
```json
[
  {
    "id": "rep_123",
    "type": "weekly",
    "period": {
      "start": "2024-01-08",
      "end": "2024-01-14"
    },
    "unitId": "ALPHA-1",
    "metrics": {
      "avgReadiness": 82,
      "totalAlerts": 45,
      "heatIncidents": 3,
      "fatigueIncidents": 7,
      "interventions": 10,
      "trainingHours": 320
    },
    "generatedAt": "2024-01-15T08:00:00Z",
    "generatedBy": "usr_456"
  }
]
```

#### POST /reports/generate

Generate a new report.

**Request:**
```json
{
  "type": "monthly",
  "filters": {
    "unitId": "ALPHA-1",
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31"
  }
}
```

#### GET /reports/:id/download

Download report file.

**Response:** Binary file (PDF/CSV)

---

### Export

#### POST /export/aggregate

Export aggregate data (non-PII).

**Request:**
```json
{
  "format": "csv",
  "filters": {
    "unitId": "ALPHA-1",
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31",
    "includeFields": ["readiness", "alerts", "vitals_summary"]
  }
}
```

**Response:**
```json
{
  "exportId": "exp_123",
  "status": "processing",
  "estimatedTime": 60
}
```

#### POST /fhir/Observation

Export FHIR observations to EMR (medical staff only).

**Request:**
```json
[
  {
    "resourceType": "Observation",
    "subject": {
      "reference": "Patient/per_123"
    },
    "code": {
      "coding": [
        {
          "system": "http://loinc.org",
          "code": "8867-4",
          "display": "Heart rate"
        }
      ]
    },
    "valueQuantity": {
      "value": 78,
      "unit": "beats/minute"
    },
    "effectiveDateTime": "2024-01-15T14:30:00Z"
  }
]
```

---

### Policies

#### GET /policies

Get privacy policies.

#### GET /policies/:id

Get policy details.

#### PUT /policies/:id

Update policy (admin only).

#### GET /policies/consent/templates

Get consent templates.

---

### Admin

#### GET /admin/users

Get users list (admin only).

#### POST /admin/users

Create new user (admin only).

#### PUT /admin/users/:id

Update user (admin only).

#### DELETE /admin/users/:id

Delete user (admin only).

#### GET /admin/audit

Get audit logs (admin only).

**Query Parameters:**
- `from` (optional): ISO 8601 datetime
- `to` (optional): ISO 8601 datetime
- `userId` (optional): Filter by user

**Response:**
```json
[
  {
    "id": "aud_123",
    "timestamp": "2024-01-15T14:30:00Z",
    "userId": "usr_456",
    "username": "jane.smith",
    "action": "read",
    "resource": "person_vitals",
    "resourceId": "per_123",
    "details": {
      "purpose": "Medical assessment",
      "dataAccessed": ["vitals", "sleep"]
    },
    "ipAddress": "10.0.1.50"
  }
]
```

#### GET /admin/api-keys

Get API keys (admin only).

#### POST /admin/api-keys

Create API key (admin only).

#### DELETE /admin/api-keys/:id

Revoke API key (admin only).

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid query parameters",
  "details": {
    "field": "unitId",
    "issue": "Unit ID not found"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "requestId": "req_abc123"
}
```

---

## Rate Limiting

- **Per User**: 1000 requests/hour
- **Per Endpoint**: Varies by endpoint
  - `/auth/login`: 5 requests/minute
  - `/alerts`: 60 requests/minute
  - `/overview`: 120 requests/minute
  - `/person/:pid/vitals`: 30 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1705329600
```

---

## Pagination

Endpoints returning lists support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 50, max: 100)

**Response Headers:**
```
X-Total-Count: 500
X-Page: 1
X-Per-Page: 50
Link: </api/alerts?page=2&limit=50>; rel="next"
```

---

## WebSocket Support (Optional)

Real-time updates via WebSocket at `wss://api.aeroguardvital.mil/ws`

**Subscribe to alerts:**
```json
{
  "action": "subscribe",
  "channel": "alerts",
  "filters": {
    "unitId": "ALPHA-1"
  }
}
```

**Receive alert:**
```json
{
  "channel": "alerts",
  "data": {
    "id": "alt_456",
    "type": "heat_stress",
    "severity": "warning",
    ...
  }
}
```
