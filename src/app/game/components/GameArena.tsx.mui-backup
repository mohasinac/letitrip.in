"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import { GameState, GameBeyblade, Vector2D } from "../types/game";
import {
  renderArenaBackground,
  renderArenaFloor,
  renderWallsAndExits,
  renderLoops,
  renderObstacles,
} from "../utils/arenaRenderer";

// Helper function to lighten/darken colors
function adjustColor(color: string, amount: number): string {
  const usePound = color[0] === "#";
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return (
    (usePound ? "#" : "") +
    ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")
  );
}

interface GameArenaProps {
  gameState: GameState;
  onMouseMove?: (position: Vector2D) => void;
  onTouchMove?: (position: Vector2D) => void;
  onTouchStart?: (position: Vector2D) => void;
  onTouchEnd?: () => void;
  className?: string;
}

const GameArena: React.FC<GameArenaProps> = ({
  gameState,
  onMouseMove,
  onTouchMove,
  onTouchStart,
  onTouchEnd,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const beybladeImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const stadiumImageRef = useRef<HTMLImageElement | null>(null);
  const stadiumCacheRef = useRef<HTMLCanvasElement | null>(null); // Cache for static stadium
  const gameStateRef = useRef(gameState); // Store latest gameState
  const imagesLoadedRef = useRef(false); // Store images loaded state
  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const [canvasScale, setCanvasScale] = React.useState(1);
  const [isScreenTooSmall, setIsScreenTooSmall] = React.useState(false);
  const theme = useTheme();

  // Update refs when props change
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    imagesLoadedRef.current = imagesLoaded;
  }, [imagesLoaded]);

  // Check screen size and update isScreenTooSmall
  useEffect(() => {
    const checkScreenSize = () => {
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      setIsScreenTooSmall(minDimension < 400);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Pre-render static stadium elements to offscreen canvas
  const renderStadiumToCache = useCallback(() => {
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = 800;
    offscreenCanvas.height = 800;
    const ctx = offscreenCanvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });
    if (!ctx) return;

    const stadium = gameState.stadium;
    const arenaConfig = gameState.arenaConfig;

    // Log arena config for debugging
    if (arenaConfig) {
      console.log("Rendering arena:", arenaConfig.name, arenaConfig);

      // Use new arena rendering system
      renderArenaBackground(ctx, arenaConfig, stadium);
      renderArenaFloor(ctx, arenaConfig, stadium);
      renderWallsAndExits(ctx, arenaConfig, stadium);
      renderLoops(ctx, arenaConfig, stadium);
      renderObstacles(ctx, arenaConfig, stadium);
    } else {
      // Fallback to default rendering
      console.log("Using default arena rendering");

      // Background
      ctx.fillStyle = theme.palette.background.default;
      ctx.fillRect(0, 0, 800, 800);

      // Default floor
      const floorGradient = ctx.createRadialGradient(
        stadium.center.x,
        stadium.center.y,
        0,
        stadium.center.x,
        stadium.center.y,
        stadium.innerRadius,
      );
      floorGradient.addColorStop(0, "#1a1a1a");
      floorGradient.addColorStop(0.7, "#2a2a2a");
      floorGradient.addColorStop(1, "#3a3a3a");
      ctx.fillStyle = floorGradient;
      ctx.beginPath();
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.innerRadius,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Default walls and exits
      const angleRanges = [
        { start: 0, end: 60, isWall: true },
        { start: 60, end: 120, isWall: false },
        { start: 120, end: 180, isWall: true },
        { start: 180, end: 240, isWall: false },
        { start: 240, end: 300, isWall: true },
        { start: 300, end: 360, isWall: false },
      ];

      for (const range of angleRanges) {
        const startAngle = (range.start * Math.PI) / 180;
        const endAngle = (range.end * Math.PI) / 180;

        if (range.isWall) {
          // Yellow wall zones
          ctx.fillStyle = "#FBBF24";
          ctx.beginPath();
          ctx.arc(
            stadium.center.x,
            stadium.center.y,
            stadium.outerRadius,
            startAngle,
            endAngle,
          );
          ctx.arc(
            stadium.center.x,
            stadium.center.y,
            stadium.innerRadius,
            endAngle,
            startAngle,
            true,
          );
          ctx.closePath();
          ctx.fill();

          // Black wall pattern
          const wallThickness = 15;
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(
            stadium.center.x,
            stadium.center.y,
            stadium.outerRadius,
            startAngle,
            endAngle,
          );
          ctx.arc(
            stadium.center.x,
            stadium.center.y,
            stadium.outerRadius - wallThickness,
            endAngle,
            startAngle,
            true,
          );
          ctx.closePath();
          ctx.fill();

          // Brick pattern
          const numBricks = 8;
          const angleStep = (endAngle - startAngle) / numBricks;
          ctx.strokeStyle = "#333333";
          ctx.lineWidth = 2;
          for (let i = 1; i < numBricks; i++) {
            const brickAngle = startAngle + angleStep * i;
            const innerR = stadium.outerRadius - wallThickness;
            const outerR = stadium.outerRadius;
            ctx.beginPath();
            ctx.moveTo(
              stadium.center.x + Math.cos(brickAngle) * innerR,
              stadium.center.y + Math.sin(brickAngle) * innerR,
            );
            ctx.lineTo(
              stadium.center.x + Math.cos(brickAngle) * outerR,
              stadium.center.y + Math.sin(brickAngle) * outerR,
            );
            ctx.stroke();
          }
          const midRadius = stadium.outerRadius - wallThickness / 2;
          ctx.beginPath();
          ctx.arc(
            stadium.center.x,
            stadium.center.y,
            midRadius,
            startAngle,
            endAngle,
          );
          ctx.stroke();
        } else {
          // Red exit zones
          ctx.fillStyle = "#EF4444";
          ctx.beginPath();
          ctx.arc(
            stadium.center.x,
            stadium.center.y,
            stadium.outerRadius,
            startAngle,
            endAngle,
          );
          ctx.arc(
            stadium.center.x,
            stadium.center.y,
            stadium.innerRadius,
            endAngle,
            startAngle,
            true,
          );
          ctx.closePath();
          ctx.fill();

          // Warning icon
          const centerAngle = (startAngle + endAngle) / 2;
          const iconRadius = (stadium.outerRadius + stadium.innerRadius) / 2;
          const iconX = stadium.center.x + Math.cos(centerAngle) * iconRadius;
          const iconY = stadium.center.y + Math.sin(centerAngle) * iconRadius;
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("⚠️", iconX, iconY);
        }
      }
    }

    stadiumCacheRef.current = offscreenCanvas;
  }, [
    gameState.stadium,
    gameState.arenaConfig,
    theme.palette.background.default,
  ]);

  // Eagerly build stadium cache on mount (before images load)
  useEffect(() => {
    // Build stadium cache immediately to eliminate lag
    renderStadiumToCache();
  }, [renderStadiumToCache]); // Run once on mount and when dependencies change

  // Load game assets
  useEffect(() => {
    const loadImages = async () => {
      try {
        const imageMap = new Map<string, HTMLImageElement>();
        const loadPromises: Promise<void>[] = [];

        // Load beyblade images with higher priority
        gameState.beyblades.forEach((beyblade) => {
          const promise = new Promise<void>((resolve, reject) => {
            const img = new Image();
            // Set decoding mode for better performance
            img.decoding = "async";
            img.onload = () => {
              const key = beyblade.config.fileName.replace(".svg", "");
              imageMap.set(key, img);
              resolve();
            };
            img.onerror = () => {
              console.warn(
                `Failed to load beyblade image: ${beyblade.config.fileName}`,
              );
              resolve(); // Continue even if one image fails
            };
            img.src = `/assets/svg/beyblades/${beyblade.config.fileName}`;
          });
          loadPromises.push(promise);
        });

        // Load stadium image
        const stadiumPromise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            stadiumImageRef.current = img;
            resolve();
          };
          img.onerror = () => {
            console.warn("Failed to load stadium image");
            resolve(); // Continue with fallback rendering
          };
          img.src = `/assets/svg/beyblades/stadium.svg`;
        });
        loadPromises.push(stadiumPromise);

        await Promise.all(loadPromises);
        beybladeImagesRef.current = imageMap;
        setImagesLoaded(true);

        // Update stadium cache with loaded images if needed
        renderStadiumToCache();
      } catch (error) {
        console.error("Failed to load game images:", error);
        setImagesLoaded(true); // Continue with fallback rendering
      }
    };

    loadImages();
  }, [gameState.beyblades, renderStadiumToCache]);

  // Handle canvas scaling for different screen sizes
  useEffect(() => {
    const updateCanvasScale = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = window.innerHeight * 0.7; // Max 70vh
      const canvasSize = 800; // Square canvas (800x800)

      // Calculate scale to fit within container (proportional)
      const scale = Math.min(
        containerWidth / canvasSize,
        containerHeight / canvasSize,
        1.2, // Cap at 1.2x for better control on large screens
      );

      setCanvasScale(scale);
    };

    updateCanvasScale();
    window.addEventListener("resize", updateCanvasScale);

    return () => {
      window.removeEventListener("resize", updateCanvasScale);
    };
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onMouseMove) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scale = 800 / rect.width; // Uniform scale for square canvas

      const position = {
        x: (event.clientX - rect.left) * scale,
        y: (event.clientY - rect.top) * scale,
      };
      onMouseMove(position);
    },
    [onMouseMove],
  );

  // Handle touch events
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (!onTouchStart) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scale = 800 / rect.width; // Uniform scale for square canvas

      const position = {
        x: (touch.clientX - rect.left) * scale,
        y: (touch.clientY - rect.top) * scale,
      };
      onTouchStart(position);
    },
    [onTouchStart],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (!onTouchMove) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      const scale = 800 / rect.width; // Uniform scale for square canvas

      const position = {
        x: (touch.clientX - rect.left) * scale,
        y: (touch.clientY - rect.top) * scale,
      };
      onTouchMove(position);
    },
    [onTouchMove],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (onTouchEnd) onTouchEnd();
    },
    [onTouchEnd],
  );

  // Render game state - stable function that uses refs
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", {
      alpha: false, // Performance: no transparency needed
      desynchronized: true, // Performance: allow async rendering
      willReadFrequently: false, // Performance: optimize for writing
    });
    if (!ctx) return;

    // Performance optimization: use image smoothing only when needed
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const currentTime = Date.now();
    const currentGameState = gameStateRef.current;
    const currentImagesLoaded = imagesLoadedRef.current;

    // Use cached stadium if available, otherwise draw full background
    if (stadiumCacheRef.current) {
      ctx.drawImage(stadiumCacheRef.current, 0, 0);
    } else {
      ctx.fillStyle = theme.palette.background.default;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGameZones(
        ctx,
        currentGameState.stadium,
        theme.palette,
        currentGameState,
        currentTime,
      );
    }

    // Only draw dynamic blue circles (not static stadium)
    drawDynamicBlueCircles(
      ctx,
      currentGameState.stadium,
      theme.palette,
      currentGameState,
      currentTime,
    );

    // Draw beyblades
    currentGameState.beyblades.forEach((beyblade) => {
      drawBeyblade(
        ctx,
        beyblade,
        currentImagesLoaded,
        beybladeImagesRef.current,
        theme.palette,
        currentTime,
      );
    });

    // Draw UI elements
    drawGameUI(
      ctx,
      currentGameState,
      theme.palette,
      beybladeImagesRef.current,
      currentTime,
    );
  }, [theme.palette]); // Only recreate if theme changes

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      // Keep animating during countdown OR when playing
      if (gameState.isPlaying || gameState.countdownActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation loop when playing OR countdown is active
    if (gameState.isPlaying || gameState.countdownActive) {
      animate();
    } else {
      // Render once when not playing and no countdown
      render();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, gameState.isPlaying, gameState.countdownActive]);

  return (
    <>
      {isScreenTooSmall ? (
        <div
          className="flex flex-col items-center justify-center p-8 border-4 rounded-xl shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800"
          style={{
            borderColor: theme.palette.error.main,
            minHeight: "400px",
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-red-500">
              Screen Too Small
            </h2>
            <p className="text-gray-300 text-lg">
              The Beyblade Arena requires a minimum screen size of{" "}
              <strong>400x400 pixels</strong>.
            </p>
            <p className="text-gray-400 text-sm">
              Current screen: {Math.min(window.innerWidth, window.innerHeight)}
              px
            </p>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm">
                Please use a device with a larger screen or rotate your device
                to landscape mode.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className={`border-4 rounded-xl shadow-2xl transition-all duration-300 ${
            gameState.isPlaying ? "cursor-crosshair" : "cursor-default"
          } ${className}`}
          style={{
            touchAction: "none",
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 30px ${theme.palette.primary.main}40`,
            aspectRatio: "1/1", // Force square aspect ratio
            // Stadium scaling: 100cm = 100vmin
            // On 400x400px screen: 100vmin = 400px, so 1cm = 4px
            // Beyblade radius in cm maps directly to pixels (no 10x scaling)
            width: "100vmin", // Stadium is 100cm = 100vmin
            minWidth: "400px", // Minimum size (4px per cm)
            height: "100vmin",
            minHeight: "400px",
            maxWidth: "800px", // Maximum size (8px per cm)
            maxHeight: "800px",
            display: "block",
            margin: "0 auto",
            imageRendering: "crisp-edges", // Prevent image smoothing/distortion
          }}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        />
      )}
    </>
  );
};

// Helper functions for drawing
const drawDynamicBlueCircles = (
  ctx: CanvasRenderingContext2D,
  stadium: any,
  colors: any,
  gameState: GameState,
  currentTime: number,
) => {
  // Check if any beyblade can use normal loop (200 radius)
  const canNormalLoop = gameState.beyblades.some(
    (b) =>
      !b.isDead &&
      !b.isOutOfBounds &&
      (!b.normalLoopCooldownEnd ||
        gameState.gameTime >= b.normalLoopCooldownEnd),
  );

  // Draw blue circle for normal loop (200 radius) - always visible when available
  if (canNormalLoop) {
    ctx.strokeStyle = `rgba(59, 130, 246, 0.6)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.normalLoopRadius,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Check if any beyblade can charge dash
  const canChargeDash = gameState.beyblades.some(
    (b) =>
      !b.isDead &&
      !b.isOutOfBounds &&
      (!b.blueLoopCooldownEnd || gameState.gameTime >= b.blueLoopCooldownEnd),
  );

  // Draw blue circle for charge dash (300 radius) when available
  if (canChargeDash) {
    ctx.strokeStyle = `rgba(59, 130, 246, 0.6)`;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.chargeDashRadius,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw 3 charge points on blue circle at 30°, 150°, 270°
  const chargePointAngles = [30, 150, 270];
  const activeBey = gameState.beyblades.find((b) => b.isInBlueLoop);
  const selectedChargePoint = activeBey?.selectedChargePointAngle;

  for (const angleDegrees of chargePointAngles) {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const chargePointX =
      stadium.center.x + Math.cos(angleRadians) * stadium.chargeDashRadius;
    const chargePointY =
      stadium.center.y + Math.sin(angleRadians) * stadium.chargeDashRadius;

    const isSelected = selectedChargePoint === angleDegrees;
    const pointSize = isSelected ? 15 : 10;

    // Outer glow
    ctx.fillStyle = isSelected
      ? `${colors.primary.main}80`
      : `${colors.primary.main}40`;
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pointSize * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Main charge point
    ctx.fillStyle = isSelected ? "#FF4500" : colors.primary.main;
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pointSize, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pointSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Targeting indicator for selected charge point
    if (isSelected) {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(chargePointX, chargePointY, pointSize * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};

const drawGameZones = (
  ctx: CanvasRenderingContext2D,
  stadium: any,
  colors: any,
  gameState: GameState,
  currentTime: number,
) => {
  // Draw main arena floor (inner circle) with subtle gradient
  const floorGradient = ctx.createRadialGradient(
    stadium.center.x,
    stadium.center.y,
    0,
    stadium.center.x,
    stadium.center.y,
    stadium.innerRadius,
  );
  floorGradient.addColorStop(0, "#1a1a1a");
  floorGradient.addColorStop(0.7, "#2a2a2a");
  floorGradient.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = floorGradient;
  ctx.beginPath();
  ctx.arc(
    stadium.center.x,
    stadium.center.y,
    stadium.innerRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Check if any beyblade can use normal loop (200 radius)
  const canNormalLoop = gameState.beyblades.some(
    (b) =>
      !b.isDead &&
      !b.isOutOfBounds &&
      (!b.normalLoopCooldownEnd ||
        gameState.gameTime >= b.normalLoopCooldownEnd),
  );

  // Draw blue circle for normal loop (200 radius) - always visible when available
  if (canNormalLoop) {
    // Solid blue circle without pulsing or glow
    ctx.strokeStyle = `rgba(59, 130, 246, 0.6)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]); // Dashed line
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.normalLoopRadius,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash
  }

  // Check if any beyblade can charge dash (has completed blue loop recently)
  const canChargeDash = gameState.beyblades.some(
    (b) =>
      !b.isDead &&
      !b.isOutOfBounds &&
      (!b.blueLoopCooldownEnd || gameState.gameTime >= b.blueLoopCooldownEnd),
  );

  // Draw blue circle for charge dash (350 radius) when available
  if (canChargeDash) {
    // Solid blue circle without pulsing or glow
    ctx.strokeStyle = `rgba(59, 130, 246, 0.6)`;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]); // Dashed line
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.chargeDashRadius,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash
  }

  // Draw angle-based zones
  const angleRanges = [
    { start: 0, end: 60, isWall: true },
    { start: 60, end: 120, isWall: false },
    { start: 120, end: 180, isWall: true },
    { start: 180, end: 240, isWall: false },
    { start: 240, end: 300, isWall: true },
    { start: 300, end: 360, isWall: false },
  ];

  for (const range of angleRanges) {
    const startAngle = (range.start * Math.PI) / 180;
    const endAngle = (range.end * Math.PI) / 180;

    if (range.isWall) {
      // Yellow wall zones with black wall design
      ctx.fillStyle = "#FBBF24";
      ctx.beginPath();
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius,
        startAngle,
        endAngle,
      );
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.innerRadius,
        endAngle,
        startAngle,
        true,
      );
      ctx.closePath();
      ctx.fill();

      // Draw black wall pattern at the outer edge
      const wallThickness = 15;
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius,
        startAngle,
        endAngle,
      );
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius - wallThickness,
        endAngle,
        startAngle,
        true,
      );
      ctx.closePath();
      ctx.fill();

      // Add brick/panel pattern on the black wall
      const numBricks = 8;
      const angleStep = (endAngle - startAngle) / numBricks;
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 2;

      for (let i = 1; i < numBricks; i++) {
        const brickAngle = startAngle + angleStep * i;
        const innerR = stadium.outerRadius - wallThickness;
        const outerR = stadium.outerRadius;

        ctx.beginPath();
        ctx.moveTo(
          stadium.center.x + Math.cos(brickAngle) * innerR,
          stadium.center.y + Math.sin(brickAngle) * innerR,
        );
        ctx.lineTo(
          stadium.center.x + Math.cos(brickAngle) * outerR,
          stadium.center.y + Math.sin(brickAngle) * outerR,
        );
        ctx.stroke();
      }

      // Add horizontal line in the middle
      const midRadius = stadium.outerRadius - wallThickness / 2;
      ctx.beginPath();
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        midRadius,
        startAngle,
        endAngle,
      );
      ctx.stroke();
    } else {
      // Red exit zones (keep same)
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius,
        startAngle,
        endAngle,
      );
      ctx.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.innerRadius,
        endAngle,
        startAngle,
        true,
      );
      ctx.closePath();
      ctx.fill();

      // Add danger icons for exit zones
      const centerAngle = (startAngle + endAngle) / 2;
      const iconRadius = (stadium.outerRadius + stadium.innerRadius) / 2;
      const iconX = stadium.center.x + Math.cos(centerAngle) * iconRadius;
      const iconY = stadium.center.y + Math.sin(centerAngle) * iconRadius;

      // Draw danger icon (warning triangle)
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚠️", iconX, iconY);
    }
  }

  // Draw 3 charge points on blue circle at 30°, 150°, 270°
  const chargePointAngles = [30, 150, 270];

  // Check if any beyblade is in a blue loop to highlight selected charge point
  const activeBey = gameState.beyblades.find((b) => b.isInBlueLoop);
  const selectedChargePoint = activeBey?.selectedChargePointAngle;

  for (const angleDegrees of chargePointAngles) {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const chargePointX =
      stadium.center.x + Math.cos(angleRadians) * stadium.chargeDashRadius;
    const chargePointY =
      stadium.center.y + Math.sin(angleRadians) * stadium.chargeDashRadius;

    const isSelected = selectedChargePoint === angleDegrees;
    // Fixed sizes without pulsing
    const pointSize = isSelected ? 15 : 10;

    // Outer glow - brighter for selected point
    ctx.fillStyle = isSelected
      ? `${colors.primary.main}80`
      : `${colors.primary.main}40`;
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pointSize * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Main charge point - different color for selected
    ctx.fillStyle = isSelected ? "#FF4500" : colors.primary.main;
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pointSize, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pointSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Add targeting indicator for selected charge point
    if (isSelected) {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(chargePointX, chargePointY, pointSize * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};

const drawBeyblade = (
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  imagesLoaded: boolean,
  images: Map<string, HTMLImageElement>,
  colors: any,
  currentTime: number,
) => {
  ctx.save();
  ctx.translate(beyblade.position.x, beyblade.position.y);

  const time = currentTime / 1000;

  // Handle out-of-bounds state
  if (beyblade.isOutOfBounds && beyblade.isDead) {
    const pulseIntensity = 0.5 + 0.5 * Math.sin(time * 4);
    const exitRadius = beyblade.radius * 2;

    // Draw exit indicator
    ctx.fillStyle = `rgba(220, 38, 38, ${0.3 * pulseIntensity})`;
    ctx.beginPath();
    ctx.arc(0, 0, exitRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(220, 38, 38, ${0.6 * pulseIntensity})`;
    ctx.beginPath();
    ctx.arc(0, 0, exitRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw dodge animation effects
  if (beyblade.lastDodgeTime && currentTime - beyblade.lastDodgeTime < 500) {
    const dodgeProgress = (currentTime - beyblade.lastDodgeTime) / 500;
    const dodgeOpacity = 1 - dodgeProgress;

    // Afterimage trail effect
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = dodgeOpacity * (0.3 / i);
      ctx.fillStyle = "#22C55E";
      ctx.beginPath();
      ctx.arc(-i * 15, 0, beyblade.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Speed lines
    ctx.strokeStyle = `rgba(34, 197, 94, ${dodgeOpacity})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const startRadius = beyblade.radius + 10;
      const endRadius = beyblade.radius + 30;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * startRadius, Math.sin(angle) * startRadius);
      ctx.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
      ctx.stroke();
    }
  }

  // Draw heavy attack animation (normal attack)
  if (beyblade.heavyAttackActive && beyblade.heavyAttackEndTime) {
    const attackProgress =
      1 - (beyblade.heavyAttackEndTime - currentTime) / 2000;
    const attackOpacity = Math.sin(attackProgress * Math.PI);

    // Orange energy ring
    ctx.strokeStyle = `rgba(251, 146, 60, ${attackOpacity * 0.8})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, beyblade.radius + 10 + attackProgress * 15, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating energy particles
    for (let i = 0; i < 8; i++) {
      const particleAngle = (Math.PI * 2 * i) / 8 + time * 3;
      const particleRadius = beyblade.radius + 15;
      const particleX = Math.cos(particleAngle) * particleRadius;
      const particleY = Math.sin(particleAngle) * particleRadius;

      ctx.fillStyle = `rgba(251, 146, 60, ${attackOpacity})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw ultimate attack animation (power attack)
  if (beyblade.ultimateAttackActive && beyblade.ultimateAttackEndTime) {
    const ultimateProgress =
      1 - (beyblade.ultimateAttackEndTime - currentTime) / 3000;
    const ultimateOpacity = Math.sin(ultimateProgress * Math.PI);

    // Red energy explosion
    const explosionRadius = beyblade.radius + ultimateProgress * 50;
    const gradient = ctx.createRadialGradient(
      0,
      0,
      beyblade.radius,
      0,
      0,
      explosionRadius,
    );
    gradient.addColorStop(0, `rgba(239, 68, 68, 0)`);
    gradient.addColorStop(0.5, `rgba(239, 68, 68, ${ultimateOpacity * 0.5})`);
    gradient.addColorStop(1, `rgba(239, 68, 68, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, explosionRadius, 0, Math.PI * 2);
    ctx.fill();

    // Lightning bolts
    ctx.strokeStyle = `rgba(255, 215, 0, ${ultimateOpacity})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const boltAngle = (Math.PI * 2 * i) / 6 + time * 2;
      const boltLength = explosionRadius * 0.8;

      ctx.beginPath();
      ctx.moveTo(0, 0);

      // Jagged lightning effect
      let currentRadius = 0;
      let currentAngle = boltAngle;
      while (currentRadius < boltLength) {
        currentRadius += 10;
        currentAngle += (Math.random() - 0.5) * 0.3;
        ctx.lineTo(
          Math.cos(currentAngle) * currentRadius,
          Math.sin(currentAngle) * currentRadius,
        );
      }
      ctx.stroke();
    }

    // Text indicator
    ctx.font = "bold 14px Inter";
    ctx.fillStyle = `rgba(255, 215, 0, ${ultimateOpacity})`;
    ctx.textAlign = "center";
    ctx.fillText("POWER ATTACK!", 0, -beyblade.radius - 25);
  }

  // Draw beyblade
  ctx.rotate(beyblade.rotation);
  const beybladeImage = images.get(
    beyblade.config.fileName.replace(".svg", ""),
  );

  if (imagesLoaded && beybladeImage) {
    const opacity = beyblade.isOutOfBounds ? 0.4 : 1.0;
    ctx.globalAlpha = opacity;
    // Beyblade radius is in cm, display at 1:1 scale (1cm = 1vmin = 4px on 400x400 screen)
    // No 10x scaling - direct mapping
    const size = beyblade.radius * 2;
    // Draw as perfect square to prevent distortion
    ctx.drawImage(beybladeImage, -size / 2, -size / 2, size, size);
    ctx.globalAlpha = 1.0;
  } else {
    // Fallback circle with theme colors
    ctx.fillStyle = beyblade.isPlayer
      ? colors.primary.main
      : colors.secondary.main;
    ctx.beginPath();
    ctx.arc(0, 0, beyblade.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Draw "OUT OF BOUNDS" text for eliminated beyblades
  if (beyblade.isOutOfBounds && beyblade.isDead) {
    ctx.font = "bold 12px Inter";
    ctx.fillStyle = "#DC2626";
    ctx.textAlign = "center";
    ctx.fillText(
      "OUT OF BOUNDS",
      beyblade.position.x,
      beyblade.position.y - beyblade.radius - 20,
    );
  }
};

const drawGameUI = (
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  colors: any,
  beybladeImages: Map<string, HTMLImageElement> | null = null,
  currentTime?: number,
) => {
  const canvasWidth = 800;
  const canvasHeight = 800; // Square canvas
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  ctx.font = "bold 18px Inter";
  ctx.fillStyle = "#fff";

  const timeText = `Time: ${gameState.gameTime.toFixed(1)}s`;
  ctx.textAlign = "center";
  ctx.fillText(timeText, centerX, 30); // Positioned near top

  // Draw player stats in top-left corner
  const playerBey = gameState.beyblades.find((b) => b.isPlayer);
  if (playerBey && !playerBey.isOutOfBounds && !playerBey.isDead) {
    drawCornerStats(ctx, playerBey, "PLAYER", 20, 15, colors, true);
  }

  // Draw AI stats in top-right corner
  const aiBey = gameState.beyblades.find((b) => !b.isPlayer);
  if (aiBey && !aiBey.isOutOfBounds && !aiBey.isDead) {
    drawCornerStats(ctx, aiBey, "AI", canvasWidth - 120, 15, colors, false);
  }

  ctx.textAlign = "left"; // Reset text alignment

  // Draw countdown overlay
  if (gameState.countdownActive) {
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw countdown text
    ctx.font = "bold 120px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (gameState.countdownValue > 0) {
      // Numbers 3, 2, 1
      ctx.fillStyle = "#FFD700";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 6;

      const countText = gameState.countdownValue.toString();
      ctx.strokeText(countText, centerX, centerY);
      ctx.fillText(countText, centerX, centerY);
    } else {
      // "LET IT RIP!" text
      ctx.font = "bold 80px Inter";
      ctx.fillStyle = "#FF4500";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 4;

      const ripText = "LET IT RIP!";
      ctx.strokeText(ripText, centerX, centerY);
      ctx.fillText(ripText, centerX, centerY);
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // Draw cinematic special move banner
  if (gameState.cinematicBanner?.show) {
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 20, 0.85)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw banner background with cinematic gradient
    const bannerY = 250;
    const bannerHeight = 200;
    const gradient = ctx.createLinearGradient(
      0,
      bannerY,
      0,
      bannerY + bannerHeight,
    );
    gradient.addColorStop(0, "#9C27B090");
    gradient.addColorStop(0.5, "#FF9800A0");
    gradient.addColorStop(1, "#F4433690");

    ctx.fillStyle = gradient;
    ctx.fillRect(50, bannerY, canvasWidth - 100, bannerHeight);

    // Draw banner border with glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FF9800";
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    ctx.strokeRect(50, bannerY, canvasWidth - 100, bannerHeight);
    ctx.shadowBlur = 0;

    // Draw special move name
    ctx.font = "bold 56px Inter";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;

    const moveName = gameState.cinematicBanner.moveName;
    ctx.strokeText(moveName, centerX, bannerY + 90);
    ctx.fillText(moveName, centerX, bannerY + 90);

    // Draw user name
    ctx.font = "bold 32px Inter";
    ctx.fillStyle = "#fff";
    const userName = gameState.cinematicBanner.userName;
    ctx.strokeText(userName, centerX, bannerY + 140);
    ctx.fillText(userName, centerX, bannerY + 140);
  }

  // Draw winner announcement with enhanced banner
  if (!gameState.isPlaying && gameState.winner) {
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw banner background
    const bannerY = 150;
    const bannerHeight = 300;
    const gradient = ctx.createLinearGradient(
      0,
      bannerY,
      0,
      bannerY + bannerHeight,
    );
    gradient.addColorStop(0, `${colors.primary.main}90`);
    gradient.addColorStop(0.5, `${colors.secondary.main}80`);
    gradient.addColorStop(1, `${colors.secondary.main}70`);

    ctx.fillStyle = gradient;
    ctx.fillRect(100, bannerY, canvasWidth - 200, bannerHeight);

    // Draw banner border
    ctx.strokeStyle = colors.primary.main;
    ctx.lineWidth = 4;
    ctx.strokeRect(100, bannerY, canvasWidth - 200, bannerHeight);

    // Draw winner image if available
    const winnerImageKey = gameState.winner.config.fileName.replace(".svg", "");
    const winnerImage = beybladeImages?.get(winnerImageKey);

    if (winnerImage) {
      const imageSize = 120;
      const imageX = centerX - imageSize / 2;
      const imageY = bannerY + 40;

      ctx.save();
      ctx.translate(imageX + imageSize / 2, imageY + imageSize / 2);
      ctx.rotate((currentTime || Date.now()) / 1000); // Spinning effect
      ctx.drawImage(
        winnerImage,
        -imageSize / 2,
        -imageSize / 2,
        imageSize,
        imageSize,
      );
      ctx.restore();
    }

    // Draw victory text
    ctx.font = "bold 48px Inter";
    ctx.fillStyle = "#FFD700";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;

    const winText = `${gameState.winner.config.name} Wins!`;
    ctx.strokeText(winText, centerX, bannerY + 200);
    ctx.fillText(winText, centerX, bannerY + 200);

    ctx.font = "bold 24px Inter";
    ctx.fillStyle = "#fff";
    const subText = gameState.winner.isPlayer ? "🏆 Victory!" : "💀 Defeat!";
    ctx.strokeText(subText, centerX, bannerY + 240);
    ctx.fillText(subText, centerX, bannerY + 240);

    // Draw both beyblade images at bottom for comparison
    const allBeyblades = gameState.beyblades;
    if (allBeyblades.length >= 2) {
      allBeyblades.forEach((beyblade, index) => {
        const beybladeImageKey = beyblade.config.fileName.replace(".svg", "");
        const beybladeImage = beybladeImages?.get(beybladeImageKey);

        if (beybladeImage) {
          const smallImageSize = 80;
          const spacing = 200;
          const startX = centerX - (spacing * (allBeyblades.length - 1)) / 2;
          const imageX = startX + index * spacing - smallImageSize / 2;
          const imageY = bannerY + 280;

          // Highlight winner
          if (beyblade === gameState.winner) {
            ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
            ctx.fillRect(
              imageX - 10,
              imageY - 10,
              smallImageSize + 20,
              smallImageSize + 20,
            );
          }

          ctx.drawImage(
            beybladeImage,
            imageX,
            imageY,
            smallImageSize,
            smallImageSize,
          );

          // Draw beyblade name
          ctx.font = "bold 14px Inter";
          ctx.fillStyle = beyblade === gameState.winner ? "#FFD700" : "#fff";
          ctx.textAlign = "center";
          ctx.fillText(
            beyblade.config.name,
            imageX + smallImageSize / 2,
            imageY + smallImageSize + 20,
          );
        }
      });
    }

    ctx.textAlign = "left";
  }

  // Controls legend removed for performance optimization
};

const drawCornerStats = (
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  label: string,
  x: number,
  y: number,
  colors: any,
  isPlayer: boolean,
) => {
  const width = 100;
  const height = 80;

  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(x, y, width, height);

  // Border
  ctx.strokeStyle = isPlayer ? colors.primary.main : colors.secondary.main;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Label
  ctx.font = "bold 12px Inter";
  ctx.fillStyle = isPlayer ? colors.primary.main : colors.secondary.main;
  ctx.textAlign = "center";
  ctx.fillText(label, x + width / 2, y + 15);

  // Control status
  if (isPlayer && (beyblade.isInBlueLoop || beyblade.isChargeDashing)) {
    ctx.font = "bold 10px Inter";
    ctx.fillStyle = "#FF6B6B";
    if (
      beyblade.isInBlueLoop &&
      beyblade.selectedChargePointAngle !== undefined
    ) {
      const chargePointNames = { 30: "TOP", 150: "LEFT", 270: "BOTTOM" };
      const pointName =
        chargePointNames[
          beyblade.selectedChargePointAngle as keyof typeof chargePointNames
        ] || "???";
      ctx.fillText(`TARGET: ${pointName}`, x + width / 2, y + 28);
    } else {
      ctx.fillText("AUTO CONTROL", x + width / 2, y + 28);
    }
  }

  // Spin bar
  const spinBarY = y + 35;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(x + 5, spinBarY, width - 10, 8);

  const spinFillWidth = (beyblade.spin / 2000) * (width - 10);
  let spinColor;
  if (beyblade.spin > 1400) spinColor = "#22C55E";
  else if (beyblade.spin > 800) spinColor = "#F59E0B";
  else if (beyblade.spin > 300) spinColor = "#FF9800";
  else spinColor = "#EF4444";

  ctx.fillStyle = spinColor;
  // For AI (not player), draw bar from right to left
  if (!isPlayer) {
    ctx.fillRect(x + width - 5 - spinFillWidth, spinBarY, spinFillWidth, 8);
  } else {
    ctx.fillRect(x + 5, spinBarY, spinFillWidth, 8);
  }

  // Power bar (replaces acceleration)
  const powerBarY = y + 50;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(x + 5, powerBarY, width - 10, 8);

  const maxPower = 25;
  const powerFillWidth = ((beyblade.power || 0) / maxPower) * (width - 10);
  ctx.fillStyle = beyblade.isChargeDashing ? "#FF4500" : colors.secondary.main;
  // For AI (not player), draw bar from right to left
  if (!isPlayer) {
    ctx.fillRect(x + width - 5 - powerFillWidth, powerBarY, powerFillWidth, 8);
  } else {
    ctx.fillRect(x + 5, powerBarY, powerFillWidth, 8);
  }

  // Text values
  ctx.font = "bold 10px Inter";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.fillText(`Spin: ${Math.floor(beyblade.spin)}`, x + 5, y + 68);
  ctx.fillText(
    `Power: ${Math.floor(beyblade.power || 0)}/${maxPower}`,
    x + 5,
    y + 78,
  );
};

export default GameArena;
