/**
 * Path Generation Utilities
 * Generate SVG paths for various shapes and effects
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Generate whirlpool spiral path for portal effects
 */
export function generateWhirlpoolSpiral(
  center: Point,
  maxRadius: number,
  startAngle: number = 0,
  turns: number = 2,
  segments: number = 50
): string {
  const points: string[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + t * turns * 360;
    const radius = maxRadius * (1 - t * 0.7); // Spiral inward
    const rad = (angle * Math.PI) / 180;
    const x = center.x + radius * Math.cos(rad);
    const y = center.y + radius * Math.sin(rad);
    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  
  return points.join(' ');
}

/**
 * Generate shape path for liquid bodies and loops
 */
export function generateShapePath(
  shape: string,
  position: Point,
  radius: number,
  width?: number,
  height?: number
): string {
  switch (shape) {
    case 'circle':
      return generateCirclePath(position, radius);
    
    case 'rectangle':
      return generateRectanglePath(position, width || radius * 2, height || radius * 2);
    
    case 'pentagon':
      return generatePolygonPath(position, radius, 5);
    
    case 'hexagon':
      return generatePolygonPath(position, radius, 6);
    
    case 'octagon':
      return generatePolygonPath(position, radius, 8);
    
    case 'star':
      return generateStarPath(position, radius, radius * 0.5, 5);
    
    case 'oval':
      return generateEllipsePath(position, radius, radius * 0.7);
    
    default:
      return generateCirclePath(position, radius);
  }
}

/**
 * Generate circle path
 */
export function generateCirclePath(center: Point, radius: number): string {
  // Using arc commands to create a circle
  return `
    M ${center.x - radius} ${center.y}
    A ${radius} ${radius} 0 1 0 ${center.x + radius} ${center.y}
    A ${radius} ${radius} 0 1 0 ${center.x - radius} ${center.y}
    Z
  `.trim();
}

/**
 * Generate rectangle path
 */
export function generateRectanglePath(center: Point, width: number, height: number): string {
  const left = center.x - width / 2;
  const top = center.y - height / 2;
  
  return `
    M ${left} ${top}
    L ${left + width} ${top}
    L ${left + width} ${top + height}
    L ${left} ${top + height}
    Z
  `.trim();
}

/**
 * Generate polygon path
 */
export function generatePolygonPath(center: Point, radius: number, sides: number): string {
  const points: string[] = [];
  
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;
    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  
  points.push('Z');
  return points.join(' ');
}

/**
 * Generate star path
 */
export function generateStarPath(
  center: Point,
  outerRadius: number,
  innerRadius: number,
  points: number
): string {
  const pathPoints: string[] = [];
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;
    pathPoints.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }
  
  pathPoints.push('Z');
  return pathPoints.join(' ');
}

/**
 * Generate ellipse path
 */
export function generateEllipsePath(
  center: Point,
  radiusX: number,
  radiusY: number
): string {
  return `
    M ${center.x - radiusX} ${center.y}
    A ${radiusX} ${radiusY} 0 1 0 ${center.x + radiusX} ${center.y}
    A ${radiusX} ${radiusY} 0 1 0 ${center.x - radiusX} ${center.y}
    Z
  `.trim();
}

/**
 * Generate arc path for walls/exits
 */
export function generateArc(
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  const startX = center.x + radius * Math.cos(startRad);
  const startY = center.y + radius * Math.sin(startRad);
  const endX = center.x + radius * Math.cos(endRad);
  const endY = center.y + radius * Math.sin(endRad);
  
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  
  return `
    M ${startX} ${startY}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
  `.trim();
}

/**
 * Generate rotation arrows for rotation body indicators
 */
export function generateRotationArrows(
  center: Point,
  radius: number,
  direction: 'clockwise' | 'counter-clockwise',
  arrowCount: number = 8
): Array<{ path: string; angle: number }> {
  const arrows: Array<{ path: string; angle: number }> = [];
  const angleStep = 360 / arrowCount;
  const arrowSize = radius * 0.15;
  
  for (let i = 0; i < arrowCount; i++) {
    const angle = i * angleStep;
    const rad = (angle * Math.PI) / 180;
    const distance = radius * 0.7;
    
    const x = center.x + distance * Math.cos(rad);
    const y = center.y + distance * Math.sin(rad);
    
    // Arrow pointing in tangent direction
    const tangentAngle = direction === 'clockwise' ? angle + 90 : angle - 90;
    const tangentRad = (tangentAngle * Math.PI) / 180;
    
    // Arrow head points
    const headX = x + arrowSize * Math.cos(tangentRad);
    const headY = y + arrowSize * Math.sin(tangentRad);
    
    const leftWingRad = tangentRad + (Math.PI * 2.5) / 3;
    const rightWingRad = tangentRad - (Math.PI * 2.5) / 3;
    
    const leftX = headX + arrowSize * 0.5 * Math.cos(leftWingRad);
    const leftY = headY + arrowSize * 0.5 * Math.sin(leftWingRad);
    const rightX = headX + arrowSize * 0.5 * Math.cos(rightWingRad);
    const rightY = headY + arrowSize * 0.5 * Math.sin(rightWingRad);
    
    arrows.push({
      path: `M ${headX} ${headY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`,
      angle: tangentAngle
    });
  }
  
  return arrows;
}

/**
 * Generate particles for whirlpool/portal effects
 */
export function generateParticles(
  center: Point,
  radius: number,
  count: number
): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const distance = radius * (0.8 + Math.random() * 0.4);
    const rad = (angle * Math.PI) / 180;
    return {
      x: center.x + distance * Math.cos(rad),
      y: center.y + distance * Math.sin(rad)
    };
  });
}

/**
 * Get polygon vertices for shape rendering
 */
export function getPolygonVertices(
  center: Point,
  radius: number,
  sides: number
): Point[] {
  const vertices: Point[] = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    vertices.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  
  return vertices;
}
