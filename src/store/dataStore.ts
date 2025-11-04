import { create } from 'zustand';
import { PersonHealth, Alert, UnitSummary, EnvironmentData, Gateway } from '@/types';

interface DataStore {
  personnel: PersonHealth[];
  alerts: Alert[];
  units: UnitSummary[];
  environment: EnvironmentData[];
  gateways: Gateway[];
  
  setPersonnel: (personnel: PersonHealth[]) => void;
  updatePerson: (id: string, updates: Partial<PersonHealth>) => void;
  
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  
  setUnits: (units: UnitSummary[]) => void;
  updateUnit: (unitId: string, updates: Partial<UnitSummary>) => void;
  
  setEnvironment: (data: EnvironmentData[]) => void;
  addEnvironment: (data: EnvironmentData) => void;
  
  setGateways: (gateways: Gateway[]) => void;
  updateGateway: (id: string, updates: Partial<Gateway>) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  personnel: [],
  alerts: [],
  units: [],
  environment: [],
  gateways: [],
  
  setPersonnel: (personnel) => set({ personnel }),
  updatePerson: (id, updates) =>
    set((state) => ({
      personnel: state.personnel.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),
  updateAlert: (id, updates) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  
  setUnits: (units) => set({ units }),
  updateUnit: (unitId, updates) =>
    set((state) => ({
      units: state.units.map((u) =>
        u.unitId === unitId ? { ...u, ...updates } : u
      ),
    })),
  
  setEnvironment: (environment) => set({ environment }),
  addEnvironment: (data) =>
    set((state) => ({
      environment: [data, ...state.environment.slice(0, 99)],
    })),
  
  setGateways: (gateways) => set({ gateways }),
  updateGateway: (id, updates) =>
    set((state) => ({
      gateways: state.gateways.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),
}));
