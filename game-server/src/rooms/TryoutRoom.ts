import { Room, Client } from "colyseus";
import { GameState, Beyblade } from "./schema/GameState";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import { loadBeyblade, loadArena } from "../utils/firebase";
import type { BeybladeStats, ArenaConfig } from "../types/shared";

/**
 * Player Input Interface
 */
interface PlayerInput {
  // Movement
  moveLeft?: boolean;
  moveRight?: boolean;
  
  // Actions
  attack?: boolean;
  specialMove?: boolean;
  
  // Legacy direction input (for backward compatibility)
  direction?: {
    x: number;
    y: number;
  };
}

/**
 * Tryout Room - Solo practice mode
 * No opponent, just player practicing
 */
export class TryoutRoom extends Room<GameState> {
  private physics!: PhysicsEngine;
  private updateInterval!: NodeJS.Timeout;
  private readonly TICK_RATE = 60; // 60 FPS
  private readonly UPDATE_INTERVAL = 1000 / this.TICK_RATE;

  maxClients = 1; // Only one player

  async onCreate(options: any) {
    console.log("TryoutRoom created", options);

    this.setState(new GameState());
    this.state.mode = "tryout";
    this.state.status = "waiting";

    // Load arena from Firestore or use defaults
    const arenaData: ArenaConfig | null = await loadArena(options.arenaId);
    if (arenaData) {
      this.state.arena.id = arenaData.id || options.arenaId;
      this.state.arena.name = arenaData.name;
      this.state.arena.width = arenaData.width;
      this.state.arena.height = arenaData.height;
      this.state.arena.shape = arenaData.shape;
      this.state.arena.gravity = arenaData.gravity || 0;
      this.state.arena.airResistance = arenaData.airResistance || 0.01;
      this.state.arena.surfaceFriction = arenaData.surfaceFriction || 0.01;
      console.log(`✅ Loaded arena: ${arenaData.name}`);
    } else {
      // Use default arena if not found
      console.log(`⚠️ Arena not found: ${options.arenaId}, using defaults`);
      this.state.arena.id = options.arenaId || "default";
      this.state.arena.name = "Standard Arena";
      this.state.arena.width = 800;
      this.state.arena.height = 800;
      this.state.arena.shape = "circle";
      this.state.arena.gravity = 0;
      this.state.arena.airResistance = 0.01;
      this.state.arena.surfaceFriction = 0.01;
    }

    // Initialize physics engine
    this.physics = new PhysicsEngine();

    // Create arena boundaries
    if (this.state.arena.shape === "circle") {
      const radius = Math.min(this.state.arena.width, this.state.arena.height) / 2;
      this.physics.createCircularArena(
        this.state.arena.width / 2,
        this.state.arena.height / 2,
        radius
      );
    } else {
      this.physics.createRectangularArena(this.state.arena.width, this.state.arena.height);
    }

    // Set up message handlers
    this.onMessage("input", (client, message) => {
      this.handleInput(client, message);
    });

    this.onMessage("action", (client, message) => {
      this.handleAction(client, message);
    });

    // Start game loop
    this.startGameLoop();
  }

  async onJoin(client: Client, options: any) {
    console.log(`Client ${client.sessionId} joined tryout room`);

    // Load beyblade from Firestore or use defaults
    const beybladeData: BeybladeStats | null = await loadBeyblade(options.beybladeId);
    
    // Create beyblade entity
    const beyblade = new Beyblade();
    beyblade.id = client.sessionId;
    beyblade.userId = options.userId;
    beyblade.username = options.username;
    beyblade.beybladeId = options.beybladeId;
    beyblade.isAI = false;

    // Set stats from database or use defaults
    if (beybladeData) {
      beyblade.type = beybladeData.type;
      beyblade.spinDirection = beybladeData.spinDirection;
      beyblade.mass = beybladeData.mass;
      beyblade.radius = beybladeData.radius;
      
      // Calculate max stamina from type distribution
      const staminaPoints = beybladeData.typeDistribution.stamina;
      beyblade.maxStamina = Math.ceil(1000 * (1 + staminaPoints * 0.01333));
      beyblade.stamina = beyblade.maxStamina;
      
      console.log(`✅ Loaded beyblade: ${beybladeData.displayName}`);
    } else {
      console.log(`⚠️ Beyblade not found: ${options.beybladeId}, using defaults`);
      beyblade.type = "balanced";
      beyblade.spinDirection = "right";
      beyblade.mass = 20;
      beyblade.radius = 40;
      beyblade.maxStamina = 1000;
      beyblade.stamina = 1000;
    }
    
    beyblade.health = 100;

    // Spawn position (center of arena)
    beyblade.x = this.state.arena.width / 2;
    beyblade.y = this.state.arena.height / 2;

    // Create physics body
    this.physics.createBeyblade(
      beyblade.id,
      beyblade.x,
      beyblade.y,
      beyblade.radius,
      beyblade.mass
    );

    // Give initial spin
    this.physics.setAngularVelocity(beyblade.id, 10);

    // Add to state
    this.state.beyblades.set(client.sessionId, beyblade);

    // Start game
    this.state.status = "in-progress";
    this.state.startTime = Date.now();
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`Client ${client.sessionId} left tryout room`);

    // Remove beyblade
    this.physics.removeBeyblade(client.sessionId);
    this.state.beyblades.delete(client.sessionId);

    // If no players left, dispose room
    if (this.state.beyblades.size === 0) {
      this.disconnect();
    }
  }

  onDispose() {
    console.log("TryoutRoom disposed");
    clearInterval(this.updateInterval);
    this.physics.destroy();
  }

  /**
   * Handle player input - NEW CONTROLS
   */
  private handleInput(client: Client, message: PlayerInput) {
    const beyblade = this.state.beyblades.get(client.sessionId);
    if (!beyblade || !beyblade.isActive) return;

    const forceMagnitude = 0.001 * beyblade.mass;

    // Move Left - Strafe left (perpendicular to current direction)
    if (message.moveLeft) {
      const perpX = -Math.sin(beyblade.rotation);
      const perpY = Math.cos(beyblade.rotation);
      this.physics.applyForce(
        beyblade.id,
        perpX * forceMagnitude * 1.5,
        perpY * forceMagnitude * 1.5
      );
    }

    // Move Right - Strafe right (perpendicular to current direction)
    if (message.moveRight) {
      const perpX = Math.sin(beyblade.rotation);
      const perpY = -Math.cos(beyblade.rotation);
      this.physics.applyForce(
        beyblade.id,
        perpX * forceMagnitude * 1.5,
        perpY * forceMagnitude * 1.5
      );
    }

    // Attack - Quick burst forward
    if (message.attack && beyblade.attackCooldown <= 0) {
      const forwardX = Math.cos(beyblade.rotation);
      const forwardY = Math.sin(beyblade.rotation);
      this.physics.applyForce(
        beyblade.id,
        forwardX * forceMagnitude * 3,
        forwardY * forceMagnitude * 3
      );
      beyblade.attackCooldown = 0.5; // 0.5 second cooldown
      this.broadcast("attack", { playerId: client.sessionId });
    }

    // Special Move - Type-specific ability
    if (message.specialMove && beyblade.specialCooldown <= 0) {
      this.handleSpecialMove(beyblade);
      beyblade.specialCooldown = 3; // 3 second cooldown
    }

    // Legacy direction input (for backward compatibility)
    if (message.direction && (message.direction.x !== 0 || message.direction.y !== 0)) {
      const magnitude = Math.sqrt(message.direction.x ** 2 + message.direction.y ** 2);
      const normalizedX = message.direction.x / magnitude;
      const normalizedY = message.direction.y / magnitude;

      this.physics.applyForce(
        beyblade.id,
        normalizedX * forceMagnitude,
        normalizedY * forceMagnitude
      );
    }
  }

  /**
   * Handle type-specific special moves
   */
  private handleSpecialMove(beyblade: Beyblade) {
    switch (beyblade.type) {
      case "attack":
        // Attack: Spin boost + damage aura
        const currentState = this.physics.getBodyState(beyblade.id);
        if (currentState) {
          this.physics.setAngularVelocity(beyblade.id, currentState.angularVelocity * 2);
        }
        this.broadcast("special-move", {
          playerId: beyblade.id,
          type: "attack-boost",
        });
        break;

      case "defense":
        // Defense: Temporary invulnerability
        beyblade.isInvulnerable = true;
        beyblade.invulnerabilityTimer = 1.5;
        this.broadcast("special-move", {
          playerId: beyblade.id,
          type: "defense-shield",
        });
        break;

      case "stamina":
        // Stamina: Recover stamina
        beyblade.stamina = Math.min(beyblade.maxStamina, beyblade.stamina + beyblade.maxStamina * 0.3);
        this.broadcast("special-move", {
          playerId: beyblade.id,
          type: "stamina-recovery",
        });
        break;

      case "balanced":
        // Balanced: All stats boost
        const balancedState = this.physics.getBodyState(beyblade.id);
        if (balancedState) {
          this.physics.setAngularVelocity(beyblade.id, balancedState.angularVelocity * 1.5);
        }
        beyblade.stamina = Math.min(beyblade.maxStamina, beyblade.stamina + beyblade.maxStamina * 0.15);
        this.broadcast("special-move", {
          playerId: beyblade.id,
          type: "balanced-boost",
        });
        break;
    }
  }

  /**
   * Handle special actions
   */
  private handleAction(client: Client, message: any) {
    const beyblade = this.state.beyblades.get(client.sessionId);
    if (!beyblade || !beyblade.isActive) return;

    const { type } = message;

    switch (type) {
      case "charge":
        // Boost spin speed
        const currentState = this.physics.getBodyState(beyblade.id);
        if (currentState) {
          this.physics.setAngularVelocity(beyblade.id, currentState.angularVelocity * 1.5);
        }
        break;

      case "dash":
        // Quick forward dash
        const dashForce = 0.01 * beyblade.mass;
        this.physics.applyForce(beyblade.id, dashForce, 0);
        break;

      case "special":
        // Special move (placeholder)
        this.broadcast("special-move", { playerId: client.sessionId });
        break;
    }
  }

  /**
   * Game loop - runs at 60 FPS
   */
  private startGameLoop() {
    this.updateInterval = setInterval(() => {
      if (this.state.status !== "in-progress") return;

      // Update physics
      this.physics.update();

      // Sync physics to game state
      this.state.beyblades.forEach((beyblade) => {
        const physicsState = this.physics.getBodyState(beyblade.id);
        if (physicsState) {
          beyblade.x = physicsState.x;
          beyblade.y = physicsState.y;
          beyblade.rotation = physicsState.rotation;
          beyblade.velocityX = physicsState.velocityX;
          beyblade.velocityY = physicsState.velocityY;
          beyblade.angularVelocity = physicsState.angularVelocity;

          // Decrease stamina based on spin speed (spin decay)
          beyblade.stamina -= Math.abs(physicsState.angularVelocity) * 0.01;
          beyblade.stamina = Math.max(0, beyblade.stamina);

          // Update cooldowns
          if (beyblade.attackCooldown > 0) {
            beyblade.attackCooldown -= this.UPDATE_INTERVAL / 1000;
          }
          if (beyblade.specialCooldown > 0) {
            beyblade.specialCooldown -= this.UPDATE_INTERVAL / 1000;
          }

          // Update invulnerability
          if (beyblade.isInvulnerable) {
            beyblade.invulnerabilityTimer -= this.UPDATE_INTERVAL / 1000;
            if (beyblade.invulnerabilityTimer <= 0) {
              beyblade.isInvulnerable = false;
            }
          }

          // Check ring out
          if (this.state.arena.shape === "circle") {
            const radius = Math.min(this.state.arena.width, this.state.arena.height) / 2;
            const isOut = this.physics.isOutOfBounds(
              beyblade.id,
              radius,
              this.state.arena.width / 2,
              this.state.arena.height / 2
            );

            if (isOut && !beyblade.isRingOut) {
              beyblade.isRingOut = true;
              beyblade.isActive = false;
              this.broadcast("ring-out", { playerId: beyblade.id });
            }
          }
        }
      });
    }, this.UPDATE_INTERVAL);
  }
}
