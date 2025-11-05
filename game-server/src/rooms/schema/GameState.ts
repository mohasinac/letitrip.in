import { Schema, type, MapSchema } from "@colyseus/schema";

/**
 * Beyblade entity - represents a single beyblade in the game
 */
export class Beyblade extends Schema {
  @type("string") id: string = "";
  @type("string") userId: string = "";
  @type("string") username: string = "";
  @type("string") beybladeId: string = "";
  @type("boolean") isAI: boolean = false;

  // Position
  @type("number") x: number = 0;
  @type("number") y: number = 0;

  // Rotation (radians)
  @type("number") rotation: number = 0;

  // Velocity
  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;

  // Angular velocity (spin speed)
  @type("number") angularVelocity: number = 0;

  // Stats - Full beyblade properties
  @type("string") type: string = "balanced"; // attack, defense, stamina, balanced
  @type("string") spinDirection: string = "right"; // left, right
  @type("number") mass: number = 50;
  @type("number") radius: number = 4;
  @type("number") actualSize: number = 40; // Visual size in pixels

  // Type Distribution (from BeybladeStats)
  @type("number") attackPoints: number = 120;
  @type("number") defensePoints: number = 120;
  @type("number") staminaPoints: number = 120;

  // Calculated stats from type distribution
  @type("number") damageMultiplier: number = 1.0; // Attack multiplier
  @type("number") damageTaken: number = 1.0; // Defense multiplier (lower is better)
  @type("number") knockbackDistance: number = 10; // Knockback amount
  @type("number") spinStealFactor: number = 0.1; // Spin steal percentage
  @type("number") spinDecayRate: number = 10; // Spin decay per second
  @type("number") speedBonus: number = 1.0; // Movement speed multiplier
  @type("number") invulnerabilityChance: number = 0.1; // Chance to avoid damage

  // Combat stats - Dynamic values
  @type("number") health: number = 100;
  @type("number") stamina: number = 100;
  @type("number") maxStamina: number = 100;
  @type("number") spin: number = 2000; // Current spin (0-maxSpin)
  @type("number") maxSpin: number = 2000; // Max spin capacity

  // Combat tracking
  @type("number") damageDealt: number = 0;
  @type("number") damageReceived: number = 0;
  @type("number") collisions: number = 0;

  // Special states
  @type("boolean") isActive: boolean = true;
  @type("boolean") isRingOut: boolean = false;
  @type("boolean") isInvulnerable: boolean = false;
  @type("number") invulnerabilityTimer: number = 0;

  // Loop state
  @type("boolean") inLoop: boolean = false;
  @type("number") loopIndex: number = -1;
  @type("number") loopEntryTime: number = 0;
  @type("number") loopSpeedBoost: number = 1.0; // Current loop speed boost
  @type("number") loopSpinBoost: number = 0; // Current loop spin recovery

  // Water body state
  @type("boolean") inWater: boolean = false;
  @type("number") waterSpeedMultiplier: number = 1.0; // Speed reduction from water
  @type("number") waterSpinDrain: number = 0; // Spin drain from water

  // Pit state
  @type("boolean") inPit: boolean = false;
  @type("string") currentPitId: string = "";
  @type("number") pitDamageRate: number = 0;

  // Obstacle collision state
  @type("boolean") collidingWithObstacle: boolean = false;
  @type("string") lastObstacleId: string = "";

  // Special move cooldown
  @type("number") specialCooldown: number = 0;
  @type("number") attackCooldown: number = 0;

  // Special move active state
  @type("boolean") specialMoveActive: boolean = false;
  @type("number") specialMoveEndTime: number = 0;
}

/**
 * Arena state - represents the battle arena
 */
export class ArenaState extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("number") width: number = 800;
  @type("number") height: number = 600;
  @type("string") shape: string = "circle";
  @type("string") theme: string = "metrocity";
  @type("number") rotation: number = 0;

  // Physics modifiers
  @type("number") gravity: number = 0;
  @type("number") airResistance: number = 0.01;
  @type("number") surfaceFriction: number = 0.1;

  // Wall configuration
  @type("boolean") wallEnabled: boolean = true;
  @type("number") wallBaseDamage: number = 5;
  @type("number") wallRecoilDistance: number = 2;
  @type("boolean") wallHasSpikes: boolean = false;
  @type("number") wallSpikeDamageMultiplier: number = 1.0;
  @type("boolean") wallHasSprings: boolean = false;
  @type("number") wallSpringRecoilMultiplier: number = 1.0;

  // Arena features counts (for client display)
  @type("number") loopCount: number = 0;
  @type("number") exitCount: number = 0;
  @type("number") obstacleCount: number = 0;
  @type("number") pitCount: number = 0;
  @type("number") laserGunCount: number = 0;
  @type("boolean") hasWaterBody: boolean = false;
}

/**
 * Main game state - synchronizes between server and clients
 */
export class GameState extends Schema {
  @type({ map: Beyblade }) beyblades = new MapSchema<Beyblade>();
  @type(ArenaState) arena = new ArenaState();

  @type("string") status: string = "waiting"; // waiting, in-progress, finished
  @type("string") winner: string = ""; // userId of winner
  @type("number") timer: number = 180; // seconds
  @type("number") startTime: number = 0;

  // Match metadata
  @type("string") mode: string = "tryout"; // tryout, single-battle-ai, single-battle-pvp
  @type("string") matchId: string = "";
}
