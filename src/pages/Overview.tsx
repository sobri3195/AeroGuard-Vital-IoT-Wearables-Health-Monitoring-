import React, { useEffect, useState } from 'react';
import { Users, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';
import { RiskDial } from '@/components/ui/RiskDial';
import { TrendChart } from '@/components/ui/TrendChart';
import { overviewApi } from '@/lib/api';
import { DashboardMetrics, Alert } from '@/types';
import { format } from 'date-fns';

export const Overview: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await overviewApi.getMetrics() as DashboardMetrics;
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const readinessLevel = 
    metrics.overview.avgReadiness >= 80 ? 'low' :
    metrics.overview.avgReadiness >= 60 ? 'medium' :
    metrics.overview.avgReadiness >= 40 ? 'high' : 'critical';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Force Readiness Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {format(new Date(), 'HH:mm:ss')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Total Personnel"
          value={metrics.overview.totalPersonnel}
          subtitle={`${metrics.overview.onlinePersonnel} online`}
          icon={Users}
          color="primary"
        />
        <StatusCard
          title="Avg Readiness"
          value={`${metrics.overview.avgReadiness}%`}
          icon={TrendingUp}
          color={
            readinessLevel === 'low' ? 'success' :
            readinessLevel === 'medium' ? 'warning' : 'danger'
          }
        />
        <StatusCard
          title="Active Alerts"
          value={metrics.overview.activeAlerts}
          subtitle={`${metrics.overview.criticalAlerts} critical`}
          icon={AlertTriangle}
          color={metrics.overview.criticalAlerts > 0 ? 'danger' : 'warning'}
        />
        <StatusCard
          title="System Health"
          value={`${Math.round((metrics.systemHealth.devicesOnline / metrics.systemHealth.devicesTotal) * 100)}%`}
          subtitle={`${metrics.systemHealth.gatewaysOnline}/${metrics.systemHealth.gatewaysTotal} gateways`}
          icon={Activity}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Unit Status</h2>
          <div className="space-y-4">
            {metrics.units.slice(0, 5).map((unit) => (
              <div key={unit.unitId} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{unit.unitName}</span>
                  <span className="text-sm text-gray-500">
                    {unit.onlineCount}/{unit.personnelCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Readiness: {unit.readinessIndex}%</span>
                  <span className={`font-semibold ${
                    unit.heatRisk === 'critical' ? 'text-red-900' :
                    unit.heatRisk === 'high' ? 'text-danger-600' :
                    unit.heatRisk === 'medium' ? 'text-warning-600' :
                    'text-success-600'
                  }`}>
                    {unit.heatRisk.toUpperCase()}
                  </span>
                </div>
                {unit.activeAlerts > 0 && (
                  <div className="mt-2 text-xs text-danger-600">
                    ⚠ {unit.activeAlerts} active alert{unit.activeAlerts > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {metrics.recentAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent alerts</p>
            ) : (
              metrics.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'emergency' ? 'border-red-900 bg-red-50' :
                    alert.severity === 'critical' ? 'border-danger-500 bg-danger-50' :
                    alert.severity === 'warning' ? 'border-warning-500 bg-warning-50' :
                    'border-primary-500 bg-primary-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase text-gray-700">
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(alert.createdAt), 'HH:mm:ss')}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Environmental Conditions</h2>
          <div className="grid grid-cols-2 gap-4">
            {metrics.environmentalStatus.slice(0, 4).map((env) => (
              <div key={env.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{env.location.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temp:</span>
                    <span className="font-medium">{env.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">WBGT:</span>
                    <span className={`font-medium ${
                      env.wbgt >= 32 ? 'text-danger-600' :
                      env.wbgt >= 29 ? 'text-warning-600' :
                      'text-success-600'
                    }`}>
                      {env.wbgt}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity:</span>
                    <span className="font-medium">{env.humidity}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Performance</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {metrics.systemHealth.gatewaysOnline}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Gateways</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600">
                {metrics.systemHealth.devicesOnline}
              </div>
              <div className="text-sm text-gray-600 mt-1">Online Devices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {metrics.systemHealth.avgLatency}ms
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg Latency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
