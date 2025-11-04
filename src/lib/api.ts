import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiClient();

export const authApi = {
  login: (username: string, password: string, twoFactorCode?: string) =>
    api.post('/auth/login', { username, password, twoFactorCode }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  verifyDevice: (deviceId: string) => api.post('/auth/device/verify', { deviceId }),
};

export const overviewApi = {
  getMetrics: (unitId?: string, from?: Date, to?: Date) =>
    api.get('/overview', {
      params: { unitId, from: from?.toISOString(), to: to?.toISOString() },
    }),
};

export const personApi = {
  getVitals: (pid: string, from?: Date, to?: Date) =>
    api.get(`/person/${pid}/vitals`, {
      params: { from: from?.toISOString(), to: to?.toISOString() },
    }),
  getRecovery: (pid: string, from?: Date, to?: Date) =>
    api.get(`/person/${pid}/recovery`, {
      params: { from: from?.toISOString(), to: to?.toISOString() },
    }),
  getSleep: (pid: string, from?: Date, to?: Date) =>
    api.get(`/person/${pid}/sleep`, {
      params: { from: from?.toISOString(), to: to?.toISOString() },
    }),
  checkConsent: (pid: string) => api.get(`/person/${pid}/consent`),
  requestAccess: (pid: string, purpose: string) =>
    api.post(`/person/${pid}/access`, { purpose }),
};

export const teamApi = {
  getTeamSummary: (unitId: string, from?: Date, to?: Date) =>
    api.get(`/team/${unitId}`, {
      params: { from: from?.toISOString(), to: to?.toISOString() },
    }),
  getPersonnel: (unitId: string) => api.get(`/team/${unitId}/personnel`),
};

export const environmentApi = {
  getWBGT: (lat?: number, lng?: number, radius?: number, from?: Date, to?: Date) =>
    api.get('/env/wbgt', {
      params: { lat, lng, radius, from: from?.toISOString(), to: to?.toISOString() },
    }),
  getSensors: () => api.get('/env/sensors'),
};

export const alertsApi = {
  getAlerts: (status?: string, severity?: string, unitId?: string) =>
    api.get('/alerts', { params: { status, severity, unitId } }),
  acknowledgeAlert: (id: string, note?: string) =>
    api.post(`/alerts/${id}/ack`, { note }),
  resolveAlert: (id: string, resolution: string) =>
    api.post(`/alerts/${id}/resolve`, { resolution }),
  getRules: () => api.get('/alerts/rules'),
  createRule: (rule: any) => api.post('/alerts/rules', rule),
  updateRule: (id: string, rule: any) => api.put(`/alerts/rules/${id}`, rule),
  deleteRule: (id: string) => api.delete(`/alerts/rules/${id}`),
};

export const devicesApi = {
  getDevices: (type?: string, status?: string) =>
    api.get('/devices', { params: { type, status } }),
  getDevice: (id: string) => api.get(`/devices/${id}`),
  updateDevice: (id: string, updates: any) => api.patch(`/devices/${id}`, updates),
  enrollDevice: (deviceData: any) => api.post('/devices/enroll', deviceData),
  getGateways: () => api.get('/devices/gateways'),
  getGatewayStatus: (id: string) => api.get(`/devices/gateways/${id}/status`),
};

export const reportsApi = {
  getReports: (type?: string, from?: Date, to?: Date) =>
    api.get('/reports', {
      params: { type, from: from?.toISOString(), to: to?.toISOString() },
    }),
  generateReport: (type: string, filters: any) =>
    api.post('/reports/generate', { type, filters }),
  downloadReport: (id: string) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

export const exportApi = {
  exportAggregate: (filters: any) => api.post('/export/aggregate', filters),
  exportFHIR: (observations: any[]) => api.post('/fhir/Observation', observations),
};

export const policiesApi = {
  getPolicies: () => api.get('/policies'),
  getPolicy: (id: string) => api.get(`/policies/${id}`),
  updatePolicy: (id: string, policy: any) => api.put(`/policies/${id}`, policy),
  getConsentTemplates: () => api.get('/policies/consent/templates'),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  createUser: (user: any) => api.post('/admin/users', user),
  updateUser: (id: string, user: any) => api.put(`/admin/users/${id}`, user),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAuditLogs: (from?: Date, to?: Date, userId?: string) =>
    api.get('/admin/audit', {
      params: { from: from?.toISOString(), to: to?.toISOString(), userId },
    }),
  getApiKeys: () => api.get('/admin/api-keys'),
  createApiKey: (name: string, permissions: string[]) =>
    api.post('/admin/api-keys', { name, permissions }),
  revokeApiKey: (id: string) => api.delete(`/admin/api-keys/${id}`),
};
