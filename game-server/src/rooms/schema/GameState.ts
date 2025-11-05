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

  // Combat stats - Dynamic values
  @type("number") health: number = 100;
  @type("number") stamina: number = 100;
  @type("number") maxStamina: number = 100;

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

  // Water body state
  @type("boolean") inWater: boolean = false;

  // Pit state
  @type("boolean") inPit: boolean = false;
  @type("string") currentPitId: string = "";

  // Special move cooldown
  @type("number") specialCooldown: number = 0;
  @type("number") attackCooldown: number = 0;
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
  @type("number") gravity: number = 0;
  @type("number") airResistance: number = 0.01;
  @type("number") surfaceFriction: number = 0.1;
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
