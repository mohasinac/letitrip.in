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
 * Special Move Flags - Defines behavior during special move activation
 * Combine multiple flags to create complex special moves!
 */
export interface SpecialMoveFlags {
  // Defensive flags
  damageReduction?: number; // 0-1, percentage of damage reduction (e.g., 0.5 = 50% reduction)
  immuneToKnockback?: boolean; // If true, cannot be knocked back during move
  damageImmune?: boolean; // If true, takes 0 damage during move
  
  // Offensive flags
  damageMultiplier?: number; // Damage multiplier during move (e.g., 2.0 = 2x damage)
  spinStealMultiplier?: number; // Spin steal effectiveness multiplier (e.g., 2.0 = 2x steal)
  
  // Movement flags
  performLoop?: boolean; // If true, performs a loop after activation
  counterAttack?: boolean; // If true, performs counter attack after taking hit
  speedBoost?: number; // Speed multiplier during move (e.g., 1.5 = 50% faster)
  cannotMove?: boolean; // If true, Beyblade becomes immobile (locked in position)
  phasing?: boolean; // If true, Beyblade phases through opponents (no collision)
  
  // Size/Radius modifications
  radiusMultiplier?: number; // Multiplier for Beyblade radius (e.g., 1.5 = 50% larger hitbox)
  visualScale?: number; // Visual scale multiplier (e.g., 1.3 = 30% larger appearance)
  
  // Special mechanics
  reflectDamage?: number; // 0-1, percentage of damage to reflect back to attacker
  healSpin?: number; // Amount of spin to heal per second during move
  gravityPull?: number; // Radius in pixels to pull opponents toward beyblade
  pushAway?: number; // Radius in pixels to push opponents away from beyblade
  
  // ==================== CINEMATIC SPECIAL MOVES ====================
  
  // Control Flags
  userLosesControl?: boolean; // If true, user cannot control their Beyblade during move
  opponentLosesControl?: boolean; // If true, opponent cannot control their Beyblade
  freezeOpponent?: boolean; // Freeze opponent in place during move
  
  // Orbital Attack (Barrage of Attacks)
  orbitalAttack?: {
    enabled: boolean;
    orbitRadius: number; // Radius to orbit around target (e.g., targetRadius * 4)
    attackCount: number; // Number of attacks (e.g., 3 attacks at 120° intervals)
    damagePerHit: number; // Damage per orbital attack
    orbitSpeed: number; // Speed multiplier during orbit (e.g., 2.0 = double speed)
  };
  
  // Time Manipulation (Time Skip)
  timeSkip?: {
    enabled: boolean;
    freezeDuration: number; // How long opponent is frozen (seconds)
    repositionOpponent?: {
      enabled: boolean;
      direction: 'center' | 'edge'; // Move toward center or edge
      distance: number; // Distance in pixels or multiplier (e.g., radius * 4)
    };
    loopRing?: {
      enabled: boolean;
      ringType: 'inner' | 'outer' | 'charge'; // Which ring to loop
      duration: number; // Loop duration in seconds
      disableChargePoints: boolean; // Don't trigger charge points during loop
    };
    spinDrainOnEnd: number; // Flat spin amount to drain when time resumes
  };
  
  // Rush Attack (Rapid Dash)
  rushAttack?: {
    enabled: boolean;
    dashCount: number; // Number of dashes
    dashSpeed: number; // Speed multiplier per dash
    damagePerDash: number; // Damage per successful dash hit
    trailEffect: boolean; // Leave visual trail
  };
  
  // Ultimate Defense (Shield Dome)
  shieldDome?: {
    enabled: boolean;
    absorbDamage: boolean; // Absorb all damage during duration
    reflectPercentage: number; // 0-1, how much to reflect back
    pushRadius: number; // Radius to push enemies away
    healPerSecond: number; // Spin healing per second
  };
  
  // Berserk Mode (Power Surge)
  berserkMode?: {
    enabled: boolean;
    damageBoost: number; // Damage multiplier
    speedBoost: number; // Speed multiplier
    defenseReduction: number; // Take more damage (glass cannon)
    visualIntensity: number; // Visual effect intensity (1.0-3.0)
  };
  
  // Vortex Mode (Spin Steal Amplified)
  vortexMode?: {
    enabled: boolean;
    pullRadius: number; // Gravity pull radius
    spinStealRate: number; // Spin stolen per second from nearby Beyblades
    healFromSteal: boolean; // Heal own spin from stolen spin
    slowOpponents: number; // Speed reduction multiplier for nearby enemies (0.5 = 50% slower)
  };
  
  // Phantom Mode (Invisibility + Phase)
  phantomMode?: {
    enabled: boolean;
    opacity: number; // Visual opacity (0.0-1.0)
    phaseThrough: boolean; // Pass through walls and Beyblades
    teleportOnHit?: {
      enabled: boolean;
      distance: number; // Teleport distance in pixels
      direction: 'random' | 'away' | 'behind'; // Teleport direction
    };
  };
  
  // Explosion (Area Damage)
  explosion?: {
    enabled: boolean;
    explosionRadius: number; // Damage radius in pixels
    explosionDamage: number; // Damage to all in radius
    knockbackForce: number; // Knockback force multiplier
    selfDamage?: number; // Optional self-damage (recoil)
  };
  
  // Clone (Create Afterimages)
  clone?: {
    enabled: boolean;
    cloneCount: number; // Number of visual clones
    cloneOpacity: number; // Clone opacity
    confuseOpponent: boolean; // Makes targeting harder
  };
  
  // Magnet Mode (Attract/Repel)
  magnetMode?: {
    enabled: boolean;
    attractRadius: number; // Attract items/power-ups
    repelOpponents: boolean; // Push away enemies
    attractOpponents: boolean; // Pull in enemies
    force: number; // Force multiplier
  };
  
  // Overdrive (Temporary Power Boost)
  overdrive?: {
    enabled: boolean;
    boostMultiplier: number; // Overall power boost
    drainRate: number; // Spin drain per second during overdrive
    afterEffectDebuff?: {
      duration: number; // Debuff duration after overdrive ends
      speedReduction: number; // Speed penalty
      damageReduction: number; // Damage penalty
    };
  };
  
  // Cinematic Settings
  cinematicSettings?: {
    showBanner: boolean; // Show "LET IT RIP!" style banner
    slowMotion?: {
      enabled: boolean;
      timeScale: number; // 0.1-1.0, game speed during effect
      duration: number; // Slow motion duration in seconds
    };
    cameraShake?: {
      enabled: boolean;
      intensity: number; // Shake intensity (1-10)
      duration: number; // Shake duration in seconds
    };
    screenFlash?: {
      enabled: boolean;
      color: string; // Flash color (hex or rgba)
      intensity: number; // 0-1
      duration: number; // Flash duration in seconds
    };
    soundEffect?: string; // Sound effect ID to play
  };
  
  // Timing
  duration: number; // Duration in seconds
  cooldown: number; // Cooldown in seconds before move can be used again
}

/**
 * Special Move Definition
 */
export interface SpecialMove {
  id: string;
  name: string;
  description: string; // User-friendly description
  powerCost: number; // Power required to activate (0-100, typically 100 for ultimate moves)
  flags: SpecialMoveFlags;
  activationKey?: string; // Optional keyboard shortcut
  category?: 'offensive' | 'defensive' | 'utility' | 'ultimate'; // Move category
}

/**
 * Type Distribution - 320 total points, max 150 per category
 */
export interface TypeDistribution {
  attack: number; // 0-150, determines attack damage bonus
  defense: number; // 0-150, determines damage reduction
  stamina: number; // 0-150, determines spin power/decay
  total: number; // Must equal 320
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
  mass: number; // kg, affects collision physics (typical: 15-25)
  radius: number; // pixels, visual size in 800x800 arena (typical: 30-50)
  actualSize: number; // pixels, hitbox size for collision (typical: 35-45)
  
  // Spin Properties
  spinStealFactor: number; // 0-1, chance to steal spin (e.g., 0.7 for Meteo with rubber)
  maxSpin: number; // Maximum spin value (typical: 2000-4000)
  spinDecayRate: number; // Spin loss per second (typical: 3-8)
  
  // Type Distribution (320 points total)
  typeDistribution: TypeDistribution;
  
  // Point of Contact (collision damage zones)
  pointsOfContact: PointOfContact[];
  
  // Special Move
  specialMove: SpecialMove;
  
  // Visual
  speed: number; // Animation speed multiplier (1 = normal)
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * Active Special Move State (for runtime tracking)
 */
export interface ActiveSpecialMove {
  beybladeId: string;
  moveId: string;
  flags: SpecialMoveFlags;
  startTime: number; // Timestamp when move was activated
  endTime: number; // Timestamp when move ends
  cooldownEndTime: number; // Timestamp when cooldown ends
  isActive: boolean;
}

/**
 * Type Bonuses calculated from distribution
 */
export interface TypeBonuses {
  attackMultiplier: number; // 1.0 + (attack / 150) * 0.2 = 1.0 to 1.2
  defenseMultiplier: number; // 1.0 - (defense / 150) * 0.2 = 0.8 to 1.0
  staminaMultiplier: number; // 1.0 + (stamina / 150) * 0.2 = 1.0 to 1.2 (affects spin power)
}

/**
 * Calculate type bonuses from distribution
 */
export function calculateTypeBonuses(distribution: TypeDistribution): TypeBonuses {
  return {
    attackMultiplier: 1.0 + (distribution.attack / 150) * 0.2,
    defenseMultiplier: 1.0 - (distribution.defense / 150) * 0.2,
    staminaMultiplier: 1.0 + (distribution.stamina / 150) * 0.2,
  };
}

/**
 * Validate type distribution (must sum to 320, max 150 each)
 */
export function validateTypeDistribution(distribution: TypeDistribution): boolean {
  if (distribution.total !== 320) return false;
  if (distribution.attack < 0 || distribution.attack > 150) return false;
  if (distribution.defense < 0 || distribution.defense > 150) return false;
  if (distribution.stamina < 0 || distribution.stamina > 150) return false;
  if (distribution.attack + distribution.defense + distribution.stamina !== 320) return false;
  return true;
}
