# AeroGuard Vital - IoT & Wearables Health Monitoring System

A comprehensive React application for real-time health monitoring of force personnel using IoT wearables and environmental sensors. Built with privacy-by-design principles and edge-aware capabilities.

## Overview

AeroGuard Vital provides:
- **Real-time vital monitoring**: HR, RR, SpO₂, skin temperature, steps, sleep tracking
- **Environmental sensors**: Temperature, humidity, WBGT, heat index, noise levels
- **Heat stress & fatigue alerts**: Automated risk detection and intervention
- **Privacy controls**: Aggregate data for commanders, individual access requires consent
- **Edge gateway support**: Offline buffering and synchronization
- **FHIR integration**: Clinical data export to EMR/SIMRS systems

## Features

### User Roles

1. **Commander/Instructor**: View team readiness, aggregated metrics, active alerts
2. **Medical Staff (Nakes)**: Access individual health data (with consent), recovery tracking
3. **Personnel**: View personal health summary, self-notifications
4. **IoT Operator**: Manage gateways, devices, firmware updates
5. **Security Admin**: User management, audit logs, privacy policies

### Core Modules

- `/overview` - Force readiness dashboard, heat map, system status
- `/team/:unitId` - Team health summary, risk distribution
- `/person/:pid` - Individual health details (medical staff only, requires consent)
- `/environment` - Environmental sensor data, WBGT monitoring, gateway status
- `/alerts` - Alert inbox, rule management, acknowledgment workflow
- `/devices` - Wearable and sensor management, firmware updates
- `/reports` - Weekly/monthly readiness and incident reports
- `/policies` - Data retention, consent templates, masking rules
- `/admin` - User/role management, API keys, audit trail

## Technology Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **React Router 6** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API server (see API documentation)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Architecture

### State Management

- **authStore**: User authentication state, JWT token
- **dataStore**: Real-time personnel, alerts, environment data

### API Integration

All API calls are centralized in `src/lib/api.ts`:
- OAuth2 + JWT authentication
- Automatic token refresh
- Request/response interceptors
- Error handling and 401 redirects

### Privacy & Security

**Privacy by Design:**
- Command view shows pseudonymized IDs only
- Individual health data requires explicit consent
- All access logged in tamper-evident audit trail

**Security Features:**
- TLS/HTTPS enforced
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- JWT-based authentication
- Role-based access control (RBAC)

### Calculations & Algorithms

Located in `src/lib/calculations.ts`:

**Readiness Index** (0-100):
```
readiness = hrv_component(30%) + sleep_component(30%) + 
            training_load(25%) + heat_exposure(15%)
```

**Fatigue Score** (0-5):
```
fatigue = hr_stress + sleep_factor + activity_load
```

**Heat Risk** (low/medium/high/critical):
- WBGT thresholds: <26 (low), 26-29 (medium), 29-32 (high), ≥32 (critical)
- Combined with heart rate % and activity level

**WBGT Calculation**:
- Indoor: `0.7 × WetBulb + 0.3 × GlobeTemp`
- Outdoor: `0.7 × WetBulb + 0.2 × GlobeTemp + 0.1 × DryBulb`

**Heat Index**: Uses NOAA formula with temperature and humidity

## API Endpoints

### Authentication
```
POST /api/auth/login - User login with 2FA support
POST /api/auth/logout - Logout
POST /api/auth/refresh - Refresh JWT token
```

### Overview
```
GET /api/overview - Dashboard metrics and unit summaries
```

### Team
```
GET /api/team/:unitId - Team summary
GET /api/team/:unitId/personnel - List personnel
```

### Person (Medical Staff Only)
```
GET /api/person/:pid/vitals - Vital signs time series
GET /api/person/:pid/recovery - Recovery metrics
GET /api/person/:pid/sleep - Sleep data
GET /api/person/:pid/consent - Check consent status
POST /api/person/:pid/access - Request access
```

### Environment
```
GET /api/env/wbgt - WBGT and environmental data
GET /api/env/sensors - Sensor list
```

### Alerts
```
GET /api/alerts - List alerts (filterable)
POST /api/alerts/:id/ack - Acknowledge alert
POST /api/alerts/:id/resolve - Resolve alert
GET /api/alerts/rules - Alert rules
POST /api/alerts/rules - Create rule
```

### Devices
```
GET /api/devices - List devices
GET /api/devices/:id - Device details
PATCH /api/devices/:id - Update device
POST /api/devices/enroll - Enroll new device
GET /api/devices/gateways - Gateway list
```

### Reports
```
GET /api/reports - List reports
POST /api/reports/generate - Generate new report
GET /api/reports/:id/download - Download report
```

### Export
```
POST /api/export/aggregate - Export aggregate data (CSV/JSON)
POST /api/fhir/Observation - Export FHIR observations
```

### Admin
```
GET /api/admin/users - List users
POST /api/admin/users - Create user
GET /api/admin/audit - Audit logs
GET /api/admin/api-keys - API keys
```

## Real-time Data

The application supports real-time updates via:
- **Polling**: 10-second intervals for vital signs
- **MQTT** (optional): Subscribe to topics for instant updates
- **WebSocket** (optional): Bidirectional real-time communication

Enable real-time in Overview, Team, and Environment pages.

## Offline & Edge Support

**Edge Gateway Features:**
- Buffer 2-4 hours of data during connectivity loss
- Automatic backfill on reconnection
- Deduplication to prevent duplicate records
- Batch mode for zero-connectivity areas

**UI Behavior:**
- Graceful degradation with "partial data" indicators
- Cached data display with timestamps
- Retry logic for failed API calls

## Performance

**Optimization Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- Alert end-to-end SLA: < 30s
- Dashboard render: < 2.5s for 500 active devices
- Uptime: > 99%

**Techniques:**
- Code splitting and lazy loading
- Memoization of expensive calculations
- Virtual scrolling for large lists
- Debounced API calls
- Optimistic UI updates

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build

```bash
# Production build
npm run build

# Output in dist/ directory
```

## Compliance & Standards

**Data Privacy:**
- GDPR-compliant consent management
- Right to access, rectify, erase
- Data portability
- Retention policies

**Medical Standards:**
- FHIR R4 for clinical data
- HL7 integration ready
- ISO 13485 medical device considerations

**Security Standards:**
- OWASP Top 10 mitigation
- SOC 2 Type II ready
- HIPAA-aligned data handling

## Contributing

1. Create feature branch from `main`
2. Follow TypeScript and ESLint rules
3. Write tests for new features
4. Update documentation
5. Submit pull request

## Troubleshooting

**API Connection Issues:**
- Check `VITE_API_BASE_URL` in `.env`
- Verify backend is running
- Check browser console for CORS errors

**Authentication Failures:**
- Clear localStorage and cookies
- Check JWT token expiration
- Verify 2FA code timing

**Real-time Updates Not Working:**
- Check polling intervals (10s default)
- Verify WebSocket/MQTT connection
- Check network connectivity

## License

Proprietary - Defense and Force Health Protection Use Only

## Support

For technical support and documentation:
- Email: support@aeroguardvital.mil
- Docs: https://docs.aeroguardvital.mil
- Status: https://status.aeroguardvital.mil

## Acknowledgments

Built for force health protection and operational readiness monitoring.
