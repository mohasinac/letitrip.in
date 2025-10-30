/**
 * Beyblade Renderer Component
 * Renders Beyblade images on canvas (replaces CSS circles)
 */

import { GameBeyblade } from "../types/game";
import { BeybladeStats } from "@/types/beybladeStats";

/**
 * Cache for loaded images
 */
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Load and cache an image
 */
export function loadBeybladeImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (imageCache.has(url)) {
      resolve(imageCache.get(url)!);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
}

/**
 * Preload all Beyblade images
 */
export async function preloadBeybladeImages(
  stats: BeybladeStats[],
): Promise<void> {
  const promises = stats
    .filter((stat) => stat.imageUrl)
    .map((stat) =>
      loadBeybladeImage(stat.imageUrl!).catch((err) => {
        console.warn(`Failed to preload ${stat.name}:`, err);
      }),
    );

  await Promise.all(promises);
}

/**
 * Draw a Beyblade on canvas using its image
 */
export function drawBeyblade(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  stats: BeybladeStats | null,
  showDebug: boolean = false,
): void {
  const { position, radius, rotation, isDead, isOutOfBounds } = beyblade;

  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.rotate(rotation);

  // Apply opacity if dead or out of bounds
  if (isDead || isOutOfBounds) {
    ctx.globalAlpha = 0.3;
  }

  // Draw Beyblade image or fallback
  if (stats?.imageUrl && imageCache.has(stats.imageUrl)) {
    const img = imageCache.get(stats.imageUrl)!;
    const size = radius * 2;

    // Draw image centered
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
  } else {
    // Fallback: Draw colored circle with gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);

    // Type-based colors
    const colors = {
      attack: ["#EF4444", "#DC2626"],
      defense: ["#3B82F6", "#2563EB"],
      stamina: ["#10B981", "#059669"],
      balanced: ["#8B5CF6", "#7C3AED"],
    };

    const [color1, color2] = stats
      ? colors[stats.type]
      : ["#6B7280", "#4B5563"];

    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw letter indicator
    if (stats) {
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${radius * 0.8}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stats.displayName[0], 0, 0);
    }
  }

  // Debug mode: Show hitbox
  if (showDebug) {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * Draw Beyblade with glow effect (for special moves)
 */
export function drawBeybladeWithGlow(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  stats: BeybladeStats | null,
  glowColor: string,
  glowIntensity: number = 1,
): void {
  const { position, radius } = beyblade;

  // Draw glow
  ctx.save();
  const gradient = ctx.createRadialGradient(
    position.x,
    position.y,
    radius,
    position.x,
    position.y,
    radius * (1.5 + glowIntensity * 0.5),
  );

  gradient.addColorStop(0, `${glowColor}80`); // 50% opacity
  gradient.addColorStop(0.5, `${glowColor}40`); // 25% opacity
  gradient.addColorStop(1, `${glowColor}00`); // Transparent

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(
    position.x,
    position.y,
    radius * (1.5 + glowIntensity * 0.5),
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  // Draw Beyblade
  drawBeyblade(ctx, beyblade, stats, false);
}

/**
 * Draw Beyblade shadow
 */
export function drawBeybladeShadow(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  shadowOffset: { x: number; y: number } = { x: 5, y: 5 },
): void {
  const { position, radius } = beyblade;

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(
    position.x + shadowOffset.x,
    position.y + shadowOffset.y,
    radius * 0.8,
    radius * 0.4,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

/**
 * Draw spin trail effect
 */
export function drawSpinTrail(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  stats: BeybladeStats | null,
  trailLength: number = 5,
): void {
  if (!beyblade.velocity || beyblade.isDead || beyblade.isOutOfBounds) return;

  const speed = Math.sqrt(beyblade.velocity.x ** 2 + beyblade.velocity.y ** 2);

  if (speed < 10) return; // Only show trail when moving fast

  const { position, radius, rotation } = beyblade;
  const velocityAngle = Math.atan2(beyblade.velocity.y, beyblade.velocity.x);

  // Type-based trail colors
  const trailColors = {
    attack: "#EF444480",
    defense: "#3B82F680",
    stamina: "#10B98180",
    balanced: "#8B5CF680",
  };

  const color = stats ? trailColors[stats.type] : "#6B728080";

  ctx.save();

  for (let i = 0; i < trailLength; i++) {
    const t = i / trailLength;
    const trailX = position.x - beyblade.velocity.x * t * 0.5;
    const trailY = position.y - beyblade.velocity.y * t * 0.5;
    const trailRadius = radius * (1 - t * 0.3);
    const alpha = (1 - t) * 0.4;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(trailX, trailY, trailRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw all visual effects for a Beyblade
 */
export function drawBeybladeComplete(
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  stats: BeybladeStats | null,
  options: {
    showShadow?: boolean;
    showTrail?: boolean;
    showGlow?: boolean;
    showDebug?: boolean;
    glowColor?: string;
    glowIntensity?: number;
  } = {},
): void {
  const {
    showShadow = true,
    showTrail = true,
    showGlow = false,
    showDebug = false,
    glowColor = "#FF00FF",
    glowIntensity = 1,
  } = options;

  // 1. Draw shadow first (lowest layer)
  if (showShadow) {
    drawBeybladeShadow(ctx, beyblade);
  }

  // 2. Draw spin trail
  if (showTrail) {
    drawSpinTrail(ctx, beyblade, stats);
  }

  // 3. Draw Beyblade with optional glow
  if (showGlow) {
    drawBeybladeWithGlow(ctx, beyblade, stats, glowColor, glowIntensity);
  } else {
    drawBeyblade(ctx, beyblade, stats, showDebug);
  }
}

/**
 * Clear image cache (call when switching games or unloading)
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Get cached image count (for debugging)
 */
export function getCachedImageCount(): number {
  return imageCache.size;
}
