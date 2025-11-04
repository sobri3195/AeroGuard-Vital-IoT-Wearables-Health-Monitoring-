import React from 'react';
import { AlertInbox } from '@/components/alerts/AlertInbox';

export const Alerts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
        <p className="text-gray-600 mt-2">Monitor and respond to health and environmental alerts</p>
      </div>

      <AlertInbox />
    </div>
  );
};
