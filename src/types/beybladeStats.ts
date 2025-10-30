/**
 * Beyblade Stats and Special Moves System
 * Defines all unique characteristics for each Beyblade
 */

export type BeybladeType = 'attack' | 'defense' | 'stamina' | 'balanced';
export type SpinDirection = 'left' | 'right';

/**
 * Point of Contact - Arrow positions for collision damage multipliers
 */
export interface PointOfContact {
  angle: number; // Angle in degrees (0-360) relative to Beyblade center
  damageMultiplier: number; // Multiplier when this point hits (e.g., 1.5x for blade contact)
  width: number; // Angular width of the contact point in degrees
}

/**
 * Type Distribution - 360 total points, max 150 per category
 * Each point provides specific bonuses:
 * - Attack: +0.01 damage, +0.01 speed
 * - Defense: -0.01 damage taken, +0.01 knockback resistance
 * - Stamina: +0.01 max stamina, +0.01 spin steal
 */
export interface TypeDistribution {
  attack: number; // 0-150, each point: +0.01 damage, +0.01 speed
  defense: number; // 0-150, each point: -0.01 damage taken, +0.01 knockback resistance
  stamina: number; // 0-150, each point: +0.01 max stamina, +0.01 spin steal
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
  mass: number; // grams, affects collision physics (typical: 10-2000g, real beyblades are ~40-60g)
  radius: number; // cm, physical radius (typical: 3-50cm, converts to pixels as radius*10)
  actualSize?: number; // CALCULATED: pixels, visual display size = radius * 10
  
  // Calculated Stats (from typeDistribution, DO NOT SET MANUALLY)
  // Base values: stamina=2000, attack=100, defense=100, speed=100, spinSteal=100, knockback=100
  // Attack points: +1 damage, +1 speed per point (base 10 units/sec, 10 damage)
  // Defense points: -1% damage taken, +1 knockback resistance per point (base 10 units)
  // Stamina points: +20 max stamina, +1 spin steal per point (base 10 points)
  stamina?: number; // CALCULATED: 2000 + (stamina points * 20)
  spinStealFactor?: number; // CALCULATED: 100 + stamina points
  spinDecayRate?: number; // CALCULATED: Based on stamina distribution (lower = better)
  speed?: number; // CALCULATED: 100 + attack points (base 10 units/sec)
  
  // Type Distribution (360 points total)
  typeDistribution: TypeDistribution;
  
  // Point of Contact (collision damage zones)
  pointsOfContact: PointOfContact[];
  
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
    case 'attack':
      return {
        attackMultiplier: 1.2, // +20% attack damage
        defenseMultiplier: 1.0,
        maxStamina: baseMaxStamina,
      };
    case 'defense':
      return {
        attackMultiplier: 1.0,
        defenseMultiplier: 0.8, // Takes 20% less damage
        maxStamina: baseMaxStamina,
      };
    case 'stamina':
      return {
        attackMultiplier: 1.0,
        defenseMultiplier: 1.0,
        maxStamina: 3000, // +20% max stamina
      };
    case 'balanced':
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
export function validateTypeDistribution(distribution: TypeDistribution): boolean {
  if (distribution.total !== 360) return false;
  if (distribution.attack < 0 || distribution.attack > 150) return false;
  if (distribution.defense < 0 || distribution.defense > 150) return false;
  if (distribution.stamina < 0 || distribution.stamina > 150) return false;
  if (distribution.attack + distribution.defense + distribution.stamina !== 360) return false;
  return true;
}

/**
 * Calculate all derived stats from type distribution
 * Base values: stamina=2000, attack=100, defense=100, speed=100, spinSteal=100, knockback=100
 * - Attack points: +1 damage multiplier, +1 speed multiplier per point
 * - Defense points: +1 defense multiplier, +1 knockback resistance per point  
 * - Stamina points: +20 max stamina, +1 spin steal per point
 */
export interface CalculatedStats {
  // Core stats (all start at 100 = 1x multiplier)
  attackPower: number; // 100 + attack points (base damage = 10)
  defensePower: number; // 100 + defense points (damage reduction)
  speedMultiplier: number; // 100 + attack points (base speed = 10 units/sec)
  knockbackResistance: number; // 100 + defense points (base = 10 units)
  
  // Stamina stats
  maxStamina: number; // 2000 + (stamina points * 20)
  spinStealPower: number; // 100 + stamina points (base = 10 points per hit)
  spinDecayRate: number; // Higher stamina = slower decay
  
  // Actual game values (for 800x800 arena)
  damagePerHit: number; // attackPower * 0.1 (so 100 = 10 damage)
  speedPerSecond: number; // speedMultiplier * 0.1 (so 100 = 10 units/sec)
  knockbackDistance: number; // knockbackResistance * 0.1 (so 100 = 10 units)
  spinStealAmount: number; // spinStealPower * 0.1 (so 100 = 10 points)
  damageReduction: number; // defensePower * 0.01 (so 100 = 1.0x, 150 = 1.5x reduction)
}

export function calculateStats(distribution: TypeDistribution): CalculatedStats {
  // Base values (all at 100 = 1x multiplier)
  const baseValue = 100;
  const baseStamina = 2000;
  
  // Calculate multipliers
  const attackPower = baseValue + distribution.attack;
  const defensePower = baseValue + distribution.defense;
  const speedMultiplier = baseValue + distribution.attack; // Attack also increases speed
  const knockbackResistance = baseValue + distribution.defense; // Defense also increases knockback resistance
  
  // Stamina calculations
  const maxStamina = baseStamina + (distribution.stamina * 20); // +20 per point
  const spinStealPower = baseValue + distribution.stamina;
  
  // Spin decay rate: inverse of stamina (more stamina = slower decay)
  // Base decay at 60 stamina points = ~1.67/sec, at 150 = ~0.67/sec
  const spinDecayRate = 100 / (distribution.stamina + 60);
  
  return {
    attackPower,
    defensePower,
    speedMultiplier,
    knockbackResistance,
    maxStamina,
    spinStealPower,
    spinDecayRate,
    // Actual game values (multiply by 0.1 to get base = 10)
    damagePerHit: attackPower * 0.1,
    speedPerSecond: speedMultiplier * 0.1,
    knockbackDistance: knockbackResistance * 0.1,
    spinStealAmount: spinStealPower * 0.1,
    damageReduction: defensePower * 0.01,
  };
}
