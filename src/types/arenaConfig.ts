/**
 * Dynamic Arena Configuration System
 * Supports loops, obstacles, hazards, themes, and various arena shapes
 */

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
export type GameMode =
  | "player-vs-ai"
  | "player-vs-player"
  | "single-player-test";

/**
 * Charge Point Configuration
 * Interactive points on loops where players can trigger early exit dash
 */
export interface ChargePointConfig {
  angle: number; // Angle in degrees (0-360) on the loop
  target: "center" | "opponent"; // Dash target: center or opponent (fallback to center if no opponent)
  dashSpeed?: number; // Speed multiplier for the dash (default: 2.0)
  radius?: number; // Visual size of the charge point (default 1em)
  color?: string; // Visual color (default: yellow/gold)
  buttonId?: 1 | 2 | 3; // Gamepad button to trigger (1, 2, or 3)
}

/**
 * Loop Configuration
 * Paths with custom shapes that provide speed boosts and strategic positioning
 */
export interface LoopConfig {
  radius: number; // em units from center (or size for non-circular shapes)
  shape:
    | "circle"
    | "rectangle"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "oval"
    | "ring"; // Loop shape
  speedBoost: number; // Multiplier (e.g., 1.5 = 50% faster)
  spinBoost?: number; // Optional spin recovery per second
  frictionMultiplier?: number; // Lower = less friction (default: 1.0)
  width?: number; // Width for rectangular loops (em units)
  height?: number; // Height for rectangular loops (em units)
  rotation?: number; // Rotation angle in degrees
  color?: string; // Visual color for the loop
  ringThickness?: number; // For ring shape - thickness of the ring (em units)
  chargePoints?: ChargePointConfig[]; // Interactive dash points
  chargePointCount?: number; // Number of evenly distributed charge points
  minLoopDuration?: number; // Minimum time beyblade stays in loop (2-5 seconds, default: 2)
  maxLoopDuration?: number; // Maximum time before forced exit (2-5 seconds, default: 5)
  renderStyle?: "outline" | "filled"; // Render as outline circle or filled (default: outline)
}

/**
 * Exit Configuration
 * Openings in the arena wall where beyblades can exit (lose condition)
 */
export interface ExitConfig {
  angle: number; // Angle in degrees (0-360)
  width: number; // Width in degrees
  enabled: boolean;
}

/**
 * Portal Configuration
 * Teleportation points (max 2 portals)
 */
export interface PortalConfig {
  id: string; // 'portal1' or 'portal2'
  inPoint: { x: number; y: number }; // Entry point (em units)
  outPoint: { x: number; y: number }; // Exit point (em units)
  radius: number; // Visual size (em units)
  cooldown?: number; // Seconds before can be used again (default: 0)
  color?: string; // Visual color (default: purple/blue)
  bidirectional?: boolean; // Can travel both ways (default: true)
}

/**
 * Wall Configuration
 * Arena boundaries with damage and recoil
 */
export interface WallConfig {
  enabled: boolean; // If false, beyblades can exit anywhere
  allExits?: boolean; // If true and walls disabled, entire boundary is an exit; if false, closed boundary
  wallCount?: number; // Number of wall segments (for polygonal arenas, default based on shape)
  exitsBetweenWalls?: boolean; // If true, create exits between wall segments
  baseDamage: number; // Damage taken when hitting wall
  recoilDistance: number; // Distance bounced back (em units)
  hasSpikes: boolean; // Spikes increase damage
  spikeDamageMultiplier: number; // Multiplier when spikes enabled (e.g., 2.0)
  hasSprings: boolean; // Springs increase recoil
  springRecoilMultiplier: number; // Multiplier when springs enabled (e.g., 1.5)
  thickness: number; // Visual thickness in em
}

/**
 * Obstacle Configuration
 * Random objects placed in arena (rocks, pillars, etc.)
 * Note: Obstacles can spawn anywhere in the arena except ON loop lines
 */
export interface ObstacleConfig {
  type: "rock" | "pillar" | "barrier" | "wall";
  x: number; // Position X (em units)
  y: number; // Position Y (em units)
  radius: number; // Size (em units)
  rotation?: number; // For non-circular obstacles
  damage: number; // Damage on collision
  recoil: number; // Knockback force
  destructible: boolean; // Can be destroyed?
  health?: number; // Health if destructible
  themeIcon?: string; // Theme-based visual representation (tree, rock, crystal, etc.)
  canBeOnLoopPath?: boolean; // If true, can be placed on loop paths (default: false)
  canBeInsideLoop?: boolean; // DEPRECATED: Loops are lines, not zones. Obstacles can be anywhere except on the line itself
}

/**
 * Water Body Configuration
 * Central or loop water that slows movement and drains spin
 */
export interface WaterBodyConfig {
  enabled: boolean;
  type: "center" | "loop" | "ring"; // Center shape, follows center loop path (moat), or ring at edges
  shape:
    | "circle"
    | "rectangle"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "oval"
    | "ring"; // Shape of water body
  radius?: number; // For circular shapes (em units)
  width?: number; // For rectangular shapes (em units)
  height?: number; // For rectangular shapes (em units)
  rotation?: number; // Rotation angle in degrees
  ringThickness?: number; // For ring shape - thickness of the ring (em units)
  loopIndex?: number; // Always 0 for center loop (when type is 'loop')
  innerRadius?: number; // For loop type - inner radius of moat (em units)
  outerRadius?: number; // For loop type - outer radius of moat (em units)
  liquidType: "water" | "blood" | "lava" | "acid" | "oil" | "ice"; // Type of liquid
  spinDrainRate: number; // Spin loss per second (percentage)
  speedMultiplier: number; // Movement speed reduction (e.g., 0.6 = 40% slower)
  viscosity: number; // 0-1, affects acceleration/deceleration
  color?: string; // Visual color (auto-determined from liquidType if not set)
  waveAnimation?: boolean; // Animated waves
}

/**
 * Pit/Hole Configuration
 * Traps where beyblades get stuck and take damage
 */
export interface PitConfig {
  x: number; // Position X (em units)
  y: number; // Position Y (em units)
  radius: number; // Size (em units)
  damagePerSecond: number; // Percentage of current spin (10% default)
  escapeChance: number; // Chance to escape per second (0.5 = 50%)
  visualDepth: number; // Visual depth effect (1-5)
  swirl?: boolean; // Swirling animation
}

/**
 * Laser Gun Configuration
 * Automated turrets that fire at beyblades
 */
export interface LaserGunConfig {
  x: number; // Position X (em units)
  y: number; // Position Y (em units)
  angle: number; // Current aim angle
  fireInterval: number; // Seconds between shots
  damage: number; // Damage per hit
  bulletSpeed: number; // em/second
  targetMode: "random" | "nearest" | "strongest"; // Targeting strategy
  warmupTime: number; // Seconds to aim before firing
  cooldown: number; // Seconds after firing before next shot
  range: number; // Maximum range (em units)
  laserColor?: string; // Laser beam color
}

/**
 * Goal Object Configuration
 * Collectible objectives (stars, crystals, etc.) based on theme
 */
export interface GoalObjectConfig {
  id: string;
  x: number; // Position X (em units)
  y: number; // Position Y (em units)
  radius: number; // Size (em units)
  health: number; // Health points
  scoreValue: number; // Points awarded on collection/destruction
  type: "star" | "crystal" | "coin" | "gem" | "relic" | "trophy"; // Collectible types
  themeVariant?: string; // Theme-based appearance (e.g., 'forest-star', 'futuristic-crystal')
  color?: string;
  shieldHealth?: number; // Optional shield that must be broken first
  isCollectible?: boolean; // If true, collect on touch; if false, must destroy
}

/**
 * Rotation Body Configuration
 * 2D area objects that apply rotational force to beyblades
 */
export interface RotationBodyConfig {
  id: string;
  position: { x: number; y: number }; // Position in em units
  shape: "circle" | "rectangle" | "star" | "polygon"; // Shape of rotation body
  radius?: number; // For circle/star/polygon (em units)
  width?: number; // For rectangle (em units)
  height?: number; // For rectangle (em units)
  sides?: number; // For polygon (default: 6)

  // Rotation properties
  rotationForce: number; // Force applied (0.1-5.0)
  direction: "clockwise" | "counter-clockwise"; // Direction of rotation
  falloff: number; // How force decreases with beyblade velocity (0.0-1.0)

  // Visual
  color?: string; // Default: red (#ef4444)
  opacity?: number; // Default: 0.5
  rotationAnimation?: boolean; // Visual spinning effect
}

/**
 * Arena Background Layer
 * For parallax and theme effects
 */
export interface BackgroundLayer {
  imageUrl: string;
  parallaxSpeed: number; // 0-1, 0=static, 1=moves with camera
  opacity: number; // 0-1
  scale: number; // Scale multiplier
  offset: { x: number; y: number }; // Initial offset
}

/**
 * Complete Arena Configuration
 */
export interface ArenaConfig {
  // Basic properties
  id?: string;
  name: string;
  description?: string;

  // Arena geometry (in em units, typically 50em = 800px at base font size)
  width: number; // Default: 50em (800px)
  height: number; // Default: 50em (800px)
  shape: ArenaShape;
  theme: ArenaTheme;
  rotation?: number; // Rotation angle for the entire arena in degrees (0-360)

  // Loops (speed boost paths/lines)
  loops: LoopConfig[];

  // Exits (where beyblades can leave the arena)
  exits: ExitConfig[];

  // Portals (teleportation, max 2)
  portals?: PortalConfig[];

  // Wall configuration
  wall: WallConfig;

  // Hazards and features
  obstacles: ObstacleConfig[];
  waterBody?: WaterBodyConfig;
  pits: PitConfig[];
  laserGuns: LaserGunConfig[];
  rotationBodies?: RotationBodyConfig[]; // Rotation force fields

  // Goal objects (optional objective mode)
  goalObjects: GoalObjectConfig[];
  requireAllGoalsDestroyed: boolean; // Win condition

  // Visual and theme
  backgroundColor?: string;
  floorColor?: string; // Custom floor color
  floorTexture?: string; // URL to floor texture image
  backgroundLayers: BackgroundLayer[];
  ambientSound?: string; // Background music/sound

  // Physics modifiers
  gravity?: number; // Optional gravity simulation (0 = none)
  airResistance?: number; // Global air resistance (0-1)
  surfaceFriction?: number; // Base surface friction (0-1)

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  difficulty?: "easy" | "medium" | "hard" | "extreme" | "custom";
}

/**
 * Preset Arena Templates
 */
export const ARENA_PRESETS: Record<string, Partial<ArenaConfig>> = {
  classic: {
    name: "Classic Stadium",
    shape: "circle",
    theme: "metrocity",
    loops: [
      { radius: 15, shape: "circle", speedBoost: 1.2 },
      { radius: 20, shape: "circle", speedBoost: 1.0 },
    ],
    exits: [],
    wall: {
      enabled: true,
      baseDamage: 5,
      recoilDistance: 2,
      hasSpikes: false,
      spikeDamageMultiplier: 1.0,
      hasSprings: false,
      springRecoilMultiplier: 1.0,
      thickness: 0.5,
    },
    obstacles: [],
    pits: [],
    laserGuns: [],
    goalObjects: [],
    requireAllGoalsDestroyed: false,
    backgroundLayers: [],
  },

  hazardZone: {
    name: "Hazard Zone",
    shape: "octagon",
    theme: "futuristic",
    loops: [
      { radius: 12, shape: "octagon", speedBoost: 1.5 },
      { radius: 18, shape: "hexagon", speedBoost: 1.2 },
      { radius: 24, shape: "circle", speedBoost: 1.0 },
    ],
    exits: [
      { angle: 0, width: 30, enabled: true },
      { angle: 90, width: 30, enabled: true },
      { angle: 180, width: 30, enabled: true },
      { angle: 270, width: 30, enabled: true },
    ],
    wall: {
      enabled: true,
      baseDamage: 10,
      recoilDistance: 3,
      hasSpikes: true,
      spikeDamageMultiplier: 2.0,
      hasSprings: true,
      springRecoilMultiplier: 1.5,
      thickness: 0.8,
    },
    pits: [
      {
        x: 0,
        y: 0,
        radius: 3,
        damagePerSecond: 10,
        escapeChance: 0.5,
        visualDepth: 3,
        swirl: true,
      },
    ],
    laserGuns: [
      {
        x: 15,
        y: 15,
        angle: 0,
        fireInterval: 3,
        damage: 50,
        bulletSpeed: 20,
        targetMode: "nearest",
        warmupTime: 0.5,
        cooldown: 1,
        range: 40,
      },
      {
        x: -15,
        y: -15,
        angle: 180,
        fireInterval: 3,
        damage: 50,
        bulletSpeed: 20,
        targetMode: "nearest",
        warmupTime: 0.5,
        cooldown: 1,
        range: 40,
      },
    ],
    obstacles: [],
    goalObjects: [],
    requireAllGoalsDestroyed: false,
    backgroundLayers: [],
  },

  waterWorld: {
    name: "Water World",
    shape: "circle",
    theme: "sea",
    loops: [{ radius: 18, shape: "circle", speedBoost: 1.1 }],
    exits: [],
    wall: {
      enabled: true,
      baseDamage: 3,
      recoilDistance: 1.5,
      hasSpikes: false,
      spikeDamageMultiplier: 1.0,
      hasSprings: false,
      springRecoilMultiplier: 1.0,
      thickness: 0.5,
    },
    waterBody: {
      enabled: true,
      type: "center",
      shape: "circle",
      radius: 10,
      liquidType: "water",
      spinDrainRate: 2,
      speedMultiplier: 0.6,
      viscosity: 0.8,
      color: "#4fc3f7",
      waveAnimation: true,
    },
    obstacles: [],
    pits: [],
    laserGuns: [],
    goalObjects: [],
    requireAllGoalsDestroyed: false,
    backgroundLayers: [],
  },
};

/**
 * Generate random obstacles for arena
 */
/**
 * Helper function to build exclude zones for hazard generation
 * Includes loops (as lines), existing hazards, walls, and exits
 */
export function buildExcludeZones(
  config: Partial<ArenaConfig>,
  includeWaterAsZone: boolean = true,
): { x: number; y: number; radius: number; type?: "zone" | "line" }[] {
  const zones: { x: number; y: number; radius: number; type?: "zone" | "line" }[] = [];

  // Add loops as LINES (not zones) - hazards can be inside/outside, just not ON the line
  if (config.loops) {
    zones.push(
      ...config.loops.map((loop) => ({
        x: 0,
        y: 0,
        radius: loop.radius,
        type: "line" as const,
      }))
    );
  }

  // Add water body as zone ONLY if includeWaterAsZone is true
  // This allows loops and some hazards to exist on liquid
  if (includeWaterAsZone && config.waterBody?.enabled && config.waterBody.type === "center") {
    zones.push({
      x: 0,
      y: 0,
      radius: config.waterBody.radius || 10,
      type: "zone" as const,
    });
  }

  // Add existing obstacles as zones
  if (config.obstacles) {
    zones.push(
      ...config.obstacles.map((obs) => ({
        x: obs.x,
        y: obs.y,
        radius: obs.radius + 1, // Add 1em buffer
        type: "zone" as const,
      }))
    );
  }

  // Add existing pits as zones
  if (config.pits) {
    zones.push(
      ...config.pits.map((pit) => ({
        x: pit.x,
        y: pit.y,
        radius: pit.radius + 1, // Add 1em buffer
        type: "zone" as const,
      }))
    );
  }

  // Add portals as zones
  if (config.portals) {
    config.portals.forEach((portal) => {
      zones.push(
        {
          x: portal.inPoint.x,
          y: portal.inPoint.y,
          radius: portal.radius + 1,
          type: "zone" as const,
        },
        {
          x: portal.outPoint.x,
          y: portal.outPoint.y,
          radius: portal.radius + 1,
          type: "zone" as const,
        }
      );
    });
  }

  // Add goal objects as zones
  if (config.goalObjects) {
    zones.push(
      ...config.goalObjects.map((goal) => ({
        x: goal.x,
        y: goal.y,
        radius: goal.radius + 1,
        type: "zone" as const,
      }))
    );
  }

  return zones;
}

/**
 * Generate random obstacles with collision avoidance
 * Now uses buildExcludeZones for comprehensive collision detection
 */
export function generateRandomObstacles(
  count: number,
  arenaWidth: number,
  arenaHeight: number,
  excludeZones: { x: number; y: number; radius: number; type?: "zone" | "line" }[] = [],
): ObstacleConfig[] {
  const obstacles: ObstacleConfig[] = [];
  const types: ObstacleConfig["type"][] = ["rock", "pillar", "barrier"];

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0,
      y = 0;

    // Try to find valid position (not overlapping with water zones or on loop lines)
    while (!validPosition && attempts < 50) {
      x = (Math.random() - 0.5) * arenaWidth * 0.8;
      y = (Math.random() - 0.5) * arenaHeight * 0.8;

      validPosition = true;
      for (const zone of excludeZones) {
        const dist = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);
        
        if (zone.type === "line") {
          // For loop lines: check if obstacle is TOO CLOSE to the line (within 2em of the path)
          // This allows obstacles inside and outside the loop, just not ON the line
          const distanceFromLine = Math.abs(dist - zone.radius);
          if (distanceFromLine < 2) {
            validPosition = false;
            break;
          }
        } else {
          // For zones (water bodies): check if obstacle overlaps the zone
          if (dist < zone.radius + 3) {
            validPosition = false;
            break;
          }
        }
      }
      attempts++;
    }

    if (validPosition) {
      obstacles.push({
        type: types[Math.floor(Math.random() * types.length)],
        x,
        y,
        radius: 1 + Math.random() * 2, // 1-3 em
        rotation: Math.random() * 360,
        damage: 5 + Math.random() * 10,
        recoil: 2 + Math.random() * 3,
        destructible: Math.random() > 0.5,
        health: Math.random() > 0.5 ? 100 + Math.random() * 200 : undefined,
      });
    }
  }

  return obstacles;
}

/**
 * Generate random pits for arena edges or center
 * Now with collision avoidance for all existing hazards
 */
export function generateRandomPits(
  count: number,
  arenaRadius: number,
  placement: "edges" | "center" | "random" = "random",
  pitRadius: number = 1.5, // Default pit radius
  excludeZones: { x: number; y: number; radius: number; type?: "zone" | "line" }[] = [],
): PitConfig[] {
  const pits: PitConfig[] = [];

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0,
      y = 0;

    // Try to find valid position
    while (!validPosition && attempts < 50) {
      if (placement === "edges") {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = arenaRadius * (0.7 + Math.random() * 0.2);
        x = Math.cos(angle) * distance;
        y = Math.sin(angle) * distance;
      } else if (placement === "center") {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * arenaRadius * 0.3;
        x = Math.cos(angle) * distance;
        y = Math.sin(angle) * distance;
      } else {
        x = (Math.random() - 0.5) * arenaRadius * 1.6;
        y = (Math.random() - 0.5) * arenaRadius * 1.6;
      }

      // Check against all exclude zones
      validPosition = true;
      for (const zone of excludeZones) {
        const dist = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);

        if (zone.type === "line") {
          // For loop lines: avoid being ON the line
          const distanceFromLine = Math.abs(dist - zone.radius);
          if (distanceFromLine < pitRadius + 1) {
            validPosition = false;
            break;
          }
        } else {
          // For zones: avoid overlapping
          if (dist < zone.radius + pitRadius + 1) {
            validPosition = false;
            break;
          }
        }
      }

      // Check against previously generated pits
      for (const existingPit of pits) {
        const dist = Math.sqrt((x - existingPit.x) ** 2 + (y - existingPit.y) ** 2);
        if (dist < existingPit.radius + pitRadius + 2) {
          validPosition = false;
          break;
        }
      }

      attempts++;
    }

    if (validPosition) {
      pits.push({
        x,
        y,
        radius: pitRadius + Math.random() * 0.5, // Use provided radius with small variation
        damagePerSecond: 10,
        escapeChance: 0.5,
        visualDepth: 2 + Math.floor(Math.random() * 3),
        swirl: Math.random() > 0.5,
      });
    }
  }

  return pits;
}

/**
 * Validate arena configuration
 */
export function validateArenaConfig(config: ArenaConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.width <= 0 || config.height <= 0) {
    errors.push("Arena dimensions must be positive");
  }

  if (config.loops.length > 10) {
    errors.push("Maximum 10 loops allowed");
  }

  if (config.obstacles.length > 50) {
    errors.push("Maximum 50 obstacles allowed for performance");
  }

  if (config.laserGuns.length > 10) {
    errors.push("Maximum 10 laser guns allowed");
  }

  if (config.goalObjects.length > 20) {
    errors.push("Maximum 20 goal objects allowed");
  }

  // Check for overlapping loops
  for (let i = 0; i < config.loops.length; i++) {
    for (let j = i + 1; j < config.loops.length; j++) {
      if (Math.abs(config.loops[i].radius - config.loops[j].radius) < 2) {
        errors.push(`Loops ${i} and ${j} are too close together`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
