import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  onClick,
}) => {
  const colorClasses = {
    primary: 'border-primary-500 bg-primary-50',
    success: 'border-success-500 bg-success-50',
    warning: 'border-warning-500 bg-warning-50',
    danger: 'border-danger-500 bg-danger-50',
  };

  const iconColorClasses = {
    primary: 'text-primary-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  };

  return (
    <div
      className={`border-l-4 ${colorClasses[color]} p-4 rounded-lg shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <p
              className={`text-xs mt-2 ${
                trend === 'up'
                  ? 'text-success-600'
                  : trend === 'down'
                  ? 'text-danger-600'
                  : 'text-gray-500'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${iconColorClasses[color]}`}>
            <Icon size={32} />
          </div>
        )}
      </div>
    </div>
  );
};
