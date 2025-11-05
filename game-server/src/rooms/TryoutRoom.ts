import { Room, Client } from "colyseus";
import { 
  GameState, 
  Beyblade, 
  LoopState, 
  ObstacleState, 
  PitState, 
  LaserGunState,
  ProjectileState 
} from "./schema/GameState";
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
      this.state.arena.theme = arenaData.theme;
      this.state.arena.rotation = arenaData.rotation || 0;
      this.state.arena.gravity = arenaData.gravity || 0;
      this.state.arena.airResistance = arenaData.airResistance || 0.01;
      this.state.arena.surfaceFriction = arenaData.surfaceFriction || 0.01;

      // Wall configuration
      this.state.arena.wallEnabled = arenaData.wall.enabled;
      this.state.arena.wallBaseDamage = arenaData.wall.baseDamage;
      this.state.arena.wallRecoilDistance = arenaData.wall.recoilDistance;
      this.state.arena.wallHasSpikes = arenaData.wall.hasSpikes;
      this.state.arena.wallSpikeDamageMultiplier = arenaData.wall.spikeDamageMultiplier;
      this.state.arena.wallHasSprings = arenaData.wall.hasSprings;
      this.state.arena.wallSpringRecoilMultiplier = arenaData.wall.springRecoilMultiplier;

      // Feature counts
      this.state.arena.loopCount = arenaData.loops.length;
      this.state.arena.exitCount = arenaData.exits.length;
      this.state.arena.obstacleCount = arenaData.obstacles.length;
      this.state.arena.pitCount = arenaData.pits.length;
      this.state.arena.laserGunCount = arenaData.laserGuns.length;
      this.state.arena.hasWaterBody = !!arenaData.waterBody?.enabled;

      console.log(`✅ Loaded arena: ${arenaData.name}`);
    } else {
      // Use default arena if not found
      console.log(`⚠️ Arena not found: ${options.arenaId}, using defaults`);
      this.state.arena.id = options.arenaId || "default";
      this.state.arena.name = "Standard Arena";
      this.state.arena.width = 50;
      this.state.arena.height = 50;
      this.state.arena.shape = "circle";
      this.state.arena.theme = "metrocity";
      this.state.arena.gravity = 0;
      this.state.arena.airResistance = 0.01;
      this.state.arena.surfaceFriction = 0.01;
      this.state.arena.wallEnabled = true;
      this.state.arena.wallBaseDamage = 5;
      this.state.arena.wallRecoilDistance = 2;
    }

    // Initialize physics engine
    this.physics = new PhysicsEngine();

    // Set arena configuration for physics engine
    if (arenaData) {
      this.physics.setArenaConfig(arenaData);

      // Create obstacles
      if (arenaData.obstacles.length > 0) {
        this.physics.createObstacles(arenaData.obstacles);
      }
    }

    // Create arena boundaries
    if (this.state.arena.shape === "circle") {
      const radius = Math.min(this.state.arena.width, this.state.arena.height) * 16 / 2;
      this.physics.createCircularArena(
        (this.state.arena.width * 16) / 2,
        (this.state.arena.height * 16) / 2,
        radius
      );
    } else {
      this.physics.createRectangularArena(
        this.state.arena.width * 16, 
        this.state.arena.height * 16
      );
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
      
      // Convert radius from cm to pixels using resolution system
      const PIXELS_PER_CM = 24; // 1080 / 45
      beyblade.actualSize = beybladeData.radius * PIXELS_PER_CM;
      
      // Calculate stats from type distribution
      const attackPoints = beybladeData.typeDistribution.attack;
      const defensePoints = beybladeData.typeDistribution.defense;
      const staminaPoints = beybladeData.typeDistribution.stamina;

      // Store type distribution
      beyblade.attackPoints = attackPoints;
      beyblade.defensePoints = defensePoints;
      beyblade.staminaPoints = staminaPoints;

      // Calculate attack stats (multiplicative: base * (1 + points * 0.01))
      beyblade.damageMultiplier = 1 + attackPoints * 0.01;
      beyblade.speedBonus = 1 + attackPoints * 0.01;

      // Calculate defense stats
      beyblade.damageTaken = 1 - defensePoints * 0.00333; // Lower is better
      beyblade.knockbackDistance = 10 * (1 - defensePoints * 0.00167);
      beyblade.invulnerabilityChance = 0.1 * (1 + defensePoints * 0.00667);

      // Calculate stamina stats
      beyblade.maxStamina = Math.ceil(1000 * (1 + staminaPoints * 0.01333));
      beyblade.stamina = beyblade.maxStamina;
      beyblade.spinStealFactor = 0.1 * (1 + staminaPoints * 0.02667);
      beyblade.spinDecayRate = 10 * (1 - staminaPoints * 0.00167);

      // Spin capacity (calculate from stamina)
      beyblade.maxSpin = Math.ceil(2000 * (1 + staminaPoints * 0.01));
      beyblade.spin = beyblade.maxSpin;
      
      console.log(`✅ Loaded beyblade: ${beybladeData.displayName}`);
      console.log(`   Stats - ATK: ${attackPoints}, DEF: ${defensePoints}, STA: ${staminaPoints}`);
      console.log(`   Multipliers - DMG: ${beyblade.damageMultiplier.toFixed(2)}x, DEF: ${(1/beyblade.damageTaken).toFixed(2)}x`);
    } else {
      console.log(`⚠️ Beyblade not found: ${options.beybladeId}, using defaults`);
      beyblade.type = "balanced";
      beyblade.spinDirection = "right";
      beyblade.mass = 50;
      beyblade.radius = 4; // 4cm standard
      beyblade.actualSize = 96; // 4cm * 24 pixels/cm
      beyblade.attackPoints = 120;
      beyblade.defensePoints = 120;
      beyblade.staminaPoints = 120;
      beyblade.damageMultiplier = 2.2; // 1 + 120 * 0.01
      beyblade.damageTaken = 0.6; // 1 - 120 * 0.00333
      beyblade.knockbackDistance = 8; // 10 * (1 - 120 * 0.00167)
      beyblade.invulnerabilityChance = 0.18; // 0.1 * (1 + 120 * 0.00667)
      beyblade.spinStealFactor = 0.42; // 0.1 * (1 + 120 * 0.02667)
      beyblade.spinDecayRate = 8; // 10 * (1 - 120 * 0.00167)
      beyblade.maxStamina = 1600;
      beyblade.stamina = 1600;
      beyblade.maxSpin = 2000;
      beyblade.spin = 2000;
    }
    
    beyblade.health = 100;

    // Spawn position (center of arena - convert em to pixels)
    beyblade.x = (this.state.arena.width * 16) / 2;
    beyblade.y = (this.state.arena.height * 16) / 2;

    // Create physics body with stats
    this.physics.createBeyblade(
      beyblade.id,
      beyblade.x,
      beyblade.y,
      beyblade.radius, // in cm
      beyblade.mass,
      beybladeData || undefined
    );

    // Give initial spin based on spin direction
    const initialAngularVelocity = beyblade.spinDirection === "left" ? -10 : 10;
    this.physics.setAngularVelocity(beyblade.id, initialAngularVelocity);

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
    this.updateInterval = setInterval(async () => {
      if (this.state.status !== "in-progress") return;

      // Update physics
      this.physics.update();

      // Load arena config for collision checks
      const arenaData: ArenaConfig | null = await loadArena(this.state.arena.id);

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

          // Arena dynamics checks
          if (arenaData) {
            // Check loop collision
            const loopCheck = this.physics.checkLoopCollision(beyblade.id, arenaData.loops);
            if (loopCheck.inLoop && loopCheck.loopConfig) {
              if (!beyblade.inLoop) {
                beyblade.inLoop = true;
                beyblade.loopIndex = loopCheck.loopIndex;
                beyblade.loopEntryTime = Date.now();
                beyblade.loopSpeedBoost = loopCheck.loopConfig.speedBoost;
                beyblade.loopSpinBoost = loopCheck.loopConfig.spinBoost || 0;
                
                // Apply speed boost
                this.physics.applyLoopBoost(beyblade.id, loopCheck.loopConfig.speedBoost);
              }
              
              // Apply continuous spin recovery
              if (beyblade.loopSpinBoost > 0) {
                beyblade.spin = Math.min(
                  beyblade.maxSpin,
                  beyblade.spin + beyblade.loopSpinBoost * (this.UPDATE_INTERVAL / 1000)
                );
              }
            } else if (beyblade.inLoop) {
              // Exit loop
              beyblade.inLoop = false;
              beyblade.loopIndex = -1;
              beyblade.loopSpeedBoost = 1.0;
              beyblade.loopSpinBoost = 0;
            }

            // Check water collision
            const inWater = this.physics.checkWaterCollision(beyblade.id, arenaData.waterBody);
            if (inWater) {
              if (!beyblade.inWater) {
                beyblade.inWater = true;
                const waterConfig = arenaData.waterBody!;
                beyblade.waterSpeedMultiplier = waterConfig.speedMultiplier;
                beyblade.waterSpinDrain = waterConfig.spinDrainRate;
              }
              
              // Apply water effects
              this.physics.applyWaterResistance(beyblade.id, beyblade.waterSpeedMultiplier);
              beyblade.spin -= beyblade.waterSpinDrain * (this.UPDATE_INTERVAL / 1000);
            } else if (beyblade.inWater) {
              beyblade.inWater = false;
              beyblade.waterSpeedMultiplier = 1.0;
              beyblade.waterSpinDrain = 0;
            }

            // Check pit collision
            const pitCheck = this.physics.checkPitCollision(beyblade.id, arenaData.pits);
            if (pitCheck) {
              if (!beyblade.inPit) {
                beyblade.inPit = true;
                beyblade.currentPitId = `pit_${arenaData.pits.indexOf(pitCheck)}`;
                beyblade.pitDamageRate = pitCheck.damagePerSecond;
              }
              
              // Apply pit damage
              beyblade.spin -= beyblade.pitDamageRate * beyblade.spin * (this.UPDATE_INTERVAL / 1000) / 100;
              
              // Check escape chance
              if (Math.random() < pitCheck.escapeChance * (this.UPDATE_INTERVAL / 1000)) {
                beyblade.inPit = false;
                beyblade.currentPitId = "";
                beyblade.pitDamageRate = 0;
                // Apply escape force
                this.physics.applyForce(beyblade.id, 0, -0.05 * beyblade.mass);
              }
            } else if (beyblade.inPit) {
              beyblade.inPit = false;
              beyblade.currentPitId = "";
              beyblade.pitDamageRate = 0;
            }

            // Check obstacle collision
            const obstacleCheck = this.physics.checkObstacleCollision(beyblade.id);
            if (obstacleCheck.colliding) {
              if (!beyblade.collidingWithObstacle || beyblade.lastObstacleId !== obstacleCheck.obstacleId) {
                beyblade.collidingWithObstacle = true;
                beyblade.lastObstacleId = obstacleCheck.obstacleId || "";
                
                // Apply obstacle damage
                beyblade.health -= obstacleCheck.damage;
                beyblade.damageReceived += obstacleCheck.damage;
                
                // Apply recoil based on knockback distance
                const recoilDirection = {
                  x: beyblade.velocityX,
                  y: beyblade.velocityY
                };
                this.physics.applyKnockback(
                  beyblade.id,
                  recoilDirection,
                  beyblade.knockbackDistance
                );
                
                this.broadcast("obstacle-collision", {
                  playerId: beyblade.id,
                  damage: obstacleCheck.damage,
                });
              }
            } else {
              beyblade.collidingWithObstacle = false;
              beyblade.lastObstacleId = "";
            }

            // Check wall collision (boundary check)
            if (arenaData.wall.enabled) {
              const dx = beyblade.x - (this.state.arena.width * 16) / 2;
              const dy = beyblade.y - (this.state.arena.height * 16) / 2;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const arenaRadius = Math.min(this.state.arena.width, this.state.arena.height) * 16 * 0.45;

              if (distance > arenaRadius * 0.95) { // Near wall
                let wallDamage = arenaData.wall.baseDamage;
                if (arenaData.wall.hasSpikes) {
                  wallDamage *= arenaData.wall.spikeDamageMultiplier;
                }
                
                beyblade.health -= wallDamage;
                beyblade.damageReceived += wallDamage;
                
                // Apply wall recoil (bounce back)
                const recoilDirection = { x: -dx, y: -dy };
                let recoilForce = arenaData.wall.recoilDistance;
                if (arenaData.wall.hasSprings) {
                  recoilForce *= arenaData.wall.springRecoilMultiplier;
                }
                
                this.physics.applyKnockback(
                  beyblade.id,
                  recoilDirection,
                  recoilForce * beyblade.knockbackDistance
                );
                
                this.broadcast("wall-collision", {
                  playerId: beyblade.id,
                  damage: wallDamage,
                });
              }
            }
          }

          // Decrease spin based on decay rate
          beyblade.spin -= beyblade.spinDecayRate * (this.UPDATE_INTERVAL / 1000);
          beyblade.spin = Math.max(0, beyblade.spin);
          
          // Decrease stamina based on spin speed
          beyblade.stamina -= Math.abs(physicsState.angularVelocity) * 0.01;
          beyblade.stamina = Math.max(0, beyblade.stamina);

          // Check if beyblade stopped spinning
          if (beyblade.spin <= 0 && beyblade.isActive) {
            beyblade.isActive = false;
            beyblade.health = 0;
            this.broadcast("spin-out", { playerId: beyblade.id });
          }

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

          // Update special move state
          if (beyblade.specialMoveActive && Date.now() > beyblade.specialMoveEndTime) {
            beyblade.specialMoveActive = false;
          }

          // Check ring out
          if (this.state.arena.shape === "circle") {
            const radius = Math.min(this.state.arena.width, this.state.arena.height) * 16 / 2;
            const isOut = this.physics.isOutOfBounds(
              beyblade.id,
              radius,
              (this.state.arena.width * 16) / 2,
              (this.state.arena.height * 16) / 2
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
