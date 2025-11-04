import React, { useEffect, useState } from 'react';
import { Watch, Wifi, Battery, RefreshCw } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';
import { devicesApi } from '@/lib/api';
import { Device } from '@/types';
import { format } from 'date-fns';

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filter, setFilter] = useState<'all' | 'wearable' | 'gateway' | 'env_sensor'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, [filter]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await devicesApi.getDevices(
        filter === 'all' ? undefined : filter
      );
      setDevices(data as Device[]);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeDevices = devices.filter(d => d.status === 'active').length;
  const lowBattery = devices.filter(d => d.batteryLevel < 20).length;
  const offline = devices.filter(d => d.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
        <p className="text-gray-600 mt-2">Monitor wearables, sensors, and gateway status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Total Devices"
          value={devices.length}
          icon={Watch}
          color="primary"
        />
        <StatusCard
          title="Active"
          value={activeDevices}
          icon={Wifi}
          color="success"
        />
        <StatusCard
          title="Low Battery"
          value={lowBattery}
          icon={Battery}
          color={lowBattery > 0 ? 'warning' : 'success'}
        />
        <StatusCard
          title="Offline"
          value={offline}
          icon={RefreshCw}
          color={offline > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="flex gap-2">
        {(['all', 'wearable', 'gateway', 'env_sensor'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Device ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Model</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned To</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Battery</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Firmware</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Loading devices...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No devices found
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {device.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                      {device.deviceType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {device.model}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          device.status === 'active' ? 'bg-success-100 text-success-800' :
                          device.status === 'maintenance' ? 'bg-warning-100 text-warning-800' :
                          device.status === 'lost' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {device.pseudonymId || device.assignedTo || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Battery
                          size={16}
                          className={
                            device.batteryLevel > 50 ? 'text-success-600' :
                            device.batteryLevel > 20 ? 'text-warning-600' :
                            'text-danger-600'
                          }
                        />
                        <span className="text-sm text-gray-900">{device.batteryLevel}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {device.firmwareVersion}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {format(new Date(device.lastSeen), 'MMM dd, HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
