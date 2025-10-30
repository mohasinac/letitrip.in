/**
 * Floating Damage/Heal Numbers System
 * Shows damage and healing numbers that float up from Beyblades
 */

import { Vector2D } from "@/app/game/types/game";

export interface FloatingNumber {
  id: string;
  value: number;
  type: "damage" | "heal" | "drain";
  position: Vector2D;
  velocity: Vector2D;
  opacity: number;
  scale: number;
  lifetime: number;
  maxLifetime: number;
  color: string;
}

let floatingNumbers: FloatingNumber[] = [];
let nextId = 0;

/**
 * Add a new floating number
 */
export function addFloatingNumber(
  value: number,
  type: "damage" | "heal" | "drain",
  position: Vector2D,
  randomOffset: boolean = true,
): void {
  const offsetX = randomOffset ? (Math.random() - 0.5) * 40 : 0;
  const offsetY = randomOffset ? (Math.random() - 0.5) * 20 : 0;

  const colors = {
    damage: "#ff4444",
    heal: "#44ff44",
    drain: "#ff44ff",
  };

  floatingNumbers.push({
    id: `float-${nextId++}`,
    value: Math.abs(Math.round(value)),
    type,
    position: {
      x: position.x + offsetX,
      y: position.y + offsetY,
    },
    velocity: {
      x: (Math.random() - 0.5) * 0.5,
      y: -1.5 - Math.random() * 0.5, // Float upward
    },
    opacity: 1.0,
    scale: 1.0,
    lifetime: 0,
    maxLifetime: 2000, // 2 seconds
    color: colors[type],
  });
}

/**
 * Update all floating numbers
 */
export function updateFloatingNumbers(deltaTime: number): void {
  floatingNumbers = floatingNumbers.filter((num) => {
    num.lifetime += deltaTime * 1000;

    // Update position
    num.position.x += num.velocity.x;
    num.position.y += num.velocity.y;

    // Slow down velocity (damping)
    num.velocity.x *= 0.98;
    num.velocity.y *= 0.98;

    // Fade out and scale up as lifetime progresses
    const progress = num.lifetime / num.maxLifetime;
    num.opacity = 1 - progress;
    num.scale = 1 + progress * 0.5; // Grow slightly

    // Remove if expired
    return num.lifetime < num.maxLifetime;
  });
}

/**
 * Draw all floating numbers
 */
export function drawFloatingNumbers(ctx: CanvasRenderingContext2D): void {
  floatingNumbers.forEach((num) => {
    ctx.save();

    ctx.globalAlpha = num.opacity;
    ctx.font = `bold ${24 * num.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Draw outline (stroke)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeText(
      formatNumber(num.value, num.type),
      num.position.x,
      num.position.y,
    );

    // Draw fill
    ctx.fillStyle = num.color;
    ctx.fillText(
      formatNumber(num.value, num.type),
      num.position.x,
      num.position.y,
    );

    // Draw glow
    ctx.shadowColor = num.color;
    ctx.shadowBlur = 10 * num.opacity;
    ctx.fillText(
      formatNumber(num.value, num.type),
      num.position.x,
      num.position.y,
    );

    ctx.restore();
  });
}

/**
 * Format number with prefix/suffix based on type
 */
function formatNumber(
  value: number,
  type: "damage" | "heal" | "drain",
): string {
  switch (type) {
    case "damage":
      return `-${value}`;
    case "heal":
      return `+${value}`;
    case "drain":
      return `−${value}★`; // Drain with star symbol
    default:
      return `${value}`;
  }
}

/**
 * Clear all floating numbers (for game reset)
 */
export function clearFloatingNumbers(): void {
  floatingNumbers = [];
}

/**
 * Get count of active floating numbers
 */
export function getFloatingNumberCount(): number {
  return floatingNumbers.length;
}

/**
 * Batch add multiple numbers (for multi-hit attacks)
 */
export function addMultipleFloatingNumbers(
  values: number[],
  type: "damage" | "heal" | "drain",
  centerPosition: Vector2D,
  spreadRadius: number = 50,
): void {
  values.forEach((value, index) => {
    const angle = (Math.PI * 2 * index) / values.length;
    const offset = {
      x: Math.cos(angle) * spreadRadius,
      y: Math.sin(angle) * spreadRadius,
    };

    setTimeout(() => {
      addFloatingNumber(
        value,
        type,
        {
          x: centerPosition.x + offset.x,
          y: centerPosition.y + offset.y,
        },
        false,
      );
    }, index * 100); // Stagger by 100ms
  });
}

/**
 * Add critical hit number (larger and more dramatic)
 */
export function addCriticalHitNumber(value: number, position: Vector2D): void {
  const num: FloatingNumber = {
    id: `crit-${nextId++}`,
    value: Math.abs(Math.round(value)),
    type: "damage",
    position: { ...position },
    velocity: {
      x: 0,
      y: -2.5, // Faster upward movement
    },
    opacity: 1.0,
    scale: 1.5, // Start larger
    lifetime: 0,
    maxLifetime: 2500, // Last longer
    color: "#ffff00", // Yellow for critical
  };

  floatingNumbers.push(num);
}

/**
 * Add combo counter
 */
export function addComboNumber(comboCount: number, position: Vector2D): void {
  const num: FloatingNumber = {
    id: `combo-${nextId++}`,
    value: comboCount,
    type: "damage",
    position: { ...position },
    velocity: {
      x: 0,
      y: -1.0,
    },
    opacity: 1.0,
    scale: 1.2,
    lifetime: 0,
    maxLifetime: 1500,
    color: "#ff8800", // Orange for combo
  };

  floatingNumbers.push(num);
}

/**
 * Custom floating text (for special messages)
 */
export function addFloatingText(
  text: string,
  position: Vector2D,
  color: string = "#ffffff",
  duration: number = 2000,
): void {
  // Extend FloatingNumber interface for text
  const textNum: any = {
    id: `text-${nextId++}`,
    value: 0,
    text, // Custom property
    type: "damage",
    position: { ...position },
    velocity: {
      x: 0,
      y: -1.0,
    },
    opacity: 1.0,
    scale: 1.0,
    lifetime: 0,
    maxLifetime: duration,
    color,
  };

  floatingNumbers.push(textNum as FloatingNumber);
}

/**
 * Draw custom floating text
 */
export function drawCustomFloatingText(ctx: CanvasRenderingContext2D): void {
  floatingNumbers.forEach((num: any) => {
    if (num.text) {
      ctx.save();

      ctx.globalAlpha = num.opacity;
      ctx.font = `bold ${20 * num.scale}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Outline
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 3;
      ctx.strokeText(num.text, num.position.x, num.position.y);

      // Fill
      ctx.fillStyle = num.color;
      ctx.fillText(num.text, num.position.x, num.position.y);

      ctx.restore();
    }
  });
}
