import Matter from "matter-js";
import { Beyblade } from "../rooms/schema/GameState";
import type { 
  ArenaConfig, 
  LoopConfig, 
  ObstacleConfig, 
  WaterBodyConfig, 
  PitConfig,
  BeybladeStats,
  PointOfContact 
} from "../types/shared";

/**
 * Collision result with detailed information
 */
interface CollisionResult {
  beyblade1Id: string;
  beyblade2Id: string;
  contactPoint: { x: number; y: number };
  relativeVelocity: { x: number; y: number };
  impactForce: number;
  contactAngle1: number; // Angle on beyblade 1
  contactAngle2: number; // Angle on beyblade 2
}

/**
 * Physics Engine - Wraps Matter.js for server-authoritative physics
 * Enhanced with arena dynamics and beyblade-specific collision detection
 */
export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private bodies: Map<string, Matter.Body> = new Map();
  private beybladeStats: Map<string, BeybladeStats> = new Map();
  private arenaConfig: ArenaConfig | null = null;

  // Arena geometry
  private arenaCenterX: number = 0;
  private arenaCenterY: number = 0;
  private arenaRadius: number = 0;

  // Arena feature bodies
  private obstacles: Map<string, Matter.Body> = new Map();
  private walls: Matter.Body[] = [];

  // Physics constants
  private readonly TICK_RATE = 60; // 60 FPS
  private readonly DELTA_TIME = 1000 / this.TICK_RATE;

  constructor() {
    // Create Matter.js engine
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }, // No gravity for top-down view
    });
    this.world = this.engine.world;

    // Configure world settings
    this.world.bounds = {
      min: { x: -1000, y: -1000 },
      max: { x: 1000, y: 1000 },
    };
  }

  /**
   * Set arena configuration
   */
  setArenaConfig(config: ArenaConfig): void {
    this.arenaConfig = config;
    this.arenaCenterX = (config.width * 16) / 2; // Convert em to pixels
    this.arenaCenterY = (config.height * 16) / 2;
    this.arenaRadius = Math.min(config.width, config.height) * 16 * 0.45;
  }

  /**
   * Create a beyblade physics body with stats
   */
  createBeyblade(
    id: string,
    x: number,
    y: number,
    radius: number,
    mass: number,
    stats?: BeybladeStats
  ): Matter.Body {
    const body = Matter.Bodies.circle(x, y, radius, {
      mass: mass,
      restitution: 0.8, // Bounciness
      friction: 0.01,
      frictionAir: 0.01,
      label: id,
    });

    Matter.World.add(this.world, body);
    this.bodies.set(id, body);

    // Store beyblade stats for collision calculations
    if (stats) {
      this.beybladeStats.set(id, stats);
    }

    return body;
  }

  /**
   * Create arena obstacles
   */
  createObstacles(obstacles: ObstacleConfig[]): void {
    obstacles.forEach((obstacle, index) => {
      const x = obstacle.x * 16; // Convert em to pixels
      const y = obstacle.y * 16;
      const radius = obstacle.radius * 16;

      const body = Matter.Bodies.circle(x, y, radius, {
        isStatic: true,
        restitution: 0.9,
        friction: 0.1,
        label: `obstacle_${index}`,
      });

      Matter.World.add(this.world, body);
      this.obstacles.set(`obstacle_${index}`, body);
    });
  }

  /**
   * Create arena walls (circular boundary)
   */
  createCircularArena(centerX: number, centerY: number, radius: number): void {
    const segments = 32;
    const angleStep = (Math.PI * 2) / segments;
    const wallThickness = 20;

    for (let i = 0; i < segments; i++) {
      const angle = i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const wall = Matter.Bodies.rectangle(x, y, wallThickness, radius / 8, {
        isStatic: true,
        angle: angle + Math.PI / 2,
        restitution: 0.9,
        friction: 0.1,
      });

      Matter.World.add(this.world, wall);
    }
  }

  /**
   * Create rectangular arena walls
   */
  createRectangularArena(width: number, height: number): void {
    const wallThickness = 20;
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, {
        isStatic: true,
      }),
      // Bottom wall
      Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
        isStatic: true,
      }),
      // Left wall
      Matter.Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
      }),
      // Right wall
      Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
      }),
    ];

    Matter.World.add(this.world, walls);
  }

  /**
   * Apply force to a beyblade
   */
  applyForce(id: string, forceX: number, forceY: number): void {
    const body = this.bodies.get(id);
    if (!body) return;

    Matter.Body.applyForce(body, body.position, {
      x: forceX,
      y: forceY,
    });
  }

  /**
   * Set angular velocity (spin speed)
   */
  setAngularVelocity(id: string, velocity: number): void {
    const body = this.bodies.get(id);
    if (!body) return;

    Matter.Body.setAngularVelocity(body, velocity);
  }

  /**
   * Update physics simulation (call every tick)
   */
  update(): void {
    Matter.Engine.update(this.engine, this.DELTA_TIME);
  }

  /**
   * Get body position and velocity
   */
  getBodyState(id: string): {
    x: number;
    y: number;
    rotation: number;
    velocityX: number;
    velocityY: number;
    angularVelocity: number;
  } | null {
    const body = this.bodies.get(id);
    if (!body) return null;

    return {
      x: body.position.x,
      y: body.position.y,
      rotation: body.angle,
      velocityX: body.velocity.x,
      velocityY: body.velocity.y,
      angularVelocity: body.angularVelocity,
    };
  }

  /**
   * Check collision between two bodies
   */
  checkCollision(id1: string, id2: string): boolean {
    const body1 = this.bodies.get(id1);
    const body2 = this.bodies.get(id2);

    if (!body1 || !body2) return false;

    return Matter.Collision.collides(body1, body2) !== null;
  }

  /**
   * Check beyblade-to-beyblade collision with detailed physics
   */
  checkBeybladeCollision(id1: string, id2: string): CollisionResult | null {
    const body1 = this.bodies.get(id1);
    const body2 = this.bodies.get(id2);
    const stats1 = this.beybladeStats.get(id1);
    const stats2 = this.beybladeStats.get(id2);

    if (!body1 || !body2) return null;

    const collision = Matter.Collision.collides(body1, body2);
    if (!collision) return null;

    // Calculate collision details
    const contactPoint = collision.supports[0] || body1.position;
    
    // Relative velocity
    const relVelX = body1.velocity.x - body2.velocity.x;
    const relVelY = body1.velocity.y - body2.velocity.y;
    const relativeSpeed = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

    // Impact force based on mass and velocity
    const totalMass = body1.mass + body2.mass;
    const impactForce = relativeSpeed * totalMass;

    // Calculate contact angles on each beyblade
    const dx1 = contactPoint.x - body1.position.x;
    const dy1 = contactPoint.y - body1.position.y;
    const contactAngle1 = Math.atan2(dy1, dx1) - body1.angle;

    const dx2 = contactPoint.x - body2.position.x;
    const dy2 = contactPoint.y - body2.position.y;
    const contactAngle2 = Math.atan2(dy2, dx2) - body2.angle;

    return {
      beyblade1Id: id1,
      beyblade2Id: id2,
      contactPoint: { x: contactPoint.x, y: contactPoint.y },
      relativeVelocity: { x: relVelX, y: relVelY },
      impactForce,
      contactAngle1: this.normalizeAngle(contactAngle1),
      contactAngle2: this.normalizeAngle(contactAngle2),
    };
  }

  /**
   * Calculate damage from collision considering points of contact
   */
  calculateCollisionDamage(
    collision: CollisionResult,
    beyblade1: Beyblade,
    beyblade2: Beyblade
  ): { damage1: number; damage2: number; spinSteal1: number; spinSteal2: number } {
    const stats1 = this.beybladeStats.get(beyblade1.id);
    const stats2 = this.beybladeStats.get(beyblade2.id);

    // Base damage from impact force
    let baseDamage1 = collision.impactForce * 0.5;
    let baseDamage2 = collision.impactForce * 0.5;

    // Apply contact point multipliers
    if (stats1) {
      const contactMultiplier1 = this.getContactPointMultiplier(
        stats1.pointsOfContact,
        collision.contactAngle1
      );
      baseDamage2 *= contactMultiplier1 * beyblade1.damageMultiplier;
    }

    if (stats2) {
      const contactMultiplier2 = this.getContactPointMultiplier(
        stats2.pointsOfContact,
        collision.contactAngle2
      );
      baseDamage1 *= contactMultiplier2 * beyblade2.damageMultiplier;
    }

    // Apply defense multipliers
    baseDamage1 *= beyblade1.damageTaken;
    baseDamage2 *= beyblade2.damageTaken;

    // Check invulnerability
    if (beyblade1.isInvulnerable || Math.random() < beyblade1.invulnerabilityChance) {
      baseDamage1 = 0;
    }
    if (beyblade2.isInvulnerable || Math.random() < beyblade2.invulnerabilityChance) {
      baseDamage2 = 0;
    }

    // Calculate spin steal based on spin direction
    let spinSteal1 = 0;
    let spinSteal2 = 0;

    const oppositeSpin = beyblade1.spinDirection !== beyblade2.spinDirection;
    
    if (oppositeSpin) {
      // Opposite spin: more spin steal
      spinSteal1 = baseDamage2 * beyblade1.spinStealFactor * 1.5;
      spinSteal2 = baseDamage1 * beyblade2.spinStealFactor * 1.5;
    } else {
      // Same spin: less spin steal
      spinSteal1 = baseDamage2 * beyblade1.spinStealFactor * 0.5;
      spinSteal2 = baseDamage1 * beyblade2.spinStealFactor * 0.5;
    }

    return {
      damage1: baseDamage1,
      damage2: baseDamage2,
      spinSteal1,
      spinSteal2,
    };
  }

  /**
   * Get damage multiplier from point of contact
   */
  private getContactPointMultiplier(
    pointsOfContact: PointOfContact[],
    angle: number
  ): number {
    let maxMultiplier = 1.0;

    for (const point of pointsOfContact) {
      const pointAngle = (point.angle * Math.PI) / 180;
      const halfWidth = (point.width * Math.PI) / 360;

      // Check if angle is within this contact point's range
      const angleDiff = Math.abs(this.normalizeAngle(angle - pointAngle));
      
      if (angleDiff <= halfWidth) {
        maxMultiplier = Math.max(maxMultiplier, point.damageMultiplier);
      }
    }

    return maxMultiplier;
  }

  /**
   * Normalize angle to -PI to PI range
   */
  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  /**
   * Check if beyblade is in a loop
   */
  checkLoopCollision(
    beybladeId: string,
    loops: LoopConfig[]
  ): { inLoop: boolean; loopIndex: number; loopConfig: LoopConfig | null } {
    const body = this.bodies.get(beybladeId);
    if (!body || !this.arenaConfig) {
      return { inLoop: false, loopIndex: -1, loopConfig: null };
    }

    // Check each loop
    for (let i = 0; i < loops.length; i++) {
      const loop = loops[i];
      const loopRadiusPx = loop.radius * 16;

      const dx = body.position.x - this.arenaCenterX;
      const dy = body.position.y - this.arenaCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if beyblade is within loop radius (with some tolerance)
      const tolerance = 20; // pixels
      if (Math.abs(distance - loopRadiusPx) < tolerance) {
        return { inLoop: true, loopIndex: i, loopConfig: loop };
      }
    }

    return { inLoop: false, loopIndex: -1, loopConfig: null };
  }

  /**
   * Check if beyblade is in water body
   */
  checkWaterCollision(
    beybladeId: string,
    waterBody?: WaterBodyConfig
  ): boolean {
    if (!waterBody || !waterBody.enabled) return false;

    const body = this.bodies.get(beybladeId);
    if (!body) return false;

    if (waterBody.type === "center") {
      // Check if in center area
      const radius = (waterBody.radius || 5) * 16;
      const dx = body.position.x - this.arenaCenterX;
      const dy = body.position.y - this.arenaCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance < radius;
    }

    // TODO: Add checks for loop and ring water types

    return false;
  }

  /**
   * Check if beyblade is in a pit
   */
  checkPitCollision(beybladeId: string, pits: PitConfig[]): PitConfig | null {
    const body = this.bodies.get(beybladeId);
    if (!body) return null;

    for (const pit of pits) {
      const pitX = pit.x * 16;
      const pitY = pit.y * 16;
      const pitRadius = pit.radius * 16;

      const dx = body.position.x - pitX;
      const dy = body.position.y - pitY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < pitRadius) {
        return pit;
      }
    }

    return null;
  }

  /**
   * Check collision with obstacles
   */
  checkObstacleCollision(beybladeId: string): {
    colliding: boolean;
    obstacleId: string | null;
    damage: number;
  } {
    const body = this.bodies.get(beybladeId);
    if (!body) {
      return { colliding: false, obstacleId: null, damage: 0 };
    }

    for (const [id, obstacle] of this.obstacles) {
      const collision = Matter.SAT.collides(body, obstacle);

      if (collision.collided) {
        // Calculate damage based on relative velocity and obstacle properties
        const relVelX = body.velocity.x - obstacle.velocity.x;
        const relVelY = body.velocity.y - obstacle.velocity.y;
        const relativeSpeed = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

        // Base damage factor
        let damage = relativeSpeed * 0.5;

        // Increase damage if obstacle is a wall
        if (obstacle.label.startsWith("wall")) {
          damage *= 1.5;
        }

        return { colliding: true, obstacleId: id, damage };
      }
    }

    return { colliding: false, obstacleId: null, damage: 0 };
  }

  /**
   * Apply loop speed boost
   */
  applyLoopBoost(beybladeId: string, speedBoost: number): void {
    const body = this.bodies.get(beybladeId);
    if (!body) return;

    // Scale current velocity by boost factor
    Matter.Body.setVelocity(body, {
      x: body.velocity.x * speedBoost,
      y: body.velocity.y * speedBoost,
    });
  }

  /**
   * Apply water resistance
   */
  applyWaterResistance(beybladeId: string, speedMultiplier: number): void {
    const body = this.bodies.get(beybladeId);
    if (!body) return;

    // Reduce velocity
    Matter.Body.setVelocity(body, {
      x: body.velocity.x * speedMultiplier,
      y: body.velocity.y * speedMultiplier,
    });
  }

  /**
   * Apply friction from arena surface
   */
  applySurfaceFriction(beybladeId: string, frictionMultiplier: number): void {
    const body = this.bodies.get(beybladeId);
    if (!body || !this.arenaConfig) return;

    const baseFriction = this.arenaConfig.surfaceFriction || 0.01;
    const newFriction = baseFriction * frictionMultiplier;

    Matter.Body.set(body, { friction: newFriction });
  }

  /**
   * Get all beyblades for collision detection
   */
  getAllBeybladeIds(): string[] {
    return Array.from(this.bodies.keys());
  }

  /**
   * Remove a beyblade body
   */
  removeBeyblade(id: string): void {
    const body = this.bodies.get(id);
    if (!body) return;

    Matter.World.remove(this.world, body);
    this.bodies.delete(id);
    this.beybladeStats.delete(id);
  }

  /**
   * Check if beyblade is out of bounds (ring out)
   */
  isOutOfBounds(id: string, arenaRadius: number, centerX: number, centerY: number): boolean {
    const body = this.bodies.get(id);
    if (!body) return false;

    const dx = body.position.x - centerX;
    const dy = body.position.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance > arenaRadius;
  }

  /**
   * Apply knockback from collision
   */
  applyKnockback(
    beybladeId: string,
    direction: { x: number; y: number },
    force: number
  ): void {
    const body = this.bodies.get(beybladeId);
    if (!body) return;

    const magnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
    if (magnitude === 0) return;

    const normalizedX = direction.x / magnitude;
    const normalizedY = direction.y / magnitude;

    Matter.Body.applyForce(body, body.position, {
      x: normalizedX * force * 0.01,
      y: normalizedY * force * 0.01,
    });
  }

  /**
   * Clean up
   */
  destroy(): void {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
    this.bodies.clear();
    this.beybladeStats.clear();
    this.obstacles.clear();
  }
}