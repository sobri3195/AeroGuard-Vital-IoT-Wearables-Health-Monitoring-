import React, { useState, useEffect } from 'react';
import { Alert, AlertSeverity, AlertStatus } from '@/types';
import { alertsApi } from '@/lib/api';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export const AlertInbox: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<AlertStatus | 'all'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsApi.getAlerts(
        filter === 'all' ? undefined : filter
      );
      setAlerts(data as Alert[]);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await alertsApi.acknowledgeAlert(id);
      loadAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertsApi.resolveAlert(id, 'Resolved by user');
      loadAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'emergency':
        return 'bg-red-900 text-white';
      case 'critical':
        return 'bg-danger-600 text-white';
      case 'warning':
        return 'bg-warning-500 text-white';
      case 'info':
        return 'bg-primary-500 text-white';
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="text-danger-600" size={20} />;
      case 'acknowledged':
        return <Clock className="text-warning-600" size={20} />;
      case 'resolved':
        return <CheckCircle className="text-success-600" size={20} />;
      case 'escalated':
        return <XCircle className="text-red-900" size={20} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'acknowledged', 'resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No alerts found</div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(alert.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(alert.createdAt), 'MMM dd, HH:mm:ss')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    {alert.pseudonymId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Personnel: {alert.pseudonymId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1 bg-warning-500 text-white text-sm rounded hover:bg-warning-600 transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1 bg-success-500 text-white text-sm rounded hover:bg-success-600 transition-colors"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 bg-success-500 text-white text-sm rounded hover:bg-success-600 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
