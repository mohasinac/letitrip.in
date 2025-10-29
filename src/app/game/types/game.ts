export interface Vector2D {
  x: number;
  y: number;
}

export interface BeybladePhysics {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  spin: number; // 0-2000, represents spin strength
  maxSpin: number;
  spinDecayRate: number; // how fast spin decreases per frame
  mass: number;
  radius: number;
  acceleration: number; // Current acceleration value for damage calculations
  isCharging: boolean;
  chargeLevel: number; // 0-100, for powerful attacks
  isOutOfBounds: boolean;
  isDead: boolean; // when spin reaches 0
  justRespawned?: boolean; // Flag to prevent immediate death after wall respawn
  blueCircleLoopStartTime?: number; // Track when beyblade started blue circle loop
  isInBlueLoop: boolean; // Track if beyblade is locked in blue circle loop
  blueLoopAngle: number; // Track current angle in blue loop
  blueLoopCooldownEnd?: number; // Track when blue loop cooldown ends (3 seconds after last loop)
  normalLoopCooldownEnd?: number; // Track when normal loop (200 radius) cooldown ends (5 seconds after last loop)
  isInNormalLoop?: boolean; // Track if beyblade is locked in normal loop (200 radius)
  normalLoopStartTime?: number; // Track when beyblade started normal loop
  normalLoopAngle?: number; // Track current angle in normal loop
  normalLoopStartAngle?: number; // Track starting angle to detect full loop completion
  isChargingToPoint: boolean; // Track if beyblade is charging to a wall center point
  chargePoint: Vector2D | null; // Target charge point position
  isChargeDashing: boolean; // Track if beyblade is in enhanced charge dash mode
  chargeDashEndTime?: number; // When charge dash enhanced acceleration ends (2 seconds)
  currentMaxAcceleration: number; // Current max acceleration cap (gradually decays from 20 to 10)
  accelerationDecayStartTime?: number; // When the gradual decay started
  selectedChargePointAngle?: number; // The randomly selected charge point angle for the current loop
  
  // Special Attacks & Dodges
  heavyAttackActive: boolean; // 1.25x damage multiplier active
  heavyAttackEndTime?: number; // When heavy attack ends
  ultimateAttackActive: boolean; // 2x damage multiplier active
  ultimateAttackEndTime?: number; // When ultimate attack ends
  attackStartPosition?: Vector2D; // Starting position for distance-based attacks
  attackTargetDistance?: number; // Target distance to travel during attack
  attackCooldownEnd?: number; // When next attack can be used (5 second cooldown)
  dodgeCooldownEnd?: number; // When dodge can be used again (2 second cooldown)
  lastDodgeTime?: number; // Track last dodge for cooldown
  isDodging: boolean; // Track if currently in dodge animation (immune to dash triggers)
  selectedChargePoint?: 1 | 2 | 3 | null; // Player-selected charge point (1, 2, or 3)
}

export interface GameBeyblade extends BeybladePhysics {
  id: string;
  name: string;
  config: {
    name: string;
    fileName: string;
    direction: 'left' | 'right';
    speed: number;
  };
  isPlayer: boolean;
}

export interface Stadium {
  center: Vector2D;
  innerRadius: number; // Outer playing area boundary (360)
  outerRadius: number; // Wall/exit zone boundary (380)
  exitRadius: number; // Yellow exit zone
  chargeDashRadius: number; // Blue circle for charge dash (350)
  normalLoopRadius: number; // Blue circle for normal loop (200)
  width: number;
  height: number;
}

export interface GameState {
  beyblades: GameBeyblade[];
  stadium: Stadium;
  isPlaying: boolean;
  winner: GameBeyblade | null;
  gameTime: number;
  countdownActive: boolean;
  countdownValue: number;
}

export interface CollisionResult {
  beyblade1: GameBeyblade;
  beyblade2: GameBeyblade;
  force: number;
  angle: number;
}
