import { GameBeyblade, Stadium, Vector2D } from '../types/game';
import { BEYBLADE_CONFIGS } from '@/constants/beyblades';
import { getBeybladeStats } from '@/constants/beybladeStatsData';
import { calculateTypeBonuses } from '@/types/beybladeStats';
import { vectorLength, vectorSubtract, vectorAdd, vectorMultiply } from './vectorUtils';

/**
 * Beyblade creation and physics utilities
 */

export const createBeyblade = (
  id: string, 
  name: string, 
  position: Vector2D, 
  isPlayer: boolean = false
): GameBeyblade => {
  const config = BEYBLADE_CONFIGS[name] || BEYBLADE_CONFIGS['dragoon-gt'];
  const stats = getBeybladeStats(name);
  
  // Use stats if available, otherwise use defaults
  const mass = stats?.mass || 20;
  const radius = stats?.radius || 40;
  const maxSpin = stats?.maxSpin || 2000;
  const spinDecayRate = stats?.spinDecayRate || 5;
  
  return {
    id,
    name,
    config,
    position,
    velocity: { x: 0, y: 0 },
    rotation: 20,
    spin: maxSpin,
    maxSpin,
    spinDecayRate,
    mass,
    radius,
    acceleration: 0,
    isCharging: false,
    chargeLevel: 0,
    isOutOfBounds: false,
    isDead: false,
    isPlayer,
    power: 0, // Initialize power system (0-25 max)
    isInBlueLoop: false,
    blueLoopAngle: 0,
    blueCircleLoopStartTime: undefined,
    blueLoopCooldownEnd: undefined,
    normalLoopCooldownEnd: undefined,
    isInNormalLoop: false,
    normalLoopStartTime: undefined,
    normalLoopAngle: undefined,
    normalLoopStartAngle: undefined,
    isChargingToPoint: false,
    chargePoint: null,
    isChargeDashing: false,
    chargeDashEndTime: undefined,
    currentMaxAcceleration: 15,
    accelerationDecayStartTime: undefined,
    selectedChargePointAngle: undefined,
    
    // Special Attacks & Dodges
    heavyAttackActive: false,
    heavyAttackEndTime: undefined,
    ultimateAttackActive: false,
    ultimateAttackEndTime: undefined,
    dodgeCooldownEnd: undefined,
    lastDodgeTime: undefined,
    isDodging: false,
    selectedChargePoint: null,
  };
};

export const updateBeyblade = (beyblade: GameBeyblade, deltaTime: number, stadium: Stadium): void => {
  if (beyblade.isDead || beyblade.isOutOfBounds) return;
  
  const stats = getBeybladeStats(beyblade.name);
  
  // Apply friction/air resistance (reduced for faster movement)
  const friction = 0.985;
  beyblade.velocity = vectorMultiply(beyblade.velocity, friction);
  
  // Enhanced movement based on acceleration and velocity
  const accelerationMultiplier = 1 + (beyblade.acceleration / 20);
  const enhancedVelocity = vectorMultiply(beyblade.velocity, accelerationMultiplier);
  
  // Update position with enhanced velocity
  beyblade.position = vectorAdd(
    beyblade.position, 
    vectorMultiply(enhancedVelocity, deltaTime)
  );
  
  // Update rotation based on spin and direction (enhanced rotation speed)
  const rotationSpeed = (beyblade.spin / 80) * beyblade.config.speed * 0.15;
  beyblade.rotation += (beyblade.config.direction === 'right' ? rotationSpeed : -rotationSpeed) * deltaTime;
  
  // Decay spin with stamina bonus
  let decayRate = beyblade.spinDecayRate;
  if (stats) {
    const bonuses = calculateTypeBonuses(stats.typeDistribution);
    // Higher stamina = slower decay (invert the multiplier)
    decayRate = decayRate / bonuses.staminaMultiplier;
  }
  beyblade.spin = Math.max(0, beyblade.spin - decayRate * deltaTime);
  
  // Check if beyblade dies
  if (beyblade.spin <= 0) {
    beyblade.isDead = true;
    beyblade.velocity = { x: 0, y: 0 };
  }
  
  // Update charging
  if (beyblade.isCharging) {
    beyblade.chargeLevel = Math.min(100, beyblade.chargeLevel + 50 * deltaTime);
  } else {
    beyblade.chargeLevel = Math.max(0, beyblade.chargeLevel - 30 * deltaTime);
  }
};

export const launchPowerAttack = (beyblade: GameBeyblade, direction: Vector2D): void => {
  if (beyblade.chargeLevel < 20) return; // Need minimum charge
  
  const power = beyblade.chargeLevel / 100;
  const normalizedDirection = {
    x: direction.x / vectorLength(direction) || 0,
    y: direction.y / vectorLength(direction) || 0,
  };
  const force = vectorMultiply(normalizedDirection, power * 200);
  
  beyblade.velocity = vectorAdd(beyblade.velocity, force);
  
  // Lose spin based on power used
  const spinCost = beyblade.chargeLevel * 0.2;
  beyblade.spin = Math.max(0, beyblade.spin - spinCost);
  
  beyblade.chargeLevel = 0;
  beyblade.isCharging = false;
};

// Helper function to check if beyblade is in a specific zone segment
export const getZoneSegment = (position: Vector2D, center: Vector2D): number => {
  const angle = Math.atan2(position.y - center.y, position.x - center.x);
  // Convert to 0-2π range
  const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
  // Divide into 3 segments
  const segmentSize = (Math.PI * 2) / 3;
  return Math.floor(normalizedAngle / segmentSize);
};

// Check if beyblade hits walls or exits stadium
export const checkStadiumBounds = (beyblade: GameBeyblade, stadium: Stadium): void => {
  const distanceFromCenter = vectorLength(vectorSubtract(beyblade.position, stadium.center));
  
  // Check if beyblade crosses exit zone
  if (distanceFromCenter + beyblade.radius > stadium.exitRadius) {
    beyblade.isOutOfBounds = true;
    beyblade.isDead = true;
    return;
  }
  
  // Check if beyblade hits wall zone
  if (distanceFromCenter + beyblade.radius > stadium.outerRadius) {
    // Bounce off wall
    const direction = {
      x: (beyblade.position.x - stadium.center.x) / distanceFromCenter,
      y: (beyblade.position.y - stadium.center.y) / distanceFromCenter,
    };
    
    const newPosition = vectorAdd(
      stadium.center, 
      vectorMultiply(direction, stadium.outerRadius - beyblade.radius)
    );
    
    beyblade.position = newPosition;
    
    // Reverse velocity component perpendicular to wall
    const bounceStrength = 0.6;
    beyblade.velocity = vectorMultiply(beyblade.velocity, -bounceStrength);
    
    // Lose spin: 10 * acceleration damage
    const wallDamage = 10 * beyblade.acceleration;
    beyblade.spin = Math.max(0, beyblade.spin - wallDamage);
  }
};
