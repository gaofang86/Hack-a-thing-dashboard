
export const WAREHOUSE_WIDTH = 800;
export const WAREHOUSE_HEIGHT = 600;

export type ZoneType = 'REST' | 'WORK' | 'BLIND';

export const ZoneType = {
  REST: 'REST' as ZoneType,
  WORK: 'WORK' as ZoneType, // Restricted
  BLIND: 'BLIND' as ZoneType
};

export interface Point {
  x: number;
  y: number;
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  color: string;
  points: Point[];
}

export interface AP {
  id: string;
  label: string;
  position: Point;
  status: 'online' | 'offline';
}

export interface WellbeingStats {
  aloneTime: number; // seconds
  edgeZonePercentage: number;
  isolationAlert: boolean;
  stabilityScore: number; // Baseline deviation (0-100)
}
export type SafetyStatus = 'SAFE' | 'WARNING' | 'DANGER';
export interface Person {
  id: string;
  name: string;
  position: Point;
  zoneId: string;
  lastSeen: number;
  dwellTime: number;
  totalWorkTime: number;
  totalRestTime: number;
  safetyViolation: boolean;
  isAuthenticated: boolean;
  role: 'Worker' | 'Supervisor' | 'Visitor';
  violationReason?: string;
  wellbeing: WellbeingStats;
  safetyStatus: SafetyStatus;
}

export interface Bottleneck {
  zoneName: string;
  density: number;
  isOverloaded: boolean;
  occupantCount: number;
  // Added avgDwellTime to match usage in EfficiencyCharts
  avgDwellTime: number;
}

export type AssetType = 'FORKLIFT' | 'PALLET' | 'HAZMAT';

export interface Asset {
  id: string;
  type: AssetType;
  position: { x: number; y: number };
  velocity: { vx: number; vy: number };
  warningRadius: number;
  dangerRadius: number;
}
