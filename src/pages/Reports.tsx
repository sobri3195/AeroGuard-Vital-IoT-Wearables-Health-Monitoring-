import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { Report } from '@/types';
import { format } from 'date-fns';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await reportsApi.getReports();
      setReports(data as Report[]);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      await reportsApi.downloadReport(id);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Weekly and monthly readiness and incident reports</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Available Reports</h2>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
            <FileText size={20} />
            Generate New Report
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reports available</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="text-primary-600" size={20} />
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {report.type} Report
                      </h3>
                      {report.unitId && (
                        <span className="text-sm text-gray-500">- Unit {report.unitId}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {format(new Date(report.period.start), 'MMM dd')} -{' '}
                        {format(new Date(report.period.end), 'MMM dd, yyyy')}
                      </div>
                      <div>Generated: {format(new Date(report.generatedAt), 'MMM dd, HH:mm')}</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Avg Readiness</div>
                        <div className="font-semibold text-gray-900">
                          {report.metrics.avgReadiness}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total Alerts</div>
                        <div className="font-semibold text-gray-900">
                          {report.metrics.totalAlerts}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Heat Incidents</div>
                        <div className="font-semibold text-danger-600">
                          {report.metrics.heatIncidents}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Fatigue Cases</div>
                        <div className="font-semibold text-warning-600">
                          {report.metrics.fatigueIncidents}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Interventions</div>
                        <div className="font-semibold text-success-600">
                          {report.metrics.interventions}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Training Hours</div>
                        <div className="font-semibold text-gray-900">
                          {report.metrics.trainingHours}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
