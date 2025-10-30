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
 * Apply special move effects to Beyblade (supports ALL flags)
 */
function applySpecialMoveEffects(
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  flags: SpecialMoveFlags
): void {
  // Store original values before modifications
  if (!beyblade.baseRadius) {
    beyblade.baseRadius = beyblade.radius;
  }
  
  // === MOVEMENT FLAGS ===
  
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
  
  // Perform loop (trigger loop mechanics)
  if (flags.performLoop) {
    beyblade.isInNormalLoop = true;
    beyblade.normalLoopStartTime = Date.now();
    beyblade.normalLoopAngle = 0;
  }
  
  // === SIZE/VISUAL FLAGS ===
  
  // Radius multiplier - increase hitbox size
  if (flags.radiusMultiplier) {
    beyblade.radius = beyblade.baseRadius * flags.radiusMultiplier;
  }
  
  // Visual scale - store for rendering
  if (flags.visualScale) {
    beyblade.visualScale = flags.visualScale;
  }
  
  // === DEFENSIVE FLAGS ===
  // These are applied during collision/damage calculations in collision handlers
  
  // === OFFENSIVE FLAGS ===
  // Damage multipliers are applied during collision detection
  
  // === CINEMATIC MOVES ===
  // Orbital Attack and Time Skip are handled by cinematicSpecialMoves.ts
  // But we can set flags here that affect behavior
  
  // === COMPLEX MOVE TYPES ===
  
  // Berserk Mode
  if (flags.berserkMode?.enabled) {
    if (flags.berserkMode.speedBoost) {
      beyblade.velocity.x *= flags.berserkMode.speedBoost;
      beyblade.velocity.y *= flags.berserkMode.speedBoost;
    }
    // Visual intensity stored for rendering
    beyblade.visualScale = flags.berserkMode.visualIntensity || 1.5;
  }
  
  // Phantom Mode
  if (flags.phantomMode?.enabled) {
    beyblade.isPhasing = flags.phantomMode.phaseThrough || false;
    beyblade.visualScale = flags.phantomMode.opacity || 0.5;
  }
  
  // Shield Dome
  if (flags.shieldDome?.enabled) {
    // Shield absorbs damage during updateSpecialMoves
  }
}

/**
 * Apply continuous effects every frame (supports ALL flags)
 */
function applyContinuousEffects(
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  flags: SpecialMoveFlags,
  deltaTime: number
): void {
  // === HEALING/DAMAGE OVER TIME ===
  
  // Heal spin
  if (flags.healSpin) {
    beyblade.spin = Math.min(
      beyblade.maxSpin,
      beyblade.spin + flags.healSpin * deltaTime
    );
  }
  
  // Shield Dome healing
  if (flags.shieldDome?.enabled && flags.shieldDome.healPerSecond) {
    beyblade.spin = Math.min(
      beyblade.maxSpin,
      beyblade.spin + flags.shieldDome.healPerSecond * deltaTime
    );
  }
  
  // === GRAVITY/PUSH EFFECTS ===
  // These would need access to other beyblades, handled in game loop
  
  // === VORTEX MODE ===
  if (flags.vortexMode?.enabled) {
    // Spin steal handled in collision detection
    // Visual effects stored for rendering
  }
  
  // === BERSERK MODE ===
  if (flags.berserkMode?.enabled) {
    // Continuous damage boost is applied during collisions
    // Defense reduction is applied when taking damage
  }
  
  // === RUSH ATTACK ===
  if (flags.rushAttack?.enabled) {
    // Dash mechanics handled in game loop
  }
  
  // === PHANTOM MODE TELEPORT ===
  if (flags.phantomMode?.enabled && flags.phantomMode.teleportOnHit) {
    // Teleport logic handled on collision
  }
  
  // === EXPLOSION ===
  if (flags.explosion?.enabled) {
    // Explosion triggered at end of move or on collision
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
        // Apply continuous effects every frame
        applyContinuousEffects(beyblade, beyStats, activeMove.flags, deltaTime);
      }
    }
  }
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
 * Calculate damage with special move modifiers (enhanced for all flags)
 */
export function calculateDamageWithSpecialMoves(
  attacker: GameBeyblade,
  defender: GameBeyblade,
  baseDamage: number
): number {
  let finalDamage = baseDamage;
  
  // Apply attacker's damage multiplier
  const attackerMove = activeSpecialMoves.get(attacker.id);
  if (attackerMove && attackerMove.isActive) {
    const flags = attackerMove.flags;
    
    // Base damage multiplier
    if (flags.damageMultiplier) {
      finalDamage *= flags.damageMultiplier;
    }
    
    // Berserk mode damage boost
    if (flags.berserkMode?.enabled && flags.berserkMode.damageBoost) {
      finalDamage *= flags.berserkMode.damageBoost;
    }
    
    // Rush attack damage per dash
    if (flags.rushAttack?.enabled && flags.rushAttack.damagePerDash) {
      finalDamage += flags.rushAttack.damagePerDash * (flags.rushAttack.dashCount || 1);
    }
  }
  
  // Apply defender's damage reduction
  const defenderMove = activeSpecialMoves.get(defender.id);
  if (defenderMove && defenderMove.isActive) {
    const flags = defenderMove.flags;
    
    // Damage immunity
    if (flags.damageImmune) {
      finalDamage = 0;
    } else {
      // Base damage reduction
      if (flags.damageReduction) {
        finalDamage *= (1 - flags.damageReduction);
      }
      
      // Shield dome absorption
      if (flags.shieldDome?.enabled && flags.shieldDome.absorbDamage) {
        finalDamage = 0;
      }
      
      // Berserk mode defense reduction (take MORE damage)
      if (flags.berserkMode?.enabled && flags.berserkMode.defenseReduction) {
        finalDamage *= (1 + flags.berserkMode.defenseReduction);
      }
    }
  }
  
  return Math.max(0, finalDamage);
}

/**
 * Calculate reflected damage (for counter-attack moves)
 */
export function calculateReflectedDamage(
  defender: GameBeyblade,
  incomingDamage: number
): number {
  const defenderMove = activeSpecialMoves.get(defender.id);
  
  if (defenderMove && defenderMove.isActive) {
    const flags = defenderMove.flags;
    
    // Shield dome reflection
    if (flags.shieldDome?.enabled && flags.shieldDome.reflectPercentage) {
      return incomingDamage * flags.shieldDome.reflectPercentage;
    }
    
    // Base reflect damage
    if (flags.reflectDamage) {
      return incomingDamage * flags.reflectDamage;
    }
  }
  
  return 0;
}

/**
 * Calculate spin steal with special move modifiers
 */
export function calculateSpinSteal(
  attacker: GameBeyblade,
  defender: GameBeyblade,
  baseSpinSteal: number
): number {
  let finalSpinSteal = baseSpinSteal;
  
  // Apply attacker's spin steal multiplier
  const attackerMove = activeSpecialMoves.get(attacker.id);
  if (attackerMove && attackerMove.isActive) {
    const flags = attackerMove.flags;
    
    if (flags.spinStealMultiplier) {
      finalSpinSteal *= flags.spinStealMultiplier;
    }
    
    // Vortex mode spin steal
    if (flags.vortexMode?.enabled && flags.vortexMode.spinStealRate) {
      finalSpinSteal += flags.vortexMode.spinStealRate;
    }
  }
  
  return finalSpinSteal;
}

/**
 * Calculate damage modifiers from special move flags (for collision system)
 */
export function getSpecialMoveDamageModifiers(beybladeId: string): {
  damageMultiplier: number;
  damageReduction: number;
  damageImmune: boolean;
  reflectDamage: number;
  spinStealMultiplier: number;
} {
  const activeMove = activeSpecialMoves.get(beybladeId);
  
  if (!activeMove || !activeMove.isActive) {
    return {
      damageMultiplier: 1.0,
      damageReduction: 0,
      damageImmune: false,
      reflectDamage: 0,
      spinStealMultiplier: 1.0,
    };
  }
  
  const flags = activeMove.flags;
  
  // Combine multipliers from different sources
  let totalDamageMultiplier = flags.damageMultiplier || 1.0;
  
  // Berserk mode damage boost
  if (flags.berserkMode?.enabled && flags.berserkMode.damageBoost) {
    totalDamageMultiplier *= flags.berserkMode.damageBoost;
  }
  
  // Shield dome damage reduction
  let totalDamageReduction = flags.damageReduction || 0;
  if (flags.shieldDome?.enabled && flags.shieldDome.absorbDamage) {
    totalDamageReduction = 1.0; // 100% reduction
  }
  
  // Berserk mode defense reduction (take MORE damage)
  if (flags.berserkMode?.enabled && flags.berserkMode.defenseReduction) {
    totalDamageReduction = Math.max(0, totalDamageReduction - flags.berserkMode.defenseReduction);
  }
  
  return {
    damageMultiplier: totalDamageMultiplier,
    damageReduction: totalDamageReduction,
    damageImmune: flags.damageImmune || false,
    reflectDamage: flags.reflectDamage || (flags.shieldDome?.reflectPercentage || 0),
    spinStealMultiplier: flags.spinStealMultiplier || 1.0,
  };
}

/**
 * Check if Beyblade is immune to knockback
 */
export function isImmuneToKnockback(beybladeId: string): boolean {
  const activeMove = activeSpecialMoves.get(beybladeId);
  if (!activeMove || !activeMove.isActive) return false;
  
  return activeMove.flags.immuneToKnockback || false;
}

/**
 * Get gravity/push forces from special moves (for game loop)
 */
export function getSpecialMoveForces(
  beybladeId: string,
  targetPosition: { x: number; y: number },
  beybladePosition: { x: number; y: number }
): { x: number; y: number } | null {
  const activeMove = activeSpecialMoves.get(beybladeId);
  if (!activeMove || !activeMove.isActive) return null;
  
  const flags = activeMove.flags;
  const dx = targetPosition.x - beybladePosition.x;
  const dy = targetPosition.y - beybladePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return null;
  
  const normalizedX = dx / distance;
  const normalizedY = dy / distance;
  
  // Gravity pull
  if (flags.gravityPull && distance <= flags.gravityPull) {
    const pullStrength = 100; // pixels per second
    return {
      x: normalizedX * pullStrength,
      y: normalizedY * pullStrength,
    };
  }
  
  // Push away
  if (flags.pushAway && distance <= flags.pushAway) {
    const pushStrength = 150; // pixels per second
    return {
      x: -normalizedX * pushStrength,
      y: -normalizedY * pushStrength,
    };
  }
  
  // Shield dome push
  if (flags.shieldDome?.enabled && distance <= flags.shieldDome.pushRadius) {
    const pushStrength = 200;
    return {
      x: -normalizedX * pushStrength,
      y: -normalizedY * pushStrength,
    };
  }
  
  // Vortex mode pull
  if (flags.vortexMode?.enabled && distance <= flags.vortexMode.pullRadius) {
    const pullStrength = 120;
    return {
      x: normalizedX * pullStrength,
      y: normalizedY * pullStrength,
    };
  }
  
  return null;
}

/**
 * Apply vortex spin steal to nearby opponents
 */
export function applyVortexSpinSteal(
  beyblade: GameBeyblade,
  opponents: GameBeyblade[],
  deltaTime: number
): void {
  const activeMove = activeSpecialMoves.get(beyblade.id);
  if (!activeMove || !activeMove.isActive) return;
  
  const flags = activeMove.flags;
  if (!flags.vortexMode?.enabled) return;
  
  const vortex = flags.vortexMode;
  
  for (const opponent of opponents) {
    if (opponent.id === beyblade.id || opponent.isDead) continue;
    
    const dx = opponent.position.x - beyblade.position.x;
    const dy = opponent.position.y - beyblade.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= vortex.pullRadius) {
      // Steal spin
      const stealAmount = vortex.spinStealRate * deltaTime;
      const actualSteal = Math.min(stealAmount, opponent.spin);
      
      opponent.spin = Math.max(0, opponent.spin - actualSteal);
      
      if (vortex.healFromSteal) {
        beyblade.spin = Math.min(beyblade.maxSpin, beyblade.spin + actualSteal);
      }
      
      // Slow opponent
      if (vortex.slowOpponents && opponent.velocity) {
        opponent.velocity.x *= vortex.slowOpponents;
        opponent.velocity.y *= vortex.slowOpponents;
      }
    }
  }
}

/**
 * Check if special move should trigger counter attack
 */
export function shouldCounterAttack(beybladeId: string): boolean {
  const activeMove = activeSpecialMoves.get(beybladeId);
  if (!activeMove || !activeMove.isActive) return false;
  
  return activeMove.flags.counterAttack || false;
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
 * Handle phantom mode teleport on hit
 */
export function handlePhantomTeleport(
  beyblade: GameBeyblade,
  arenaRadius: number
): void {
  const activeMove = activeSpecialMoves.get(beyblade.id);
  if (!activeMove || !activeMove.isActive) return;
  
  const flags = activeMove.flags;
  if (!flags.phantomMode?.enabled || !flags.phantomMode.teleportOnHit) return;
  
  // Teleport to random position in arena
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * arenaRadius * 0.7; // Keep away from edges
  
  beyblade.position.x = Math.cos(angle) * distance;
  beyblade.position.y = Math.sin(angle) * distance;
  
  // Reset velocity
  if (beyblade.velocity) {
    beyblade.velocity.x *= 0.5;
    beyblade.velocity.y *= 0.5;
  }
}

/**
 * Trigger explosion effect (area damage)
 */
export function triggerExplosion(
  beyblade: GameBeyblade,
  opponents: GameBeyblade[]
): void {
  const activeMove = activeSpecialMoves.get(beyblade.id);
  if (!activeMove || !activeMove.isActive) return;
  
  const flags = activeMove.flags;
  if (!flags.explosion?.enabled) return;
  
  const explosion = flags.explosion;
  
  for (const opponent of opponents) {
    if (opponent.id === beyblade.id || opponent.isDead) continue;
    
    const dx = opponent.position.x - beyblade.position.x;
    const dy = opponent.position.y - beyblade.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= explosion.explosionRadius) {
      // Apply damage
      opponent.spin = Math.max(0, opponent.spin - explosion.explosionDamage);
      
      // Apply knockback
      if (opponent.velocity) {
        const normalizedX = dx / (distance || 1);
        const normalizedY = dy / (distance || 1);
        
        opponent.velocity.x += normalizedX * explosion.knockbackForce;
        opponent.velocity.y += normalizedY * explosion.knockbackForce;
      }
      
      // Self damage if specified
      if (explosion.selfDamage) {
        beyblade.spin = Math.max(0, beyblade.spin - explosion.selfDamage);
      }
    }
  }
}

/**
 * Execute rush attack dashes
 */
export function executeRushAttack(
  beyblade: GameBeyblade,
  targetPosition: { x: number; y: number }
): void {
  const activeMove = activeSpecialMoves.get(beyblade.id);
  if (!activeMove || !activeMove.isActive) return;
  
  const flags = activeMove.flags;
  if (!flags.rushAttack?.enabled) return;
  
  const rush = flags.rushAttack;
  
  // Calculate dash direction
  const dx = targetPosition.x - beyblade.position.x;
  const dy = targetPosition.y - beyblade.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return;
  
  const normalizedX = dx / distance;
  const normalizedY = dy / distance;
  
  // Apply dash velocity
  if (beyblade.velocity) {
    beyblade.velocity.x = normalizedX * rush.dashSpeed;
    beyblade.velocity.y = normalizedY * rush.dashSpeed;
  }
}

/**
 * Check if magnet mode should attract/repel opponent
 */
export function getMagnetForce(
  beyblade: GameBeyblade,
  opponent: GameBeyblade
): { x: number; y: number } | null {
  const activeMove = activeSpecialMoves.get(beyblade.id);
  if (!activeMove || !activeMove.isActive) return null;
  
  const flags = activeMove.flags;
  if (!flags.magnetMode?.enabled) return null;
  
  const dx = opponent.position.x - beyblade.position.x;
  const dy = opponent.position.y - beyblade.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0 || distance > flags.magnetMode.attractRadius) return null;
  
  const normalizedX = dx / distance;
  const normalizedY = dy / distance;
  const force = flags.magnetMode.force;
  
  // Attract or repel based on mode
  const direction = flags.magnetMode.attractOpponents ? -1 : (flags.magnetMode.repelOpponents ? 1 : 0);
  
  if (direction === 0) return null;
  
  return {
    x: direction * normalizedX * force,
    y: direction * normalizedY * force,
  };
}
