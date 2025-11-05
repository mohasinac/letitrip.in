import Matter from "matter-js";
import { Beyblade } from "../rooms/schema/GameState";

/**
 * Physics Engine - Wraps Matter.js for server-authoritative physics
 */
export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private bodies: Map<string, Matter.Body> = new Map();

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
   * Create a beyblade physics body
   */
  createBeyblade(
    id: string,
    x: number,
    y: number,
    radius: number,
    mass: number
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

    return body;
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
   * Remove a beyblade body
   */
  removeBeyblade(id: string): void {
    const body = this.bodies.get(id);
    if (!body) return;

    Matter.World.remove(this.world, body);
    this.bodies.delete(id);
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
   * Clean up
   */
  destroy(): void {
    Matter.World.clear(this.world, false);
    Matter.Engine.clear(this.engine);
  }
}
