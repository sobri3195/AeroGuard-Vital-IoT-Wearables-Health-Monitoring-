export type UserRole = 'commander' | 'medical' | 'personnel' | 'iot_operator' | 'security_admin';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  unitId?: string;
  permissions: string[];
  lastLogin?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface VitalSigns {
  heartRate: number;
  respiratoryRate: number;
  spo2: number;
  skinTemp: number;
  timestamp: Date;
}

export interface PersonHealth {
  id: string;
  pseudonymId: string;
  name?: string;
  unitId: string;
  vitals: VitalSigns;
  readinessIndex: number;
  fatigueScore: number;
  heatRisk: RiskLevel;
  lastUpdate: Date;
  deviceId: string;
  batteryLevel: number;
  isOnline: boolean;
}

export interface EnvironmentData {
  id: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  temperature: number;
  humidity: number;
  wbgt: number;
  heatIndex: number;
  noiseLevel: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'heat_stress' | 'fatigue' | 'vital_abnormal' | 'device' | 'environmental';
  severity: AlertSeverity;
  status: AlertStatus;
  personId?: string;
  pseudonymId?: string;
  unitId: string;
  title: string;
  message: string;
  data: Record<string, any>;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  escalationLevel: number;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: AlertCondition[];
  actions: AlertAction[];
  priority: number;
}

export interface AlertCondition {
  parameter: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  value: number;
  duration?: number;
}

export interface AlertAction {
  type: 'notify' | 'escalate' | 'log';
  target: string[];
  message?: string;
}

export interface UnitSummary {
  unitId: string;
  unitName: string;
  personnelCount: number;
  onlineCount: number;
  readinessIndex: number;
  activeAlerts: number;
  criticalAlerts: number;
  heatRisk: RiskLevel;
  fatigueRisk: RiskLevel;
  lastUpdate: Date;
}

export interface Device {
  id: string;
  deviceType: 'wearable' | 'gateway' | 'env_sensor';
  model: string;
  firmwareVersion: string;
  assignedTo?: string;
  pseudonymId?: string;
  unitId?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'lost';
  batteryLevel: number;
  lastSeen: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Gateway {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'degraded';
  cpu: number;
  memory: number;
  latency: number;
  connectedDevices: number;
  bufferedRecords: number;
  lastSync: Date;
}

export interface SleepData {
  date: Date;
  totalMinutes: number;
  deepMinutes: number;
  lightMinutes: number;
  remMinutes: number;
  awakeMinutes: number;
  sleepScore: number;
  fragmentations: number;
}

export interface RecoveryData {
  date: Date;
  hrv: number;
  restingHr: number;
  sleepScore: number;
  hydrationLevel: number;
  recoveryScore: number;
  recommendation: string;
}

export interface ConsentRecord {
  personId: string;
  consentType: 'aggregate' | 'medical' | 'research';
  granted: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  accessLog: ConsentAccessLog[];
}

export interface ConsentAccessLog {
  accessedBy: string;
  accessedAt: Date;
  purpose: string;
  dataAccessed: string[];
}

export interface PrivacyPolicy {
  id: string;
  name: string;
  description: string;
  maskingRules: MaskingRule[];
  retentionDays: number;
  allowedRoles: UserRole[];
}

export interface MaskingRule {
  field: string;
  roles: UserRole[];
  maskType: 'hide' | 'pseudonym' | 'aggregate';
}

export interface ExportRequest {
  type: 'aggregate' | 'fhir';
  format: 'csv' | 'json' | 'fhir';
  filters: {
    unitId?: string;
    fromDate: Date;
    toDate: Date;
    includeFields: string[];
  };
  requestedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface Report {
  id: string;
  type: 'weekly' | 'monthly' | 'incident';
  period: {
    start: Date;
    end: Date;
  };
  unitId?: string;
  metrics: {
    avgReadiness: number;
    totalAlerts: number;
    heatIncidents: number;
    fatigueIncidents: number;
    interventions: number;
    trainingHours: number;
  };
  generatedAt: Date;
  generatedBy: string;
}

export interface DashboardMetrics {
  overview: {
    totalPersonnel: number;
    onlinePersonnel: number;
    avgReadiness: number;
    activeAlerts: number;
    criticalAlerts: number;
  };
  units: UnitSummary[];
  recentAlerts: Alert[];
  environmentalStatus: EnvironmentData[];
  systemHealth: {
    gatewaysOnline: number;
    gatewaysTotal: number;
    devicesOnline: number;
    devicesTotal: number;
    avgLatency: number;
  };
}
