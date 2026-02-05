// src/rules/efficiency.ts
import type { Person } from '../types';

export function computeEfficiency(person: Person) {
  const ratio =
    person.totalWorkTime / Math.max(person.totalRestTime, 1);

  if (ratio > 10) {
    return {
      level: 'warning',
      suggestion: 'Rest recommended',
    };
  }

  return {
    level: 'normal',
  };
}
