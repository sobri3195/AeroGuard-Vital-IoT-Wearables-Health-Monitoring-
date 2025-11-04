import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Activity, ThermometerSun, Battery } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';
import { RiskDial } from '@/components/ui/RiskDial';
import { TrendChart } from '@/components/ui/TrendChart';
import { teamApi } from '@/lib/api';
import { PersonHealth } from '@/types';

export const Team: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [personnel, setPersonnel] = useState<PersonHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unitId) {
      loadTeamData();
      const interval = setInterval(loadTeamData, 10000);
      return () => clearInterval(interval);
    }
  }, [unitId]);

  const loadTeamData = async () => {
    try {
      const data = await teamApi.getPersonnel(unitId!) as PersonHealth[];
      setPersonnel(data);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading team data...</div>
      </div>
    );
  }

  const avgReadiness = personnel.length > 0
    ? Math.round(personnel.reduce((sum, p) => sum + p.readinessIndex, 0) / personnel.length)
    : 0;

  const criticalCount = personnel.filter(p => p.heatRisk === 'critical' || p.fatigueScore >= 4).length;
  const onlineCount = personnel.filter(p => p.isOnline).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team: Unit {unitId}</h1>
        <p className="text-gray-600 mt-2">Real-time health monitoring and readiness status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Personnel Count"
          value={personnel.length}
          subtitle={`${onlineCount} online`}
          icon={Users}
          color="primary"
        />
        <StatusCard
          title="Avg Readiness"
          value={`${avgReadiness}%`}
          icon={Activity}
          color={avgReadiness >= 70 ? 'success' : avgReadiness >= 50 ? 'warning' : 'danger'}
        />
        <StatusCard
          title="At Risk"
          value={criticalCount}
          subtitle="Critical status"
          icon={ThermometerSun}
          color={criticalCount > 0 ? 'danger' : 'success'}
        />
        <StatusCard
          title="Device Health"
          value={`${Math.round((onlineCount / personnel.length) * 100)}%`}
          subtitle="Online devices"
          icon={Battery}
          color="success"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Personnel Status</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Readiness</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fatigue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Heat Risk</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">HR</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SpO₂</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Temp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Battery</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((person) => (
                <tr key={person.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {person.pseudonymId}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      person.isOnline ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {person.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            person.readinessIndex >= 70 ? 'bg-success-500' :
                            person.readinessIndex >= 50 ? 'bg-warning-500' :
                            'bg-danger-500'
                          }`}
                          style={{ width: `${person.readinessIndex}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">
                        {person.readinessIndex}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <span className={`font-medium ${
                      person.fatigueScore >= 4 ? 'text-danger-600' :
                      person.fatigueScore >= 3 ? 'text-warning-600' :
                      'text-success-600'
                    }`}>
                      {person.fatigueScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      person.heatRisk === 'critical' ? 'bg-red-900 text-white' :
                      person.heatRisk === 'high' ? 'bg-danger-100 text-danger-800' :
                      person.heatRisk === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    }`}>
                      {person.heatRisk.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {person.vitals.heartRate} bpm
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {person.vitals.spo2}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {person.vitals.skinTemp.toFixed(1)}°C
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Battery
                        size={16}
                        className={
                          person.batteryLevel > 50 ? 'text-success-600' :
                          person.batteryLevel > 20 ? 'text-warning-600' :
                          'text-danger-600'
                        }
                      />
                      <span className="text-sm text-gray-900">{person.batteryLevel}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Distribution</h2>
          <div className="grid grid-cols-2 gap-6">
            <RiskDial
              level={
                avgReadiness >= 80 ? 'low' :
                avgReadiness >= 60 ? 'medium' :
                avgReadiness >= 40 ? 'high' : 'critical'
              }
              value={avgReadiness}
              label="Avg Readiness"
            />
            <RiskDial
              level={
                criticalCount === 0 ? 'low' :
                criticalCount <= 2 ? 'medium' :
                criticalCount <= 5 ? 'high' : 'critical'
              }
              value={criticalCount}
              label="At Risk"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Heat Risk Summary</h2>
          <div className="space-y-4">
            {['low', 'medium', 'high', 'critical'].map((risk) => {
              const count = personnel.filter(p => p.heatRisk === risk).length;
              const percentage = personnel.length > 0 ? (count / personnel.length) * 100 : 0;
              
              return (
                <div key={risk}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{risk}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        risk === 'critical' ? 'bg-red-900' :
                        risk === 'high' ? 'bg-danger-500' :
                        risk === 'medium' ? 'bg-warning-500' :
                        'bg-success-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
