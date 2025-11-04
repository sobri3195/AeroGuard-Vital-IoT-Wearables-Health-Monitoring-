# AeroGuard Vital - System Architecture

## Overview

AeroGuard Vital is designed as a privacy-first, edge-aware health monitoring system for military and force personnel. The architecture supports real-time data streaming, offline operation, and strict access controls.

## High-Level Architecture

```
┌─────────────────┐
│   Wearables     │ (HR, SpO₂, Temp, Activity)
│   & Sensors     │ (WBGT, Humidity, Noise)
└────────┬────────┘
         │ BLE/ANT+
         ↓
┌─────────────────┐
│ Edge Gateway    │ ← 2-4hr buffer, local processing
│  (MQTT/HTTPS)   │
└────────┬────────┘
         │ 4G/5G/WiFi
         ↓
┌─────────────────┐
│  API Backend    │ ← JWT Auth, RBAC, Rate Limiting
│  (REST/MQTT)    │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬──────────┐
    ↓         ↓            ↓          ↓
┌────────┐ ┌──────┐ ┌──────────┐ ┌────────┐
│  TSDB  │ │ RDBMS│ │ FHIR API │ │ Audit  │
│(Vitals)│ │(Meta)│ │ (RME)    │ │  Log   │
└────────┘ └──────┘ └──────────┘ └────────┘
         │
         ↓
┌─────────────────┐
│   React SPA     │ ← AeroGuard Vital UI
│  (This Repo)    │
└─────────────────┘
```

## Component Breakdown

### 1. Frontend (React SPA)

**Tech Stack:**
- React 18 with TypeScript
- Vite for bundling
- Zustand for state management
- Tailwind CSS for styling
- Recharts for visualization

**Key Features:**
- Role-based UI rendering
- Real-time data polling (10s interval)
- Offline-aware UI with graceful degradation
- Privacy-conscious data masking

**State Management:**
- `authStore`: User session, JWT token
- `dataStore`: Personnel, alerts, environment data
- Local storage for token persistence
- Session storage for temporary data

### 2. API Layer (`src/lib/api.ts`)

**Responsibilities:**
- Centralized HTTP client (Axios)
- JWT token injection
- Automatic token refresh
- Error handling and retry logic
- 401 redirect to login

**Endpoints:**
- Auth: `/auth/login`, `/auth/logout`
- Overview: `/overview`
- Team: `/team/:unitId`
- Person: `/person/:pid/*` (requires consent)
- Environment: `/env/wbgt`, `/env/sensors`
- Alerts: `/alerts`, `/alerts/rules`
- Devices: `/devices`, `/devices/gateways`
- Reports: `/reports`
- Export: `/export/aggregate`, `/fhir/Observation`
- Admin: `/admin/users`, `/admin/audit`

### 3. Calculation Engine (`src/lib/calculations.ts`)

**Algorithms:**

**Readiness Index (0-100):**
```typescript
readiness = min(100,
  hrv_score(30%) +        // HRV relative to baseline
  sleep_score(30%) +       // Sleep duration & quality
  training_load(25%) +     // TRIMP/RPE-based
  heat_exposure(15%)       // Cumulative heat stress
)
```

**Fatigue Score (0-5):**
```typescript
fatigue = 
  ((resting_hr / max_hr * 100 - 50) / 10) +  // HR stress
  ((100 - sleep_quality) / 20) +               // Sleep deficit
  (activity_load / 20)                         // Training load
```

**Heat Risk (low/medium/high/critical):**
```typescript
risk_score = 0
if wbgt >= 32 or heat_index >= 40: risk_score += 3
elif wbgt >= 29 or heat_index >= 35: risk_score += 2
elif wbgt >= 26 or heat_index >= 32: risk_score += 1

if hr_percent > 85 and activity > 0.7: risk_score += 2
elif hr_percent > 75 and activity > 0.5: risk_score += 1

if risk_score >= 4: return 'critical'
elif risk_score >= 3: return 'high'
elif risk_score >= 2: return 'medium'
else: return 'low'
```

**WBGT (Wet Bulb Globe Temperature):**
- Indoor: `0.7 × Twb + 0.3 × Tg`
- Outdoor: `0.7 × Twb + 0.2 × Tg + 0.1 × Tdb`

**Heat Index (NOAA formula):**
```typescript
if T < 27°C: HI = T
else:
  HI = -42.379 + 2.049*T + 10.143*RH - 0.225*T*RH
       - 0.007*T² - 0.055*RH² + 0.001*T²*RH
       + 0.001*T*RH² - 0.000002*T²*RH²
  (with adjustments for low RH or moderate temps)
```

### 4. Privacy & Security Architecture

**Privacy Layers:**

```
┌──────────────────────────────────────┐
│  Commander View (Aggregate Only)     │
│  - Unit readiness: 78%               │
│  - Alert count: 5                    │
│  - Personnel: [P-1234, P-5678]       │
└──────────────────────────────────────┘
           ↑
           │ Data Masking (pseudonym_id)
           │
┌──────────────────────────────────────┐
│  Medical View (Consent Required)     │
│  - Full name: Sgt. John Doe          │
│  - HR: 85 bpm, SpO2: 97%             │
│  - Access logged to audit trail      │
└──────────────────────────────────────┘
```

**Access Control Flow:**
1. User authenticates → receives JWT with role claim
2. Frontend filters navigation based on role
3. API enforces RBAC at endpoint level
4. Person endpoints check consent record
5. All PII access logged to audit table

**Consent Workflow:**
```
Medical staff → Request access (purpose)
                    ↓
            Consent check (DB)
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
    Granted                  Denied
        ↓                       ↓
  Load PII data          Show consent request
  Log access                   page
```

### 5. Alert System Architecture

**Alert Pipeline:**
```
Wearable data → Gateway → API → Rules Engine
                                      ↓
                              Alert generated
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
            Push notification                   WebSocket/Poll
          (Mobile/WhatsApp)                      (Web dashboard)
                    ↓                                   ↓
            Acknowledge                          Acknowledge
                    └─────────────────┬─────────────────┘
                                      ↓
                                  Resolved
                                      ↓
                              Update alert status
```

**Alert Rule Example:**
```json
{
  "name": "Heat Stress Critical",
  "conditions": [
    {"parameter": "wbgt", "operator": "gte", "value": 32},
    {"parameter": "heart_rate_percent", "operator": "gt", "value": 85, "duration": 300}
  ],
  "actions": [
    {"type": "notify", "target": ["medical", "commander"]},
    {"type": "escalate", "delay": 600}
  ]
}
```

**Escalation Policy:**
- 0-10 min: Notify medical staff
- 10-20 min: Escalate to unit commander
- 20+ min: Alert to higher command + on-call medic

### 6. Edge Gateway Architecture

**Gateway Responsibilities:**
- Collect data from 10-50 wearables via BLE/ANT+
- Buffer 2-4 hours of data (SQLite)
- Local WBGT calculation
- Immediate critical alerts (local threshold)
- Sync to cloud when connected

**Data Flow:**
```
Wearable → Gateway buffer → Cloud API
           (SQLite)             ↓
                            Time-series DB
```

**Offline Behavior:**
1. Gateway detects connectivity loss
2. Continues data collection to local buffer
3. Shows "partial connectivity" in UI
4. On reconnect: backfills buffered data
5. Deduplicates by timestamp + device_id

### 7. Data Model

**Key Entities:**

```typescript
User {
  id, username, role, permissions, unit_id
}

PersonHealth {
  id, pseudonym_id, name (nullable), unit_id,
  vitals: {hr, rr, spo2, skin_temp},
  readiness_index, fatigue_score, heat_risk,
  device_id, battery_level, is_online
}

VitalSigns (time-series) {
  person_id, timestamp,
  heart_rate, respiratory_rate, spo2, skin_temp
}

Alert {
  id, type, severity, status,
  person_id, pseudonym_id, unit_id,
  title, message, data,
  created_at, acknowledged_at, resolved_at
}

EnvironmentData (time-series) {
  location: {lat, lng, name},
  temperature, humidity, wbgt, heat_index, noise_level,
  timestamp
}

ConsentRecord {
  person_id, consent_type, granted,
  granted_at, revoked_at,
  access_log: [{accessed_by, accessed_at, purpose, data_accessed}]
}

AuditLog {
  timestamp, user_id, action, resource, resource_id,
  details, ip_address
}
```

### 8. Performance Optimization

**Target Metrics:**
- LCP < 2.5s
- Alert end-to-end < 30s
- Dashboard render < 2.5s for 500 devices
- API response p95 < 500ms

**Optimization Techniques:**
1. Code splitting: Lazy load pages
2. Memoization: React.memo for expensive components
3. Debouncing: API calls on rapid state changes
4. Virtual scrolling: Large personnel lists
5. CDN: Static assets on edge network
6. Caching: API responses (5-10s TTL)
7. Indexing: Database indices on timestamp, person_id, unit_id

### 9. Deployment Architecture

**Production Stack:**
```
┌──────────────┐
│   CloudFlare │ ← CDN, DDoS protection
│   (or AWS CF)│
└──────┬───────┘
       ↓
┌──────────────┐
│  Load Balancer│ ← AWS ALB / Nginx
└──────┬───────┘
       ↓
┌──────────────┐
│  React App   │ ← S3 + CloudFront or Nginx
│  (Static)    │
└──────────────┘

┌──────────────┐
│  API Servers │ ← Kubernetes / ECS
│  (Node/Go)   │
└──────┬───────┘
       ↓
┌──────────────┬──────────────┬──────────────┐
│  TimescaleDB │   PostgreSQL │    Redis     │
│  (Vitals)    │   (Metadata) │   (Cache)    │
└──────────────┴──────────────┴──────────────┘
```

**Kubernetes Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aeroguard-vital-ui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aeroguard-vital-ui
  template:
    metadata:
      labels:
        app: aeroguard-vital-ui
    spec:
      containers:
      - name: ui
        image: aeroguard-vital:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_BASE_URL
          value: "https://api.aeroguardvital.mil"
```

## Security Considerations

1. **Authentication**: OAuth2 + JWT, 2FA required for privileged roles
2. **Authorization**: RBAC enforced at API level, row-level security in DB
3. **Encryption**: TLS 1.3 in transit, AES-256 at rest
4. **Secrets**: Vault/AWS Secrets Manager for API keys
5. **CSP**: Strict Content Security Policy headers
6. **CORS**: Whitelist allowed origins
7. **Rate Limiting**: Per-user and per-endpoint limits
8. **Audit**: All actions logged, tamper-evident logs

## Scalability

**Horizontal Scaling:**
- Stateless React app: Scale via CDN replication
- API servers: Auto-scale based on CPU/request count
- Database: Read replicas, partitioning by unit_id

**Vertical Scaling:**
- Time-series DB: Compress old data, downsample to 1-min avg
- Audit logs: Archive to cold storage after 90 days

**Expected Load:**
- 10,000 active wearables
- 60 updates/min per device → 600,000 writes/min
- Dashboard: 500 concurrent users
- API: 10,000 req/s peak

## Disaster Recovery

**Backup Strategy:**
- Real-time replication to secondary region
- Point-in-time recovery (7 days)
- Daily full backups to S3 Glacier

**RTO/RPO:**
- RTO: 1 hour (Recovery Time Objective)
- RPO: 5 minutes (Recovery Point Objective)

**Failover:**
- Multi-region deployment with DNS failover
- Edge gateways continue local operation during outage
- Automatic reconnection and backfill

## Monitoring & Observability

**Metrics:**
- Application: Datadog / New Relic
- Infrastructure: Prometheus + Grafana
- Logs: ELK stack (Elasticsearch, Logstash, Kibana)
- Traces: Jaeger / AWS X-Ray

**Key Alerts:**
- API error rate > 1%
- Alert processing time > 30s
- Gateway offline > 5 min
- Database connection pool exhaustion
- Disk usage > 80%

## Future Enhancements

1. **Machine Learning**: Predictive fatigue/heat injury models
2. **Mobile App**: Native iOS/Android for personnel
3. **AR/VR**: Immersive command center visualization
4. **Voice Alerts**: Integration with tactical radios
5. **Federated Learning**: Privacy-preserving model training
6. **Blockchain**: Immutable audit trail for compliance
