/**
 * Game Constants
 * 
 * All magic numbers and configuration values for the Beyblade Battle game
 */

// ====== STADIUM DIMENSIONS ======
export const STADIUM = {
  WIDTH: 800,
  HEIGHT: 800,
  CENTER_X: 400,
  CENTER_Y: 400,
  
  // Circle radii (from center outward)
  NORMAL_LOOP_RADIUS: 200,      // Inner blue circle (normal loop, 10s cooldown)
  CHARGE_DASH_RADIUS: 300,       // Middle blue circle (charge dash with points, 3s cooldown)
  INNER_RADIUS: 360,             // Outer playing area boundary
  OUTER_RADIUS: 380,             // Wall/exit zone boundary
  EXIT_RADIUS: 380,              // Exit detection radius
  
  // Charge point angles (degrees)
  CHARGE_POINT_ANGLES: [30, 150, 270] as const,
} as const;

// ====== BEYBLADE PHYSICS ======
export const BEYBLADE = {
  // Initial stats
  INITIAL_PLAYER_SPIN: 3500,
  INITIAL_AI_SPIN: 2800,
  MAX_SPIN: 2000,
  SPIN_DECAY_RATE: 5,            // Per frame decay
  
  // Radius and mass
  RADIUS: 15,                    // Visual size (diameter = 30)
  MASS: 1,
  
  // Acceleration
  NORMAL_MAX_ACCELERATION: 15,
  CHARGE_DASH_MAX_ACCELERATION: 25,
  ACCELERATION_FROM_VELOCITY_DIVISOR: 10,  // velocity / 10 = acceleration
  VELOCITY_GAIN_MULTIPLIER: 0.01,          // 2 per 100 velocity units
  
  // Decay rates
  ACCELERATION_DECAY_FAST: 6,    // During charge dash
  ACCELERATION_DECAY_NORMAL: 4,  // Normal gameplay
  ACCELERATION_DECAY_INITIAL: 2, // First 5 seconds
  NO_DECAY_DURATION: 5.0,        // Seconds before decay starts
  
  // Movement
  FRICTION: 0.985,
  ACCELERATION_MOVEMENT_MULTIPLIER_DIVISOR: 20,  // 1 + (accel / 20)
  BASE_ROTATIONS_PER_SECOND: 20,
} as const;

// ====== PLAYER MOVEMENT ======
export const PLAYER_MOVEMENT = {
  MAX_SPEED: 250,
  ACCELERATION: 500,
  DECELERATION: 0.90,
  VELOCITY_CAP_NORMAL: 300,
  VELOCITY_CAP_CHARGE_DASH: 400,
} as const;

// ====== AI MOVEMENT ======
export const AI_MOVEMENT = {
  MAX_SPEED: 180,
  ACCELERATION: 380,
  RANDOM_FACTOR: 0.4,
  MIN_TARGET_DISTANCE: 60,       // Minimum distance to maintain from player
  SPAWN_MIN_RADIUS: 100,
  SPAWN_RADIUS_RANGE: 80,        // Min + random(0, range)
} as const;

// ====== SPECIAL ACTIONS ======
export const DODGE = {
  SPEED: 400,
  SPIN_COST: 20,
  COOLDOWN: 0.5,                 // Seconds
  ANIMATION_DURATION: 500,       // Milliseconds
  IMMUNITY_RADIUS_TOLERANCE: 5,  // Pixels tolerance for dash line crossing
} as const;

export const HEAVY_ATTACK = {
  DAMAGE_MULTIPLIER: 1.25,
  DURATION: 0.3,                 // Seconds (300ms for attack window)
  ANIMATION_DURATION: 2000,      // Milliseconds
} as const;

export const ULTIMATE_ATTACK = {
  DAMAGE_MULTIPLIER: 2.0,
  SPIN_COST: 100,
  DURATION: 0.5,                 // Seconds (500ms for attack window)
  ANIMATION_DURATION: 3000,      // Milliseconds
} as const;

// ====== BLUE LOOP MECHANICS ======
export const BLUE_LOOP = {
  // Detection
  CHARGE_DASH_DETECTION_TOLERANCE: 5,  // Pixels tolerance for circle edge
  NORMAL_LOOP_DETECTION_TOLERANCE: 5,  // Pixels tolerance for circle edge
  
  // Timing
  CHARGE_DASH_COOLDOWN: 3.0,     // Seconds
  NORMAL_LOOP_COOLDOWN: 10.0,    // Seconds
  LOOP_DURATION: 1.0,            // Seconds to complete one loop
  PLAYER_SELECTION_TIME: 1.0,    // Seconds for player to select charge point
  
  // Movement
  CIRCULAR_SPEED: 200,
  ACCELERATION_MULTIPLIER: 1.3,
  
  // Charge dash
  CHARGE_DASH_SPEED: 350,
  CHARGE_DASH_DURATION: 3.0,     // Seconds of enhanced acceleration
  CHARGE_POINT_ANGLE_THRESHOLD: 5,  // Degrees tolerance for triggering dash
} as const;

// ====== COLLISION SYSTEM ======
export const COLLISION = {
  // Damage calculation
  OPPOSITE_SPIN_DAMAGE_MULTIPLIER: 0.6,
  SAME_SPIN_DAMAGE_MULTIPLIER: 0.6,
  
  // Physics
  RESTITUTION: 0.8,              // Bounce coefficient
  VELOCITY_TRANSFER: 35,
  MAX_VELOCITY_ADDITION: 150,
  MAX_KNOCKBACK_DISTANCE: 80,
  STADIUM_RADIUS_LIMIT: 290,     // For knockback calculations
} as const;

// ====== WALL COLLISIONS ======
export const WALL = {
  BOUNCE_STRENGTH: 0.6,
  BASE_SPIN_LOSS: 10,
  ACCELERATION_SPIN_LOSS_MULTIPLIER: 0.7,  // spinLoss = 10 + accel * 0.7
  MIN_SPIN_AFTER_HIT: 50,
  RESPAWN_DISTANCE_FROM_INNER: 10,
  INWARD_RESPAWN_SPEED_MIN: 60,
  INWARD_RESPAWN_SPEED_RANGE: 30,
  
  // Visual design
  THICKNESS: 15,
  NUM_BRICKS: 8,
  
  // Angle ranges (degrees) - Yellow walls vs Red exits
  ZONES: [
    { start: 0, end: 60, isWall: true },
    { start: 60, end: 120, isWall: false },
    { start: 120, end: 180, isWall: true },
    { start: 180, end: 240, isWall: false },
    { start: 240, end: 300, isWall: true },
    { start: 300, end: 360, isWall: false },
  ] as const,
} as const;

// ====== SPIN DECAY ======
export const SPIN_DECAY = {
  FRICTION_COEFFICIENT: 0.995,
  VELOCITY_DRAG_MULTIPLIER: 0.008,
  BASE_LOSS: 0.35,
} as const;

// ====== CHARGE DASH STADIUM BOUNDS ======
export const CHARGE_DASH_BOUNDS = {
  REDIRECT_DISTANCE_FROM_OUTER: 20,  // Redirect if within 20px of outer edge
  REDIRECT_SPEED: 250,
} as const;

// ====== RENDERING ======
export const RENDERING = {
  // Canvas
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 800,
  MAX_CANVAS_SCALE: 1.2,
  VIEWPORT_HEIGHT_PERCENTAGE: 0.7,
  
  // Floor gradient
  FLOOR_GRADIENT_STOPS: [
    { offset: 0, color: "#1a1a1a" },
    { offset: 0.7, color: "#2a2a2a" },
    { offset: 1, color: "#3a3a3a" },
  ] as const,
  
  // Blue circles
  NORMAL_LOOP_LINE_WIDTH: 3,
  NORMAL_LOOP_DASH: [8, 4] as const,
  NORMAL_LOOP_PULSE_SPEED: 2.5,
  
  CHARGE_DASH_LINE_WIDTH: 4,
  CHARGE_DASH_DASH: [10, 5] as const,
  CHARGE_DASH_PULSE_SPEED: 3,
  
  // Pulse alpha range
  PULSE_ALPHA_BASE: 0.3,
  PULSE_ALPHA_RANGE: 0.2,
  
  // Charge points
  CHARGE_POINT_SIZE_BASE: 10,
  CHARGE_POINT_SIZE_PULSE: 3,
  CHARGE_POINT_SIZE_SELECTED_BASE: 15,
  CHARGE_POINT_SIZE_SELECTED_PULSE: 5,
  CHARGE_POINT_PULSE_SPEED: 4,
  CHARGE_POINT_SELECTED_PULSE_SPEED: 6,
  
  // Colors
  BLUE_CIRCLE_COLOR: "rgba(59, 130, 246, ",  // + alpha + ")"
  YELLOW_WALL_COLOR: "#FBBF24",
  RED_EXIT_COLOR: "#EF4444",
  BLACK_WALL_COLOR: "#000000",
  BRICK_LINE_COLOR: "#333333",
  
  // Dodge animation
  DODGE_TRAIL_COUNT: 3,
  DODGE_TRAIL_SPACING: 15,
  DODGE_SPEED_LINES: 5,
  DODGE_COLOR: "#22C55E",
  
  // Attack animations
  HEAVY_ATTACK_COLOR: "rgba(251, 146, 60, ",  // + alpha + ")"
  HEAVY_ATTACK_PARTICLES: 8,
  HEAVY_ATTACK_PARTICLE_SIZE: 3,
  
  ULTIMATE_ATTACK_COLOR: "rgba(239, 68, 68, ",  // + alpha + ")"
  ULTIMATE_LIGHTNING_BOLTS: 6,
  ULTIMATE_LIGHTNING_WIDTH: 3,
  ULTIMATE_EXPLOSION_MULTIPLIER: 50,
  
  // UI
  STATS_PANEL_WIDTH: 100,
  STATS_PANEL_HEIGHT: 80,
  LEGEND_WIDTH: 180,
  LEGEND_HEIGHT: 100,
  CONTROL_LINE_HEIGHT: 13,
} as const;

// ====== COUNTDOWN ======
export const COUNTDOWN = {
  INITIAL_VALUE: 3,
  INTERVAL: 1000,                // Milliseconds
  LET_IT_RIP_DURATION: 500,      // Milliseconds
} as const;

// ====== GAME TIMINGS ======
export const TIMING = {
  MAX_DELTA_TIME: 1 / 30,        // Cap at 30fps minimum
  TARGET_FPS: 60,
} as const;

// ====== CONTROL MAPPINGS ======
export const CONTROLS = {
  KEYBOARD: {
    DODGE_LEFT: '1',
    DODGE_RIGHT: '2',
    HEAVY_ATTACK: '3',
    ULTIMATE_ATTACK: '4',
    MOVE_UP: ['w', 'arrowup'],
    MOVE_DOWN: ['s', 'arrowdown'],
    MOVE_LEFT: ['a', 'arrowleft'],
    MOVE_RIGHT: ['d', 'arrowright'],
  },
  MOUSE: {
    DODGE_LEFT: 0,               // Left click
    DODGE_RIGHT: 2,              // Right click
    HEAVY_ATTACK: 1,             // Middle click
    // Double click for ultimate attack
  },
  GAMEPAD: {
    DODGE_LEFT: 1,
    DODGE_RIGHT: 2,
    HEAVY_ATTACK: 3,
    ULTIMATE_ATTACK: 4,
  },
} as const;

// ====== TYPE EXPORTS ======
export type ChargePointAngle = typeof STADIUM.CHARGE_POINT_ANGLES[number];
export type WallZone = typeof WALL.ZONES[number];
