/**
 * Beyblade Stats and Special Moves System
 * Defines all unique characteristics for each Beyblade
 */

export type BeybladeType = "attack" | "defense" | "stamina" | "balanced";
export type SpinDirection = "left" | "right";

/**
 * Point of Contact - Arrow positions for collision damage multipliers
 */
export interface PointOfContact {
  angle: number; // Angle in degrees (0-360) relative to Beyblade center
  damageMultiplier: number; // Multiplier when this point hits (1.0x - 2.0x)
  width: number; // Angular width of the contact point in degrees
}

/**
 * Spin Steal Point - Positions for spin steal multipliers
 */
export interface SpinStealPoint {
  angle: number; // Angle in degrees (0-360) relative to Beyblade center
  spinStealMultiplier: number; // Multiplier for spin steal (1.0x - 2.0x)
  width: number; // Angular width of the spin steal point in degrees
}

/**
 * Type Distribution - 360 total points, max 150 per category
 *
 * Base Stats (0 points): 100 damage, 10 speed, 10 rotation, 10 knockback,
 *                        1x damage taken, 10% invulnerability, 1000 HP,
 *                        10% spin steal, 10 decay/sec
 *
 * Each point provides multiplicative bonuses:
 * - Attack: +1% to all stats (150pts = 2.5x all)
 * - Defense: -0.33% dmg taken, -0.167% knockback, +0.667% invuln (150pts = 50% dmg, 7.5 knockback, 20% invuln)
 * - Stamina: +1.333% HP, +2.667% steal, -0.167% decay (150pts = 3000 HP, 50% steal, 7.5 decay)
 */
export interface TypeDistribution {
  attack: number; // 0-150, multiplicative: base * (1 + points * 0.01)
  defense: number; // 0-150, multiplicative: varies by stat (see formulas above)
  stamina: number; // 0-150, multiplicative: varies by stat (see formulas above)
  total: number; // Must equal 360
}

/**
 * Complete Beyblade Stats
 */
export interface BeybladeStats {
  id: string;
  name?: string; // @deprecated - Use displayName instead (kept for backward compatibility)
  displayName: string;
  fileName: string; // SVG file name (legacy)
  imageUrl?: string; // Custom uploaded image URL (300x300 PNG with transparent background)

  // Image positioning (for WhatsApp-style editor)
  imagePosition?: {
    x: number; // Horizontal offset from center (-2 to 2, where 0 is center)
    y: number; // Vertical offset from center (-2 to 2, where 0 is center)
    scale: number; // Scale multiplier (0.5 to 3.0)
    rotation: number; // Rotation in degrees (0-360)
  };

  // Basic Properties
  type: BeybladeType;
  spinDirection: SpinDirection;

  // Physical Properties
  // RESOLUTION-BASED SIZING SYSTEM:
  // 1 cm = ARENA_RESOLUTION / 45 pixels (24px at 1080p)
  // Example: 4cm radius = 96px diameter at 1080p (standard size)
  mass: number; // grams, affects collision physics (typical: 10-2000g, real beyblades are ~40-60g)
  radius: number; // cm, physical radius (typical: 1.5-25cm, recommended: 3-5cm for standard)
  actualSize?: number; // DEPRECATED: Use getBeybladeDisplayRadius(radius) from constants instead

  // Calculated Stats (from typeDistribution, DO NOT SET MANUALLY)
  // Base values (0 points): 100 damage, 10 speed, 10 rotation, 10 knockback,
  //                         1x damage taken, 10% invulnerability, 1000 HP,
  //                         10% spin steal, 10 decay/sec
  //
  // ATTACK (multiplicative):
  // - Each point: +1% to all attack stats
  // - Formula: base * (1 + points * 0.01)
  // - 150 points: 250 damage (2.5x), 25 speed, 25 rotation
  //
  // DEFENSE (multiplicative):
  // - Damage taken: base * (1 - points * 0.00333) → 150pts = 50% damage taken
  // - Knockback: base * (1 - points * 0.00167) → 150pts = 7.5 units
  // - Invulnerability: base * (1 + points * 0.00667) → 150pts = 20% chance
  //
  // STAMINA (multiplicative):
  // - Max HP: base * (1 + points * 0.01333) → 150pts = 3000 HP
  // - Spin steal: base * (1 + points * 0.02667) → 150pts = 50% (25% same spin)
  // - Decay: base * (1 - points * 0.00167) → 150pts = 7.5/sec
  stamina?: number; // CALCULATED: 1000 * (1 + stamina_points * 0.01333), rounded up
  spinStealFactor?: number; // CALCULATED: 10 * (1 + stamina_points * 0.02667) % of damage
  spinDecayRate?: number; // CALCULATED: 10 * (1 - stamina_points * 0.00167) per sec
  speed?: number; // CALCULATED: 10 * (1 + attack_points * 0.01) units/sec
  rotationSpeed?: number; // CALCULATED: 10 * (1 + attack_points * 0.01) spins/sec
  invulnerabilityChance?: number; // CALCULATED: 10 * (1 + defense_points * 0.00667) %
  damageReduction?: number; // CALCULATED: 1 / damageTaken for display

  // Type Distribution (360 points total)
  typeDistribution: TypeDistribution;

  // Point of Contact (collision damage zones)
  pointsOfContact: PointOfContact[];
  
  // Spin Steal Points (spin steal zones)
  spinStealPoints?: SpinStealPoint[];

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * Type Bonuses calculated from type
 * Attack: +20% attack damage
 * Defense: -20% damage taken
 * Stamina: +20% max stamina (3000 instead of 2500)
 * Balanced: No bonuses
 */
export interface TypeBonuses {
  attackMultiplier: number; // Attack: 1.2, Others: 1.0
  defenseMultiplier: number; // Defense: 0.8 (takes 20% less), Others: 1.0
  maxStamina: number; // Stamina: 3000, Others: 2500
}

/**
 * Calculate type bonuses based on beyblade type
 */
export function calculateTypeBonuses(type: BeybladeType): TypeBonuses {
  const baseMaxStamina = 2500;

  switch (type) {
    case "attack":
      return {
        attackMultiplier: 1.2, // +20% attack damage
        defenseMultiplier: 1.0,
        maxStamina: baseMaxStamina,
      };
    case "defense":
      return {
        attackMultiplier: 1.0,
        defenseMultiplier: 0.8, // Takes 20% less damage
        maxStamina: baseMaxStamina,
      };
    case "stamina":
      return {
        attackMultiplier: 1.0,
        defenseMultiplier: 1.0,
        maxStamina: 3000, // +20% max stamina
      };
    case "balanced":
    default:
      return {
        attackMultiplier: 1.0,
        defenseMultiplier: 1.0,
        maxStamina: baseMaxStamina,
      };
  }
}

/**
 * Validate type distribution (must sum to 360, max 150 each)
 */
export function validateTypeDistribution(
  distribution: TypeDistribution,
): boolean {
  if (distribution.total !== 360) return false;
  if (distribution.attack < 0 || distribution.attack > 150) return false;
  if (distribution.defense < 0 || distribution.defense > 150) return false;
  if (distribution.stamina < 0 || distribution.stamina > 150) return false;
  if (distribution.attack + distribution.defense + distribution.stamina !== 360)
    return false;
  return true;
}

/**
 * Calculate all derived stats from type distribution
 *
 * BASE STATS (0 distribution points):
 * - 100 base damage
 * - 10 base speed (units/sec)
 * - 10 base rotation (spins/sec)
 * - 10 unit knockback distance
 * - 1x damage taken (take damage as is)
 * - 10% chance to become invulnerable for 1.5 sec
 * - 1000 base stamina (HP)
 * - 10% base spin steal
 * - 10 base spin decay per second
 *
 * ATTACK (0-150 range):
 * - Each point: +1% to all attack stats (multiplicative)
 * - 0 points = 100 damage (1.0x), 10 speed, 10 rotation
 * - 150 points = 250 damage (2.5x), 25 speed, 25 rotation
 * - Formula: base * (1 + points * 0.01)
 *
 * DEFENSE (0-150 range):
 * - Each point: -0.33% damage taken, -0.167% knockback, +0.667% invulnerability (multiplicative)
 * - 0 points = 100% damage taken (1.0x), 10 knockback, 10% invulnerability
 * - 150 points = 50% damage taken (0.5x), 7.5 knockback, 20% invulnerability
 * - Formula: base * (1 - points * 0.00333) for damage, base * (1 - points * 0.00167) for knockback, base * (1 + points * 0.00667) for invuln
 *
 * STAMINA (0-150 range):
 * - Each point: +1.333% HP, +2.667% spin steal, -0.167% decay (multiplicative)
 * - 0 points = 1000 HP, 10% steal, 10 decay/sec
 * - 150 points = 3000 HP, 50% steal, 7.5 decay/sec
 * - Formula: base * (1 + points * 0.01333) for HP, base * (1 + points * 0.02667) for steal, base * (1 - points * 0.00167) for decay
 */
export interface CalculatedStats {
  // Attack stats
  attackPower: number; // Legacy compatibility (100-250)
  damageMultiplier: number; // 1.0x - 2.5x (multiplicative)
  damagePerHit: number; // 100 - 250 damage (base * multiplier)
  speedPerSecond: number; // 10 - 25 units/sec (multiplicative)
  rotationSpeed: number; // 10 - 25 spins/sec (multiplicative)

  // Defense stats
  defensePower: number; // Legacy compatibility (100-250)
  damageTaken: number; // 1.0x - 0.5x (100% - 50%, multiplicative)
  damageReduction: number; // 1.0x - 2.0x (inverse of damageTaken for display)
  knockbackDistance: number; // 10 - 7.5 units (multiplicative)
  invulnerabilityChance: number; // 10% - 20% (multiplicative)

  // Stamina stats
  staminaPower: number; // Legacy compatibility (100-250)
  maxStamina: number; // 1000 - 3000 HP (multiplicative, rounded up)
  spinStealPercent: number; // 10% - 50% (multiplicative, 50% in opposite spin, 25% in same spin)
  spinStealAmount: number; // For display: same as spinStealPercent
  spinDecayRate: number; // 10 - 7.5 per sec (multiplicative)

  // Legacy/compatibility
  speedMultiplier: number; // Same as attackPower
  knockbackResistance: number; // Same as defensePower
  spinStealPower: number; // Same as staminaPower
}

export function calculateStats(
  distribution: TypeDistribution,
): CalculatedStats {
  // Base stats (at 0 distribution points)
  const baseDamage = 100;
  const baseSpeed = 10;
  const baseRotation = 10;
  const baseKnockback = 10;
  const baseDamageTaken = 1.0; // 1x = 100% damage taken
  const baseInvulnerability = 10; // 10% chance
  const baseStamina = 1000;
  const baseSpinSteal = 10; // 10%
  const baseSpinDecay = 10; // 10 per second

  // Store distribution points for calculations
  const attackPower = distribution.attack; // 0-150
  const defensePower = distribution.defense; // 0-150
  const staminaPower = distribution.stamina; // 0-150

  // Attack calculations
  // Each point: +0.01x damage, +0.1 speed, +0.1 rotation
  const damageMultiplier = 1.0 + attackPower * 0.01; // 1.0x - 2.5x
  const damagePerHit = baseDamage * damageMultiplier; // 100 - 250 damage
  const speedPerSecond = baseSpeed * (1.0 + attackPower * 0.01); // 10 - 25 units/sec
  const rotationSpeed = baseRotation * (1.0 + attackPower * 0.01); // 10 - 25 spins/sec

  // Defense calculations
  // At 150 points: 50% damage taken (0.5x), 7.5 knockback (25% reduction), 20% invulnerability (2x)
  const damageTaken = Math.max(
    0.01,
    baseDamageTaken * (1.0 - defensePower * 0.00333),
  ); // 1.0x - 0.5x (100% - 50%)
  const damageReduction = 1 / damageTaken; // Display as effective reduction (1.0x - 2.0x)
  const knockbackDistance = Math.max(
    0,
    baseKnockback * (1.0 - defensePower * 0.00167),
  ); // 10 - 7.5 units (25% reduction)
  const invulnerabilityChance = Math.min(
    100,
    baseInvulnerability * (1.0 + defensePower * 0.00667),
  ); // 10% - 20%

  // Stamina calculations
  // At 150 points: 3000 HP (3x), 50% spin steal (5x), 7.5 decay (25% reduction)
  const maxStamina = Math.ceil(baseStamina * (1.0 + staminaPower * 0.01333)); // 1000 - 3000 HP (rounded up)
  const spinStealPercent = baseSpinSteal * (1.0 + staminaPower * 0.02667); // 10% - 50%
  const spinDecayRate = Math.max(
    0.5,
    baseSpinDecay * (1.0 - staminaPower * 0.00167),
  ); // 10 - 7.5 per sec

  return {
    // Attack
    attackPower: attackPower + 100, // For legacy compatibility (100-250)
    damageMultiplier,
    damagePerHit,
    speedPerSecond,
    rotationSpeed,

    // Defense
    defensePower: defensePower + 100, // For legacy compatibility (100-250)
    damageTaken,
    damageReduction,
    knockbackDistance,
    invulnerabilityChance,

    // Stamina
    staminaPower: staminaPower + 100, // For legacy compatibility (100-250)
    maxStamina,
    spinStealPercent,
    spinStealAmount: spinStealPercent, // For display
    spinDecayRate,

    // Legacy compatibility
    speedMultiplier: attackPower + 100,
    knockbackResistance: defensePower + 100,
    spinStealPower: staminaPower + 100,
  };
}
