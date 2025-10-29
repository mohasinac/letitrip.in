import { GameBeyblade, Vector2D } from '../types/game';
import { vectorDistance, vectorNormalize, vectorSubtract, vectorAdd, vectorMultiply } from './vectorUtils';

/**
 * Collision detection and response utilities
 * NOTE: This file contains the OLD acceleration-based collision system.
 * For NEW physics-based collisions, see physicsCollision.ts
 */

export const checkCollision = (bey1: GameBeyblade, bey2: GameBeyblade): boolean => {
  const distance = vectorDistance(bey1.position, bey2.position);
  return distance < (bey1.radius + bey2.radius);
};

// Re-export for backwards compatibility
export { checkCollision as default };

export const resolveCollisionWithAcceleration = (bey1: GameBeyblade, bey2: GameBeyblade): void => {
  const distance = vectorDistance(bey1.position, bey2.position);
  const normal = vectorNormalize(vectorSubtract(bey2.position, bey1.position));
  
  // Check spin directions
  const bey1SpinDirection = bey1.config.direction === "left" ? -1 : 1;
  const bey2SpinDirection = bey2.config.direction === "left" ? -1 : 1;
  const isOppositeSpins = bey1SpinDirection !== bey2SpinDirection;
  
  // Check if either beyblade is in charge dash mode for enhanced knockback
  const bey1ChargeDash = bey1.isChargeDashing || false;
  const bey2ChargeDash = bey2.isChargeDashing || false;
  const chargeKnockbackMultiplier = (bey1ChargeDash || bey2ChargeDash) ? 1.25 : 1.0; // 1.25x for charge dash, 1x for normal
  
  // Check for special attack multipliers
  const bey1DamageMultiplier = bey1.ultimateAttackActive ? 2.0 : bey1.heavyAttackActive ? 1.25 : 1.0;
  const bey2DamageMultiplier = bey2.ultimateAttackActive ? 2.0 : bey2.heavyAttackActive ? 1.25 : 1.0;
  
  let damage1 = 0;
  let damage2 = 0;
  
  if (isOppositeSpins) {
    // Opposite spin collision: Both get average spin + their acceleration
    const avgSpin = (bey1.spin + bey2.spin) / 2;
    const newSpin1 = avgSpin + bey1.acceleration;
    const newSpin2 = avgSpin + bey2.acceleration;
    
    // Calculate damage: 1.5x multiplier for faster-paced battles
    const avgAcceleration = Math.floor((bey1.acceleration + bey2.acceleration) / 2);
    damage1 = (avgAcceleration + bey2.acceleration * bey2DamageMultiplier) * 0.9; // 0.6 * 1.5 = 0.9
    damage2 = (avgAcceleration + bey1.acceleration * bey1DamageMultiplier) * 0.9; // 0.6 * 1.5 = 0.9
    
    // Apply new spins and damage
    bey1.spin = Math.max(0, newSpin1 - damage1);
    bey2.spin = Math.max(0, newSpin2 - damage2);
  } else {
    // Same spin collision: 1.5x multiplier for faster-paced battles
    const accelerationDiff = Math.abs(bey1.acceleration - bey2.acceleration);
    damage1 = (accelerationDiff + bey2.acceleration * bey2DamageMultiplier) * 0.9; // 0.6 * 1.5 = 0.9
    damage2 = (accelerationDiff + bey1.acceleration * bey1DamageMultiplier) * 0.9; // 0.6 * 1.5 = 0.9
    
    // Apply damage
    bey1.spin = Math.max(0, bey1.spin - damage1);
    bey2.spin = Math.max(0, bey2.spin - damage2);
  }
  
  // Enhanced collision knockback with charge dash multiplier
  const knockback1 = vectorMultiply(normal, -damage1 * chargeKnockbackMultiplier);
  const knockback2 = vectorMultiply(normal, damage2 * chargeKnockbackMultiplier);
  
  // Apply knockback to positions - allow strategic exits but limit excessive knockback
  const newPos1 = vectorAdd(bey1.position, knockback1);
  const newPos2 = vectorAdd(bey2.position, knockback2);
  
  // Stadium bounds for strategic gameplay
  const stadiumCenter = { x: 400, y: 450 }; // Moved down for better visual centering in square canvas (800x800)
  const stadiumRadius = 290; // Full outer radius - allow exits but limit excessive knockback
  const maxKnockbackDistance = 80; // Maximum knockback distance per collision
  
  const dist1 = vectorDistance(newPos1, stadiumCenter);
  const dist2 = vectorDistance(newPos2, stadiumCenter);
  
  // Apply position changes with limited knockback distance
  const knockback1Length = vectorDistance(bey1.position, newPos1);
  const knockback2Length = vectorDistance(bey2.position, newPos2);
  
  if (knockback1Length <= maxKnockbackDistance) {
    bey1.position = newPos1;
  } else {
    // Limit knockback distance while preserving direction
    const knockbackDirection = vectorNormalize(knockback1);
    const limitedKnockback = vectorMultiply(knockbackDirection, maxKnockbackDistance);
    bey1.position = vectorAdd(bey1.position, limitedKnockback);
  }
  
  if (knockback2Length <= maxKnockbackDistance) {
    bey2.position = newPos2;
  } else {
    // Limit knockback distance while preserving direction
    const knockbackDirection = vectorNormalize(knockback2);
    const limitedKnockback = vectorMultiply(knockbackDirection, maxKnockbackDistance);
    bey2.position = vectorAdd(bey2.position, limitedKnockback);
  }
  
  // Apply velocity changes for collision response (controlled for strategic gameplay)
  const velocityTransfer = 35 * chargeKnockbackMultiplier; // Slightly reduced for better control
  const maxVelocityAddition = 150; // Cap velocity addition to maintain control
  
  let velocityKnockback1 = vectorMultiply(knockback1, velocityTransfer * 0.01);
  let velocityKnockback2 = vectorMultiply(knockback2, velocityTransfer * 0.01);
  
  // Limit velocity addition for better control
  const velocity1Magnitude = vectorDistance({ x: 0, y: 0 }, velocityKnockback1);
  const velocity2Magnitude = vectorDistance({ x: 0, y: 0 }, velocityKnockback2);
  
  if (velocity1Magnitude > maxVelocityAddition) {
    const scale = maxVelocityAddition / velocity1Magnitude;
    velocityKnockback1 = vectorMultiply(velocityKnockback1, scale);
  }
  
  if (velocity2Magnitude > maxVelocityAddition) {
    const scale = maxVelocityAddition / velocity2Magnitude;
    velocityKnockback2 = vectorMultiply(velocityKnockback2, scale);
  }
  
  bey1.velocity = vectorAdd(bey1.velocity, velocityKnockback1);
  bey2.velocity = vectorAdd(bey2.velocity, velocityKnockback2);
  
  // Separate beyblades to prevent overlap
  const overlap = (bey1.radius + bey2.radius) - distance;
  if (overlap > 0) {
    const separation = vectorMultiply(normal, overlap / 2 + 1);
    bey1.position = vectorSubtract(bey1.position, separation);
    bey2.position = vectorAdd(bey2.position, separation);
  }
};

export const calculateSpinExchange = (bey1: GameBeyblade, bey2: GameBeyblade, force: number): number => {
  const spinDiff = Math.abs(bey1.spin - bey2.spin);
  const avgSpin = (bey1.spin + bey2.spin) / 2;
  
  // Base exchange rate
  const baseExchange = force * 0.1;
  
  // If spins are in opposite directions (one left, one right), equalize more
  const oppositeFactor = (bey1.config.direction !== bey2.config.direction) ? 1.5 : 1.0;
  
  return Math.min(baseExchange * oppositeFactor, spinDiff * 0.3);
};

export const applySpinExchange = (bey1: GameBeyblade, bey2: GameBeyblade, exchange: number): void => {
  if (bey1.spin > bey2.spin) {
    bey1.spin = Math.max(0, bey1.spin - exchange);
    bey2.spin = Math.min(bey2.maxSpin, bey2.spin + exchange * 0.7); // Receiver gets less
  } else {
    bey2.spin = Math.max(0, bey2.spin - exchange);
    bey1.spin = Math.min(bey1.maxSpin, bey1.spin + exchange * 0.7);
  }
};
