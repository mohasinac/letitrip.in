# Arena Feature State Tracking System

## Overview

The game server now tracks detailed state for **all arena features**, including which beyblades are using them, destruction status, damage dealt, and usage statistics.

## 🎯 State Classes

### 1. LoopState

Tracks beyblades using loops and loop statistics.

```typescript
class LoopState {
  loopIndex: number; // Which loop (0, 1, 2...)
  radius: number; // em units
  shape: string; // circle, rectangle, pentagon, etc.
  speedBoost: number; // 1.0 - 2.0x
  spinBoost: number; // Spin recovery per second
  frictionMultiplier: number; // 0.5 - 1.5
  beybladeIds: string[]; // Currently in loop
  totalBeybladesPassed: number; // Lifetime count
  lastEntryTime: number; // Timestamp
}
```

**Usage**:

- Tracks which beyblades are currently in each loop
- Stores loop configuration for quick access
- Counts total usage for analytics

### 2. ObstacleState

Tracks obstacle health, collisions, and destruction.

```typescript
class ObstacleState {
  obstacleId: string;
  obstacleIndex: number;
  type: string; // rock, pillar, barrier, wall
  x: number; // em units
  y: number; // em units
  radius: number; // em units
  destructible: boolean;
  isDestroyed: boolean; // 💥 Can be destroyed!
  health: number; // Current health
  maxHealth: number;
  damage: number; // Damage on collision
  recoil: number; // Knockback force
  lastHitBy: string; // Beyblade ID
  lastHitTime: number;
  totalCollisions: number; // Lifetime count
  totalDamageDealt: number; // To beyblades
}
```

**Usage**:

- Destructible obstacles can be destroyed by attacks
- Tracks collision count and damage statistics
- Shows last beyblade that hit it

### 3. PitState

Tracks pit traps and trapped beyblades.

```typescript
class PitState {
  pitId: string;
  pitIndex: number;
  x: number; // em units
  y: number; // em units
  radius: number; // em units
  damagePerSecond: number; // Percentage
  escapeChance: number; // 0-1
  trappedBeybladeId: string; // 🕳️ Only 1 beyblade per pit!
  trapStartTime: number;
  totalDamageDealt: number;
  totalTraps: number; // Lifetime trap count
  totalEscapes: number; // Successful escapes
}
```

**Usage**:

- **Only one beyblade can be in a pit at a time**
- Tracks trap duration and escape attempts
- Records damage dealt to trapped beyblades

### 4. LaserGunState

Tracks turret status, targeting, and firing.

```typescript
class LaserGunState {
  turretId: string;
  turretIndex: number;
  x: number; // em units
  y: number; // em units
  currentAngle: number; // Current aim (degrees)
  targetAngle: number; // Target aim (for animation)
  fireInterval: number; // Seconds between shots
  damage: number;
  bulletSpeed: number; // em/second
  targetMode: string; // random, nearest, strongest
  warmupTime: number; // Seconds
  range: number; // em units
  destructible: boolean; // 💥 Can turret be destroyed?
  isDestroyed: boolean;
  health: number;
  maxHealth: number;
  isActive: boolean;
  isWarming: boolean; // 🎯 Currently aiming
  isFiring: boolean; // 💥 Currently firing
  warmupStartTime: number;
  lastFireTime: number;
  cooldownEndTime: number;
  currentTarget: string; // Beyblade ID
  shotsFired: number; // Lifetime count
  hitsLanded: number;
  damageDealt: number;
}
```

**Usage**:

- Tracks turret warmup/aiming phase
- Can be destroyed if `destructible = true`
- Records accuracy (hits/shots ratio)

### 5. ProjectileState

Tracks individual bullets/lasers.

```typescript
class ProjectileState {
  id: string;
  turretId: string;
  turretIndex: number;
  targetId: string; // Original target
  x: number; // Current position (em)
  y: number;
  velocityX: number; // em/second
  velocityY: number;
  angle: number; // Degrees
  damage: number;
  speed: number; // em/second
  spawnTime: number;
  maxLifetime: number; // 5 seconds
  isActive: boolean;
  hasHit: boolean; // 🎯 Did it hit something?
  hitBeybladeId: string; // What did it hit?
}
```

**Usage**:

- Each bullet/laser is tracked individually
- Disappears after maxLifetime or on hit
- Tracks what it hit for accuracy stats

### 6. WaterBodyState

Tracks beyblades in water and total damage.

```typescript
class WaterBodyState {
  enabled: boolean;
  type: string; // center, moat, ring
  shape: string; // circle, rectangle, etc.
  liquidType: string; // water, lava, acid, etc.
  spinDrainRate: number; // % per second
  speedMultiplier: number; // 0.5 - 1.0
  beybladeIds: string[]; // Currently in water
  totalDamageDealt: number; // Total spin drained
  totalBeybladesPassed: number; // Lifetime count
}
```

**Usage**:

- Tracks all beyblades currently in water
- Different liquid types have different effects
- Records total spin drained

### 7. PortalState

Tracks portal usage and cooldown.

```typescript
class PortalState {
  portalId: string; // portal1, portal2
  portalIndex: number;
  inPointX: number; // em units
  inPointY: number;
  outPointX: number; // em units
  outPointY: number;
  radius: number; // em units
  cooldown: number; // Seconds
  bidirectional: boolean;
  isOnCooldown: boolean; // ⏳ Can't use right now
  cooldownEndTime: number;
  lastUsedBy: string; // Beyblade ID
  lastUseTime: number;
  totalUses: number; // Lifetime count
}
```

**Usage**:

- Tracks cooldown per portal
- Records which beyblade used it last
- Counts total teleportations

### 8. GoalObjectState

Tracks collectibles and destroyable objectives.

```typescript
class GoalObjectState {
  goalId: string;
  goalIndex: number;
  type: string; // star, crystal, coin, etc.
  x: number; // em units
  y: number;
  radius: number; // em units
  isCollectible: boolean; // true = collect, false = destroy
  isCollected: boolean; // ⭐ Collected!
  isDestroyed: boolean; // 💥 Destroyed!
  health: number;
  maxHealth: number;
  shieldHealth: number; // Must break shield first
  scoreValue: number;
  collectedBy: string; // Beyblade ID
  destroyedBy: string; // Beyblade ID
  collectionTime: number;
}
```

**Usage**:

- Objectives can be collected OR destroyed
- Shields must be broken before damaging health
- Tracks who collected/destroyed it

## 🎮 Implementation in TryoutRoom

### Initialization (onCreate)

```typescript
async onCreate(options: any) {
  // Load arena config
  const arenaData: ArenaConfig = await loadArena(options.arenaId);

  // Initialize loop states
  arenaData.loops.forEach((loop, index) => {
    const loopState = new LoopState();
    loopState.loopIndex = index;
    loopState.radius = loop.radius;
    loopState.shape = loop.shape;
    loopState.speedBoost = loop.speedBoost;
    loopState.spinBoost = loop.spinBoost || 0;
    loopState.frictionMultiplier = loop.frictionMultiplier || 1.0;
    this.state.loops.set(`loop_${index}`, loopState);
  });

  // Initialize obstacle states
  arenaData.obstacles.forEach((obstacle, index) => {
    const obstacleState = new ObstacleState();
    obstacleState.obstacleId = `obstacle_${index}`;
    obstacleState.obstacleIndex = index;
    obstacleState.type = obstacle.type;
    obstacleState.x = obstacle.x;
    obstacleState.y = obstacle.y;
    obstacleState.radius = obstacle.radius;
    obstacleState.destructible = obstacle.destructible;
    obstacleState.health = obstacle.health || 100;
    obstacleState.maxHealth = obstacle.health || 100;
    obstacleState.damage = obstacle.damage;
    obstacleState.recoil = obstacle.recoil;
    this.state.obstacles.set(`obstacle_${index}`, obstacleState);
  });

  // Initialize pit states
  arenaData.pits.forEach((pit, index) => {
    const pitState = new PitState();
    pitState.pitId = `pit_${index}`;
    pitState.pitIndex = index;
    pitState.x = pit.x;
    pitState.y = pit.y;
    pitState.radius = pit.radius;
    pitState.damagePerSecond = pit.damagePerSecond;
    pitState.escapeChance = pit.escapeChance;
    this.state.pits.set(`pit_${index}`, pitState);
  });

  // Initialize turret states
  arenaData.laserGuns.forEach((gun, index) => {
    const gunState = new LaserGunState();
    gunState.turretId = `turret_${index}`;
    gunState.turretIndex = index;
    gunState.x = gun.x;
    gunState.y = gun.y;
    gunState.currentAngle = gun.angle;
    gunState.targetAngle = gun.angle;
    gunState.fireInterval = gun.fireInterval;
    gunState.damage = gun.damage;
    gunState.bulletSpeed = gun.bulletSpeed;
    gunState.targetMode = gun.targetMode;
    gunState.warmupTime = gun.warmupTime;
    gunState.range = gun.range;
    // Turrets can be destroyed if they have health in config
    gunState.destructible = false; // Set based on game mode
    this.state.laserGuns.set(`turret_${index}`, gunState);
  });

  // Initialize water body
  if (arenaData.waterBody?.enabled) {
    this.state.waterBody.enabled = true;
    this.state.waterBody.type = arenaData.waterBody.type;
    this.state.waterBody.shape = arenaData.waterBody.shape;
    this.state.waterBody.liquidType = arenaData.waterBody.liquidType;
    this.state.waterBody.spinDrainRate = arenaData.waterBody.spinDrainRate;
    this.state.waterBody.speedMultiplier = arenaData.waterBody.speedMultiplier;
  }

  // Initialize portals
  arenaData.portals?.forEach((portal, index) => {
    const portalState = new PortalState();
    portalState.portalId = portal.id;
    portalState.portalIndex = index;
    portalState.inPointX = portal.inPoint.x;
    portalState.inPointY = portal.inPoint.y;
    portalState.outPointX = portal.outPoint.x;
    portalState.outPointY = portal.outPoint.y;
    portalState.radius = portal.radius;
    portalState.cooldown = portal.cooldown || 0;
    portalState.bidirectional = portal.bidirectional !== false;
    this.state.portals.set(portal.id, portalState);
  });

  // Initialize goal objects
  arenaData.goalObjects.forEach((goal, index) => {
    const goalState = new GoalObjectState();
    goalState.goalId = goal.id;
    goalState.goalIndex = index;
    goalState.type = goal.type;
    goalState.x = goal.x;
    goalState.y = goal.y;
    goalState.radius = goal.radius;
    goalState.isCollectible = goal.isCollectible !== false;
    goalState.health = goal.health;
    goalState.maxHealth = goal.health;
    goalState.shieldHealth = goal.shieldHealth || 0;
    goalState.scoreValue = goal.scoreValue;
    this.state.goalObjects.set(goal.id, goalState);
  });
}
```

### Game Loop Updates

```typescript
private startGameLoop() {
  this.updateInterval = setInterval(async () => {
    // ... existing physics update ...

    // Update loop states
    this.state.loops.forEach((loopState, loopKey) => {
      const beyblades = this.state.beyblades;
      const inLoop: string[] = [];

      beyblades.forEach((beyblade) => {
        if (beyblade.inLoop && beyblade.loopIndex === loopState.loopIndex) {
          inLoop.push(beyblade.id);
        }
      });

      loopState.beybladeIds.clear();
      inLoop.forEach(id => loopState.beybladeIds.push(id));
    });

    // Update obstacle states
    this.state.obstacles.forEach((obstacleState) => {
      if (obstacleState.destructible && obstacleState.health <= 0) {
        obstacleState.isDestroyed = true;
        obstacleState.isActive = false;
      }
    });

    // Update pit states
    this.state.pits.forEach((pitState) => {
      // Check if trapped beyblade is still in pit
      if (pitState.trappedBeybladeId) {
        const beyblade = this.state.beyblades.get(pitState.trappedBeybladeId);
        if (!beyblade || !beyblade.inPit) {
          // Beyblade escaped
          pitState.trappedBeybladeId = "";
          pitState.totalEscapes++;
        }
      }
    });

    // Update turret states (AI targeting)
    this.state.laserGuns.forEach((gunState) => {
      if (gunState.isDestroyed || !gunState.isActive) return;

      const now = Date.now();

      // Check if on cooldown
      if (now < gunState.cooldownEndTime) {
        gunState.isWarming = false;
        gunState.isFiring = false;
        return;
      }

      // Check if should start warming up
      if (!gunState.isWarming && !gunState.isFiring &&
          now - gunState.lastFireTime > gunState.fireInterval * 1000) {

        // Find target
        const target = this.findTurretTarget(gunState);
        if (target) {
          gunState.currentTarget = target.id;
          gunState.isWarming = true;
          gunState.warmupStartTime = now;

          // Calculate target angle
          const dx = target.x - gunState.x * 16;
          const dy = target.y - gunState.y * 16;
          gunState.targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        }
      }

      // Check if warmup complete
      if (gunState.isWarming &&
          now - gunState.warmupStartTime > gunState.warmupTime * 1000) {
        // Fire!
        this.fireTurret(gunState);
        gunState.isWarming = false;
        gunState.isFiring = true;
        gunState.lastFireTime = now;
        gunState.cooldownEndTime = now + gunState.fireInterval * 1000;
        gunState.shotsFired++;
      }

      // Gradually rotate to target angle
      if (gunState.isWarming) {
        const diff = gunState.targetAngle - gunState.currentAngle;
        const turnSpeed = 180; // degrees per second
        const maxTurn = turnSpeed * (this.UPDATE_INTERVAL / 1000);

        if (Math.abs(diff) > maxTurn) {
          gunState.currentAngle += Math.sign(diff) * maxTurn;
        } else {
          gunState.currentAngle = gunState.targetAngle;
        }
      }
    });

    // Update projectiles
    this.state.projectiles.forEach((projectile, projKey) => {
      if (!projectile.isActive) return;

      const now = Date.now();
      const age = now - projectile.spawnTime;

      // Check lifetime
      if (age > projectile.maxLifetime) {
        projectile.isActive = false;
        this.state.projectiles.delete(projKey);
        return;
      }

      // Update position
      const deltaTime = this.UPDATE_INTERVAL / 1000;
      projectile.x += projectile.velocityX * deltaTime;
      projectile.y += projectile.velocityY * deltaTime;

      // Check collision with beyblades
      this.state.beyblades.forEach((beyblade) => {
        if (projectile.hasHit) return;

        const dx = beyblade.x - projectile.x * 16;
        const dy = beyblade.y - projectile.y * 16;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < beyblade.radius * 24) {
          // Hit!
          projectile.hasHit = true;
          projectile.hitBeybladeId = beyblade.id;
          projectile.isActive = false;

          // Apply damage
          beyblade.health -= projectile.damage;
          beyblade.spin -= projectile.damage;
          beyblade.damageReceived += projectile.damage;

          // Update turret stats
          const gunState = this.state.laserGuns.get(projectile.turretId);
          if (gunState) {
            gunState.hitsLanded++;
            gunState.damageDealt += projectile.damage;
          }

          this.broadcast("projectile-hit", {
            projectileId: projectile.id,
            beybladeId: beyblade.id,
            damage: projectile.damage,
          });

          this.state.projectiles.delete(projKey);
        }
      });
    });

    // Update water body
    if (this.state.waterBody.enabled) {
      const inWater: string[] = [];
      this.state.beyblades.forEach((beyblade) => {
        if (beyblade.inWater) {
          inWater.push(beyblade.id);
        }
      });

      this.state.waterBody.beybladeIds.clear();
      inWater.forEach(id => this.state.waterBody.beybladeIds.push(id));
    }

    // Update portal cooldowns
    this.state.portals.forEach((portalState) => {
      if (portalState.isOnCooldown && Date.now() > portalState.cooldownEndTime) {
        portalState.isOnCooldown = false;
      }
    });
  }, this.UPDATE_INTERVAL);
}
```

## 🎯 Benefits

1. **Full State Visibility**: Clients can see exactly what's happening in the arena
2. **Statistics**: Track usage, damage, accuracy for all features
3. **Destruction**: Obstacles and turrets can be destroyed
4. **Occupancy**: Know which beyblades are using which features
5. **Cooldowns**: Portal and turret cooldowns are tracked
6. **Analytics**: Collect data for balancing and player stats

## 📊 Client Usage

```typescript
// Listen to state changes
room.state.obstacles.onAdd = (obstacle, key) => {
  console.log(`Obstacle ${key} added`);
};

room.state.obstacles.onChange = (obstacle, key) => {
  if (obstacle.isDestroyed) {
    console.log(`Obstacle ${key} destroyed by ${obstacle.lastHitBy}!`);
    // Play destruction animation
  }
};

room.state.laserGuns.onChange = (gun, key) => {
  if (gun.isFiring) {
    console.log(`Turret ${key} firing at ${gun.currentTarget}!`);
    // Play firing animation
  }
};

room.state.projectiles.onAdd = (projectile, key) => {
  console.log(`New projectile from ${projectile.turretId}`);
  // Render projectile
};

room.state.projectiles.onRemove = (projectile, key) => {
  if (projectile.hasHit) {
    console.log(`Projectile hit ${projectile.hitBeybladeId}!`);
    // Play hit effect
  }
};

room.state.pits.onChange = (pit, key) => {
  if (pit.trappedBeybladeId) {
    console.log(`Beyblade ${pit.trappedBeybladeId} trapped in pit!`);
    // Show trapped animation
  }
};
```

## 🚀 Advanced Features

### Destructible Obstacles

```typescript
// Beyblade attacks can destroy obstacles
if (obstacle.destructible && obstacle.health > 0) {
  obstacle.health -= beyblade.damageMultiplier * 10;
  if (obstacle.health <= 0) {
    obstacle.isDestroyed = true;
    // Broadcast destruction event
    this.broadcast("obstacle-destroyed", {
      obstacleId: obstacle.obstacleId,
      destroyedBy: beyblade.id,
    });
  }
}
```

### Destructible Turrets

```typescript
// Beyblades can attack and destroy turrets
if (turret.destructible && turret.health > 0) {
  turret.health -= beyblade.damageMultiplier * 15;
  if (turret.health <= 0) {
    turret.isDestroyed = true;
    turret.isActive = false;
    // Broadcast destruction event
    this.broadcast("turret-destroyed", {
      turretId: turret.turretId,
      destroyedBy: beyblade.id,
    });
  }
}
```

### Goal Object Shielding

```typescript
// Must break shield before damaging object
if (goal.shieldHealth > 0) {
  goal.shieldHealth -= damage;
  if (goal.shieldHealth <= 0) {
    goal.shieldHealth = 0;
    this.broadcast("shield-broken", { goalId: goal.goalId });
  }
} else {
  goal.health -= damage;
  if (goal.health <= 0) {
    goal.isDestroyed = true;
    goal.destroyedBy = beyblade.id;
    goal.collectionTime = Date.now();
    this.broadcast("goal-destroyed", {
      goalId: goal.goalId,
      destroyedBy: beyblade.id,
      scoreValue: goal.scoreValue,
    });
  }
}
```

---

**Last Updated**: November 6, 2025  
**Version**: 2.1.0  
**Status**: ✅ Complete State Tracking
