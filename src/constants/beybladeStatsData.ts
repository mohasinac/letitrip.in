/**
 * Default Beyblade Stats Data
 * Each Beyblade has unique characteristics, special moves, and type distributions
 */

import { BeybladeStats } from '@/types/beybladeStats';

export const DEFAULT_BEYBLADE_STATS: Record<string, BeybladeStats> = {
  'dragoon-gt': {
    id: 'dragoon-gt',
    displayName: 'Dragoon GT',
    fileName: 'dragoon GT.svg',
    type: 'attack',
    spinDirection: 'left',
    mass: 18,
    radius: 42,
    actualSize: 40,
    spinStealFactor: 0.35,
    maxSpin: 3200,
    spinDecayRate: 5,
    typeDistribution: {
      attack: 120, // High attack
      defense: 90,
      stamina: 110,
      total: 320,
    },
    pointsOfContact: [
      { angle: 0, damageMultiplier: 1.8, width: 30 },
      { angle: 120, damageMultiplier: 1.5, width: 25 },
      { angle: 240, damageMultiplier: 1.5, width: 25 },
    ],
    specialMove: {
      id: 'dragon-storm',
      name: 'Dragon Storm',
      description: 'Unleash a devastating spinning storm with 1.5x damage and increased speed for 3 seconds',
      powerCost: 100,
      flags: {
        damageMultiplier: 1.5,
        speedBoost: 1.3,
        duration: 3,
        cooldown: 8,
      },
    },
    speed: 1.5,
  },

  'dran-buster': {
    id: 'dran-buster',
    displayName: 'Dran Buster',
    fileName: 'dran buster.svg',
    type: 'attack',
    spinDirection: 'right',
    mass: 22,
    radius: 44,
    actualSize: 42,
    spinStealFactor: 0.3,
    maxSpin: 3000,
    spinDecayRate: 6,
    typeDistribution: {
      attack: 130, // Highest attack
      defense: 80,
      stamina: 110,
      total: 320,
    },
    pointsOfContact: [
      { angle: 0, damageMultiplier: 2.0, width: 35 },
      { angle: 90, damageMultiplier: 1.6, width: 30 },
      { angle: 180, damageMultiplier: 2.0, width: 35 },
      { angle: 270, damageMultiplier: 1.6, width: 30 },
    ],
    specialMove: {
      id: 'buster-crash',
      name: 'Buster Crash',
      description: 'Massive impact attack dealing 2x damage with knockback immunity for 2.5 seconds',
      powerCost: 100,
      flags: {
        damageMultiplier: 2.0,
        immuneToKnockback: true,
        speedBoost: 1.2,
        duration: 2.5,
        cooldown: 10,
      },
    },
    speed: 1,
  },

  'dranzer-gt': {
    id: 'dranzer-gt',
    displayName: 'Dranzer GT',
    fileName: 'dranzer GT.svg',
    type: 'balanced',
    spinDirection: 'right',
    mass: 20,
    radius: 40,
    actualSize: 38,
    spinStealFactor: 0.4,
    maxSpin: 3500,
    spinDecayRate: 4,
    typeDistribution: {
      attack: 110,
      defense: 110,
      stamina: 100,
      total: 320,
    },
    pointsOfContact: [
      { angle: 45, damageMultiplier: 1.6, width: 30 },
      { angle: 135, damageMultiplier: 1.4, width: 25 },
      { angle: 225, damageMultiplier: 1.6, width: 30 },
      { angle: 315, damageMultiplier: 1.4, width: 25 },
    ],
    specialMove: {
      id: 'flame-shield',
      name: 'Flame Shield',
      description: 'Creates a fiery barrier reflecting 30% damage back and reducing incoming damage by 40% for 4 seconds',
      powerCost: 100,
      flags: {
        damageReduction: 0.4,
        reflectDamage: 0.3,
        duration: 4,
        cooldown: 12,
      },
    },
    speed: 1,
  },

  'hells-hammer': {
    id: 'hells-hammer',
    displayName: 'Hells Hammer',
    fileName: 'hells hammer.svg',
    type: 'defense',
    spinDirection: 'right',
    mass: 25, // Heaviest
    radius: 46,
    actualSize: 44,
    spinStealFactor: 0.25,
    maxSpin: 3800,
    spinDecayRate: 3,
    typeDistribution: {
      attack: 90,
      defense: 140, // Highest defense
      stamina: 90,
      total: 320,
    },
    pointsOfContact: [
      { angle: 0, damageMultiplier: 1.7, width: 40 },
      { angle: 180, damageMultiplier: 1.7, width: 40 },
    ],
    specialMove: {
      id: 'iron-fortress',
      name: 'Iron Fortress',
      description: 'Become an immovable fortress taking 50% less damage and immune to all knockbacks for 5 seconds',
      powerCost: 100,
      flags: {
        damageReduction: 0.5,
        immuneToKnockback: true,
        duration: 5,
        cooldown: 15,
      },
    },
    speed: 1,
  },

  'meteo': {
    id: 'meteo',
    displayName: 'Meteo L-Drago',
    fileName: 'meteo.svg',
    type: 'stamina',
    spinDirection: 'left',
    mass: 17,
    radius: 41,
    actualSize: 39,
    spinStealFactor: 0.75, // Highest spin steal (rubber)
    maxSpin: 4000, // Highest max spin
    spinDecayRate: 3.5,
    typeDistribution: {
      attack: 90,
      defense: 90,
      stamina: 140, // Highest stamina
      total: 320,
    },
    pointsOfContact: [
      { angle: 60, damageMultiplier: 1.3, width: 40 },
      { angle: 180, damageMultiplier: 1.4, width: 35 },
      { angle: 300, damageMultiplier: 1.3, width: 40 },
    ],
    specialMove: {
      id: 'absorb-mode',
      name: 'Absorb Mode',
      description: 'Activate rubber absorption increasing spin steal by 2x and healing 15 spin/sec for 3 seconds',
      powerCost: 100,
      flags: {
        spinStealMultiplier: 2.0,
        healSpin: 15,
        duration: 3,
        cooldown: 10,
      },
    },
    speed: 1,
  },

  'pegasus': {
    id: 'pegasus',
    displayName: 'Storm Pegasus',
    fileName: 'pegasus.svg',
    type: 'attack',
    spinDirection: 'right',
    mass: 19,
    radius: 40,
    actualSize: 38,
    spinStealFactor: 0.35,
    maxSpin: 3300,
    spinDecayRate: 5.5,
    typeDistribution: {
      attack: 125,
      defense: 85,
      stamina: 110,
      total: 320,
    },
    pointsOfContact: [
      { angle: 0, damageMultiplier: 1.9, width: 28 },
      { angle: 72, damageMultiplier: 1.5, width: 25 },
      { angle: 144, damageMultiplier: 1.5, width: 25 },
      { angle: 216, damageMultiplier: 1.5, width: 25 },
      { angle: 288, damageMultiplier: 1.5, width: 25 },
    ],
    specialMove: {
      id: 'pegasus-rush',
      name: 'Pegasus Star Blast',
      description: 'Lightning-fast rush attack with 1.6x damage and 1.5x speed for 3 seconds',
      powerCost: 100,
      flags: {
        damageMultiplier: 1.6,
        speedBoost: 1.5,
        duration: 3,
        cooldown: 9,
      },
    },
    speed: 1.5,
  },

  'spriggan': {
    id: 'spriggan',
    displayName: 'Legend Spriggan',
    fileName: 'spriggan.svg',
    type: 'balanced',
    spinDirection: 'left',
    mass: 21,
    radius: 43,
    actualSize: 41,
    spinStealFactor: 0.5, // Good spin steal (dual rotation)
    maxSpin: 3600,
    spinDecayRate: 4.5,
    typeDistribution: {
      attack: 105,
      defense: 115,
      stamina: 100,
      total: 320,
    },
    pointsOfContact: [
      { angle: 30, damageMultiplier: 1.7, width: 32 },
      { angle: 90, damageMultiplier: 1.5, width: 28 },
      { angle: 150, damageMultiplier: 1.7, width: 32 },
      { angle: 210, damageMultiplier: 1.7, width: 32 },
      { angle: 270, damageMultiplier: 1.5, width: 28 },
      { angle: 330, damageMultiplier: 1.7, width: 32 },
    ],
    specialMove: {
      id: 'counter-break',
      name: 'Counter Break',
      description: 'After taking a hit, become invincible and perform a devastating loop counter-attack for 2 seconds',
      powerCost: 100,
      flags: {
        damageImmune: true,
        counterAttack: true,
        performLoop: true,
        damageMultiplier: 1.8,
        duration: 2,
        cooldown: 12,
      },
    },
    speed: 1,
  },

  'valkyrie': {
    id: 'valkyrie',
    displayName: 'Victory Valkyrie',
    fileName: 'valkyrie.svg',
    type: 'attack',
    spinDirection: 'right',
    mass: 20,
    radius: 41,
    actualSize: 39,
    spinStealFactor: 0.32,
    maxSpin: 3100,
    spinDecayRate: 6,
    typeDistribution: {
      attack: 135, // Very high attack
      defense: 75,
      stamina: 110,
      total: 320,
    },
    pointsOfContact: [
      { angle: 0, damageMultiplier: 2.1, width: 32 }, // Strongest blade
      { angle: 120, damageMultiplier: 1.7, width: 28 },
      { angle: 240, damageMultiplier: 1.7, width: 28 },
    ],
    specialMove: {
      id: 'victory-rush',
      name: 'Victory Rush',
      description: 'Unleash maximum power dealing 2.2x damage with extreme speed boost for 2.5 seconds',
      powerCost: 100, // Requires full power bar
      flags: {
        damageMultiplier: 2.2,
        speedBoost: 1.7,
        duration: 2.5,
        cooldown: 15,
      },
    },
    speed: 1.5,
  },
};

/**
 * Get Beyblade stats by ID
 */
export function getBeybladeStats(id: string): BeybladeStats | null {
  return DEFAULT_BEYBLADE_STATS[id] || null;
}

/**
 * Get all Beyblade IDs
 */
export function getAllBeybladeIds(): string[] {
  return Object.keys(DEFAULT_BEYBLADE_STATS);
}

/**
 * Get Beyblades by type
 */
export function getBeybladesByType(type: 'attack' | 'defense' | 'stamina' | 'balanced'): BeybladeStats[] {
  return Object.values(DEFAULT_BEYBLADE_STATS).filter(bey => bey.type === type);
}
