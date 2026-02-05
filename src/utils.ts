
import type { Point, Zone } from './types';

/**
 * Checks if a point is inside a rectangular zone
 */
export const isPointInZone = (point: Point, zone: Zone): boolean => {
  const xs = zone.points.map(p => p.x);
  const ys = zone.points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
};

/**
 * Calculate Euclidean distance between two points
 */
export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Format time in mm:ss
 */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
