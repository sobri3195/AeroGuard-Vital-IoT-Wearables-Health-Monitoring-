import React, { useEffect, useState } from 'react';
import { Shield, Lock, FileText, Eye } from 'lucide-react';
import { policiesApi } from '@/lib/api';
import { PrivacyPolicy } from '@/types';

export const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await policiesApi.getPolicies();
      setPolicies(data as PrivacyPolicy[]);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Privacy & Data Policies</h1>
        <p className="text-gray-600 mt-2">Data retention, consent management, and masking rules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Shield className="text-primary-600" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Privacy by Design</h2>
          </div>
          <p className="text-sm text-gray-600">
            All health data is pseudonymized by default. Command view shows only aggregate data.
            Individual identification requires explicit consent and is logged.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Lock className="text-warning-600" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Data Retention</h2>
          </div>
          <p className="text-sm text-gray-600">
            Raw vital data: 90 days. Aggregate metrics: 12 months. Clinical records follow medical
            retention requirements. All configurable per policy.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <Eye className="text-success-600" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
          </div>
          <p className="text-sm text-gray-600">
            Every access to individual health data is logged with timestamp, user, purpose, and data
            accessed. Tamper-evident logs retained for compliance.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Active Policies</h2>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading policies...</div>
        ) : policies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No policies configured</div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="text-primary-600" size={20} />
                    <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    Retention: {policy.retentionDays} days
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Allowed Roles:</div>
                  <div className="flex flex-wrap gap-2">
                    {policy.allowedRoles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {policy.maskingRules.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Masking Rules:</div>
                    <div className="space-y-2">
                      {policy.maskingRules.map((rule, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="font-medium">{rule.field}:</span>
                          <span className="capitalize">{rule.maskType}</span>
                          <span className="text-gray-400">for</span>
                          <span className="text-primary-600">{rule.roles.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded">
        <h3 className="font-semibold text-warning-900 mb-2 flex items-center gap-2">
          <Shield size={20} />
          Consent Management
        </h3>
        <div className="space-y-2 text-sm text-warning-800">
          <p>
            <strong>Default:</strong> Personnel consent to aggregate, anonymized monitoring for operational readiness.
          </p>
          <p>
            <strong>Medical Access:</strong> Individual health data access requires explicit consent, granted through secure process.
          </p>
          <p>
            <strong>Revocation:</strong> Personnel can revoke consent at any time. Data reverts to aggregate-only access.
          </p>
          <p>
            <strong>Emergency Override:</strong> Medical emergencies allow temporary access, logged and reviewed.
          </p>
        </div>
      </div>
    </div>
  );
};
