import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets, Wind, Volume2 } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';
import { environmentApi, devicesApi } from '@/lib/api';
import { EnvironmentData, Gateway } from '@/types';
import { format } from 'date-fns';

export const Environment: React.FC = () => {
  const [envData, setEnvData] = useState<EnvironmentData[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [env, gw] = await Promise.all([
        environmentApi.getWBGT(),
        devicesApi.getGateways(),
      ]);
      setEnvData(env as EnvironmentData[]);
      setGateways(gw as Gateway[]);
    } catch (error) {
      console.error('Failed to load environment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading environmental data...</div>
      </div>
    );
  }

  const avgTemp = envData.length > 0
    ? envData.reduce((sum, e) => sum + e.temperature, 0) / envData.length
    : 0;

  const avgWBGT = envData.length > 0
    ? envData.reduce((sum, e) => sum + e.wbgt, 0) / envData.length
    : 0;

  const criticalLocations = envData.filter(e => e.wbgt >= 32).length;
  const gatewaysOnline = gateways.filter(g => g.status === 'online').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Environmental Monitoring</h1>
        <p className="text-gray-600 mt-2">Real-time environmental conditions and sensor status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Avg Temperature"
          value={`${avgTemp.toFixed(1)}°C`}
          icon={Thermometer}
          color={avgTemp > 35 ? 'danger' : avgTemp > 30 ? 'warning' : 'success'}
        />
        <StatusCard
          title="Avg WBGT"
          value={`${avgWBGT.toFixed(1)}°C`}
          icon={Wind}
          color={avgWBGT >= 32 ? 'danger' : avgWBGT >= 29 ? 'warning' : 'success'}
        />
        <StatusCard
          title="Critical Locations"
          value={criticalLocations}
          subtitle="WBGT ≥ 32°C"
          icon={Droplets}
          color={criticalLocations > 0 ? 'danger' : 'success'}
        />
        <StatusCard
          title="Gateways Online"
          value={`${gatewaysOnline}/${gateways.length}`}
          icon={Volume2}
          color={gatewaysOnline === gateways.length ? 'success' : 'warning'}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Sensor Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {envData.map((env) => (
            <div
              key={env.id}
              className={`border-2 rounded-lg p-4 ${
                env.wbgt >= 32 ? 'border-danger-500 bg-danger-50' :
                env.wbgt >= 29 ? 'border-warning-500 bg-warning-50' :
                'border-success-500 bg-success-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{env.location.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    env.wbgt >= 32 ? 'bg-danger-600 text-white' :
                    env.wbgt >= 29 ? 'bg-warning-600 text-white' :
                    'bg-success-600 text-white'
                  }`}
                >
                  {env.wbgt >= 32 ? 'CRITICAL' : env.wbgt >= 29 ? 'HIGH' : 'SAFE'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Thermometer size={14} /> Temperature
                  </span>
                  <span className="font-semibold text-gray-900">{env.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Droplets size={14} /> Humidity
                  </span>
                  <span className="font-semibold text-gray-900">{env.humidity}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Wind size={14} /> WBGT
                  </span>
                  <span
                    className={`font-bold ${
                      env.wbgt >= 32 ? 'text-danger-700' :
                      env.wbgt >= 29 ? 'text-warning-700' :
                      'text-success-700'
                    }`}
                  >
                    {env.wbgt}°C
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Heat Index</span>
                  <span className="font-semibold text-gray-900">{env.heatIndex}°C</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Volume2 size={14} /> Noise
                  </span>
                  <span className="font-semibold text-gray-900">{env.noiseLevel} dB</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-500">
                Updated: {format(new Date(env.timestamp), 'HH:mm:ss')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Gateway Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((gateway) => (
            <div
              key={gateway.id}
              className={`border-2 rounded-lg p-4 ${
                gateway.status === 'online' ? 'border-success-500 bg-success-50' :
                gateway.status === 'degraded' ? 'border-warning-500 bg-warning-50' :
                'border-danger-500 bg-danger-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{gateway.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    gateway.status === 'online' ? 'bg-success-600 text-white' :
                    gateway.status === 'degraded' ? 'bg-warning-600 text-white' :
                    'bg-danger-600 text-white'
                  }`}
                >
                  {gateway.status.toUpperCase()}
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">{gateway.location}</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connected Devices</span>
                  <span className="font-semibold text-gray-900">{gateway.connectedDevices}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-semibold text-gray-900">{gateway.cpu}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-semibold text-gray-900">{gateway.memory}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Latency</span>
                  <span className="font-semibold text-gray-900">{gateway.latency}ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Buffered Records</span>
                  <span className="font-semibold text-gray-900">{gateway.bufferedRecords}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-500">
                Last sync: {format(new Date(gateway.lastSync), 'HH:mm:ss')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded">
        <h3 className="font-semibold text-primary-900 mb-2">WBGT Risk Levels</h3>
        <div className="space-y-1 text-sm text-primary-800">
          <p><strong>&lt; 26°C:</strong> Low risk - Normal activity</p>
          <p><strong>26-29°C:</strong> Moderate risk - Monitor hydration, allow breaks</p>
          <p><strong>29-32°C:</strong> High risk - Limit intense activity, frequent breaks</p>
          <p><strong>≥ 32°C:</strong> Critical risk - Avoid strenuous activity, relocate to cooler area</p>
        </div>
      </div>
    </div>
  );
};
