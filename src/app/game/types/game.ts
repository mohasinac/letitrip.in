export interface Vector2D {
  x: number;
  y: number;
}

export interface BeybladePhysics {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  spin: number; // 0-1000, represents spin strength
  maxSpin: number;
  spinDecayRate: number; // how fast spin decreases per frame
  mass: number;
  radius: number;
  acceleration: number; // Current acceleration value for damage calculations
  isCharging: boolean;
  chargeLevel: number; // 0-100, for powerful attacks
  isOutOfBounds: boolean;
  isDead: boolean; // when spin reaches 0
  blueCircleLoopStartTime?: number; // Track when beyblade started blue circle loop
  isInBlueLoop: boolean; // Track if beyblade is locked in blue circle loop
  blueLoopAngle: number; // Track current angle in blue loop
  blueLoopCooldownEnd?: number; // Track when blue loop cooldown ends (3 seconds after last loop)
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
  innerRadius: number; // Blue speed zone
  outerRadius: number; // Red wall zone
  exitRadius: number; // Yellow exit zone
  width: number;
  height: number;
}

export interface GameState {
  beyblades: GameBeyblade[];
  stadium: Stadium;
  isPlaying: boolean;
  winner: GameBeyblade | null;
  gameTime: number;
}

export interface CollisionResult {
  beyblade1: GameBeyblade;
  beyblade2: GameBeyblade;
  force: number;
  angle: number;
}
