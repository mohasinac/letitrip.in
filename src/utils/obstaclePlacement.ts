/**
 * Obstacle Placement Utilities
 * Algorithms for placing obstacles in arena
 */

export interface Point {
  x: number;
  y: number;
}

export interface Zone {
  position: Point;
  radius: number;
}

export type PlacementMode = 'center' | 'random' | 'evenly-distributed';

/**
 * Place all obstacles at arena center (stacked or slightly offset)
 */
export function placeCenterObstacles(
  count: number,
  arenaCenter: Point,
  obstacleRadius: number = 2
): Point[] {
  const positions: Point[] = [];
  
  for (let i = 0; i < count; i++) {
    // Slight offset to avoid perfect overlap
    const offsetAngle = (i / count) * Math.PI * 2;
    const offsetDistance = obstacleRadius * 0.5; // Half radius offset
    
    positions.push({
      x: arenaCenter.x + offsetDistance * Math.cos(offsetAngle),
      y: arenaCenter.y + offsetDistance * Math.sin(offsetAngle)
    });
  }
  
  return positions;
}

/**
 * Place obstacles randomly, avoiding excluded zones (portals, exits, pits)
 */
export function placeRandomObstacles(
  count: number,
  arenaWidth: number,
  arenaHeight: number,
  excludeZones: Zone[],
  obstacleRadius: number = 2,
  maxAttempts: number = 100
): Point[] {
  const positions: Point[] = [];
  const minDistance = obstacleRadius * 2.5; // Minimum distance between obstacles
  
  for (let i = 0; i < count; i++) {
    let position: Point | null = null;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const candidate = {
        x: (Math.random() - 0.5) * arenaWidth * 0.8, // 80% of arena width
        y: (Math.random() - 0.5) * arenaHeight * 0.8
      };
      
      // Check if in excluded zone
      if (isInExcludedZone(candidate, excludeZones, obstacleRadius)) {
        attempts++;
        continue;
      }
      
      // Check distance from other obstacles
      const tooClose = positions.some(pos => {
        const dist = Math.sqrt(
          Math.pow(pos.x - candidate.x, 2) + 
          Math.pow(pos.y - candidate.y, 2)
        );
        return dist < minDistance;
      });
      
      if (!tooClose) {
        position = candidate;
        break;
      }
      
      attempts++;
    }
    
    if (position) {
      positions.push(position);
    }
  }
  
  return positions;
}

/**
 * Place obstacles evenly distributed in a circle pattern
 */
export function placeEvenlyDistributedObstacles(
  count: number,
  arenaRadius: number,
  excludeZones: Zone[],
  obstacleRadius: number = 2,
  distributionRadius: number = 0.6 // 60% from center
): Point[] {
  const positions: Point[] = [];
  const angleStep = (2 * Math.PI) / count;
  const distance = arenaRadius * distributionRadius;
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const position = {
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle)
    };
    
    // Check if in excluded zone
    if (!isInExcludedZone(position, excludeZones, obstacleRadius)) {
      positions.push(position);
    }
  }
  
  return positions;
}

/**
 * Check if a position is in any excluded zone
 */
export function isInExcludedZone(
  position: Point,
  excludeZones: Zone[],
  obstacleRadius: number = 0
): boolean {
  return excludeZones.some(zone => {
    const distance = Math.sqrt(
      Math.pow(position.x - zone.position.x, 2) + 
      Math.pow(position.y - zone.position.y, 2)
    );
    return distance < (zone.radius + obstacleRadius);
  });
}

/**
 * Generate excluded zones from portals, exits, and pits
 */
export function generateExcludedZones(
  portals: Array<{ inPoint: Point; outPoint: Point; radius: number }> = [],
  pits: Array<{ x: number; y: number; radius: number }> = [],
  waterBodies: Array<{ position?: Point; radius?: number }> = []
): Zone[] {
  const zones: Zone[] = [];
  
  // Add portal zones
  portals.forEach(portal => {
    zones.push(
      { position: portal.inPoint, radius: portal.radius * 1.5 },
      { position: portal.outPoint, radius: portal.radius * 1.5 }
    );
  });
  
  // Add pit zones
  pits.forEach(pit => {
    zones.push({
      position: { x: pit.x, y: pit.y },
      radius: pit.radius * 1.5
    });
  });
  
  // Add water body zones (center type)
  waterBodies.forEach(water => {
    if (water.position && water.radius) {
      zones.push({
        position: water.position,
        radius: water.radius * 1.2
      });
    }
  });
  
  return zones;
}
