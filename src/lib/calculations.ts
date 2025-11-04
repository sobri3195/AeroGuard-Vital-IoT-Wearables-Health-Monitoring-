import { VitalSigns, SleepData, RecoveryData, RiskLevel } from '@/types';

export function calculateReadinessIndex(
  hrv: number,
  sleepScore: number,
  trainingLoad: number,
  heatExposure: number
): number {
  const hrvComponent = Math.min((hrv / 100) * 30, 30);
  const sleepComponent = (sleepScore / 100) * 30;
  const trainingComponent = Math.max(0, 25 - trainingLoad * 5);
  const heatComponent = Math.max(0, 15 - heatExposure * 3);
  
  return Math.round(Math.min(100, hrvComponent + sleepComponent + trainingComponent + heatComponent));
}

export function calculateFatigueScore(
  restingHr: number,
  maxHr: number,
  sleepQuality: number,
  activityLoad: number
): number {
  const hrStress = ((restingHr / maxHr) * 100 - 50) / 10;
  const sleepFactor = (100 - sleepQuality) / 20;
  const loadFactor = activityLoad / 20;
  
  const score = hrStress + sleepFactor + loadFactor;
  return Math.max(0, Math.min(5, Math.round(score * 10) / 10));
}

export function calculateHeatRisk(
  wbgt: number,
  heatIndex: number,
  currentHr: number,
  maxHr: number,
  activityLevel: number
): RiskLevel {
  const hrPercent = (currentHr / maxHr) * 100;
  
  let riskScore = 0;
  
  if (wbgt >= 32 || heatIndex >= 40) riskScore += 3;
  else if (wbgt >= 29 || heatIndex >= 35) riskScore += 2;
  else if (wbgt >= 26 || heatIndex >= 32) riskScore += 1;
  
  if (hrPercent > 85 && activityLevel > 0.7) riskScore += 2;
  else if (hrPercent > 75 && activityLevel > 0.5) riskScore += 1;
  
  if (riskScore >= 4) return 'critical';
  if (riskScore >= 3) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
}

export function calculateWBGT(
  dryBulbTemp: number,
  wetBulbTemp: number,
  globeTemp: number,
  indoors: boolean = false
): number {
  if (indoors) {
    return 0.7 * wetBulbTemp + 0.3 * globeTemp;
  }
  return 0.7 * wetBulbTemp + 0.2 * globeTemp + 0.1 * dryBulbTemp;
}

export function calculateHeatIndex(temperature: number, humidity: number): number {
  const T = temperature;
  const RH = humidity;
  
  if (T < 27) return T;
  
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
  
  if (HI >= 80) {
    HI = -42.379 + 2.04901523 * T + 10.14333127 * RH
      - 0.22475541 * T * RH - 0.00683783 * T * T
      - 0.05481717 * RH * RH + 0.00122874 * T * T * RH
      + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    
    if (RH < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    } else if (RH > 85 && T >= 80 && T <= 87) {
      HI += ((RH - 85) / 10) * ((87 - T) / 5);
    }
  }
  
  return Math.round(HI * 10) / 10;
}

export function calculateSleepScore(sleep: SleepData): number {
  const totalMinutes = sleep.totalMinutes;
  const targetMinutes = 480;
  const durationScore = Math.min(30, (totalMinutes / targetMinutes) * 30);
  
  const deepPercentage = (sleep.deepMinutes / totalMinutes) * 100;
  const deepScore = Math.min(25, (deepPercentage / 20) * 25);
  
  const remPercentage = (sleep.remMinutes / totalMinutes) * 100;
  const remScore = Math.min(20, (remPercentage / 20) * 20);
  
  const fragmentationPenalty = Math.min(25, sleep.fragmentations * 2);
  const fragmentationScore = 25 - fragmentationPenalty;
  
  return Math.round(durationScore + deepScore + remScore + fragmentationScore);
}

export function calculateRecoveryScore(
  hrv: number,
  restingHr: number,
  sleepScore: number,
  hydration: number
): number {
  const baselineHRV = 60;
  const baselineRestingHR = 60;
  
  const hrvScore = Math.min(30, (hrv / baselineHRV) * 30);
  const hrScore = Math.min(25, (baselineRestingHR / restingHr) * 25);
  const sleepComponent = (sleepScore / 100) * 25;
  const hydrationComponent = (hydration / 100) * 20;
  
  return Math.round(hrvScore + hrScore + sleepComponent + hydrationComponent);
}

export function getRecoveryRecommendation(recoveryScore: number): string {
  if (recoveryScore >= 85) {
    return 'Excellent recovery. Ready for high-intensity training.';
  } else if (recoveryScore >= 70) {
    return 'Good recovery. Suitable for moderate to high intensity.';
  } else if (recoveryScore >= 55) {
    return 'Fair recovery. Consider light to moderate activity.';
  } else if (recoveryScore >= 40) {
    return 'Poor recovery. Rest or very light activity recommended.';
  } else {
    return 'Critical recovery deficit. Rest required. Consult medical staff.';
  }
}

export function evaluateAlertCondition(
  value: number,
  operator: string,
  threshold: number,
  duration: number = 0,
  durationMet: number = 0
): boolean {
  let conditionMet = false;
  
  switch (operator) {
    case 'gt':
      conditionMet = value > threshold;
      break;
    case 'lt':
      conditionMet = value < threshold;
      break;
    case 'gte':
      conditionMet = value >= threshold;
      break;
    case 'lte':
      conditionMet = value <= threshold;
      break;
    case 'eq':
      conditionMet = value === threshold;
      break;
    case 'neq':
      conditionMet = value !== threshold;
      break;
  }
  
  if (duration > 0) {
    return conditionMet && durationMet >= duration;
  }
  
  return conditionMet;
}

export function aggregateUnitReadiness(personnelReadiness: number[]): number {
  if (personnelReadiness.length === 0) return 0;
  
  const avg = personnelReadiness.reduce((sum, r) => sum + r, 0) / personnelReadiness.length;
  const min = Math.min(...personnelReadiness);
  
  return Math.round(avg * 0.7 + min * 0.3);
}

export function calculateMaxHeartRate(age: number): number {
  return Math.round(208 - 0.7 * age);
}

export function getVitalStatus(vitals: VitalSigns): { status: RiskLevel; message: string } {
  const issues: string[] = [];
  let maxRisk: RiskLevel = 'low';
  
  if (vitals.heartRate > 100) {
    issues.push('Elevated heart rate');
    maxRisk = vitals.heartRate > 120 ? 'high' : 'medium';
  } else if (vitals.heartRate < 50) {
    issues.push('Low heart rate');
    maxRisk = 'medium';
  }
  
  if (vitals.spo2 < 95) {
    issues.push('Low oxygen saturation');
    maxRisk = vitals.spo2 < 90 ? 'critical' : 'high';
  }
  
  if (vitals.respiratoryRate > 20) {
    issues.push('Elevated respiratory rate');
    if (maxRisk === 'low') maxRisk = 'medium';
  } else if (vitals.respiratoryRate < 12) {
    issues.push('Low respiratory rate');
    if (maxRisk === 'low') maxRisk = 'medium';
  }
  
  if (vitals.skinTemp > 38) {
    issues.push('Elevated skin temperature');
    maxRisk = vitals.skinTemp > 39 ? 'high' : 'medium';
  }
  
  if (issues.length === 0) {
    return { status: 'low', message: 'All vitals normal' };
  }
  
  return { status: maxRisk, message: issues.join(', ') };
}
