import { Room, Client } from "colyseus";
import { GameState, Beyblade } from "./schema/GameState";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import { loadBeyblade, loadArena } from "../utils/firebase";

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
    const arenaData = await loadArena(options.arenaId);
    if (arenaData) {
      this.state.arena.id = arenaData.id;
      this.state.arena.name = arenaData.name;
      this.state.arena.width = arenaData.width;
      this.state.arena.height = arenaData.height;
      this.state.arena.shape = arenaData.shape;
      this.state.arena.gravity = arenaData.gravity;
      this.state.arena.airResistance = arenaData.airResistance;
      this.state.arena.surfaceFriction = arenaData.surfaceFriction;
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
    const beybladeData = await loadBeyblade(options.beybladeId);
    
    // Create beyblade entity
    const beyblade = new Beyblade();
    beyblade.id = client.sessionId;
    beyblade.userId = options.userId;
    beyblade.username = options.username;
    beyblade.beybladeId = options.beybladeId;
    beyblade.isAI = false;

    // Set stats from database or use defaults
    if (beybladeData) {
      beyblade.mass = beybladeData.mass;
      beyblade.radius = beybladeData.radius;
      console.log(`✅ Loaded beyblade: ${beybladeData.displayName}`);
    } else {
      console.log(`⚠️ Beyblade not found: ${options.beybladeId}, using defaults`);
      beyblade.mass = 20;
      beyblade.radius = 40;
    }
    
    beyblade.health = 100;
    beyblade.stamina = 100;

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
   * Handle player input
   */
  private handleInput(client: Client, message: any) {
    const beyblade = this.state.beyblades.get(client.sessionId);
    if (!beyblade || !beyblade.isActive) return;

    // Apply force based on input direction
    const { direction } = message;
    if (direction && (direction.x !== 0 || direction.y !== 0)) {
      // Normalize direction
      const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
      const normalizedX = direction.x / magnitude;
      const normalizedY = direction.y / magnitude;

      // Apply force (scaled by mass)
      const forceMagnitude = 0.001 * beyblade.mass;
      this.physics.applyForce(
        beyblade.id,
        normalizedX * forceMagnitude,
        normalizedY * forceMagnitude
      );
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

          // Decrease stamina based on spin speed
          beyblade.stamina -= Math.abs(physicsState.angularVelocity) * 0.01;
          beyblade.stamina = Math.max(0, beyblade.stamina);

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
