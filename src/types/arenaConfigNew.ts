/**
 * Clean Arena Configuration System - Built from Ground Up
 * Focus: Name, Shape, Theme, Auto-Rotate, Walls with proper edge-based configuration
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Standard arena resolution - all arenas are rendered at this resolution
 * and scaled to fit the display device (using shortest dimension)
 */
export const ARENA_RESOLUTION = 1080; // 1080x1080px

// ============================================================================
// BASIC TYPES
// ============================================================================

export type ArenaShape =
  | "circle"
  | "triangle" 
  | "square"
  | "pentagon"
  | "hexagon"
  | "heptagon"
  | "octagon"
  | "star3"   // 3-point star (6 edges)
  | "star4"   // 4-point star (8 edges)
  | "star5"   // 5-point star (10 edges)
  | "star6"   // 6-point star (12 edges)
  | "star7"   // 7-point star (14 edges)
  | "star8";  // 8-point star (16 edges)

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
  | "ocean"
  | "riverbank";

// ============================================================================
// SPEED PATHS & PORTALS
// ============================================================================

/**
 * Charge Point Configuration
 * Interactive points on speed paths where players can trigger early exit dash
 */
export interface ChargePointConfig {
  id?: number; // Charge point ID (1, 2, 3)
  pathPosition: number; // Position on loop path (0-100%)
  target: "center" | "opponent"; // Dash target
  dashSpeed?: number; // Speed multiplier for the dash (default: 2.0)
  radius?: number; // Visual size (default 1em)
  color?: string; // Visual color (default: yellow/gold)
  buttonId?: 1 | 2 | 3; // Gamepad button to trigger
}

/**
 * Speed Path Configuration
 * Speed boost paths that stay inside the stadium shape - players travel along the path
 */
export interface SpeedPathConfig {
  id?: number; // Speed path ID for identification
  radius: number; // em units from center (must be within stadium bounds)
  shape:
    | "circle"
    | "rectangle"
    | "pentagon"
    | "hexagon"
    | "octagon"
    | "star"
    | "oval"
    | "ring"; // Path shape
  speedBoost: number; // Multiplier (e.g., 1.5 = 50% faster)
  spinBoost?: number; // Optional spin recovery per second
  frictionMultiplier?: number; // Lower = less friction (default: 1.0)
  width?: number; // Width for rectangular paths (em units)
  height?: number; // Height for rectangular paths (em units)
  rotation?: number; // Rotation angle in degrees
  color?: string; // Visual color for the path
  ringThickness?: number; // For ring shape - thickness (em units)
  chargePoints?: ChargePointConfig[]; // Interactive dash points
  autoPlaceChargePoints?: boolean; // Auto-place charge points evenly (max 3)
  chargePointCount?: number; // Number of evenly distributed charge points (1-3)
  minPathDuration?: number; // Minimum time on path (2-5 seconds)
  maxPathDuration?: number; // Maximum time before forced exit (2-5 seconds)
  renderStyle?: "outline" | "filled"; // Render style (default: outline)
}

// Keep LoopConfig as alias for backward compatibility
export type LoopConfig = SpeedPathConfig;

// ============================================================================
// WATER BODY CONFIGURATION
// ============================================================================

/**
 * Water Body Types
 */
export type WaterBodyType = "moat" | "zone" | "wall-based";

/**
 * Liquid Types - Predefined liquid configurations with specific effects
 */
export type LiquidType = 
  | "water"        // Normal water - slight slowdown
  | "lava"         // Lava - damage over time, extreme heat
  | "ice"          // Ice water - freeze effect after time
  | "healing"      // Healing spring - restores HP
  | "speedBoost"   // Energy drink - speed boost
  | "quicksand"    // Quicksand - high friction, pulls inward
  | "oil"          // Oil - low friction, makes sliding
  | "poison";      // Poison - damage and spin drain

/**
 * Water Body Effect Configuration
 * Defines gameplay effects when beyblade is in water
 */
export interface WaterEffectConfig {
  // Damage/Heal
  damagePerSecond?: number; // HP damage per second (0-10, default: 0)
  healPerSecond?: number; // HP heal per second (0-10, default: 0)
  
  // Speed Effects
  speedBoost?: number; // Speed multiplier (e.g., 1.5 = 50% faster, default: 1.0)
  speedLoss?: number; // Speed reduction multiplier (e.g., 0.5 = 50% slower, default: 1.0)
  
  // Spin Effects
  spinDrainPerSecond?: number; // Spin loss per second (0-100, default: 0)
  spinBoostPerSecond?: number; // Spin gain per second (0-100, default: 0)
  
  // Friction
  frictionMultiplier?: number; // Friction multiplier (higher = more drag, default: 1.0)
  
  // Status Effects
  freezeDuration?: number; // Freeze time in seconds (0-10, default: 0)
  freezeThreshold?: number; // Time in water before freeze triggers (seconds, default: 5)
  stunDuration?: number; // Stun time in seconds (0-5, default: 0)
  stunThreshold?: number; // Time in water before stun triggers (seconds, default: 3)
  
  // Push/Pull Effects
  pushForce?: number; // Push away from water center (0-10, default: 0)
  pullForce?: number; // Pull toward water center (0-10, default: 0)
  
  // Visual Feedback
  showParticles?: boolean; // Show water splash particles (default: true)
  particleColor?: string; // Particle color (default: water color)
}

/**
 * Base Water Body Configuration
 */
export interface BaseWaterBodyConfig {
  id: string; // 'water1', 'water2', or 'water3'
  type: WaterBodyType;
  liquidType: LiquidType; // Type of liquid (water, lava, ice, etc.)
  color?: string; // Custom color (overrides liquid type default color)
  opacity?: number; // Water opacity (0-1, default: 0.6)
  depth?: number; // Visual depth effect (0-10, default: 5)
  wavyEffect?: boolean; // Animated wavy effect (default: false)
  effects?: WaterEffectConfig; // Custom gameplay effects (overrides liquid type defaults)
}

/**
 * Predefined Liquid Configurations
 * Each liquid type has default colors and effects
 */
export const LIQUID_PRESETS: Record<LiquidType, {
  name: string;
  color: string;
  opacity: number;
  description: string;
  effects: WaterEffectConfig;
}> = {
  water: {
    name: "💧 Water",
    color: "#3b82f6", // Blue
    opacity: 0.6,
    description: "Normal water - slight slowdown and friction",
    effects: {
      speedLoss: 0.8, // 20% slower
      frictionMultiplier: 1.3,
      showParticles: true,
    },
  },
  lava: {
    name: "🔥 Lava",
    color: "#ef4444", // Red-orange
    opacity: 0.8,
    description: "Extreme heat - damages beyblades over time",
    effects: {
      damagePerSecond: 5,
      speedLoss: 0.6, // 40% slower
      frictionMultiplier: 2.0,
      pushForce: 3, // Heat pushes away
      showParticles: true,
      particleColor: "#ff6b35",
    },
  },
  ice: {
    name: "❄️ Ice Water",
    color: "#60a5fa", // Light blue
    opacity: 0.7,
    description: "Freezing cold - slows and freezes after 5 seconds",
    effects: {
      speedLoss: 0.5, // 50% slower
      frictionMultiplier: 1.5,
      freezeDuration: 3,
      freezeThreshold: 5,
      spinDrainPerSecond: 10,
      showParticles: true,
      particleColor: "#bfdbfe",
    },
  },
  healing: {
    name: "💚 Healing Spring",
    color: "#10b981", // Green
    opacity: 0.5,
    description: "Restores HP and spin - no negative effects",
    effects: {
      healPerSecond: 3,
      spinBoostPerSecond: 20,
      frictionMultiplier: 1.0, // No extra friction
      showParticles: true,
      particleColor: "#6ee7b7",
    },
  },
  speedBoost: {
    name: "⚡ Energy Drink",
    color: "#eab308", // Yellow
    opacity: 0.6,
    description: "Speed boost zone - increases speed and reduces friction",
    effects: {
      speedBoost: 1.5, // 50% faster
      frictionMultiplier: 0.7, // Less friction
      spinBoostPerSecond: 10,
      showParticles: true,
      particleColor: "#fde047",
    },
  },
  quicksand: {
    name: "🏜️ Quicksand",
    color: "#d97706", // Brown-orange
    opacity: 0.7,
    description: "High friction - pulls inward and slows drastically",
    effects: {
      speedLoss: 0.3, // 70% slower
      frictionMultiplier: 3.0, // Very high friction
      pullForce: 5, // Strong pull toward center
      spinDrainPerSecond: 20,
      stunDuration: 2,
      stunThreshold: 4,
      showParticles: true,
      particleColor: "#fed7aa",
    },
  },
  oil: {
    name: "🛢️ Oil Slick",
    color: "#374151", // Dark gray
    opacity: 0.5,
    description: "Very slippery - low friction, hard to control",
    effects: {
      speedBoost: 1.2, // 20% faster (slippery)
      frictionMultiplier: 0.3, // Very low friction
      showParticles: true,
      particleColor: "#6b7280",
    },
  },
  poison: {
    name: "☠️ Poison",
    color: "#8b5cf6", // Purple
    opacity: 0.7,
    description: "Toxic - damages HP and drains spin over time",
    effects: {
      damagePerSecond: 2,
      spinDrainPerSecond: 30,
      speedLoss: 0.7, // 30% slower
      frictionMultiplier: 1.2,
      showParticles: true,
      particleColor: "#c4b5fd",
    },
  },
};

/**
 * Moat Water Body - Surrounds the arena in its shape (star, circle, etc.)
 * Creates a water-filled gap between the playing area and the outer boundary
 */
export interface MoatWaterBodyConfig extends BaseWaterBodyConfig {
  type: "moat";
  thickness: number; // Thickness of moat (em units, 1-10)
  distanceFromArena: number; // Inner radius from center (em units, 5-25)
  followsArenaShape: boolean; // true = matches arena shape, false = uses custom moatShape
  moatShape?: ArenaShape; // Custom shape for moat (only used when followsArenaShape is false)
}

/**
 * Zone Water Body - Positioned water body with custom shape inside arena
 * Can be placed at any X, Y position with specific dimensions
 */
export interface ZoneWaterBodyConfig extends BaseWaterBodyConfig {
  type: "zone";
  position: { x: number; y: number }; // Position relative to center (em units)
  shape: "circle" | "square" | "rectangle" | "oval"; // Water zone shape
  radius?: number; // For circle/oval - radius (em units)
  width?: number; // For square/rectangle - width (em units)
  height?: number; // For rectangle/oval - height (em units)
  rotation?: number; // Rotation angle in degrees (0-360)
}

/**
 * Wall-Based Water Body - Water at the edges of arena, in front of walls and exits
 * Follows the exact shape of the arena, positioned at the edge
 */
export interface WallBasedWaterBodyConfig extends BaseWaterBodyConfig {
  type: "wall-based";
  thickness: number; // Thickness of water strip (em units, 1-5)
  offsetFromEdge: number; // Distance from arena edge inward (em units, 0-3)
  coversExits: boolean; // Whether water also covers exit zones (default: true)
}

/**
 * Union type for all water body configurations
 */
export type WaterBodyConfig = MoatWaterBodyConfig | ZoneWaterBodyConfig | WallBasedWaterBodyConfig;

/**
 * Portal Configuration
 * Linked teleportation points (max 4 portals) - all portals are interconnected
 * Entering any portal can teleport to any other portal based on directional input or randomly
 */
export interface PortalConfig {
  id: string; // 'portal1', 'portal2', 'portal3', or 'portal4'
  portalNumber?: number; // Portal number for display (1-4)
  position: { x: number; y: number }; // Portal position (em units, relative to center)
  radius: number; // Visual size (em units)
  cooldown?: number; // Seconds before can be used again (default: 0)
  color?: string; // Visual color (default: varies by portal number)
  autoPlace?: boolean; // Auto-place at equal angles from center
  distanceFromCenter?: number; // Distance from center (em units) for auto-placement
  angle?: number; // Angle from center (degrees) for auto-placement
}

// ============================================================================
// PIT CONFIGURATION
// ============================================================================

/**
 * Pit Types - Different styles of pits
 */
export type PitType = "edge" | "crater";

/**
 * Pit Configuration
 * Pits are hazardous zones that trap beyblades temporarily
 * When a beyblade enters a pit:
 * - Takes spin damage every second
 * - Cannot be controlled
 * - Has 50% chance each second to escape before damage is applied
 */
export interface PitConfig {
  id: string; // 'pit1', 'pit2', 'pit3'
  type: PitType;
  position: { x: number; y: number }; // Position relative to center (em units)
  radius: number; // Pit size (em units, 1-5)
  depth: number; // Visual depth effect (1-10, affects appearance)
  spinDamagePerSecond: number; // Spin damage taken per second (5-50)
  escapeChance: number; // Chance to escape before damage (0-1, default: 0.5 = 50%)
  color?: string; // Visual color (default: dark brown/black)
  autoPlace?: boolean; // Auto-place at edge or random position
  edgeOffset?: number; // Distance from edge for edge-type pits (em units)
  angle?: number; // Angle for edge-type pits (degrees, 0-360)
}

// ============================================================================
// WALL CONFIGURATION
// ============================================================================

/**
 * Configuration for a single wall segment on an edge
 */
export interface WallSegment {
  id?: string; // Wall ID for identification (e.g., "E1W1" = Edge 1, Wall 1)
  width: number; // Arc width for circle, or length for polygon edges (in percentage 0-100)
  thickness: number; // Wall thickness (em units)
  position: number; // Position along edge (0-100%), for multiple walls per edge
}

/**
 * Configuration for walls on a single edge
 */
export interface EdgeWallConfig {
  walls: WallSegment[]; // Array of wall segments (1-3 walls per edge)
  // Empty spaces between walls become exits (red zones with arrows)
}

/**
 * Complete wall configuration for the arena
 */
export interface WallConfig {
  enabled: boolean; // If false, no walls at all
  
  // Wall configuration per edge
  // Number of edges depends on shape: circle=1, triangle=3, square=4, pentagon=5, etc.
  edges: EdgeWallConfig[];
  
  // Common wall properties
  commonThickness?: number; // Common thickness for all walls (optional)
  
  // Wall appearance
  wallStyle: "brick" | "metal" | "wood" | "stone"; // Visual appearance
  wallColor?: string; // Optional custom color
  
  // Exit appearance
  exitStyle: "arrows" | "glow" | "dashed"; // How exits are shown
  exitColor: string; // Color for exits (default: red)
  
  // Collision properties
  baseDamage: number; // Damage taken when hitting wall
  recoilDistance: number; // Distance bounced back (em units)
  hasSpikes: boolean; // Spikes increase damage
  spikeDamageMultiplier: number; // Multiplier when spikes enabled
}

// ============================================================================
// ARENA CONFIGURATION
// ============================================================================

/**
 * Complete Arena Configuration
 */
export interface ArenaConfig {
  // ===== BASIC PROPERTIES =====
  id?: string;
  name: string;
  description?: string;
  
  // ===== GEOMETRY =====
  // NOTE: All arenas use ARENA_RESOLUTION (1080x1080) internally
  // These properties are kept for backward compatibility but should use ARENA_RESOLUTION
  width: number; // Deprecated: use ARENA_RESOLUTION instead
  height: number; // Deprecated: use ARENA_RESOLUTION instead
  shape: ArenaShape;
  
  // ===== VISUAL & THEME =====
  theme: ArenaTheme;
  backgroundColor?: string; // Custom background color
  floorColor?: string; // Custom floor color
  floorTexture?: string; // URL to floor texture image
  
  // ===== ROTATION =====
  autoRotate: boolean; // Arena rotates constantly
  rotationSpeed: number; // Degrees per second (360/60 = 6°/sec = 1 minute per full rotation)
  rotationDirection: "clockwise" | "counterclockwise";
  
  // ===== WALLS & EXITS =====
  wall: WallConfig;
  
  // ===== SPEED PATHS & PORTALS =====
  speedPaths: SpeedPathConfig[]; // Speed boost paths that players travel along
  loops?: LoopConfig[]; // Deprecated: use speedPaths instead
  portals: PortalConfig[]; // Linked teleportation points (max 4 portals)
  
  // ===== WATER BODIES =====
  waterBodies: WaterBodyConfig[]; // Water bodies in arena (max 3)
  
  // ===== PITS =====
  pits: PitConfig[]; // Pit hazards in arena (max 3)
  
  // ===== METADATA =====
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  difficulty?: "easy" | "medium" | "hard" | "extreme" | "custom";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get number of edges for a given shape
 */
export function getEdgeCount(shape: ArenaShape): number {
  const edgeCounts: Record<ArenaShape, number> = {
    circle: 1,
    triangle: 3,
    square: 4,
    pentagon: 5,
    hexagon: 6,
    heptagon: 7,
    octagon: 8,
    star3: 6,   // 3 points × 2 (outer + inner)
    star4: 8,   // 4 points × 2
    star5: 10,  // 5 points × 2
    star6: 12,  // 6 points × 2
    star7: 14,  // 7 points × 2
    star8: 16,  // 8 points × 2
  };
  return edgeCounts[shape];
}

/**
 * Initialize wall config with default values for a shape
 */
export function initializeWallConfig(shape: ArenaShape): WallConfig {
  const edgeCount = getEdgeCount(shape);
  
  return {
    enabled: true,
    edges: Array.from({ length: edgeCount }, () => ({
      walls: [
        {
          width: 100, // Full edge by default
          thickness: 1,
          position: 0,
        },
      ],
    })),
    wallStyle: "brick",
    exitStyle: "arrows",
    exitColor: "#ef4444",
    baseDamage: 5,
    recoilDistance: 2,
    hasSpikes: false,
    spikeDamageMultiplier: 1.5,
  };
}

/**
 * Generate random wall configuration
 */
export function generateRandomWalls(shape: ArenaShape): WallConfig {
  const edgeCount = getEdgeCount(shape);
  const config = initializeWallConfig(shape);
  
  config.edges = Array.from({ length: edgeCount }, () => {
    // Randomly choose 1-3 walls per edge
    const wallCount = Math.floor(Math.random() * 3) + 1;
    
    if (wallCount === 1) {
      // Single wall covering 60-100% of edge
      const width = 60 + Math.random() * 40;
      return {
        walls: [
          {
            width,
            thickness: 0.5 + Math.random() * 1.5, // 0.5-2.0em
            position: Math.random() * (100 - width),
          },
        ],
      };
    } else if (wallCount === 2) {
      // Two walls, each covering 30-45% of edge
      const wall1Width = 30 + Math.random() * 15;
      const wall2Width = 30 + Math.random() * 15;
      return {
        walls: [
          {
            width: wall1Width,
            thickness: 0.5 + Math.random() * 1.5,
            position: 0,
          },
          {
            width: wall2Width,
            thickness: 0.5 + Math.random() * 1.5,
            position: 100 - wall2Width,
          },
        ],
      };
    } else {
      // Three walls, each covering 20-30% of edge
      const wall1Width = 20 + Math.random() * 10;
      const wall2Width = 20 + Math.random() * 10;
      const wall3Width = 20 + Math.random() * 10;
      return {
        walls: [
          {
            width: wall1Width,
            thickness: 0.5 + Math.random() * 1.5,
            position: 0,
          },
          {
            width: wall2Width,
            thickness: 0.5 + Math.random() * 1.5,
            position: 50 - wall2Width / 2,
          },
          {
            width: wall3Width,
            thickness: 0.5 + Math.random() * 1.5,
            position: 100 - wall3Width,
          },
        ],
      };
    }
  });
  
  return config;
}

// ============================================================================
// PRESET TEMPLATES
// ============================================================================

export const ARENA_PRESETS: Record<string, Partial<ArenaConfig>> = {
  classic: {
    name: "Classic Stadium",
    shape: "circle",
    theme: "metrocity",
    width: 50,
    height: 50,
    autoRotate: false,
    rotationSpeed: 0,
    rotationDirection: "clockwise",
    wall: initializeWallConfig("circle"),
    speedPaths: [],
    portals: [],
    waterBodies: [],
  },
  
  square_arena: {
    name: "Square Arena",
    shape: "square",
    theme: "desert",
    width: 50,
    height: 50,
    autoRotate: false,
    rotationSpeed: 0,
    rotationDirection: "clockwise",
    wall: initializeWallConfig("square"),
    speedPaths: [],
    portals: [],
    waterBodies: [],
  },
  
  hexagon_fortress: {
    name: "Hexagon Fortress",
    shape: "hexagon",
    theme: "futuristic",
    width: 50,
    height: 50,
    autoRotate: true,
    rotationSpeed: 6, // 1 minute per rotation (360°/60sec = 6°/sec)
    rotationDirection: "clockwise",
    wall: initializeWallConfig("hexagon"),
    speedPaths: [],
    portals: [],
    waterBodies: [],
  },
  
  pentagon_chaos: {
    name: "Pentagon Chaos",
    shape: "pentagon",
    theme: "prehistoric",
    width: 50,
    height: 50,
    autoRotate: false,
    rotationSpeed: 0,
    rotationDirection: "counterclockwise",
    wall: generateRandomWalls("pentagon"),
    speedPaths: [],
    portals: [],
    waterBodies: [],
  },

  star_fortress: {
    name: "Star Fortress",
    shape: "star5",
    theme: "futuristic",
    width: 50,
    height: 50,
    autoRotate: true,
    rotationSpeed: 12,
    rotationDirection: "clockwise",
    wall: initializeWallConfig("star5"),
    speedPaths: [],
    portals: [],
    waterBodies: [],
  },
};

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_ARENA_CONFIG: ArenaConfig = {
  name: "New Arena",
  description: "",
  width: 50,
  height: 50,
  shape: "circle",
  theme: "metrocity",
  autoRotate: false,
  rotationSpeed: 6,
  rotationDirection: "clockwise",
  wall: initializeWallConfig("circle"),
  speedPaths: [],
  portals: [],
  waterBodies: [],
  pits: [],
  difficulty: "medium",
};
