/**
 * Cinematic Special Move System
 * Handles advanced special moves with animations, banners, and control management
 */

import { GameBeyblade, Vector2D, Stadium } from '../types/game';
import { BeybladeStats } from '@/types/beybladeStats';

/**
 * Special Move Types
 */
export type SpecialMoveType = 
  | 'barrage-of-attacks'   // Orbital strike around opponent
  | 'time-skip'            // Freeze opponent, gain spin advantage
  | 'standard';            // Standard flag-based moves

/**
 * Cinematic Special Move State
 */
export interface CinematicMoveState {
  beybladeId: string;
  moveType: SpecialMoveType;
  moveName: string;
  targetId?: string;
  
  // Animation phases
  phase: 'banner' | 'windup' | 'execution' | 'complete';
  phaseStartTime: number;
  
  // Barrage of Attacks specific
  orbitRadius?: number;
  orbitCenter?: Vector2D;
  currentAngle?: number;
  attackCount?: number;
  attacksPerformed?: number;
  attackAngles?: number[];
  nextAttackAngle?: number;
  
  // Time Skip specific
  frozenBeybladeId?: string;
  originalPosition?: Vector2D;
  targetLoopRadius?: number;
  loopStartAngle?: number;
  
  // Control flags
  attackerLosesControl: boolean;
  defenderLosesControl: boolean;
  
  // Timing
  startTime: number;
  endTime: number;
}

/**
 * Active cinematic moves
 */
const activeCinematicMoves = new Map<string, CinematicMoveState>();

/**
 * Damage/Heal number particles
 */
export interface DamageNumber {
  id: string;
  beybladeId: string;
  value: number;
  isHeal: boolean;
  position: Vector2D;
  velocity: Vector2D;
  alpha: number;
  createdAt: number;
  duration: number;
}

const damageNumbers: DamageNumber[] = [];
let damageNumberIdCounter = 0;

/**
 * Activate Barrage of Attacks (using standard flags)
 */
export function activateBarrageOfAttacks(
  attacker: GameBeyblade,
  defender: GameBeyblade,
  attackerStats: BeybladeStats,
  stadium: Stadium,
  currentTime: number
): CinematicMoveState {
  const orbitalConfig = attackerStats.specialMove.flags.orbitalAttack;
  
  // Use configuration from flags, or defaults
  const orbitRadius = orbitalConfig?.orbitRadius || (attacker.radius * 4);
  const attackCount = orbitalConfig?.attackCount || 3;
  const angleIncrement = 360 / attackCount;
  
  // Generate attack angles
  const attackAngles: number[] = [];
  for (let i = 0; i < attackCount; i++) {
    attackAngles.push(i * angleIncrement);
  }
  
  const state: CinematicMoveState = {
    beybladeId: attacker.id,
    moveType: 'barrage-of-attacks',
    moveName: attackerStats.specialMove.name,
    targetId: defender.id,
    
    phase: 'banner',
    phaseStartTime: currentTime,
    
    orbitRadius,
    orbitCenter: { ...defender.position },
    currentAngle: 0,
    attackCount,
    attacksPerformed: 0,
    attackAngles,
    nextAttackAngle: attackAngles[0],
    
    attackerLosesControl: attackerStats.specialMove.flags.userLosesControl || true,
    defenderLosesControl: attackerStats.specialMove.flags.opponentLosesControl || true,
    
    startTime: currentTime,
    endTime: currentTime + ((attackerStats.specialMove.flags.duration || 4) * 1000),
  };
  
  activeCinematicMoves.set(attacker.id, state);
  return state;
}

/**
 * Activate Time Skip (using standard flags)
 */
export function activateTimeSkip(
  attacker: GameBeyblade,
  defender: GameBeyblade,
  attackerStats: BeybladeStats,
  stadium: Stadium,
  currentTime: number
): CinematicMoveState {
  const timeSkipConfig = attackerStats.specialMove.flags.timeSkip;
  
  // Calculate target position for frozen beyblade
  const centerDistance = Math.sqrt(
    Math.pow(defender.position.x - stadium.center.x, 2) +
    Math.pow(defender.position.y - stadium.center.y, 2)
  );
  
  // Use config or default: Move toward center by 4x radius
  const pushDistance = timeSkipConfig?.repositionOpponent?.distance || (defender.radius * 4);
  const newDistance = Math.max(100, centerDistance - pushDistance);
  
  const angle = Math.atan2(
    defender.position.y - stadium.center.y,
    defender.position.x - stadium.center.x
  );
  
  const targetPosition: Vector2D = {
    x: stadium.center.x + Math.cos(angle) * newDistance,
    y: stadium.center.y + Math.sin(angle) * newDistance,
  };
  
  const state: CinematicMoveState = {
    beybladeId: attacker.id,
    moveType: 'time-skip',
    moveName: attackerStats.specialMove.name,
    targetId: defender.id,
    
    phase: 'banner',
    phaseStartTime: currentTime,
    
    frozenBeybladeId: defender.id,
    originalPosition: { ...defender.position },
    targetLoopRadius: stadium.chargeDashRadius, // Outer blue ring
    loopStartAngle: 0,
    
    attackerLosesControl: attackerStats.specialMove.flags.userLosesControl || false,
    defenderLosesControl: attackerStats.specialMove.flags.freezeOpponent || true,
    
    startTime: currentTime,
    endTime: currentTime + ((attackerStats.specialMove.flags.duration || 4) * 1000),
  };
  
  activeCinematicMoves.set(attacker.id, state);
  
  // Immediately move defender to target position if repositioning enabled
  if (timeSkipConfig?.repositionOpponent?.enabled !== false) {
    defender.position.x = targetPosition.x;
    defender.position.y = targetPosition.y;
    defender.velocity.x = 0;
    defender.velocity.y = 0;
  }
  
  return state;
}

/**
 * Update cinematic special moves
 */
export function updateCinematicMoves(
  beyblades: GameBeyblade[],
  statsMap: Map<string, BeybladeStats>,
  stadium: Stadium,
  currentTime: number,
  deltaTime: number
): void {
  for (const [beybladeId, state] of activeCinematicMoves.entries()) {
    const attacker = beyblades.find(b => b.id === beybladeId);
    const defender = state.targetId ? beyblades.find(b => b.id === state.targetId) : null;
    
    if (!attacker) {
      activeCinematicMoves.delete(beybladeId);
      continue;
    }
    
    const phaseElapsed = currentTime - state.phaseStartTime;
    
    // Phase transitions
    switch (state.phase) {
      case 'banner':
        // Banner shows for 1 second
        if (phaseElapsed >= 1000) {
          state.phase = 'windup';
          state.phaseStartTime = currentTime;
        }
        break;
        
      case 'windup':
        // Windup (positioning) for 0.5 seconds
        if (phaseElapsed >= 500) {
          state.phase = 'execution';
          state.phaseStartTime = currentTime;
        }
        break;
        
      case 'execution':
        // Execute the special move
        if (state.moveType === 'barrage-of-attacks') {
          updateBarrageOfAttacks(attacker, defender, state, stadium, currentTime, deltaTime);
        } else if (state.moveType === 'time-skip') {
          updateTimeSkip(attacker, defender, state, stadium, currentTime, deltaTime);
        }
        
        // Check if execution complete
        if (currentTime >= state.endTime) {
          state.phase = 'complete';
          state.phaseStartTime = currentTime;
        }
        break;
        
      case 'complete':
        // Cleanup and remove
        cleanupCinematicMove(attacker, defender, state);
        activeCinematicMoves.delete(beybladeId);
        break;
    }
  }
  
  // Update damage numbers
  updateDamageNumbers(currentTime, deltaTime);
}

/**
 * Update Barrage of Attacks execution
 */
function updateBarrageOfAttacks(
  attacker: GameBeyblade,
  defender: GameBeyblade | null | undefined,
  state: CinematicMoveState,
  stadium: Stadium,
  currentTime: number,
  deltaTime: number
): void {
  if (!defender || !state.orbitCenter || state.orbitRadius === undefined) return;
  
  // Orbit speed (360 degrees per second)
  const orbitSpeed = 360; // degrees per second
  state.currentAngle = (state.currentAngle || 0) + orbitSpeed * deltaTime;
  
  // Check if we've reached next attack angle
  if (state.nextAttackAngle !== undefined && 
      state.currentAngle >= state.nextAttackAngle &&
      state.attacksPerformed! < state.attackCount!) {
    
    // Perform attack
    performBarrageAttack(attacker, defender, state);
    
    // Move to next attack
    state.attacksPerformed!++;
    if (state.attacksPerformed! < state.attackCount!) {
      state.nextAttackAngle = state.attackAngles![state.attacksPerformed!];
    }
  }
  
  // Position attacker on orbit
  const angleRad = (state.currentAngle || 0) * Math.PI / 180;
  attacker.position.x = state.orbitCenter.x + Math.cos(angleRad) * state.orbitRadius;
  attacker.position.y = state.orbitCenter.y + Math.sin(angleRad) * state.orbitRadius;
  
  // Keep within bounds
  const distFromCenter = Math.sqrt(
    Math.pow(attacker.position.x - stadium.center.x, 2) +
    Math.pow(attacker.position.y - stadium.center.y, 2)
  );
  
  if (distFromCenter > stadium.innerRadius) {
    const angle = Math.atan2(
      attacker.position.y - stadium.center.y,
      attacker.position.x - stadium.center.x
    );
    attacker.position.x = stadium.center.x + Math.cos(angle) * stadium.innerRadius;
    attacker.position.y = stadium.center.y + Math.sin(angle) * stadium.innerRadius;
  }
}

/**
 * Perform single attack in barrage
 */
function performBarrageAttack(
  attacker: GameBeyblade,
  defender: GameBeyblade,
  state: CinematicMoveState
): void {
  // Get damage from orbital attack config or use default
  const baseDamage = 150; // Base spin damage (can be overridden by beyblade stats)
  const damageReduction = 0.7; // Defender takes 70% damage
  const actualDamage = baseDamage * damageReduction;
  
  defender.spin = Math.max(0, defender.spin - actualDamage);
  
  // Show damage number
  showDamageNumber(defender.id, actualDamage, false, defender.position);
  
  // Knockback effect
  const angle = Math.atan2(
    defender.position.y - attacker.position.y,
    defender.position.x - attacker.position.x
  );
  
  defender.velocity.x += Math.cos(angle) * 2;
  defender.velocity.y += Math.sin(angle) * 2;
}

/**
 * Update Time Skip execution
 */
function updateTimeSkip(
  attacker: GameBeyblade,
  defender: GameBeyblade | null | undefined,
  state: CinematicMoveState,
  stadium: Stadium,
  currentTime: number,
  deltaTime: number
): void {
  if (!defender || state.targetLoopRadius === undefined) return;
  
  // Attacker does full-speed loop in outer blue ring
  const loopSpeed = 720; // degrees per second (2 rotations per second)
  state.loopStartAngle = (state.loopStartAngle || 0) + loopSpeed * deltaTime;
  
  const angleRad = state.loopStartAngle * Math.PI / 180;
  attacker.position.x = stadium.center.x + Math.cos(angleRad) * state.targetLoopRadius;
  attacker.position.y = stadium.center.y + Math.sin(angleRad) * state.targetLoopRadius;
  
  // Attacker gains spin while looping
  const spinGain = 30 * deltaTime; // 30 spin per second
  attacker.spin = Math.min(attacker.maxSpin, attacker.spin + spinGain);
  
  // Show heal number occasionally
  if (Math.random() < 0.05) { // 5% chance per frame
    showDamageNumber(attacker.id, spinGain, true, attacker.position);
  }
  
  // Defender loses spin while frozen
  const spinLoss = 50 * deltaTime; // 50 spin per second
  defender.spin = Math.max(0, defender.spin - spinLoss);
  
  // Show damage number occasionally
  if (Math.random() < 0.05) {
    showDamageNumber(defender.id, spinLoss, false, defender.position);
  }
  
  // Keep defender frozen
  defender.velocity.x = 0;
  defender.velocity.y = 0;
}

/**
 * Cleanup after cinematic move
 */
function cleanupCinematicMove(
  attacker: GameBeyblade,
  defender: GameBeyblade | null | undefined,
  state: CinematicMoveState
): void {
  // Restore control (done in shouldLoseControl check)
  
  // Reset velocities if needed
  if (state.moveType === 'time-skip' && defender) {
    defender.velocity.x = 0;
    defender.velocity.y = 0;
  }
}

/**
 * Check if beyblade should lose control
 */
export function shouldLoseControl(beybladeId: string): { loses: boolean; reason?: string } {
  const state = activeCinematicMoves.get(beybladeId);
  
  if (!state) return { loses: false };
  
  // During banner phase, both lose control
  if (state.phase === 'banner' || state.phase === 'windup') {
    return { loses: true, reason: 'Special move activating...' };
  }
  
  // During execution
  if (state.phase === 'execution') {
    if (state.beybladeId === beybladeId) {
      return { 
        loses: state.attackerLosesControl, 
        reason: state.attackerLosesControl ? 'Performing special move...' : undefined 
      };
    }
    
    if (state.targetId === beybladeId) {
      return { 
        loses: state.defenderLosesControl, 
        reason: state.defenderLosesControl ? 'Under special move effect...' : undefined 
      };
    }
  }
  
  return { loses: false };
}

/**
 * Check if any beyblade is affected by a cinematic move
 */
export function isAffectedByCinematicMove(beybladeId: string): boolean {
  for (const state of activeCinematicMoves.values()) {
    if (state.beybladeId === beybladeId || state.targetId === beybladeId) {
      return true;
    }
  }
  return false;
}

/**
 * Get active cinematic move for beyblade
 */
export function getActiveCinematicMove(beybladeId: string): CinematicMoveState | null {
  return activeCinematicMoves.get(beybladeId) || null;
}

/**
 * Get all active cinematic moves (for rendering)
 */
export function getAllActiveCinematicMoves(): CinematicMoveState[] {
  return Array.from(activeCinematicMoves.values());
}

/**
 * Show damage/heal number
 */
export function showDamageNumber(
  beybladeId: string,
  value: number,
  isHeal: boolean,
  position: Vector2D
): void {
  const damageNumber: DamageNumber = {
    id: `damage-${damageNumberIdCounter++}`,
    beybladeId,
    value: Math.round(value),
    isHeal,
    position: { ...position },
    velocity: {
      x: (Math.random() - 0.5) * 1,
      y: -2 - Math.random() * 1, // Float upward
    },
    alpha: 1.0,
    createdAt: Date.now(),
    duration: 2000, // 2 seconds
  };
  
  damageNumbers.push(damageNumber);
}

/**
 * Update damage numbers
 */
function updateDamageNumbers(currentTime: number, deltaTime: number): void {
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const dn = damageNumbers[i];
    const elapsed = currentTime - dn.createdAt;
    
    if (elapsed >= dn.duration) {
      damageNumbers.splice(i, 1);
      continue;
    }
    
    // Update position
    dn.position.x += dn.velocity.x * deltaTime;
    dn.position.y += dn.velocity.y * deltaTime;
    
    // Fade out
    dn.alpha = 1 - (elapsed / dn.duration);
  }
}

/**
 * Get all damage numbers (for rendering)
 */
export function getAllDamageNumbers(): DamageNumber[] {
  return damageNumbers;
}

/**
 * Clear all cinematic moves (for game reset)
 */
export function clearAllCinematicMoves(): void {
  activeCinematicMoves.clear();
  damageNumbers.length = 0;
}
