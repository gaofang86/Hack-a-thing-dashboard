interface Person {
  isAuthenticated: boolean;
  wellbeing: {
    isolationAlert: boolean;
    stabilityScore: number;
  };
  safetyViolation?: boolean;
}

interface Zone {
  type: string;
}

export function checkSecurity(person: Person, zone: Zone, neighbors: number[]) {
  if (!person.isAuthenticated && zone.type === 'restricted') {
    return { level: 'alert', message: 'Unauthenticated access' };
  }

  if (zone.type === 'restricted' && neighbors.some(d => d < 2)) {
    return { level: 'alert', message: 'Following too close' };
  }

  return null;
}
export function assessWellbeing(person: Person) {
  const stats = person.wellbeing;
  if (stats.isolationAlert) {
    return { level: 'warning', message: 'Isolation detected' };
  }
  if (stats.stabilityScore < 40) {
    return { level: 'warning', message: 'Low stability score' };
  }
  return null;
}
export function evaluateZoneSafety(zone: Zone, occupants: Person[]) {
  const violations = occupants.filter(p => p.safetyViolation);
  if (violations.length > 0) {
    return { level: 'alert', message: `${violations.length} safety violations` };
  }
  return null;
}
export function overallSafetyAssessment(person: Person, zone: Zone, neighbors: number[]) {
  const securityIssue = checkSecurity(person, zone, neighbors);
  if (securityIssue) return securityIssue;

  const wellbeingIssue = assessWellbeing(person);
  if (wellbeingIssue) return wellbeingIssue;

  const zoneIssue = evaluateZoneSafety(zone, [person]);
  if (zoneIssue) return zoneIssue;

  return { level: 'safe', message: 'All clear' };
}