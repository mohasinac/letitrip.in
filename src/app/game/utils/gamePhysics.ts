// Re-export all utilities for backward compatibility
export * from './vectorUtils';
export * from './collisionUtils';
export * from './beybladeUtils';

// Legacy exports for backward compatibility
import { Vector2D, GameBeyblade, Stadium, CollisionResult } from '../types/game';
import { BEYBLADE_CONFIGS } from '@/constants/beyblades';
import {
  vectorAdd,
  vectorSubtract,
  vectorMultiply,
  vectorLength,
  vectorNormalize,
  vectorDistance,
  vectorDot,
} from './vectorUtils';

import {
  checkCollision as checkCollisionUtil,
  resolveCollisionWithAcceleration as resolveCollisionWithAccelerationUtil,
  calculateSpinExchange as calculateSpinExchangeUtil,
  applySpinExchange as applySpinExchangeUtil,
} from './collisionUtils';

import {
  createBeyblade as createBeybladeUtil,
  updateBeyblade as updateBeybladeUtil,
  launchPowerAttack as launchPowerAttackUtil,
  getZoneSegment as getZoneSegmentUtil,
  checkStadiumBounds as checkStadiumBoundsUtil,
} from './beybladeUtils';

// Legacy function exports for backward compatibility
export const checkCollision = checkCollisionUtil;
export const resolveCollisionWithAcceleration = resolveCollisionWithAccelerationUtil;
export const calculateSpinExchange = calculateSpinExchangeUtil;
export const applySpinExchange = applySpinExchangeUtil;
export const createBeyblade = createBeybladeUtil;
export const updateBeyblade = updateBeybladeUtil;
export const launchPowerAttack = launchPowerAttackUtil;
export const getZoneSegment = getZoneSegmentUtil;
export const checkStadiumBoundsSegmented = checkStadiumBoundsUtil;

// Legacy resolveCollision function for backward compatibility
export const resolveCollision = (bey1: GameBeyblade, bey2: GameBeyblade): CollisionResult => {
  const distance = vectorDistance(bey1.position, bey2.position);
  const normal = vectorNormalize(vectorSubtract(bey2.position, bey1.position));
  
  // Separate beyblades if they're overlapping
  const overlap = (bey1.radius + bey2.radius) - distance;
  if (overlap > 0) {
    const separation = vectorMultiply(normal, overlap / 2);
    bey1.position = vectorSubtract(bey1.position, separation);
    bey2.position = vectorAdd(bey2.position, separation);
  }
  
  // Calculate relative velocity
  const relativeVelocity = vectorSubtract(bey1.velocity, bey2.velocity);
  const speed = vectorDot(relativeVelocity, normal);
  
  // Don't resolve if velocities are separating
  if (speed > 0) return { beyblade1: bey1, beyblade2: bey2, force: 0, angle: 0 };
  
  // Calculate restitution (bounciness)
  const restitution = 0.8;
  
  // Calculate impulse scalar
  const impulse = -(1 + restitution) * speed / (1/bey1.mass + 1/bey2.mass);
  
  // Apply impulse to velocities
  const impulseVector = vectorMultiply(normal, impulse);
  bey1.velocity = vectorAdd(bey1.velocity, vectorMultiply(impulseVector, 1/bey1.mass));
  bey2.velocity = vectorSubtract(bey2.velocity, vectorMultiply(impulseVector, 1/bey2.mass));
  
  // Calculate spin exchange based on collision force and direction
  const force = Math.abs(impulse);
  const spinExchange = calculateSpinExchange(bey1, bey2, force);
  
  // Apply spin changes
  applySpinExchange(bey1, bey2, spinExchange);
  
  return { 
    beyblade1: bey1, 
    beyblade2: bey2, 
    force, 
    angle: Math.atan2(normal.y, normal.x) 
  };
};
