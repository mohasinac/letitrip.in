/**
 * Special Moves Manager
 * Handles activation, tracking, and execution of Beyblade special moves
 */

import { GameBeyblade } from '../types/game';
import { BeybladeStats, ActiveSpecialMove, SpecialMoveFlags } from '@/types/beybladeStats';

/**
 * Active special moves registry
 */
const activeSpecialMoves = new Map<string, ActiveSpecialMove>();

/**
 * Check if a special move can be activated
 */
export function canActivateSpecialMove(
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  currentTime: number
): { canActivate: boolean; reason?: string } {
  // Check if Beyblade is dead or out of bounds
  if (beyblade.isDead || beyblade.isOutOfBounds) {
    return { canActivate: false, reason: 'Beyblade is inactive' };
  }
  
  // Check power requirement
  if ((beyblade.power || 0) < stats.specialMove.powerCost) {
    return { 
      canActivate: false, 
      reason: `Need ${stats.specialMove.powerCost} power (have ${beyblade.power || 0})` 
    };
  }
  
  // Check cooldown
  const activeMove = activeSpecialMoves.get(beyblade.id);
  if (activeMove && currentTime < activeMove.cooldownEndTime) {
    const remaining = ((activeMove.cooldownEndTime - currentTime) / 1000).toFixed(1);
    return { 
      canActivate: false, 
      reason: `Cooldown: ${remaining}s remaining` 
    };
  }
  
  return { canActivate: true };
}

/**
 * Activate a special move
 */
export function activateSpecialMove(
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  currentTime: number
): ActiveSpecialMove | null {
  const check = canActivateSpecialMove(beyblade, stats, currentTime);
  
  if (!check.canActivate) {
    console.log(`Cannot activate special move: ${check.reason}`);
    return null;
  }
  
  // Deduct power cost
  beyblade.power = Math.max(0, (beyblade.power || 0) - stats.specialMove.powerCost);
  
  // Create active move
  const activeMove: ActiveSpecialMove = {
    beybladeId: beyblade.id,
    moveId: stats.specialMove.id,
    flags: stats.specialMove.flags,
    startTime: currentTime,
    endTime: currentTime + stats.specialMove.flags.duration * 1000,
    cooldownEndTime: currentTime + (stats.specialMove.flags.duration + stats.specialMove.flags.cooldown) * 1000,
    isActive: true,
  };
  
  // Register active move
  activeSpecialMoves.set(beyblade.id, activeMove);
  
  // Apply initial move effects
  applySpecialMoveEffects(beyblade, stats, activeMove.flags);
  
  return activeMove;
}

/**
 * Apply special move effects to Beyblade
 */
function applySpecialMoveEffects(
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  flags: SpecialMoveFlags
): void {
  // Speed boost
  if (flags.speedBoost) {
    beyblade.velocity.x *= flags.speedBoost;
    beyblade.velocity.y *= flags.speedBoost;
  }
  
  // Cannot move - freeze in position
  if (flags.cannotMove) {
    beyblade.velocity.x = 0;
    beyblade.velocity.y = 0;
    beyblade.isFrozen = true;
  }
  
  // Phasing - disable collisions
  if (flags.phasing) {
    beyblade.isPhasing = true;
  }
  
  // Radius multiplier - increase hitbox size
  if (flags.radiusMultiplier && beyblade.baseRadius) {
    beyblade.radius = beyblade.baseRadius * flags.radiusMultiplier;
  }
  
  // Visual scale - store for rendering
  if (flags.visualScale) {
    beyblade.visualScale = flags.visualScale;
  }
  
  // Perform loop (trigger loop mechanics)
  if (flags.performLoop) {
    beyblade.isInNormalLoop = true;
    beyblade.normalLoopStartTime = Date.now();
    beyblade.normalLoopAngle = 0;
  }
}

/**
 * Update active special moves (call every frame)
 */
export function updateSpecialMoves(
  beyblades: GameBeyblade[],
  stats: Map<string, BeybladeStats>,
  currentTime: number,
  deltaTime: number
): void {
  for (const beyblade of beyblades) {
    const activeMove = activeSpecialMoves.get(beyblade.id);
    
    if (activeMove && activeMove.isActive) {
      const beyStats = stats.get(beyblade.name);
      if (!beyStats) continue;
      
      // Check if move duration ended
      if (currentTime >= activeMove.endTime) {
        activeMove.isActive = false;
        removeSpecialMoveEffects(beyblade, activeMove.flags);
      } else {
        // Apply continuous effects
        applySpecialMoveContinuousEffects(beyblade, beyStats, activeMove.flags, deltaTime);
      }
    }
  }
}

/**
 * Apply continuous effects during special move
 */
function applySpecialMoveContinuousEffects(
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  flags: SpecialMoveFlags,
  deltaTime: number
): void {
  // Heal spin over time
  if (flags.healSpin) {
    const healAmount = flags.healSpin * deltaTime;
    beyblade.spin = Math.min(beyblade.maxSpin, beyblade.spin + healAmount);
  }
  
  // Cannot move - keep frozen
  if (flags.cannotMove) {
    beyblade.velocity.x = 0;
    beyblade.velocity.y = 0;
  }
  
  // NOTE: gravityPull and pushAway should be handled in the main game loop
  // by checking for active special moves and applying forces to nearby Beyblades
}

/**
 * Remove special move effects
 */
function removeSpecialMoveEffects(
  beyblade: GameBeyblade,
  flags: SpecialMoveFlags
): void {
  // Speed boost reversal (gradual deceleration)
  if (flags.speedBoost) {
    const reverseMultiplier = 1 / flags.speedBoost;
    beyblade.velocity.x *= reverseMultiplier;
    beyblade.velocity.y *= reverseMultiplier;
  }
  
  // Unfreeze movement
  if (flags.cannotMove) {
    beyblade.isFrozen = false;
  }
  
  // Disable phasing
  if (flags.phasing) {
    beyblade.isPhasing = false;
  }
  
  // Reset radius
  if (flags.radiusMultiplier && beyblade.baseRadius) {
    beyblade.radius = beyblade.baseRadius;
  }
  
  // Reset visual scale
  if (flags.visualScale) {
    beyblade.visualScale = 1.0;
  }
  
  // End loop
  if (flags.performLoop) {
    beyblade.isInNormalLoop = false;
  }
}

/**
 * Get active special move for a Beyblade
 */
export function getActiveSpecialMove(beybladeId: string): ActiveSpecialMove | null {
  return activeSpecialMoves.get(beybladeId) || null;
}

/**
 * Check if Beyblade has active special move
 */
export function hasActiveSpecialMove(beybladeId: string): boolean {
  const activeMove = activeSpecialMoves.get(beybladeId);
  return activeMove !== undefined && activeMove.isActive;
}

/**
 * Calculate damage with special move modifiers
 */
export function calculateDamageWithSpecialMoves(
  attacker: GameBeyblade,
  defender: GameBeyblade,
  baseDamage: number
): number {
  let finalDamage = baseDamage;
  
  // Apply attacker's damage multiplier
  const attackerMove = activeSpecialMoves.get(attacker.id);
  if (attackerMove && attackerMove.isActive && attackerMove.flags.damageMultiplier) {
    finalDamage *= attackerMove.flags.damageMultiplier;
  }
  
  // Apply defender's damage reduction
  const defenderMove = activeSpecialMoves.get(defender.id);
  if (defenderMove && defenderMove.isActive) {
    if (defenderMove.flags.damageImmune) {
      finalDamage = 0;
    } else if (defenderMove.flags.damageReduction) {
      finalDamage *= (1 - defenderMove.flags.damageReduction);
    }
  }
  
  return finalDamage;
}

/**
 * Calculate reflected damage (for counter-attack moves)
 */
export function calculateReflectedDamage(
  defender: GameBeyblade,
  incomingDamage: number
): number {
  const defenderMove = activeSpecialMoves.get(defender.id);
  
  if (defenderMove && defenderMove.isActive && defenderMove.flags.reflectDamage) {
    return incomingDamage * defenderMove.flags.reflectDamage;
  }
  
  return 0;
}

/**
 * Check if Beyblade is immune to knockback
 */
export function isImmuneToKnockback(beybladeId: string): boolean {
  const activeMove = activeSpecialMoves.get(beybladeId);
  return activeMove !== undefined && activeMove.isActive && (activeMove.flags.immuneToKnockback || false);
}

/**
 * Trigger counter-attack (for special moves like Spriggan's Counter Break)
 */
export function shouldTriggerCounterAttack(beybladeId: string): boolean {
  const activeMove = activeSpecialMoves.get(beybladeId);
  return activeMove !== undefined && activeMove.isActive && (activeMove.flags.counterAttack || false);
}

/**
 * Get remaining cooldown time for a Beyblade's special move
 */
export function getRemainingCooldown(beybladeId: string, currentTime: number): number {
  const activeMove = activeSpecialMoves.get(beybladeId);
  
  if (!activeMove) return 0;
  
  const remaining = Math.max(0, activeMove.cooldownEndTime - currentTime);
  return remaining / 1000; // Return in seconds
}

/**
 * Clear all active special moves (for game reset)
 */
export function clearAllSpecialMoves(): void {
  activeSpecialMoves.clear();
}

/**
 * Get all active special moves (for debugging)
 */
export function getAllActiveSpecialMoves(): ActiveSpecialMove[] {
  return Array.from(activeSpecialMoves.values());
}

/**
 * Check if Beyblade is phasing (no collisions)
 */
export function isPhasing(beybladeId: string): boolean {
  const activeMove = activeSpecialMoves.get(beybladeId);
  return activeMove !== undefined && activeMove.isActive && (activeMove.flags.phasing || false);
}

/**
 * Check if Beyblade cannot move
 */
export function cannotMove(beybladeId: string): boolean {
  const activeMove = activeSpecialMoves.get(beybladeId);
  return activeMove !== undefined && activeMove.isActive && (activeMove.flags.cannotMove || false);
}

/**
 * Get current radius multiplier for Beyblade
 */
export function getRadiusMultiplier(beybladeId: string): number {
  const activeMove = activeSpecialMoves.get(beybladeId);
  if (activeMove && activeMove.isActive && activeMove.flags.radiusMultiplier) {
    return activeMove.flags.radiusMultiplier;
  }
  return 1.0;
}

/**
 * Get current visual scale multiplier for Beyblade
 */
export function getVisualScale(beybladeId: string): number {
  const activeMove = activeSpecialMoves.get(beybladeId);
  if (activeMove && activeMove.isActive && activeMove.flags.visualScale) {
    return activeMove.flags.visualScale;
  }
  return 1.0;
}

/**
 * Get gravity pull radius (for attracting nearby Beyblades)
 */
export function getGravityPull(beybladeId: string): number {
  const activeMove = activeSpecialMoves.get(beybladeId);
  if (activeMove && activeMove.isActive && activeMove.flags.gravityPull) {
    return activeMove.flags.gravityPull;
  }
  return 0;
}

/**
 * Get push away radius (for repelling nearby Beyblades)
 */
export function getPushAway(beybladeId: string): number {
  const activeMove = activeSpecialMoves.get(beybladeId);
  if (activeMove && activeMove.isActive && activeMove.flags.pushAway) {
    return activeMove.flags.pushAway;
  }
  return 0;
}
