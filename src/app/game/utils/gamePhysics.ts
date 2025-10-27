import { Vector2D, GameBeyblade, Stadium, CollisionResult } from '../types/game';

// Vector utilities
export const vectorAdd = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const vectorSubtract = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const vectorMultiply = (v: Vector2D, scalar: number): Vector2D => ({
  x: v.x * scalar,
  y: v.y * scalar,
});

export const vectorLength = (v: Vector2D): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

export const vectorNormalize = (v: Vector2D): Vector2D => {
  const length = vectorLength(v);
  if (length === 0) return { x: 0, y: 0 };
  return { x: v.x / length, y: v.y / length };
};

export const vectorDistance = (a: Vector2D, b: Vector2D): number => {
  return vectorLength(vectorSubtract(a, b));
};

export const vectorDot = (a: Vector2D, b: Vector2D): number => {
  return a.x * b.x + a.y * b.y;
};

// Physics calculations
export const checkCollision = (bey1: GameBeyblade, bey2: GameBeyblade): boolean => {
  const distance = vectorDistance(bey1.position, bey2.position);
  return distance < (bey1.radius + bey2.radius);
};

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

// New collision mechanics based on spin direction and acceleration
export const resolveCollisionWithAcceleration = (bey1: GameBeyblade, bey2: GameBeyblade): void => {
  const distance = vectorDistance(bey1.position, bey2.position);
  const normal = vectorNormalize(vectorSubtract(bey2.position, bey1.position));
  
  // Check spin directions
  const bey1SpinDirection = bey1.config.direction === "left" ? -1 : 1;
  const bey2SpinDirection = bey2.config.direction === "left" ? -1 : 1;
  const isOppositeSpins = bey1SpinDirection !== bey2SpinDirection;
  
  let damage1 = 0;
  let damage2 = 0;
  
  if (isOppositeSpins) {
    // Opposite spin collision: Both get average spin + their acceleration
    const avgSpin = (bey1.spin + bey2.spin) / 2;
    const newSpin1 = avgSpin + bey1.acceleration;
    const newSpin2 = avgSpin + bey2.acceleration;
    
    // Calculate damage: average of accelerations plus the other's acceleration
    const avgAcceleration = Math.floor((bey1.acceleration + bey2.acceleration) / 2);
    damage1 = avgAcceleration + bey2.acceleration;
    damage2 = avgAcceleration + bey1.acceleration;
    
    // Apply new spins and damage
    bey1.spin = Math.max(0, newSpin1 - damage1);
    bey2.spin = Math.max(0, newSpin2 - damage2);
  } else {
    // Same spin collision: Damage = difference of accelerations + opposite bey's acceleration
    const accelerationDiff = Math.abs(bey1.acceleration - bey2.acceleration);
    damage1 = accelerationDiff + bey2.acceleration;
    damage2 = accelerationDiff + bey1.acceleration;
    
    // Apply damage
    bey1.spin = Math.max(0, bey1.spin - damage1);
    bey2.spin = Math.max(0, bey2.spin - damage2);
  }
  
  // Collision knockback - move beyblades in opposite directions by damage amount
  const knockback1 = vectorMultiply(normal, -damage1);
  const knockback2 = vectorMultiply(normal, damage2);
  
  // Apply knockback to positions
  bey1.position = vectorAdd(bey1.position, knockback1);
  bey2.position = vectorAdd(bey2.position, knockback2);
  
  // Apply velocity changes for collision response
  const velocityTransfer = 40;
  const velocityKnockback1 = vectorMultiply(knockback1, velocityTransfer * 0.01);
  const velocityKnockback2 = vectorMultiply(knockback2, velocityTransfer * 0.01);
  
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

// Helper function to check if beyblade is in a specific zone segment (3 segments total)
export const getZoneSegment = (position: Vector2D, center: Vector2D): number => {
  const angle = Math.atan2(position.y - center.y, position.x - center.x);
  // Convert to 0-2π range
  const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
  // Divide into 3 segments
  const segmentSize = (Math.PI * 2) / 3;
  return Math.floor(normalizedAngle / segmentSize);
};

// Check if beyblade hits walls or exits stadium with 3-segment zones
export const checkStadiumBoundsSegmented = (beyblade: GameBeyblade, stadium: Stadium): void => {
  const distanceFromCenter = vectorDistance(beyblade.position, stadium.center);
  const segment = getZoneSegment(beyblade.position, stadium.center);
  
  // Check if beyblade crosses yellow exit zone (3 segments)
  if (distanceFromCenter + beyblade.radius > stadium.exitRadius) {
    beyblade.isOutOfBounds = true;
    beyblade.isDead = true;
    return;
  }
  
  // Check if beyblade hits red wall zone (3 segments)
  if (distanceFromCenter + beyblade.radius > stadium.outerRadius) {
    // Bounce off red wall
    const direction = vectorNormalize(vectorSubtract(beyblade.position, stadium.center));
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

export const updateBeyblade = (beyblade: GameBeyblade, deltaTime: number, stadium: Stadium): void => {
  if (beyblade.isDead || beyblade.isOutOfBounds) return;
  
  // Apply friction/air resistance
  const friction = 0.98;
  beyblade.velocity = vectorMultiply(beyblade.velocity, friction);
  
  // Update position
  beyblade.position = vectorAdd(
    beyblade.position, 
    vectorMultiply(beyblade.velocity, deltaTime)
  );
  
  // Update rotation based on spin and direction
  const rotationSpeed = (beyblade.spin / 100) * beyblade.config.speed * 0.1;
  beyblade.rotation += (beyblade.config.direction === 'right' ? rotationSpeed : -rotationSpeed) * deltaTime;
  
  // Decay spin
  beyblade.spin = Math.max(0, beyblade.spin - beyblade.spinDecayRate * deltaTime);
  
  // Check if beyblade dies
  if (beyblade.spin <= 0) {
    beyblade.isDead = true;
    beyblade.velocity = { x: 0, y: 0 };
  }
  
  // Check stadium bounds
  checkStadiumBoundsSegmented(beyblade, stadium);
  
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
  const force = vectorMultiply(vectorNormalize(direction), power * 200);
  
  beyblade.velocity = vectorAdd(beyblade.velocity, force);
  
  // Lose spin based on power used
  const spinCost = beyblade.chargeLevel * 0.2;
  beyblade.spin = Math.max(0, beyblade.spin - spinCost);
  
  beyblade.chargeLevel = 0;
  beyblade.isCharging = false;
};

export const createBeyblade = (
  id: string, 
  name: string, 
  position: Vector2D, 
  isPlayer: boolean = false
): GameBeyblade => {
  // Import beyblade config
  const beybladeConfigs = {
    'dg-gt': { name: 'DG GT', fileName: 'dg gt.svg', direction: 'right' as const, speed: 1.8 },
    'dragoon-gt': { name: 'Dragoon GT', fileName: 'dragoon-gt.svg', direction: 'right' as const, speed: 2 },
    'dran-buster': { name: 'Dran Buster', fileName: 'dran buster.svg', direction: 'left' as const, speed: 1.2 },
    'dz-gt': { name: 'DZ GT', fileName: 'dz gt.svg', direction: 'left' as const, speed: 1.6 },
    'hells-hammer': { name: 'Hells Hammer', fileName: 'hells hammer.svg', direction: 'right' as const, speed: 1.8 },
    'meteo': { name: 'Meteo', fileName: 'meteo.svg', direction: 'left' as const, speed: 1.3 },
    'pegasus': { name: 'Pegasus', fileName: 'pegasus.svg', direction: 'right' as const, speed: 1.7 },
    'spriggan': { name: 'Spriggan', fileName: 'spriggan.svg', direction: 'left' as const, speed: 1.9 },
    'valkyrie': { name: 'Valkyrie', fileName: 'valkyrie.svg', direction: 'right' as const, speed: 1.4 },
  };

  const config = beybladeConfigs[name as keyof typeof beybladeConfigs] || beybladeConfigs['dragoon-gt'];
  
  return {
    id,
    name,
    config,
    position,
    velocity: { x: 0, y: 0 },
    rotation: 0,
    spin: 1000, // Changed to 1000 max
    maxSpin: 1000,
    spinDecayRate: 10, // spin lost per second
    mass: 1,
    radius: 30,
    acceleration: 0, // Track current acceleration
    isCharging: false,
    chargeLevel: 0,
    isOutOfBounds: false,
    isDead: false,
    isPlayer,
    isInBlueLoop: false,
    blueLoopAngle: 0,
    blueCircleLoopStartTime: undefined,
    blueLoopCooldownEnd: undefined, // Track when blue loop cooldown ends
  };
};
