/**
 * Contact Points Balance System
 * Calculates balanced damage multipliers based on the number of contact points (spikes)
 *
 * Balance Formula:
 * - More spikes = more consistent hits but lower peak damage
 * - Fewer spikes = fewer hits but higher peak damage
 * - Total damage potential stays balanced across all configurations
 */

export interface ContactPoint {
  angle: number;
  damageMultiplier: number;
  width: number;
}

/**
 * Calculate the base damage multiplier for a beyblade based on number of contact points
 * This represents the "spike" damage when a contact point hits
 *
 * Formula:
 * - 1 spike: 2.0x (max damage, but only hits occasionally)
 * - 2 spikes: 1.6x
 * - 3 spikes: 1.4x
 * - 4 spikes: 1.3x
 * - 5 spikes: 1.25x
 * - 6 spikes: 1.2x
 * - 7 spikes: 1.15x
 * - 8 spikes: 1.12x
 * - 9 spikes: 1.11x
 * - 10 spikes: 1.1x (minimum, but very consistent hits)
 *
 * The formula ensures: fewer spikes = higher damage but less frequent
 */
export function calculateBalancedDamageMultiplier(numSpikes: number): number {
  if (numSpikes <= 0) return 1.0;
  if (numSpikes === 1) return 2.0;
  if (numSpikes === 2) return 1.6;
  if (numSpikes === 3) return 1.4;
  if (numSpikes === 4) return 1.3;
  if (numSpikes === 5) return 1.25;
  if (numSpikes === 6) return 1.2;
  if (numSpikes === 7) return 1.15;
  if (numSpikes === 8) return 1.12;
  if (numSpikes === 9) return 1.11;
  return 1.1; // 10+ spikes
}

/**
 * Calculate the base damage (when not hitting a spike)
 * This is always 1.0 for balance
 */
export function getBaseDamage(): number {
  return 1.0;
}

/**
 * Auto-distribute contact points evenly around the beyblade
 * Useful for creating balanced configurations quickly
 */
export function generateEvenlyDistributedPoints(
  numPoints: number,
  startAngle: number = 0,
): ContactPoint[] {
  if (numPoints <= 0 || numPoints > 10) return [];

  const angleStep = 360 / numPoints;
  const baseDamage = calculateBalancedDamageMultiplier(numPoints);
  const baseWidth = Math.max(20, (360 / numPoints) * 0.7); // Width proportional to spacing

  const points: ContactPoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    points.push({
      angle: (startAngle + angleStep * i) % 360,
      damageMultiplier: baseDamage,
      width: Math.min(baseWidth, 60), // Cap at 60 degrees
    });
  }

  return points;
}

/**
 * Validate and normalize contact points to ensure they're balanced
 */
export function normalizeContactPoints(points: ContactPoint[]): ContactPoint[] {
  if (points.length === 0) return points;

  const recommendedDamage = calculateBalancedDamageMultiplier(points.length);

  return points.map((point) => ({
    ...point,
    // Ensure angles are within 0-360
    angle: ((point.angle % 360) + 360) % 360,
    // Keep damage multipliers reasonable (0.5 to 3.0)
    damageMultiplier: Math.max(0.5, Math.min(3.0, point.damageMultiplier)),
    // Keep widths reasonable (10 to 90 degrees)
    width: Math.max(10, Math.min(90, point.width)),
  }));
}

/**
 * Check if an angle hits any contact point
 * Returns the damage multiplier if hit, or base damage (1.0) if no hit
 */
export function calculateDamageAtAngle(
  contactPoints: ContactPoint[],
  hitAngle: number,
): { isHit: boolean; damageMultiplier: number; hitPointIndex: number | null } {
  // Normalize hit angle to 0-360
  const normalizedAngle = ((hitAngle % 360) + 360) % 360;

  // Check each contact point
  for (let i = 0; i < contactPoints.length; i++) {
    const point = contactPoints[i];
    const halfWidth = point.width / 2;

    // Calculate angle difference (accounting for wraparound)
    let angleDiff = Math.abs(normalizedAngle - point.angle);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;

    // Check if within the contact point's width
    if (angleDiff <= halfWidth) {
      return {
        isHit: true,
        damageMultiplier: point.damageMultiplier,
        hitPointIndex: i,
      };
    }
  }

  // No hit - return base damage
  return {
    isHit: false,
    damageMultiplier: getBaseDamage(),
    hitPointIndex: null,
  };
}

/**
 * Get statistics about a contact point configuration
 */
export function getContactPointStats(points: ContactPoint[]) {
  if (points.length === 0) {
    return {
      numPoints: 0,
      recommendedDamage: 1.0,
      averageDamage: 1.0,
      maxDamage: 1.0,
      minDamage: 1.0,
      totalCoverage: 0,
      isBalanced: true,
    };
  }

  const recommendedDamage = calculateBalancedDamageMultiplier(points.length);
  const damages = points.map((p) => p.damageMultiplier);
  const averageDamage = damages.reduce((a, b) => a + b, 0) / damages.length;
  const maxDamage = Math.max(...damages);
  const minDamage = Math.min(...damages);
  const totalCoverage = points.reduce((sum, p) => sum + p.width, 0);

  // Consider balanced if all points are within 20% of recommended damage
  const isBalanced = damages.every(
    (d) => Math.abs(d - recommendedDamage) / recommendedDamage < 0.2,
  );

  return {
    numPoints: points.length,
    recommendedDamage,
    averageDamage,
    maxDamage,
    minDamage,
    totalCoverage,
    isBalanced,
  };
}

/**
 * Suggest optimal contact point configuration for a beyblade type
 */
export function suggestContactPointsForType(type: string): {
  numPoints: number;
  description: string;
  points: ContactPoint[];
} {
  switch (type.toLowerCase()) {
    case "attack":
      // Attack types: 3-4 spikes for high damage
      return {
        numPoints: 3,
        description: "3 heavy spikes for maximum impact damage",
        points: generateEvenlyDistributedPoints(3),
      };

    case "defense":
      // Defense types: 2 large spikes for counter-attacks
      return {
        numPoints: 2,
        description: "2 massive contact points for powerful counters",
        points: generateEvenlyDistributedPoints(2),
      };

    case "stamina":
      // Stamina types: 6-8 small points for consistent hits
      return {
        numPoints: 6,
        description: "6 balanced points for consistent damage",
        points: generateEvenlyDistributedPoints(6),
      };

    case "balanced":
      // Balanced types: 4-5 medium points
      return {
        numPoints: 4,
        description: "4 well-balanced contact points",
        points: generateEvenlyDistributedPoints(4),
      };

    default:
      return {
        numPoints: 3,
        description: "3 standard contact points",
        points: generateEvenlyDistributedPoints(3),
      };
  }
}
