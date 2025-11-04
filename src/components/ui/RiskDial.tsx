import React from 'react';
import { RiskLevel } from '@/types';

interface RiskDialProps {
  level: RiskLevel;
  value: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskDial: React.FC<RiskDialProps> = ({
  level,
  value,
  label,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const colors = {
    low: { bg: 'bg-success-100', border: 'border-success-500', text: 'text-success-700' },
    medium: { bg: 'bg-warning-100', border: 'border-warning-500', text: 'text-warning-700' },
    high: { bg: 'bg-danger-100', border: 'border-danger-500', text: 'text-danger-700' },
    critical: { bg: 'bg-red-900', border: 'border-red-900', text: 'text-white' },
  };

  const color = colors[level];
  const percentage = Math.min(100, Math.max(0, value));
  const rotation = (percentage / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${color.bg} ${color.border} border-4 rounded-full flex items-center justify-center`}
        >
          <div className="text-center">
            <div className={`${textSizeClasses[size]} font-bold ${color.text}`}>
              {value}
            </div>
            <div className={`text-xs ${color.text} uppercase`}>{level}</div>
          </div>
        </div>
        <svg
          className="absolute top-0 left-0 w-full h-full"
          style={{ transform: 'rotate(-135deg)' }}
        >
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200"
            strokeDasharray="283"
            strokeDashoffset="70.75"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={color.text}
            strokeDasharray="283"
            strokeDashoffset={283 - (percentage / 100) * 212.25}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-2">{label}</p>
    </div>
  );
};
