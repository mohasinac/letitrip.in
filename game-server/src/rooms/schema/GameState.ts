import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

/**
 * Loop State - tracks which beyblades are using a loop
 */
export class LoopState extends Schema {
  @type("number") loopIndex: number = 0;
  @type("number") radius: number = 0; // em units
  @type("string") shape: string = "circle"; // circle, rectangle, etc.
  @type("number") speedBoost: number = 1.0;
  @type("number") spinBoost: number = 0;
  @type("number") frictionMultiplier: number = 1.0;
  @type(["string"]) beybladeIds = new ArraySchema<string>(); // Beyblades currently in loop
  @type("number") totalBeybladesPassed: number = 0; // Total count of beyblades that used this loop
  @type("number") lastEntryTime: number = 0;
}

/**
 * Obstacle State - tracks obstacle health and destruction
 */
export class ObstacleState extends Schema {
  @type("string") obstacleId: string = "";
  @type("number") obstacleIndex: number = 0;
  @type("string") type: string = "rock"; // rock, pillar, barrier, wall
  @type("number") x: number = 0; // em units
  @type("number") y: number = 0; // em units
  @type("number") radius: number = 1; // em units
  @type("boolean") destructible: boolean = false;
  @type("boolean") isDestroyed: boolean = false;
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("number") damage: number = 10; // Damage on collision
  @type("number") recoil: number = 5; // Knockback force
  @type("string") lastHitBy: string = ""; // Beyblade ID
  @type("number") lastHitTime: number = 0;
  @type("number") totalCollisions: number = 0;
  @type("number") totalDamageDealt: number = 0;
}

/**
 * Pit State - tracks which beyblade is trapped in a pit
 */
export class PitState extends Schema {
  @type("string") pitId: string = "";
  @type("number") pitIndex: number = 0;
  @type("number") x: number = 0; // em units
  @type("number") y: number = 0; // em units
  @type("number") radius: number = 1; // em units
  @type("number") damagePerSecond: number = 10; // Percentage
  @type("number") escapeChance: number = 0.5; // 0-1
  @type("string") trappedBeybladeId: string = ""; // Empty if no beyblade trapped
  @type("number") trapStartTime: number = 0;
  @type("number") totalDamageDealt: number = 0;
  @type("number") totalTraps: number = 0; // Number of times beyblades got trapped
  @type("number") totalEscapes: number = 0; // Number of successful escapes
}

/**
 * Laser Gun (Turret) State
 */
export class LaserGunState extends Schema {
  @type("string") turretId: string = "";
  @type("number") turretIndex: number = 0;
  @type("number") x: number = 0; // em units
  @type("number") y: number = 0; // em units
  @type("number") currentAngle: number = 0; // Current aim angle in degrees
  @type("number") targetAngle: number = 0; // Target angle (for aiming animation)
  @type("number") fireInterval: number = 2; // Seconds between shots
  @type("number") damage: number = 10;
  @type("number") bulletSpeed: number = 10; // em/second
  @type("string") targetMode: string = "nearest"; // random, nearest, strongest
  @type("number") warmupTime: number = 1; // Seconds
  @type("number") range: number = 20; // em units
  @type("boolean") destructible: boolean = false; // Can turret be destroyed?
  @type("boolean") isDestroyed: boolean = false;
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("boolean") isActive: boolean = true;
  @type("boolean") isWarming: boolean = false; // Currently aiming/warming up
  @type("boolean") isFiring: boolean = false;
  @type("number") warmupStartTime: number = 0;
  @type("number") lastFireTime: number = 0;
  @type("number") cooldownEndTime: number = 0;
  @type("string") currentTarget: string = ""; // Beyblade ID
  @type("number") shotsFired: number = 0;
  @type("number") hitsLanded: number = 0;
  @type("number") damageDealt: number = 0;
}

/**
 * Projectile (Laser/Bullet) State
 */
export class ProjectileState extends Schema {
  @type("string") id: string = "";
  @type("string") turretId: string = "";
  @type("number") turretIndex: number = 0;
  @type("string") targetId: string = ""; // Beyblade ID (for tracking)
  @type("number") x: number = 0; // Current position (em units)
  @type("number") y: number = 0;
  @type("number") velocityX: number = 0; // em/second
  @type("number") velocityY: number = 0;
  @type("number") angle: number = 0; // Direction in degrees
  @type("number") damage: number = 0;
  @type("number") speed: number = 0; // em/second
  @type("number") spawnTime: number = 0;
  @type("number") maxLifetime: number = 5000; // 5 seconds max
  @type("boolean") isActive: boolean = true;
  @type("boolean") hasHit: boolean = false; // Track if projectile hit something
  @type("string") hitBeybladeId: string = ""; // Track what it hit
}

/**
 * Water Body State - tracks beyblades in water
 */
export class WaterBodyState extends Schema {
  @type("boolean") enabled: boolean = false;
  @type("string") type: string = "center"; // center, moat, ring
  @type("string") shape: string = "circle";
  @type("string") liquidType: string = "water"; // water, blood, lava, acid, oil, ice
  @type("number") spinDrainRate: number = 10; // Percentage per second
  @type("number") speedMultiplier: number = 0.7; // 0.7 = 30% slower
  @type(["string"]) beybladeIds = new ArraySchema<string>(); // Beyblades currently in water
  @type("number") totalDamageDealt: number = 0; // Total spin drained
  @type("number") totalBeybladesPassed: number = 0; // Total count
}

/**
 * Portal State - tracks portal usage and cooldown
 */
export class PortalState extends Schema {
  @type("string") portalId: string = ""; // portal1 or portal2
  @type("number") portalIndex: number = 0;
  @type("number") inPointX: number = 0; // em units
  @type("number") inPointY: number = 0;
  @type("number") outPointX: number = 0;
  @type("number") outPointY: number = 0;
  @type("number") radius: number = 2; // em units
  @type("number") cooldown: number = 0; // Seconds
  @type("boolean") bidirectional: boolean = true;
  @type("boolean") isOnCooldown: boolean = false;
  @type("number") cooldownEndTime: number = 0;
  @type("string") lastUsedBy: string = ""; // Beyblade ID
  @type("number") lastUseTime: number = 0;
  @type("number") totalUses: number = 0;
}

/**
 * Goal Object State - tracks collectibles/destroyables
 */
export class GoalObjectState extends Schema {
  @type("string") goalId: string = "";
  @type("number") goalIndex: number = 0;
  @type("string") type: string = "star"; // star, crystal, coin, gem, relic, trophy
  @type("number") x: number = 0; // em units
  @type("number") y: number = 0;
  @type("number") radius: number = 1;
  @type("boolean") isCollectible: boolean = false; // true = collect on touch, false = must destroy
  @type("boolean") isCollected: boolean = false;
  @type("boolean") isDestroyed: boolean = false;
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("number") shieldHealth: number = 0;
  @type("number") scoreValue: number = 10;
  @type("string") collectedBy: string = ""; // Beyblade ID
  @type("string") destroyedBy: string = ""; // Beyblade ID
  @type("number") collectionTime: number = 0;
}

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

  // Arena feature states
  @type({ map: LoopState }) loops = new MapSchema<LoopState>();
  @type({ map: ObstacleState }) obstacles = new MapSchema<ObstacleState>();
  @type({ map: PitState }) pits = new MapSchema<PitState>();
  @type({ map: LaserGunState }) laserGuns = new MapSchema<LaserGunState>();
  @type({ map: ProjectileState }) projectiles = new MapSchema<ProjectileState>();
  @type(WaterBodyState) waterBody = new WaterBodyState();
  @type({ map: PortalState }) portals = new MapSchema<PortalState>();
  @type({ map: GoalObjectState }) goalObjects = new MapSchema<GoalObjectState>();

  @type("string") status: string = "waiting"; // waiting, in-progress, finished
  @type("string") winner: string = ""; // userId of winner
  @type("number") timer: number = 180; // seconds
  @type("number") startTime: number = 0;

  // Match metadata
  @type("string") mode: string = "tryout"; // tryout, single-battle-ai, single-battle-pvp
  @type("string") matchId: string = "";
}
