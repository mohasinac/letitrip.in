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

export interface ChargePointConfig {
  angle: number;
  target: "center" | "opponent";
  dashSpeed?: number;
  radius?: number;
  color?: string;
  buttonId?: 1 | 2 | 3;
}

export interface LoopConfig {
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
  chargePointCount?: number;
  minLoopDuration?: number;
  maxLoopDuration?: number;
  renderStyle?: "outline" | "filled";
}

export interface ExitConfig {
  angle: number;
  width: number;
  enabled: boolean;
}

export interface PortalConfig {
  id: string;
  inPoint: { x: number; y: number };
  outPoint: { x: number; y: number };
  radius: number;
  cooldown?: number;
  color?: string;
  bidirectional?: boolean;
}

export interface WallConfig {
  enabled: boolean;
  allExits?: boolean;
  wallCount?: number;
  exitsBetweenWalls?: boolean;
  baseDamage: number;
  recoilDistance: number;
  hasSpikes: boolean;
  spikeDamageMultiplier: number;
  hasSprings: boolean;
  springRecoilMultiplier: number;
  thickness: number;
}

export interface ObstacleConfig {
  type: "rock" | "pillar" | "barrier" | "wall";
  x: number;
  y: number;
  radius: number;
  rotation?: number;
  damage: number;
  recoil: number;
  destructible: boolean;
  health?: number;
  themeIcon?: string;
  canBeOnLoopPath?: boolean;
  canBeInsideLoop?: boolean;
}

export interface WaterBodyConfig {
  enabled: boolean;
  type: "center" | "loop" | "ring";
  shape:
    | "circle"
    | "rectangle"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "oval"
    | "ring";
  radius?: number;
  width?: number;
  height?: number;
  rotation?: number;
  ringThickness?: number;
  loopIndex?: number;
  innerRadius?: number;
  outerRadius?: number;
  liquidType: "water" | "blood" | "lava" | "acid" | "oil" | "ice";
  spinDrainRate: number;
  speedMultiplier: number;
  viscosity: number;
  color?: string;
  waveAnimation?: boolean;
}

export interface PitConfig {
  x: number;
  y: number;
  radius: number;
  damagePerSecond: number;
  escapeChance: number;
  visualDepth: number;
  swirl?: boolean;
}

export interface LaserGunConfig {
  x: number;
  y: number;
  angle: number;
  fireInterval: number;
  damage: number;
  bulletSpeed: number;
  targetMode: "random" | "nearest" | "strongest";
  warmupTime: number;
  cooldown: number;
  range: number;
  laserColor?: string;
}

export interface GoalObjectConfig {
  id: string;
  x: number;
  y: number;
  radius: number;
  health: number;
  scoreValue: number;
  type: "star" | "crystal" | "coin" | "gem" | "relic" | "trophy";
  themeVariant?: string;
  color?: string;
  shieldHealth?: number;
  isCollectible?: boolean;
}

export interface RotationBodyConfig {
  id: string;
  position: { x: number; y: number };
  shape: "circle" | "rectangle" | "star" | "polygon";
  radius?: number;
  width?: number;
  height?: number;
  sides?: number;
  rotationForce: number;
  direction: "clockwise" | "counter-clockwise";
  falloff: number;
  color?: string;
  opacity?: number;
  rotationAnimation?: boolean;
}

export interface BackgroundLayer {
  imageUrl: string;
  parallaxSpeed: number;
  opacity: number;
  scale: number;
  offset: { x: number; y: number };
}

export interface ArenaConfig {
  id?: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  shape: ArenaShape;
  theme: ArenaTheme;
  rotation?: number;
  loops: LoopConfig[];
  exits: ExitConfig[];
  portals?: PortalConfig[];
  wall: WallConfig;
  obstacles: ObstacleConfig[];
  waterBody?: WaterBodyConfig;
  pits: PitConfig[];
  laserGuns: LaserGunConfig[];
  rotationBodies?: RotationBodyConfig[];
  goalObjects: GoalObjectConfig[];
  requireAllGoalsDestroyed: boolean;
  backgroundColor?: string;
  floorColor?: string;
  floorTexture?: string;
  backgroundLayers: BackgroundLayer[];
  ambientSound?: string;
  gravity?: number;
  airResistance?: number;
  surfaceFriction?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  difficulty?: "easy" | "medium" | "hard" | "extreme" | "custom";
}
