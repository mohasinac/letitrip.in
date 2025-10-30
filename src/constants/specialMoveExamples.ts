/**
 * Example Special Move Configurations
 * Demonstrates how to use flags to create complex cinematic special moves
 */

import { SpecialMove } from '@/types/beybladeStats';

/**
 * EXAMPLE 1: Barrage of Attacks
 * - Bey orbits around opponent at 4x radius
 * - Attacks at every 120° (3 attacks total)
 * - Opponent takes reduced damage
 * - User maintains control, opponent loses control
 */
export const BARRAGE_OF_ATTACKS: SpecialMove = {
  id: 'barrage-of-attacks',
  name: 'Barrage of Attacks',
  description: 'Orbit around your opponent and unleash a devastating flurry of strikes!',
  powerCost: 100,
  category: 'offensive',
  flags: {
    // Orbital attack configuration
    orbitalAttack: {
      enabled: true,
      orbitRadius: 4, // 4x the Beyblade's own radius
      attackCount: 3, // 3 attacks at 120° intervals (360/3)
      damagePerHit: 200, // 200 spin damage per hit
      orbitSpeed: 2.5, // 2.5x normal speed during orbit
    },
    
    // Control configuration
    opponentLosesControl: true, // Opponent cannot move
    freezeOpponent: false, // But not completely frozen (can rotate)
    
    // Opponent takes reduced damage from orbital attacks
    damageReduction: 0.3, // Opponent has 30% damage reduction
    
    // User properties during move
    speedBoost: 1.8, // User moves 80% faster
    phasing: false, // User can still collide
    
    // Cinematic effects
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: true,
        timeScale: 0.7, // 70% game speed
        duration: 0.5, // First 0.5 seconds in slow-mo
      },
      cameraShake: {
        enabled: true,
        intensity: 3,
        duration: 3, // Shake during entire move
      },
      screenFlash: {
        enabled: true,
        color: '#ff4444',
        intensity: 0.3,
        duration: 0.2,
      },
      soundEffect: 'barrage-whoosh',
    },
    
    duration: 3, // 3 seconds to complete orbit and attacks
    cooldown: 15, // 15 second cooldown
  },
};

/**
 * EXAMPLE 2: Time Skip
 * - Opponent freezes and is repositioned
 * - User loops at full speed in outer ring
 * - Charge points don't trigger
 * - Opponent loses spin when time resumes
 */
export const TIME_SKIP: SpecialMove = {
  id: 'time-skip',
  name: 'Time Skip',
  description: 'Freeze time, reposition your opponent, and drain their power!',
  powerCost: 100,
  category: 'ultimate',
  flags: {
    // Time manipulation configuration
    timeSkip: {
      enabled: true,
      freezeDuration: 3, // Opponent frozen for 3 seconds
      
      // Reposition opponent away from charge dash line
      repositionOpponent: {
        enabled: true,
        direction: 'center', // Move toward center
        distance: 4, // 4x opponent's radius toward center
      },
      
      // User loops in outer ring
      loopRing: {
        enabled: true,
        ringType: 'outer', // Outer blue ring (charge dash ring)
        duration: 3, // 3 seconds at full speed
        disableChargePoints: true, // Don't trigger charge points
      },
      
      // Opponent loses spin when time resumes
      spinDrainOnEnd: 400, // Flat 400 spin loss
    },
    
    // Control configuration
    opponentLosesControl: true, // Opponent cannot control
    freezeOpponent: true, // Opponent completely frozen
    userLosesControl: false, // User can still control during loop (or auto-loop)
    
    // User gets speed boost for the loop
    speedBoost: 2.0, // Double speed
    
    // Cinematic effects
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: true,
        timeScale: 0.3, // 30% game speed
        duration: 1, // First second in heavy slow-mo
      },
      cameraShake: {
        enabled: false, // No shake for time manipulation
        intensity: 0,
        duration: 0,
      },
      screenFlash: {
        enabled: true,
        color: '#00ffff', // Cyan flash for time effect
        intensity: 0.5,
        duration: 0.3,
      },
      soundEffect: 'time-stop',
    },
    
    duration: 3, // 3 seconds total
    cooldown: 20, // 20 second cooldown
  },
};

/**
 * EXAMPLE 3: Storm Fury (Rush Attack)
 * - Multiple rapid dashes with visual trails
 * - Damage on each dash hit
 * - User maintains control
 */
export const STORM_FURY: SpecialMove = {
  id: 'storm-fury',
  name: 'Storm Fury',
  description: 'Unleash a storm of rapid dashes that devastate your opponent!',
  powerCost: 100,
  category: 'offensive',
  flags: {
    rushAttack: {
      enabled: true,
      dashCount: 5, // 5 rapid dashes
      dashSpeed: 3.0, // 3x speed per dash
      damagePerDash: 150, // 150 spin damage per hit
      trailEffect: true, // Leave visual trails
    },
    
    damageMultiplier: 1.5, // 50% more damage during move
    userLosesControl: false, // User can steer between dashes
    
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: false,
        timeScale: 1.0,
        duration: 0,
      },
      cameraShake: {
        enabled: true,
        intensity: 5,
        duration: 2,
      },
      screenFlash: {
        enabled: true,
        color: '#ffff00',
        intensity: 0.2,
        duration: 0.1,
      },
      soundEffect: 'rush-attack',
    },
    
    duration: 2, // 2 seconds of rapid dashing
    cooldown: 12,
  },
};

/**
 * EXAMPLE 4: Fortress Shield (Ultimate Defense)
 * - Complete damage immunity
 * - Reflects damage back
 * - Pushes enemies away
 * - Heals spin over time
 */
export const FORTRESS_SHIELD: SpecialMove = {
  id: 'fortress-shield',
  name: 'Fortress Shield',
  description: 'Create an impenetrable shield that reflects attacks and heals!',
  powerCost: 100,
  category: 'defensive',
  flags: {
    shieldDome: {
      enabled: true,
      absorbDamage: true, // No damage taken
      reflectPercentage: 0.5, // Reflect 50% of damage back
      pushRadius: 100, // Push enemies 100px away
      healPerSecond: 100, // Heal 100 spin per second
    },
    
    cannotMove: true, // User cannot move (rooted in place)
    damageImmune: true, // Complete immunity
    visualScale: 1.3, // Appear 30% larger
    
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: false,
        timeScale: 1.0,
        duration: 0,
      },
      cameraShake: {
        enabled: false,
        intensity: 0,
        duration: 0,
      },
      screenFlash: {
        enabled: true,
        color: '#0066ff',
        intensity: 0.4,
        duration: 0.3,
      },
      soundEffect: 'shield-activate',
    },
    
    duration: 4, // 4 seconds of shielding
    cooldown: 18,
  },
};

/**
 * EXAMPLE 5: Berserk Rampage (High Risk, High Reward)
 * - Massive damage and speed boost
 * - But take more damage (glass cannon)
 * - Intense visual effects
 */
export const BERSERK_RAMPAGE: SpecialMove = {
  id: 'berserk-rampage',
  name: 'Berserk Rampage',
  description: 'Go berserk with insane power, but at the cost of your defense!',
  powerCost: 100,
  category: 'offensive',
  flags: {
    berserkMode: {
      enabled: true,
      damageBoost: 2.5, // 2.5x damage
      speedBoost: 1.8, // 1.8x speed
      defenseReduction: 0.5, // Take 2x damage (50% reduction = take double)
      visualIntensity: 3.0, // Max visual intensity
    },
    
    radiusMultiplier: 1.2, // Slightly larger hitbox
    userLosesControl: false, // User controls the rampage
    
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: false,
        timeScale: 1.0,
        duration: 0,
      },
      cameraShake: {
        enabled: true,
        intensity: 8, // Heavy shake
        duration: 5,
      },
      screenFlash: {
        enabled: true,
        color: '#ff0000',
        intensity: 0.6,
        duration: 0.2,
      },
      soundEffect: 'berserk-roar',
    },
    
    duration: 5, // 5 seconds of pure chaos
    cooldown: 20,
  },
};

/**
 * EXAMPLE 6: Vortex Drain (Stamina Special)
 * - Pulls opponents in
 * - Steals their spin continuously
 * - Heals from stolen spin
 * - Slows opponents
 */
export const VORTEX_DRAIN: SpecialMove = {
  id: 'vortex-drain',
  name: 'Vortex Drain',
  description: 'Create a vortex that drains power from all nearby Beyblades!',
  powerCost: 100,
  category: 'utility',
  flags: {
    vortexMode: {
      enabled: true,
      pullRadius: 200, // Pull enemies within 200px
      spinStealRate: 80, // Steal 80 spin per second from each nearby enemy
      healFromSteal: true, // Heal from stolen spin
      slowOpponents: 0.7, // Opponents move at 70% speed (30% slower)
    },
    
    gravityPull: 200, // Also use gravity pull system
    spinStealMultiplier: 2.0, // 2x spin steal on contact
    
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: false,
        timeScale: 1.0,
        duration: 0,
      },
      cameraShake: {
        enabled: false,
        intensity: 0,
        duration: 0,
      },
      screenFlash: {
        enabled: true,
        color: '#9900ff',
        intensity: 0.3,
        duration: 0.4,
      },
      soundEffect: 'vortex-drain',
    },
    
    duration: 6, // 6 seconds of draining
    cooldown: 16,
  },
};

/**
 * EXAMPLE 7: Phantom Strike (Stealth Attack)
 * - Become semi-invisible
 * - Phase through everything
 * - Teleport on hit
 */
export const PHANTOM_STRIKE: SpecialMove = {
  id: 'phantom-strike',
  name: 'Phantom Strike',
  description: 'Fade into the shadows and strike from nowhere!',
  powerCost: 100,
  category: 'offensive',
  flags: {
    phantomMode: {
      enabled: true,
      opacity: 0.3, // 30% opacity (mostly invisible)
      phaseThrough: true, // Pass through walls and Beyblades
      teleportOnHit: {
        enabled: true,
        distance: 150, // Teleport 150px away after hitting
        direction: 'behind', // Teleport behind opponent
      },
    },
    
    phasing: true, // Also use phasing flag
    speedBoost: 1.5, // 50% faster
    damageMultiplier: 2.0, // 2x damage from stealth
    
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: true,
        timeScale: 0.5,
        duration: 1,
      },
      cameraShake: {
        enabled: false,
        intensity: 0,
        duration: 0,
      },
      screenFlash: {
        enabled: true,
        color: '#000000',
        intensity: 0.7, // Dark flash
        duration: 0.3,
      },
      soundEffect: 'phantom-vanish',
    },
    
    duration: 4, // 4 seconds of stealth
    cooldown: 14,
  },
};

/**
 * EXAMPLE 8: Supernova (Ultimate Explosion)
 * - Massive area damage
 * - Huge knockback
 * - Self-damage (recoil)
 * - Intense cinematic effects
 */
export const SUPERNOVA: SpecialMove = {
  id: 'supernova',
  name: 'Supernova',
  description: 'Release all your power in a devastating explosion!',
  powerCost: 100,
  category: 'ultimate',
  flags: {
    explosion: {
      enabled: true,
      explosionRadius: 250, // Huge 250px radius
      explosionDamage: 500, // 500 spin damage
      knockbackForce: 3.0, // 3x knockback
      selfDamage: 200, // Take 200 spin damage as recoil
    },
    
    cannotMove: true, // Rooted during charging
    radiusMultiplier: 1.5, // Visual expansion
    visualScale: 2.0, // 2x visual size at explosion
    
    cinematicSettings: {
      showBanner: true,
      slowMotion: {
        enabled: true,
        timeScale: 0.2, // 20% speed (heavy slow-mo)
        duration: 2, // 2 seconds slow-mo
      },
      cameraShake: {
        enabled: true,
        intensity: 10, // Maximum shake
        duration: 2,
      },
      screenFlash: {
        enabled: true,
        color: '#ffffff',
        intensity: 0.9, // Near-white flash
        duration: 0.5,
      },
      soundEffect: 'supernova-explosion',
    },
    
    duration: 2, // 2 second charge before explosion
    cooldown: 25, // Long cooldown
  },
};

/**
 * Export all example moves
 */
export const EXAMPLE_SPECIAL_MOVES = {
  BARRAGE_OF_ATTACKS,
  TIME_SKIP,
  STORM_FURY,
  FORTRESS_SHIELD,
  BERSERK_RAMPAGE,
  VORTEX_DRAIN,
  PHANTOM_STRIKE,
  SUPERNOVA,
};

/**
 * Helper function to create a custom special move
 */
export function createCustomSpecialMove(
  id: string,
  name: string,
  description: string,
  flags: Partial<import('@/types/beybladeStats').SpecialMoveFlags>
): SpecialMove {
  return {
    id,
    name,
    description,
    powerCost: 100,
    category: 'ultimate',
    flags: {
      duration: flags.duration || 3,
      cooldown: flags.cooldown || 15,
      ...flags,
    } as any,
  };
}
