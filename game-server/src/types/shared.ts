/**
 * Shared types for game server
 * These mirror the backend types for full compatibility
 */

// Beyblade Types
export type BeybladeType = "attack" | "defense" | "stamina" | "balanced";
export type SpinDirection = "left" | "right";

export interface PointOfContact {
  angle: number;
  damageMultiplier: number;
  width: number;
}

export interface SpinStealPoint {
  angle: number;
  spinStealMultiplier: number;
  width: number;
}

export interface TypeDistribution {
  attack: number;
  defense: number;
  stamina: number;
  total: number;
}

export interface BeybladeStats {
  id: string;
  displayName: string;
  fileName: string;
  imageUrl?: string;
  imagePosition?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  type: BeybladeType;
  spinDirection: SpinDirection;
  mass: number;
  radius: number;
  actualSize?: number;
  stamina?: number;
  spinStealFactor?: number;
  spinDecayRate?: number;
  speed?: number;
  rotationSpeed?: number;
  invulnerabilityChance?: number;
  damageReduction?: number;
  typeDistribution: TypeDistribution;
  pointsOfContact: PointOfContact[];
  spinStealPoints?: SpinStealPoint[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Arena Types
export type ArenaShape =
  | "circle"
  | "rectangle"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "star"
  | "oval"
  | "loop"
  | "racetrack";

export type ArenaTheme =
  | "forest"
  | "mountains"
  | "grasslands"
  | "metrocity"
  | "safari"
  | "prehistoric"
  | "futuristic"
  | "desert"
  | "sea"
  | "riverbank";

// ============================================================================
// SPEED PATHS & CHARGE POINTS (Updated System)
// ============================================================================

export interface ChargePointConfig {
  id?: number; // Charge point ID (1, 2, 3)
  pathPosition: number; // Position on loop path (0-100%) - UPDATED from angle
  target: "center" | "opponent";
  dashSpeed?: number;
  radius?: number;
  color?: string;
  buttonId?: 1 | 2 | 3;
}

export interface SpeedPathConfig {
  id?: number; // Speed path ID for identification
  radius: number;
  shape:
    | "circle"
    | "rectangle"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "oval"
    | "ring";
  speedBoost: number;
  spinBoost?: number;
  frictionMultiplier?: number;
  width?: number;
  height?: number;
  rotation?: number;
  color?: string;
  ringThickness?: number;
  chargePoints?: ChargePointConfig[];
  autoPlaceChargePoints?: boolean; // Auto-place charge points evenly
  chargePointCount?: number; // Number of evenly distributed charge points (1-3)
  minPathDuration?: number; // Minimum time on path (2-5 seconds)
  maxPathDuration?: number; // Maximum time before forced exit (2-5 seconds)
  renderStyle?: "outline" | "filled";
}

// Keep LoopConfig as alias for backward compatibility
export type LoopConfig = SpeedPathConfig;

export interface ExitConfig {
  angle: number;
  width: number;
  enabled: boolean;
}

export interface PortalConfig {
  id: string;
  portalNumber?: number; // 1, 2, 3, etc.
  inPoint: { x: number; y: number };
  outPoint: { x: number; y: number };
  radius: number;
  cooldown?: number;
  color?: string;
  bidirectional?: boolean;
}

// ============================================================================
// WALL CONFIGURATION (Updated System)
// ============================================================================

export interface WallSegment {
  id?: string; // Wall segment ID (e.g., "W1", "E2W3")
  position: number; // Position on edge (0-100%)
  width: number; // Width as percentage of edge (0-100%)
  thickness: number; // Wall thickness in em units
}

export interface WallEdgeConfig {
  edge: number; // Edge number (0-based for polygons, 0 for circle)
  walls: WallSegment[]; // Wall segments on this edge
}

export interface WallConfig {
  enabled: boolean;
  wallStyle: "brick" | "metal" | "wood" | "stone"; // Visual style
  wallColor?: string; // Custom wall color
  exitColor?: string; // Custom exit/gap color (default: red)
  baseDamage: number;
  recoilDistance: number;
  hasSpikes: boolean;
  spikeDamageMultiplier: number;
  thickness: number;
  edges: WallEdgeConfig[]; // Edge-based wall configuration
}

// ============================================================================
// OBSTACLE CONFIGURATION (Simplified System)
// ============================================================================

export interface ObstacleConfig {
  id?: number;
  x: number; // X position (center-relative, em units)
  y: number; // Y position (center-relative, em units)
  radius: number; // Size in em units
  health: number; // Hit points before destruction (1-5)
  damage: number; // Damage dealt on collision (5-30)
  recoilDistance: number; // Knockback distance in em units
  indestructible?: boolean; // If true, obstacle cannot be destroyed
  color?: string; // Optional custom color
  autoPlaced?: boolean; // Was this obstacle auto-placed?
}

// ============================================================================
// WATER BODY CONFIGURATION (Enhanced System)
// ============================================================================

export type WaterBodyType = "moat" | "zone" | "wall-based";

export type LiquidType =
  | "water"
  | "lava"
  | "ice"
  | "healing"
  | "speedBoost"
  | "quicksand"
  | "oil"
  | "poison";

export interface WaterEffectConfig {
  // Damage/Heal
  damagePerSecond?: number;
  healPerSecond?: number;
  // Speed Effects
  speedBoost?: number;
  speedLoss?: number;
  // Spin Effects
  spinDrainPerSecond?: number;
  spinBoostPerSecond?: number;
  // Friction
  frictionMultiplier?: number;
  // Status Effects
  freezeDuration?: number;
  freezeThreshold?: number;
  stunDuration?: number;
  stunThreshold?: number;
  // Push/Pull Effects
  pushForce?: number;
  pullForce?: number;
  // Visual Feedback
  showParticles?: boolean;
  particleColor?: string;
}

export interface BaseWaterBodyConfig {
  id: string; // 'water1', 'water2', or 'water3'
  type: WaterBodyType;
  liquidType: LiquidType;
  color?: string;
  opacity?: number;
  depth?: number;
  wavyEffect?: boolean;
  effects?: WaterEffectConfig;
}

export interface MoatWaterBodyConfig extends BaseWaterBodyConfig {
  type: "moat";
  thickness: number; // Thickness of moat (em units)
  distanceFromArena: number; // Inner radius from center (em units)
}

export interface ZoneWaterBodyConfig extends BaseWaterBodyConfig {
  type: "zone";
  shape: "circle" | "rectangle" | "pentagon" | "hexagon" | "octagon" | "star";
  position: { x: number; y: number }; // Center position (em units)
  radius?: number; // For circle/star (em units)
  width?: number; // For rectangle (em units)
  height?: number; // For rectangle (em units)
  rotation?: number; // Rotation in degrees
}

export interface WallBasedWaterBodyConfig extends BaseWaterBodyConfig {
  type: "wall-based";
  wallSegmentId: string; // ID of wall segment to attach to
  inwardDepth: number; // How far inward from wall (em units)
}

export type WaterBodyConfig =
  | MoatWaterBodyConfig
  | ZoneWaterBodyConfig
  | WallBasedWaterBodyConfig;

export interface PitConfig {
  id?: number;
  type: "edge" | "crater"; // edge = ring-out pit, crater = central pit
  x: number; // Position (em units, center-relative)
  y: number;
  radius: number; // Size in em units
  depth: number; // Visual depth (1-10, affects rendering)
  damagePerSecond: number; // Spin damage per second
  pullForce?: number; // Optional: pull force toward center
  escapeThreshold?: number; // Spin threshold to escape (default: 50% max spin)
  color?: string; // Optional custom color
}

// ============================================================================
// TURRET CONFIGURATION (Replaces LaserGuns - New System)
// ============================================================================

export type TurretAttackType = "random" | "beam" | "periodic" | "aoe" | "boomerang";

export interface TurretConfig {
  id: number;
  x: number; // Position X (em units, center-relative)
  y: number; // Position Y (em units, center-relative)
  radius: number; // Turret size (em units)
  health: number; // Hit points (if destructible)
  indestructible?: boolean; // Cannot be destroyed
  attackType: TurretAttackType;
  attackDamage: number; // Damage per hit
  attackRange: number; // Maximum range (em units)
  attackCooldown: number; // Seconds between attacks
  
  // Beam attack properties
  beamDuration?: number; // Beam duration in seconds (default: 2)
  beamChargePeriod?: number; // Charge time before beam (default: 1)
  
  // Periodic attack properties
  bulletCount?: number; // Number of bullets per burst (default: 3)
  bulletSpread?: number; // Spread angle in degrees (default: 30)
  
  // AOE/Missile attack properties
  aoeRadius?: number; // Explosion radius (em units, default: 100)
  aoeDamageRadius?: number; // Damage radius (em units, default: 50)
  missileTravelTime?: number; // Time to reach target (default: 800ms)
  
  // Boomerang attack properties
  boomerangReturnTime?: number; // Time for full orbit (default: 3)
  boomerangOrbitRadius?: number; // Orbit radius (default: 60% of range)
  
  color?: string; // Turret color
  autoPlaced?: boolean; // Was this turret auto-placed?
}

// Remove old features - these are no longer supported
// export interface GoalObjectConfig { ... }
// export interface RotationBodyConfig { ... }

export interface BackgroundLayer {
  imageUrl: string;
  parallaxSpeed: number;
  opacity: number;
  scale: number;
  offset: { x: number; y: number };
}

// ============================================================================
// ARENA CONFIGURATION (Updated System)
// ============================================================================

export interface ArenaConfig {
  id?: string;
  name: string;
  description?: string;
  
  // Geometry
  width: number; // Use ARENA_RESOLUTION (1080) for new arenas
  height: number; // Use ARENA_RESOLUTION (1080) for new arenas
  shape: ArenaShape;
  
  // Visual & Theme
  theme: ArenaTheme;
  backgroundColor?: string;
  floorColor?: string;
  floorTexture?: string;
  
  // Rotation
  autoRotate?: boolean;
  rotationSpeed?: number; // Degrees per second
  rotationDirection?: "clockwise" | "counter-clockwise";
  
  // Arena Features - UPDATED
  speedPaths?: SpeedPathConfig[]; // New name (loops still works as alias)
  loops?: LoopConfig[]; // Alias for speedPaths (backward compatibility)
  portals?: PortalConfig[];
  wall: WallConfig;
  obstacles?: ObstacleConfig[];
  waterBodies?: WaterBodyConfig[]; // NEW: Multiple water bodies (replaces waterBody)
  pits?: PitConfig[];
  turrets?: TurretConfig[]; // NEW: Replaces laserGuns
  
  // Removed Features (for backward compatibility, mark as deprecated)
  // waterBody?: WaterBodyConfig; // DEPRECATED: Use waterBodies instead
  // laserGuns?: LaserGunConfig[]; // DEPRECATED: Use turrets instead
  // exits?: ExitConfig[]; // DEPRECATED: Use wall.edges configuration instead
  // goalObjects?: GoalObjectConfig[]; // REMOVED
  // rotationBodies?: RotationBodyConfig[]; // REMOVED
  // requireAllGoalsDestroyed?: boolean; // REMOVED
  
  backgroundLayers?: BackgroundLayer[];
  ambientSound?: string;
  gravity?: number;
  airResistance?: number;
  surfaceFriction?: number;
  difficulty?: "easy" | "medium" | "hard" | "extreme" | "custom";
  
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
