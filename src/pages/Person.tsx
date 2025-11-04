import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Activity, Moon, Droplets, Heart } from 'lucide-react';
import { StatusCard } from '@/components/ui/StatusCard';
import { RiskDial } from '@/components/ui/RiskDial';
import { TrendChart } from '@/components/ui/TrendChart';
import { personApi } from '@/lib/api';
import { VitalSigns, SleepData, RecoveryData } from '@/types';
import { useAuthStore } from '@/store/authStore';

export const Person: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const user = useAuthStore((state) => state.user);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [sleep, setSleep] = useState<SleepData[]>([]);
  const [recovery, setRecovery] = useState<RecoveryData[]>([]);
  const [hasConsent, setHasConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consentRequested, setConsentRequested] = useState(false);

  useEffect(() => {
    if (pid) {
      checkConsent();
    }
  }, [pid]);

  const checkConsent = async () => {
    try {
      const consent = await personApi.checkConsent(pid!) as any;
      setHasConsent(consent.granted);
      
      if (consent.granted) {
        await loadPersonData();
      }
    } catch (error) {
      console.error('Failed to check consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonData = async () => {
    try {
      const [vitalsData, sleepData, recoveryData] = await Promise.all([
        personApi.getVitals(pid!),
        personApi.getSleep(pid!),
        personApi.getRecovery(pid!),
      ]);
      
      setVitals(vitalsData as VitalSigns[]);
      setSleep(sleepData as SleepData[]);
      setRecovery(recoveryData as RecoveryData[]);
    } catch (error) {
      console.error('Failed to load person data:', error);
    }
  };

  const requestAccess = async () => {
    try {
      await personApi.requestAccess(pid!, 'Medical assessment');
      setConsentRequested(true);
    } catch (error) {
      console.error('Failed to request access:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Checking access permissions...</div>
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <Shield className="mx-auto text-warning-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Consent Required</h2>
          <p className="text-gray-600 mb-6">
            Access to individual health data requires explicit consent from the personnel.
            This request will be logged in the audit trail.
          </p>
          {user?.role === 'medical' && !consentRequested && (
            <button
              onClick={requestAccess}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Request Access
            </button>
          )}
          {consentRequested && (
            <p className="text-success-600 font-medium">
              Access request submitted. Awaiting consent.
            </p>
          )}
          {user?.role !== 'medical' && (
            <p className="text-danger-600 font-medium">
              Only medical staff can request access to individual health data.
            </p>
          )}
        </div>
      </div>
    );
  }

  const latestVitals = vitals[vitals.length - 1];
  const latestRecovery = recovery[recovery.length - 1];
  const latestSleep = sleep[sleep.length - 1];

  return (
    <div className="space-y-6">
      <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded">
        <div className="flex items-center gap-2">
          <Shield className="text-warning-600" size={20} />
          <p className="text-sm font-medium text-warning-800">
            This is sensitive personal health information. Access is logged and monitored.
          </p>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Personnel ID: {pid}</h1>
        <p className="text-gray-600 mt-2">Individual health monitoring and recovery tracking</p>
      </div>

      {latestVitals && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard
            title="Heart Rate"
            value={`${latestVitals.heartRate} bpm`}
            icon={Heart}
            color={latestVitals.heartRate > 100 ? 'warning' : 'success'}
          />
          <StatusCard
            title="SpO₂"
            value={`${latestVitals.spo2}%`}
            icon={Activity}
            color={latestVitals.spo2 < 95 ? 'danger' : 'success'}
          />
          <StatusCard
            title="Respiratory Rate"
            value={`${latestVitals.respiratoryRate} /min`}
            icon={Activity}
            color={latestVitals.respiratoryRate > 20 ? 'warning' : 'success'}
          />
          <StatusCard
            title="Skin Temp"
            value={`${latestVitals.skinTemp.toFixed(1)}°C`}
            icon={Activity}
            color={latestVitals.skinTemp > 38 ? 'danger' : 'success'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {latestRecovery && (
          <>
            <RiskDial
              level={
                latestRecovery.recoveryScore >= 85 ? 'low' :
                latestRecovery.recoveryScore >= 70 ? 'medium' :
                latestRecovery.recoveryScore >= 55 ? 'high' : 'critical'
              }
              value={latestRecovery.recoveryScore}
              label="Recovery Score"
              size="lg"
            />
            <RiskDial
              level={latestRecovery.hrv >= 60 ? 'low' : latestRecovery.hrv >= 40 ? 'medium' : 'high'}
              value={latestRecovery.hrv}
              label="HRV"
              size="lg"
            />
          </>
        )}
        {latestSleep && (
          <RiskDial
            level={
              latestSleep.sleepScore >= 80 ? 'low' :
              latestSleep.sleepScore >= 60 ? 'medium' : 'high'
            }
            value={latestSleep.sleepScore}
            label="Sleep Score"
            size="lg"
          />
        )}
      </div>

      {vitals.length > 0 && (
        <TrendChart
          data={vitals.map(v => ({
            timestamp: v.timestamp,
            heartRate: v.heartRate,
            spo2: v.spo2,
            respiratoryRate: v.respiratoryRate,
          }))}
          lines={[
            { dataKey: 'heartRate', name: 'Heart Rate (bpm)', color: '#ef4444' },
            { dataKey: 'spo2', name: 'SpO₂ (%)', color: '#3b82f6' },
            { dataKey: 'respiratoryRate', name: 'RR (/min)', color: '#10b981' },
          ]}
          title="Vital Signs (Last 24 Hours)"
          height={300}
        />
      )}

      {latestSleep && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Moon className="text-primary-600" />
            Sleep Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(latestSleep.totalMinutes / 60)}h {latestSleep.totalMinutes % 60}m
              </div>
              <div className="text-sm text-gray-600">Total Sleep</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {latestSleep.deepMinutes}m
              </div>
              <div className="text-sm text-gray-600">Deep Sleep</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success-600">
                {latestSleep.remMinutes}m
              </div>
              <div className="text-sm text-gray-600">REM Sleep</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-600">
                {latestSleep.lightMinutes}m
              </div>
              <div className="text-sm text-gray-600">Light Sleep</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {latestSleep.fragmentations}
              </div>
              <div className="text-sm text-gray-600">Interruptions</div>
            </div>
          </div>
        </div>
      )}

      {latestRecovery && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets className="text-primary-600" />
            Recovery Recommendation
          </h2>
          <p className="text-gray-700 text-lg">{latestRecovery.recommendation}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">{latestRecovery.hrv}</div>
              <div className="text-sm text-gray-600">HRV (ms)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{latestRecovery.restingHr}</div>
              <div className="text-sm text-gray-600">Resting HR (bpm)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{latestRecovery.sleepScore}</div>
              <div className="text-sm text-gray-600">Sleep Quality</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{latestRecovery.hydrationLevel}%</div>
              <div className="text-sm text-gray-600">Hydration</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
