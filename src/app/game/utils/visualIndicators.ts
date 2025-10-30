/**
 * Visual Indicators for Beyblade Stats
 * Renders contact points, special move effects, and stat visualizations
 */

import { GameBeyblade } from '../types/game';
import { BeybladeStats, PointOfContact } from '@/types/beybladeStats';

/**
 * Draw contact points as arrows on the Beyblade
 */
export function drawContactPoints(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  showAlways: boolean = false
): void {
  // Only show contact points when attacking or when explicitly requested
  if (!showAlways && !beyblade.heavyAttackActive && !beyblade.ultimateAttackActive) {
    return;
  }

  const { position, rotation, radius } = beyblade;
  
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(rotation);

  for (const contact of stats.pointsOfContact) {
    const angleRad = (contact.angle * Math.PI) / 180;
    const widthRad = (contact.width * Math.PI) / 180;
    
    // Calculate arrow position (slightly beyond the edge)
    const arrowDistance = radius + 10;
    const arrowX = Math.cos(angleRad) * arrowDistance;
    const arrowY = Math.sin(angleRad) * arrowDistance;
    
    // Color based on damage multiplier
    const intensity = Math.min(255, Math.floor((contact.damageMultiplier - 1) * 255));
    const color = `rgba(${intensity}, ${255 - intensity * 0.5}, 0, 0.8)`;
    
    // Draw arrow
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Arrow body
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    const arrowBaseDistance = radius + 2;
    const arrowBaseX = Math.cos(angleRad) * arrowBaseDistance;
    const arrowBaseY = Math.sin(angleRad) * arrowBaseDistance;
    ctx.lineTo(arrowBaseX, arrowBaseY);
    ctx.stroke();
    
    // Arrow head
    const headSize = 6;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
      arrowX - Math.cos(angleRad - 0.5) * headSize,
      arrowY - Math.sin(angleRad - 0.5) * headSize
    );
    ctx.lineTo(
      arrowX - Math.cos(angleRad + 0.5) * headSize,
      arrowY - Math.sin(angleRad + 0.5) * headSize
    );
    ctx.closePath();
    ctx.fill();
    
    // Draw contact zone arc
    ctx.strokeStyle = `rgba(${intensity}, ${255 - intensity * 0.5}, 0, 0.3)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      0, 0,
      radius,
      angleRad - widthRad / 2,
      angleRad + widthRad / 2
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw special move aura/effect
 */
export function drawSpecialMoveAura(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  stats: BeybladeStats,
  animationTime: number
): void {
  // Check if special move is active (you'll need to import and use the special moves manager)
  // For now, show aura during ultimate attack
  if (!beyblade.ultimateAttackActive && !beyblade.heavyAttackActive) {
    return;
  }

  const { position, radius } = beyblade;
  
  // Pulsing aura effect
  const pulseScale = 1 + Math.sin(animationTime * 0.005) * 0.1;
  const auraRadius = radius * pulseScale * 1.5;
  
  // Color based on special move type
  const isUltimate = beyblade.ultimateAttackActive;
  const color = isUltimate 
    ? 'rgba(255, 0, 255, 0.3)' // Purple for ultimate
    : 'rgba(255, 150, 0, 0.3)'; // Orange for heavy
  
  ctx.save();
  
  // Outer glow
  const gradient = ctx.createRadialGradient(
    position.x, position.y, radius,
    position.x, position.y, auraRadius
  );
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(position.x, position.y, auraRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner ring
  ctx.strokeStyle = isUltimate ? 'rgba(255, 0, 255, 0.6)' : 'rgba(255, 150, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius + 5, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw hit quality indicator (perfect/good/normal)
 */
export function drawHitQualityIndicator(
  ctx: CanvasRenderingContext2D,
  position: { x: number; y: number },
  quality: 'perfect' | 'good' | 'normal',
  alpha: number = 1
): void {
  const text = quality === 'perfect' ? 'PERFECT!' : quality === 'good' ? 'Good!' : 'Hit';
  const color = quality === 'perfect' ? '#FFD700' : quality === 'good' ? '#FFA500' : '#FFFFFF';
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold ${quality === 'perfect' ? 20 : 16}px Arial`;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Stroke (outline)
  ctx.strokeText(text, position.x, position.y);
  // Fill
  ctx.fillText(text, position.x, position.y);
  
  ctx.restore();
}

/**
 * Draw type icon/badge on Beyblade
 */
export function drawTypeBadge(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  stats: BeybladeStats
): void {
  const { position, radius } = beyblade;
  
  const badgeSize = 16;
  const badgeX = position.x + radius - badgeSize / 2;
  const badgeY = position.y - radius + badgeSize / 2;
  
  // Background circle
  ctx.save();
  ctx.fillStyle = getTypeColor(stats.type);
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Type letter
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stats.type[0].toUpperCase(), badgeX, badgeY);
  
  ctx.restore();
}

/**
 * Get type color
 */
function getTypeColor(type: string): string {
  switch (type) {
    case 'attack': return '#EF4444';
    case 'defense': return '#3B82F6';
    case 'stamina': return '#10B981';
    case 'balanced': return '#8B5CF6';
    default: return '#6B7280';
  }
}

/**
 * Draw spin steal indicator (particles flowing from defender to attacker)
 */
export function drawSpinStealEffect(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  progress: number // 0 to 1
): void {
  const particleCount = 5;
  
  ctx.save();
  
  for (let i = 0; i < particleCount; i++) {
    const t = (progress + i / particleCount) % 1;
    const x = from.x + (to.x - from.x) * t;
    const y = from.y + (to.y - from.y) * t;
    
    const size = 3 + Math.sin(t * Math.PI) * 2;
    const alpha = Math.sin(t * Math.PI) * 0.8;
    
    ctx.fillStyle = `rgba(147, 51, 234, ${alpha})`; // Purple particles
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}
