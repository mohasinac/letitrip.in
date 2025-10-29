/**
 * Physics-based collision damage calculation using Newton's laws of motion
 * 
 * This module implements realistic 2D collision physics for spinning beyblades:
 * - Linear momentum (p = mv)
 * - Angular momentum (L = Iω)
 * - Rotational inertia for disk (I = 0.5mr²)
 * - Conservation of momentum
 * - Energy transfer during collisions
 */

import { GameBeyblade, Vector2D } from '../types/game';
import {
  vectorSubtract,
  vectorAdd,
  vectorLength,
  vectorNormalize,
  vectorMultiply,
  vectorDot,
  vectorDistance,
} from './vectorUtils';

/**
 * Calculate moment of inertia for a solid disk
 * I = 0.5 * m * r²
 */
export function calculateMomentOfInertia(mass: number, radius: number): number {
  return 0.5 * mass * radius * radius;
}

/**
 * Calculate angular velocity (radians per second) from spin value
 * Spin value is normalized (0-3500), convert to angular velocity
 * @param spin - Current spin value (0-3500)
 * @param maxSpin - Maximum spin value (typically 3500)
 * @param direction - Spin direction ('left' = counter-clockwise, 'right' = clockwise)
 */
export function calculateAngularVelocity(
  spin: number,
  maxSpin: number,
  direction: 'left' | 'right'
): number {
  // Base angular velocity at max spin (radians per second)
  // One full rotation per second at max spin = 2π rad/s
  const maxAngularVelocity = Math.PI * 2 * 20; // 20 rotations/sec at max spin
  
  // Normalize spin (0-1)
  const spinRatio = Math.max(0, Math.min(1, spin / maxSpin));
  
  // Direction: left = counter-clockwise = negative, right = clockwise = positive
  const directionMultiplier = direction === 'left' ? -1 : 1;
  
  return spinRatio * maxAngularVelocity * directionMultiplier;
}

/**
 * Calculate angular momentum: L = I * ω
 * @param mass - Beyblade mass
 * @param radius - Beyblade radius
 * @param angularVelocity - Angular velocity in rad/s
 */
export function calculateAngularMomentum(
  mass: number,
  radius: number,
  angularVelocity: number
): number {
  const momentOfInertia = calculateMomentOfInertia(mass, radius);
  return momentOfInertia * angularVelocity;
}

/**
 * Calculate linear momentum: p = m * v
 * @param mass - Beyblade mass
 * @param velocity - Velocity vector
 */
export function calculateLinearMomentum(mass: number, velocity: Vector2D): number {
  const speed = vectorLength(velocity);
  return mass * speed;
}

/**
 * Calculate rotational kinetic energy: KE_rot = 0.5 * I * ω²
 */
export function calculateRotationalKineticEnergy(
  mass: number,
  radius: number,
  angularVelocity: number
): number {
  const momentOfInertia = calculateMomentOfInertia(mass, radius);
  return 0.5 * momentOfInertia * angularVelocity * angularVelocity;
}

/**
 * Calculate linear kinetic energy: KE_lin = 0.5 * m * v²
 */
export function calculateLinearKineticEnergy(mass: number, velocity: Vector2D): number {
  const speedSquared = velocity.x * velocity.x + velocity.y * velocity.y;
  return 0.5 * mass * speedSquared;
}

/**
 * Calculate total kinetic energy (linear + rotational)
 */
export function calculateTotalKineticEnergy(
  mass: number,
  radius: number,
  velocity: Vector2D,
  angularVelocity: number
): number {
  const linearKE = calculateLinearKineticEnergy(mass, velocity);
  const rotationalKE = calculateRotationalKineticEnergy(mass, radius, angularVelocity);
  return linearKE + rotationalKE;
}

/**
 * Check if two beyblades have opposite spin directions
 */
export function areOppositeSpins(direction1: 'left' | 'right', direction2: 'left' | 'right'): boolean {
  return direction1 !== direction2;
}

/**
 * Calculate collision damage and knockback using physics principles
 * 
 * This is the main damage calculation function that considers:
 * - Mass of both beyblades
 * - Velocity of both beyblades
 * - Spin speed (angular velocity)
 * - Spin direction
 * - Radius (affects moment of inertia)
 * 
 * @returns Collision result with damage and knockback for both beyblades
 */
export function calculatePhysicsBasedDamage(
  bey1: {
    mass: number;
    radius: number;
    velocity: Vector2D;
    position: Vector2D;
    spin: number;
    maxSpin: number;
    direction: 'left' | 'right';
    isChargeDashing?: boolean;
    heavyAttackActive?: boolean;
    ultimateAttackActive?: boolean;
  },
  bey2: {
    mass: number;
    radius: number;
    velocity: Vector2D;
    position: Vector2D;
    spin: number;
    maxSpin: number;
    direction: 'left' | 'right';
    isChargeDashing?: boolean;
    heavyAttackActive?: boolean;
    ultimateAttackActive?: boolean;
  }
): {
  damage1: number;
  damage2: number;
  knockback1: Vector2D;
  knockback2: Vector2D;
  collisionForce: number;
} {
  // 1. Calculate angular velocities
  const omega1 = calculateAngularVelocity(bey1.spin, bey1.maxSpin, bey1.direction);
  const omega2 = calculateAngularVelocity(bey2.spin, bey2.maxSpin, bey2.direction);
  
  // 2. Calculate angular momentum magnitudes
  const L1 = Math.abs(calculateAngularMomentum(bey1.mass, bey1.radius, omega1));
  const L2 = Math.abs(calculateAngularMomentum(bey2.mass, bey2.radius, omega2));
  
  // 3. Calculate linear momentum magnitudes
  const p1 = calculateLinearMomentum(bey1.mass, bey1.velocity);
  const p2 = calculateLinearMomentum(bey2.mass, bey2.velocity);
  
  // 4. Calculate relative velocity (approach speed)
  const relativeVelocity = vectorSubtract(bey1.velocity, bey2.velocity);
  const relativeSpeed = vectorLength(relativeVelocity);
  
  // 5. Calculate collision normal (direction from bey1 to bey2)
  const collisionNormal = vectorNormalize(vectorSubtract(bey2.position, bey1.position));
  
  // 6. Calculate relative velocity along collision normal
  const relativeVelocityAlongNormal = vectorDot(relativeVelocity, collisionNormal);
  
  // 7. Check if opposite spins (more destructive collision)
  const isOppositeSpins = areOppositeSpins(bey1.direction, bey2.direction);
  
  // 8. Calculate angular momentum interaction
  // Opposite spins: angular momenta add (more damage)
  // Same spins: angular momenta subtract (less damage)
  const angularMomentumInteraction = isOppositeSpins 
    ? (L1 + L2) * 1.5  // Amplify for opposite spins
    : Math.abs(L1 - L2) * 0.8; // Reduce for same spins
  
  // 9. Calculate total collision force
  // Based on: F = Δp/Δt, using relative momentum and relative speed
  const momentumDifference = Math.abs(p1 - p2);
  const totalMomentum = p1 + p2;
  
  // Collision force considers both linear and angular momentum
  // Higher relative speed = shorter collision time = higher force
  const linearCollisionForce = (momentumDifference + totalMomentum * 0.3) * relativeSpeed * 0.01;
  const angularCollisionForce = angularMomentumInteraction * 0.02;
  const collisionForce = linearCollisionForce + angularCollisionForce;
  
  // 10. Calculate energy transfer
  const ke1 = calculateTotalKineticEnergy(bey1.mass, bey1.radius, bey1.velocity, omega1);
  const ke2 = calculateTotalKineticEnergy(bey2.mass, bey2.radius, bey2.velocity, omega2);
  
  // Energy-based damage factor
  const energyFactor = (ke1 + ke2) * 0.001;
  
  // 11. Calculate base damage for each beyblade
  // Heavier, faster beyblade with more spin does less damage to itself
  // Lighter, slower beyblade takes more damage
  
  // Mass ratio affects damage distribution
  const totalMass = bey1.mass + bey2.mass;
  const massRatio1 = bey2.mass / totalMass; // Bey1 takes less damage if bey2 is heavier
  const massRatio2 = bey1.mass / totalMass; // Bey2 takes less damage if bey1 is heavier
  
  // Momentum-based damage
  const baseDamage1 = (p2 * massRatio1 + angularMomentumInteraction * massRatio1) * 0.15;
  const baseDamage2 = (p1 * massRatio2 + angularMomentumInteraction * massRatio2) * 0.15;
  
  // 12. Apply special attack multipliers
  const bey1AttackMultiplier = bey1.ultimateAttackActive ? 2.0 : bey1.heavyAttackActive ? 1.5 : 1.0;
  const bey2AttackMultiplier = bey2.ultimateAttackActive ? 2.0 : bey2.heavyAttackActive ? 1.5 : 1.0;
  
  // 13. Calculate final damage with energy factor
  let damage1 = (baseDamage1 + energyFactor * massRatio1) * bey2AttackMultiplier;
  let damage2 = (baseDamage2 + energyFactor * massRatio2) * bey1AttackMultiplier;
  
  // 14. Apply spin-based scaling
  // More spin = more resistance to damage
  const spinResistance1 = 1 - (bey1.spin / bey1.maxSpin) * 0.3; // Max 30% reduction
  const spinResistance2 = 1 - (bey2.spin / bey2.maxSpin) * 0.3;
  
  damage1 *= (1 + spinResistance1 * 0.5);
  damage2 *= (1 + spinResistance2 * 0.5);
  
  // 15. Calculate knockback based on momentum transfer
  // Use impulse-momentum theorem: J = Δp = F * Δt
  
  // Charge dash multiplier for enhanced knockback
  const chargeDashMultiplier = (bey1.isChargeDashing || bey2.isChargeDashing) ? 1.3 : 1.0;
  
  // Knockback magnitude based on collision force and mass
  const knockbackMagnitude1 = (collisionForce / bey1.mass) * massRatio1 * chargeDashMultiplier;
  const knockbackMagnitude2 = (collisionForce / bey2.mass) * massRatio2 * chargeDashMultiplier;
  
  // Knockback direction (opposite to collision normal for bey1, along normal for bey2)
  const knockback1 = vectorMultiply(collisionNormal, -knockbackMagnitude1);
  const knockback2 = vectorMultiply(collisionNormal, knockbackMagnitude2);
  
  // 16. Cap damage values for gameplay balance
  const maxDamage = 200; // Maximum damage per collision
  damage1 = Math.min(maxDamage, Math.max(0, damage1));
  damage2 = Math.min(maxDamage, Math.max(0, damage2));
  
  return {
    damage1,
    damage2,
    knockback1,
    knockback2,
    collisionForce,
  };
}

/**
 * Apply collision results to beyblades
 * This function modifies the beyblades in place
 */
export function applyCollisionResults(
  bey1: GameBeyblade,
  bey2: GameBeyblade,
  collisionResult: {
    damage1: number;
    damage2: number;
    knockback1: Vector2D;
    knockback2: Vector2D;
  }
): void {
  // Apply damage (reduce spin)
  bey1.spin = Math.max(0, bey1.spin - collisionResult.damage1);
  bey2.spin = Math.max(0, bey2.spin - collisionResult.damage2);
  
  // Apply knockback to positions
  // Cap knockback distance for gameplay control
  const maxKnockbackDistance = 80;
  
  const knockback1Length = vectorLength(collisionResult.knockback1);
  const knockback2Length = vectorLength(collisionResult.knockback2);
  
  if (knockback1Length > 0) {
    const knockback1Limited = knockback1Length > maxKnockbackDistance
      ? vectorMultiply(vectorNormalize(collisionResult.knockback1), maxKnockbackDistance)
      : collisionResult.knockback1;
    bey1.position = vectorAdd(bey1.position, knockback1Limited);
  }
  
  if (knockback2Length > 0) {
    const knockback2Limited = knockback2Length > maxKnockbackDistance
      ? vectorMultiply(vectorNormalize(collisionResult.knockback2), maxKnockbackDistance)
      : collisionResult.knockback2;
    bey2.position = vectorAdd(bey2.position, knockback2Limited);
  }
  
  // Apply velocity changes (impulse)
  // Convert knockback to velocity change
  const velocityTransfer = 0.4; // Scaling factor for velocity change
  const maxVelocityChange = 150;
  
  const velocityChange1 = vectorMultiply(collisionResult.knockback1, velocityTransfer);
  const velocityChange2 = vectorMultiply(collisionResult.knockback2, velocityTransfer);
  
  // Cap velocity changes
  const velocityChange1Magnitude = vectorLength(velocityChange1);
  const velocityChange2Magnitude = vectorLength(velocityChange2);
  
  if (velocityChange1Magnitude > maxVelocityChange) {
    const scale = maxVelocityChange / velocityChange1Magnitude;
    bey1.velocity = vectorAdd(bey1.velocity, vectorMultiply(velocityChange1, scale));
  } else {
    bey1.velocity = vectorAdd(bey1.velocity, velocityChange1);
  }
  
  if (velocityChange2Magnitude > maxVelocityChange) {
    const scale = maxVelocityChange / velocityChange2Magnitude;
    bey2.velocity = vectorAdd(bey2.velocity, vectorMultiply(velocityChange2, scale));
  } else {
    bey2.velocity = vectorAdd(bey2.velocity, velocityChange2);
  }
  
  // Separate beyblades to prevent overlap
  const distance = vectorDistance(bey1.position, bey2.position);
  const overlap = (bey1.radius + bey2.radius) - distance;
  
  if (overlap > 0) {
    const separationDirection = vectorNormalize(vectorSubtract(bey2.position, bey1.position));
    const separation = vectorMultiply(separationDirection, overlap / 2 + 1);
    bey1.position = vectorSubtract(bey1.position, separation);
    bey2.position = vectorAdd(bey2.position, separation);
  }
}

/**
 * Main collision resolution function using physics
 * This replaces the old acceleration-based collision system
 */
export function resolvePhysicsCollision(bey1: GameBeyblade, bey2: GameBeyblade): {
  damage1: number;
  damage2: number;
  collisionForce: number;
} {
  // Calculate damage and knockback
  const collisionResult = calculatePhysicsBasedDamage(
    {
      mass: bey1.mass,
      radius: bey1.radius,
      velocity: bey1.velocity,
      position: bey1.position,
      spin: bey1.spin,
      maxSpin: bey1.maxSpin,
      direction: bey1.config.direction,
      isChargeDashing: bey1.isChargeDashing,
      heavyAttackActive: bey1.heavyAttackActive,
      ultimateAttackActive: bey1.ultimateAttackActive,
    },
    {
      mass: bey2.mass,
      radius: bey2.radius,
      velocity: bey2.velocity,
      position: bey2.position,
      spin: bey2.spin,
      maxSpin: bey2.maxSpin,
      direction: bey2.config.direction,
      isChargeDashing: bey2.isChargeDashing,
      heavyAttackActive: bey2.heavyAttackActive,
      ultimateAttackActive: bey2.ultimateAttackActive,
    }
  );
  
  // Apply the results
  applyCollisionResults(bey1, bey2, collisionResult);
  
  // Return damage values for logging/sync
  return {
    damage1: collisionResult.damage1,
    damage2: collisionResult.damage2,
    collisionForce: collisionResult.collisionForce,
  };
}
