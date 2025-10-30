/**
 * Dynamic Arena Configuration System
 * Supports loops, obstacles, hazards, themes, and various arena shapes
 */

export type ArenaShape = 'circle' | 'rectangle' | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'oval' | 'loop';
export type ArenaTheme = 'forest' | 'mountains' | 'grasslands' | 'metrocity' | 'safari' | 'prehistoric' | 'futuristic' | 'desert' | 'sea' | 'riverbank';
export type GameMode = 'player-vs-ai' | 'player-vs-player' | 'single-player-test';

/**
 * Loop Configuration
 * Paths with custom shapes that provide speed boosts and strategic positioning
 */
export interface LoopConfig {
  radius: number; // em units from center (or size for non-circular shapes)
  shape: 'circle' | 'rectangle' | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'oval'; // Loop shape
  speedBoost: number; // Multiplier (e.g., 1.5 = 50% faster)
  spinBoost?: number; // Optional spin recovery per second
  frictionMultiplier?: number; // Lower = less friction (default: 1.0)
  width?: number; // Width for rectangular loops (em units)
  height?: number; // Height for rectangular loops (em units)
  rotation?: number; // Rotation angle in degrees
  color?: string; // Visual color for the loop
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
 * Wall Configuration
 * Arena boundaries with damage and recoil
 */
export interface WallConfig {
  enabled: boolean; // If false, beyblades can exit anywhere
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
 */
export interface ObstacleConfig {
  type: 'rock' | 'pillar' | 'barrier' | 'wall';
  x: number; // Position X (em units)
  y: number; // Position Y (em units)
  radius: number; // Size (em units)
  rotation?: number; // For non-circular obstacles
  damage: number; // Damage on collision
  recoil: number; // Knockback force
  destructible: boolean; // Can be destroyed?
  health?: number; // Health if destructible
}

/**
 * Water Body Configuration
 * Central or loop water that slows movement and drains spin
 */
export interface WaterBodyConfig {
  enabled: boolean;
  type: 'center' | 'loop'; // Center circle or follows a loop path
  radius?: number; // For center type (em units)
  loopIndex?: number; // Which loop to follow (for loop type)
  spinDrainRate: number; // Spin loss per second (percentage)
  speedMultiplier: number; // Movement speed reduction (e.g., 0.6 = 40% slower)
  viscosity: number; // 0-1, affects acceleration/deceleration
  color?: string; // Visual color
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
  targetMode: 'random' | 'nearest' | 'strongest'; // Targeting strategy
  warmupTime: number; // Seconds to aim before firing
  cooldown: number; // Seconds after firing before next shot
  range: number; // Maximum range (em units)
  laserColor?: string; // Laser beam color
}

/**
 * Goal Object Configuration
 * Destructible objectives that must be destroyed to win
 */
export interface GoalObjectConfig {
  id: string;
  x: number; // Position X (em units)
  y: number; // Position Y (em units)
  radius: number; // Size (em units)
  health: number; // Health points
  scoreValue: number; // Points awarded on destruction
  type: 'target' | 'crystal' | 'tower' | 'relic';
  color?: string;
  shieldHealth?: number; // Optional shield that must be broken first
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
  
  // Game mode
  gameMode: GameMode;
  aiDifficulty?: 'easy' | 'medium' | 'hard' | 'extreme'; // For AI mode
  
  // Loops (speed boost zones)
  loops: LoopConfig[];
  
  // Exits (where beyblades can leave the arena)
  exits: ExitConfig[];
  
  // Wall configuration
  wall: WallConfig;
  
  // Hazards and features
  obstacles: ObstacleConfig[];
  waterBody?: WaterBodyConfig;
  pits: PitConfig[];
  laserGuns: LaserGunConfig[];
  
  // Goal objects (optional objective mode)
  goalObjects: GoalObjectConfig[];
  requireAllGoalsDestroyed: boolean; // Win condition
  
  // Visual and theme
  backgroundColor?: string;
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
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme' | 'custom';
}

/**
 * Preset Arena Templates
 */
export const ARENA_PRESETS: Record<string, Partial<ArenaConfig>> = {
  classic: {
    name: 'Classic Stadium',
    shape: 'circle',
    theme: 'metrocity',
    loops: [
      { radius: 15, shape: 'circle', speedBoost: 1.2 },
      { radius: 20, shape: 'circle', speedBoost: 1.0 },
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
    name: 'Hazard Zone',
    shape: 'octagon',
    theme: 'futuristic',
    loops: [
      { radius: 12, shape: 'octagon', speedBoost: 1.5 },
      { radius: 18, shape: 'hexagon', speedBoost: 1.2 },
      { radius: 24, shape: 'circle', speedBoost: 1.0 },
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
      { x: 0, y: 0, radius: 3, damagePerSecond: 10, escapeChance: 0.5, visualDepth: 3, swirl: true },
    ],
    laserGuns: [
      { x: 15, y: 15, angle: 0, fireInterval: 3, damage: 50, bulletSpeed: 20, targetMode: 'nearest', warmupTime: 0.5, cooldown: 1, range: 40 },
      { x: -15, y: -15, angle: 180, fireInterval: 3, damage: 50, bulletSpeed: 20, targetMode: 'nearest', warmupTime: 0.5, cooldown: 1, range: 40 },
    ],
    obstacles: [],
    goalObjects: [],
    requireAllGoalsDestroyed: false,
    backgroundLayers: [],
  },
  
  waterWorld: {
    name: 'Water World',
    shape: 'circle',
    theme: 'sea',
    loops: [
      { radius: 18, shape: 'circle', speedBoost: 1.1 },
    ],
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
      type: 'center',
      radius: 10,
      spinDrainRate: 2,
      speedMultiplier: 0.6,
      viscosity: 0.8,
      color: '#4fc3f7',
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
export function generateRandomObstacles(
  count: number,
  arenaWidth: number,
  arenaHeight: number,
  excludeZones: { x: number; y: number; radius: number }[] = []
): ObstacleConfig[] {
  const obstacles: ObstacleConfig[] = [];
  const types: ObstacleConfig['type'][] = ['rock', 'pillar', 'barrier'];
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0, y = 0;
    
    // Try to find valid position (not overlapping with loops, water, etc.)
    while (!validPosition && attempts < 50) {
      x = (Math.random() - 0.5) * arenaWidth * 0.8;
      y = (Math.random() - 0.5) * arenaHeight * 0.8;
      
      validPosition = true;
      for (const zone of excludeZones) {
        const dist = Math.sqrt((x - zone.x) ** 2 + (y - zone.y) ** 2);
        if (dist < zone.radius + 3) {
          validPosition = false;
          break;
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
 */
export function generateRandomPits(
  count: number,
  arenaRadius: number,
  placement: 'edges' | 'center' | 'random' = 'random'
): PitConfig[] {
  const pits: PitConfig[] = [];
  
  for (let i = 0; i < count; i++) {
    let x = 0, y = 0;
    
    if (placement === 'edges') {
      const angle = (i / count) * Math.PI * 2;
      const distance = arenaRadius * (0.7 + Math.random() * 0.2);
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;
    } else if (placement === 'center') {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * arenaRadius * 0.3;
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;
    } else {
      x = (Math.random() - 0.5) * arenaRadius * 1.6;
      y = (Math.random() - 0.5) * arenaRadius * 1.6;
    }
    
    pits.push({
      x,
      y,
      radius: 1.5 + Math.random() * 1.5, // 1.5-3 em
      damagePerSecond: 10,
      escapeChance: 0.5,
      visualDepth: 2 + Math.floor(Math.random() * 3),
      swirl: Math.random() > 0.5,
    });
  }
  
  return pits;
}

/**
 * Validate arena configuration
 */
export function validateArenaConfig(config: ArenaConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.width <= 0 || config.height <= 0) {
    errors.push('Arena dimensions must be positive');
  }
  
  if (config.loops.length > 10) {
    errors.push('Maximum 10 loops allowed');
  }
  
  if (config.obstacles.length > 50) {
    errors.push('Maximum 50 obstacles allowed for performance');
  }
  
  if (config.laserGuns.length > 10) {
    errors.push('Maximum 10 laser guns allowed');
  }
  
  if (config.goalObjects.length > 20) {
    errors.push('Maximum 20 goal objects allowed');
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
