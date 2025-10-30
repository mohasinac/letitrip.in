/**
 * Enhanced Collision System with Point of Contact
 * Handles collision detection and damage calculation based on contact points
 */

import { GameBeyblade, Vector2D } from '../types/game';
import { BeybladeStats, PointOfContact, calculateTypeBonuses } from '@/types/beybladeStats';
import { vectorLength, vectorSubtract, vectorNormalize, vectorDot } from './vectorUtils';

/**
 * Check if two Beyblades are colliding
 */
export function checkCollision(bey1: GameBeyblade, bey2: GameBeyblade): boolean {
  const distance = vectorLength(vectorSubtract(bey1.position, bey2.position));
  const combinedRadius = bey1.radius + bey2.radius;
  return distance < combinedRadius;
}

/**
 * Calculate the angle of collision relative to a Beyblade's rotation
 */
function getCollisionAngle(
  beybladePosition: Vector2D,
  beybladeRotation: number,
  collisionPoint: Vector2D
): number {
  // Vector from beyblade center to collision point
  const toCollision = vectorSubtract(collisionPoint, beybladePosition);
  const collisionAngle = Math.atan2(toCollision.y, toCollision.x) * (180 / Math.PI);
  
  // Convert beyblade rotation to degrees and normalize
  const beybladeAngleDeg = beybladeRotation * (180 / Math.PI);
  
  // Calculate relative angle (0-360)
  let relativeAngle = collisionAngle - beybladeAngleDeg;
  while (relativeAngle < 0) relativeAngle += 360;
  while (relativeAngle >= 360) relativeAngle -= 360;
  
  return relativeAngle;
}

/**
 * Find the damage multiplier based on point of contact
 */
function getContactDamageMultiplier(
  relativeAngle: number,
  pointsOfContact: PointOfContact[]
): number {
  let maxMultiplier = 1.0; // Default multiplier
  
  for (const contact of pointsOfContact) {
    // Calculate angular difference
    let angleDiff = Math.abs(relativeAngle - contact.angle);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    
    // Check if within contact width
    if (angleDiff <= contact.width / 2) {
      // Linear interpolation for smoother damage
      const factor = 1 - (angleDiff / (contact.width / 2));
      const multiplier = 1.0 + (contact.damageMultiplier - 1.0) * factor;
      maxMultiplier = Math.max(maxMultiplier, multiplier);
    }
  }
  
  return maxMultiplier;
}

/**
 * Calculate spin steal based on rotation directions and spin steal factor
 */
function calculateSpinSteal(
  attacker: GameBeyblade,
  attackerStats: BeybladeStats,
  defender: GameBeyblade,
  defenderStats: BeybladeStats,
  collisionForce: number
): number {
  // Opposite rotation directions = more spin steal
  const oppositeRotation = attacker.config.direction !== defender.config.direction;
  const spinStealMultiplier = oppositeRotation ? 1.5 : 0.5;
  
  // Base spin steal calculation
  const baseSteal = collisionForce * attackerStats.spinStealFactor * spinStealMultiplier * 0.1;
  
  // Check if attacker has active spin steal special move
  const hasSpinStealBoost = attacker.ultimateAttackActive && 
    attackerStats.specialMove?.flags?.spinStealMultiplier;
  
  const finalSteal = hasSpinStealBoost
    ? baseSteal * (attackerStats.specialMove.flags.spinStealMultiplier || 1)
    : baseSteal;
  
  return Math.min(finalSteal, defender.spin * 0.3); // Cap at 30% of defender's spin
}

/**
 * Enhanced collision resolution with point of contact
 */
export interface CollisionResult {
  collisionForce: number;
  bey1Damage: number;
  bey2Damage: number;
  bey1SpinSteal: number;
  bey2SpinSteal: number;
  bey1ContactMultiplier: number;
  bey2ContactMultiplier: number;
}

export function resolveEnhancedCollision(
  bey1: GameBeyblade,
  bey1Stats: BeybladeStats,
  bey2: GameBeyblade,
  bey2Stats: BeybladeStats
): CollisionResult {
  // Calculate collision point (midpoint between centers)
  const collisionPoint: Vector2D = {
    x: (bey1.position.x + bey2.position.x) / 2,
    y: (bey1.position.y + bey2.position.y) / 2,
  };
  
  // Calculate collision angles for each Beyblade
  const bey1CollisionAngle = getCollisionAngle(bey1.position, bey1.rotation, collisionPoint);
  const bey2CollisionAngle = getCollisionAngle(bey2.position, bey2.rotation, collisionPoint);
  
  // Get contact damage multipliers
  const bey1ContactMultiplier = getContactDamageMultiplier(
    bey1CollisionAngle,
    bey1Stats.pointsOfContact
  );
  const bey2ContactMultiplier = getContactDamageMultiplier(
    bey2CollisionAngle,
    bey2Stats.pointsOfContact
  );
  
  // Calculate relative velocity
  const relativeVelocity = vectorSubtract(bey1.velocity, bey2.velocity);
  const speed = vectorLength(relativeVelocity);
  
  // Calculate collision normal
  const normal = vectorNormalize(vectorSubtract(bey2.position, bey1.position));
  const relativeVelocityAlongNormal = vectorDot(relativeVelocity, normal);
  
  // Calculate collision force
  const massSum = bey1.mass + bey2.mass;
  const collisionForce = Math.abs(relativeVelocityAlongNormal) * massSum * 0.5;
  
  // Get type bonuses
  const bey1Bonuses = calculateTypeBonuses(bey1Stats.typeDistribution);
  const bey2Bonuses = calculateTypeBonuses(bey2Stats.typeDistribution);
  
  // Calculate base damage
  let bey1BaseDamage = collisionForce * (bey2.mass / massSum) * 10;
  let bey2BaseDamage = collisionForce * (bey1.mass / massSum) * 10;
  
  // Apply contact point multipliers
  bey1BaseDamage *= bey2ContactMultiplier; // bey2's contact hit bey1
  bey2BaseDamage *= bey1ContactMultiplier; // bey1's contact hit bey2
  
  // Apply attack/defense bonuses
  bey1BaseDamage *= bey2Bonuses.attackMultiplier; // bey2's attack
  bey1BaseDamage *= bey1Bonuses.defenseMultiplier; // bey1's defense
  
  bey2BaseDamage *= bey1Bonuses.attackMultiplier; // bey1's attack
  bey2BaseDamage *= bey2Bonuses.defenseMultiplier; // bey2's defense
  
  // Apply special move modifiers
  if (bey1.heavyAttackActive) bey1BaseDamage *= 0.8; // Take less damage
  if (bey1.ultimateAttackActive) bey1BaseDamage *= 0.6; // Take much less damage
  if (bey2.heavyAttackActive) bey2BaseDamage *= 0.8;
  if (bey2.ultimateAttackActive) bey2BaseDamage *= 0.6;
  
  // Apply charge dash bonus
  if (bey1.isChargeDashing) bey2BaseDamage *= 1.3;
  if (bey2.isChargeDashing) bey1BaseDamage *= 1.3;
  
  // Calculate spin steal
  const bey1SpinSteal = calculateSpinSteal(bey1, bey1Stats, bey2, bey2Stats, collisionForce);
  const bey2SpinSteal = calculateSpinSteal(bey2, bey2Stats, bey1, bey1Stats, collisionForce);
  
  // Apply damage to spin
  bey1.spin = Math.max(0, bey1.spin - bey1BaseDamage + bey1SpinSteal);
  bey2.spin = Math.max(0, bey2.spin - bey2BaseDamage + bey2SpinSteal);
  
  // Calculate impulse for velocity changes
  const impulse = (1 + 0.6) * relativeVelocityAlongNormal / massSum;
  
  // Apply velocity changes (physics-based)
  bey1.velocity.x -= impulse * bey2.mass * normal.x;
  bey1.velocity.y -= impulse * bey2.mass * normal.y;
  bey2.velocity.x += impulse * bey1.mass * normal.x;
  bey2.velocity.y += impulse * bey1.mass * normal.y;
  
  // Separate overlapping Beyblades
  const overlap = (bey1.radius + bey2.radius) - vectorLength(vectorSubtract(bey1.position, bey2.position));
  if (overlap > 0) {
    const separation = (overlap / 2) + 1;
    bey1.position.x -= normal.x * separation;
    bey1.position.y -= normal.y * separation;
    bey2.position.x += normal.x * separation;
    bey2.position.y += normal.y * separation;
  }
  
  return {
    collisionForce,
    bey1Damage: bey1BaseDamage,
    bey2Damage: bey2BaseDamage,
    bey1SpinSteal,
    bey2SpinSteal,
    bey1ContactMultiplier,
    bey2ContactMultiplier,
  };
}

/**
 * Get visual indicator for point of contact hit
 */
export function getContactHitQuality(multiplier: number): 'perfect' | 'good' | 'normal' {
  if (multiplier >= 1.8) return 'perfect';
  if (multiplier >= 1.4) return 'good';
  return 'normal';
}
