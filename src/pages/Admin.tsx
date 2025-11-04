import React, { useEffect, useState } from 'react';
import { Users, Key, FileText } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { AuditLog } from '@/types';
import { format } from 'date-fns';

export const Admin: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      const data = await adminApi.getAuditLogs();
      setAuditLogs(data as AuditLog[]);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600 mt-2">User management, API keys, and audit logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="text-primary-600" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          <p className="text-sm text-gray-600">
            Create, update, and manage user accounts and role assignments
          </p>
        </button>

        <button className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Key className="text-warning-600" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
          </div>
          <p className="text-sm text-gray-600">
            Generate and manage API keys for external system integration
          </p>
        </button>

        <button className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <FileText className="text-success-600" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
          </div>
          <p className="text-sm text-gray-600">
            Review system access and data modification audit trail
          </p>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Audit Log</h2>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading audit logs...</div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No audit logs available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {log.username}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {log.resource}
                      {log.resourceId && <span className="text-gray-500"> #{log.resourceId}</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {Object.keys(log.details).length > 0
                        ? JSON.stringify(log.details).substring(0, 50) + '...'
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded">
        <h3 className="font-semibold text-danger-900 mb-2">Security Notice</h3>
        <div className="space-y-1 text-sm text-danger-800">
          <p>All administrative actions are logged and monitored.</p>
          <p>Unauthorized access or misuse will result in immediate investigation.</p>
          <p>Audit logs are tamper-evident and retained for compliance requirements.</p>
        </div>
      </div>
    </div>
  );
};
