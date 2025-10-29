"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import { GameState, GameBeyblade, Vector2D } from "../types/game";
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
  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const [canvasScale, setCanvasScale] = React.useState(1);
  const theme = useTheme();

  // Load game assets
  useEffect(() => {
    const loadImages = async () => {
      try {
        const imageMap = new Map<string, HTMLImageElement>();
        const loadPromises: Promise<void>[] = [];

        // Load beyblade images
        gameState.beyblades.forEach((beyblade) => {
          const promise = new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const key = beyblade.config.fileName.replace(".svg", "");
              imageMap.set(key, img);
              resolve();
            };
            img.onerror = reject;
            img.src = `/assets/svg/beyblades/${beyblade.config.fileName}`;
          });
          loadPromises.push(promise);
        });

        // Load stadium image
        const stadiumPromise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            stadiumImageRef.current = img;
            resolve();
          };
          img.onerror = reject;
          img.src = `/assets/svg/beyblades/stadium.svg`;
        });
        loadPromises.push(stadiumPromise);

        await Promise.all(loadPromises);
        beybladeImagesRef.current = imageMap;
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to load game images:", error);
        setImagesLoaded(true); // Continue with fallback rendering
      }
    };

    loadImages();
  }, [gameState.beyblades]);

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
        1.2 // Cap at 1.2x for better control on large screens
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
    [onMouseMove]
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
    [onTouchStart]
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
    [onTouchMove]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (onTouchEnd) onTouchEnd();
    },
    [onTouchEnd]
  );

  // Render game state
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const stadium = gameState.stadium;

    // Draw stadium background
    if (imagesLoaded && stadiumImageRef.current) {
      const stadiumSize = stadium.outerRadius * 2.8;
      ctx.save();
      ctx.translate(stadium.center.x, stadium.center.y);
      ctx.drawImage(
        stadiumImageRef.current,
        -stadiumSize / 2,
        -stadiumSize / 2,
        stadiumSize,
        stadiumSize
      );
      ctx.restore();
    } else {
      // Fallback gradient background with theme colors
      const gradient = ctx.createRadialGradient(
        stadium.center.x,
        stadium.center.y,
        0,
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius
      );
      gradient.addColorStop(0, theme.palette.background.default);
      gradient.addColorStop(0.7, theme.palette.secondary.main);
      gradient.addColorStop(1, theme.palette.primary.main);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw game zones with theme colors
    drawGameZones(ctx, stadium, theme.palette, gameState);

    // Draw beyblades
    gameState.beyblades.forEach((beyblade) => {
      drawBeyblade(
        ctx,
        beyblade,
        imagesLoaded,
        beybladeImagesRef.current,
        theme.palette
      );
    });

    // Draw UI elements
    drawGameUI(ctx, gameState, theme.palette, beybladeImagesRef.current);
  }, [gameState, imagesLoaded, theme.palette]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      render();
      if (gameState.isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [render, gameState.isPlaying]);

  return (
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
        aspectRatio: "1/1", // Square aspect ratio
        width: "100%",
        maxWidth: "min(100vw, 70vh, 800px)", // Fit within viewport while maintaining square
        height: "auto",
        display: "block",
        margin: "0 auto",
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

// Helper functions for drawing
const drawGameZones = (
  ctx: CanvasRenderingContext2D,
  stadium: any,
  colors: any,
  gameState: GameState
) => {
  // Draw main arena (inner circle)
  ctx.fillStyle = `${colors.background.default}20`;
  ctx.beginPath();
  ctx.arc(
    stadium.center.x,
    stadium.center.y,
    stadium.innerRadius,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw angle-based zones with charge points on blue circle
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

    ctx.fillStyle = range.isWall
      ? "#FBBF24" // Bright yellow for wall zones
      : "#EF4444"; // Bright red for exit zones

    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.outerRadius,
      startAngle,
      endAngle
    );
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.innerRadius,
      endAngle,
      startAngle,
      true
    );
    ctx.closePath();
    ctx.fill();

    // Add danger icons for exit zones
    if (!range.isWall) {
      const centerAngle = (startAngle + endAngle) / 2;
      const iconRadius = (stadium.outerRadius + stadium.innerRadius) / 2;
      const iconX = stadium.center.x + Math.cos(centerAngle) * iconRadius;
      const iconY = stadium.center.y + Math.sin(centerAngle) * iconRadius;

      // Draw danger icon (warning triangle)
      ctx.fillStyle = "#FFFFFF"; // White warning color for better visibility
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚠️", iconX, iconY);
    }
  }

  // Draw charge points on blue circle at 90°, 210°, 330°
  const chargePointAngles = [30, 150, 270];
  const time = Date.now() / 1000;

  // Check if any beyblade is in a blue loop to highlight selected charge point
  const activeBey = gameState.beyblades.find((b) => b.isInBlueLoop);
  const selectedChargePoint = activeBey?.selectedChargePointAngle;

  for (const angleDegrees of chargePointAngles) {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const chargePointX =
      stadium.center.x + Math.cos(angleRadians) * stadium.innerRadius;
    const chargePointY =
      stadium.center.y + Math.sin(angleRadians) * stadium.innerRadius;

    const isSelected = selectedChargePoint === angleDegrees;
    const pulseSize = isSelected
      ? 15 + 5 * Math.sin(time * 6) // Larger, faster pulse for selected point
      : 10 + 3 * Math.sin(time * 4); // Normal pulse for other points

    // Outer glow - brighter for selected point
    ctx.fillStyle = isSelected
      ? `${colors.primary.main}80`
      : `${colors.primary.main}40`;
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pulseSize * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Main charge point - different color for selected
    ctx.fillStyle = isSelected ? "#FF4500" : colors.primary.main;
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(chargePointX, chargePointY, pulseSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Add targeting indicator for selected charge point
    if (isSelected) {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(chargePointX, chargePointY, pulseSize * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
};

const drawBeyblade = (
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  imagesLoaded: boolean,
  images: Map<string, HTMLImageElement>,
  colors: any
) => {
  ctx.save();
  ctx.translate(beyblade.position.x, beyblade.position.y);

  // Handle out-of-bounds state
  if (beyblade.isOutOfBounds && beyblade.isDead) {
    const time = Date.now() / 1000;
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

  // Draw beyblade
  ctx.rotate(beyblade.rotation);
  const beybladeImage = images.get(
    beyblade.config.fileName.replace(".svg", "")
  );

  if (imagesLoaded && beybladeImage) {
    const opacity = beyblade.isOutOfBounds ? 0.4 : 1.0;
    ctx.globalAlpha = opacity;
    const size = beyblade.radius * 1.8; // Reduced multiplier for smaller visual size
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
      beyblade.position.y - beyblade.radius - 20
    );
  }
};

const drawGameUI = (
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  colors: any,
  beybladeImages: Map<string, HTMLImageElement> | null = null
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
      bannerY + bannerHeight
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
      ctx.rotate(Date.now() / 1000); // Spinning effect
      ctx.drawImage(
        winnerImage,
        -imageSize / 2,
        -imageSize / 2,
        imageSize,
        imageSize
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
              smallImageSize + 20
            );
          }

          ctx.drawImage(
            beybladeImage,
            imageX,
            imageY,
            smallImageSize,
            smallImageSize
          );

          // Draw beyblade name
          ctx.font = "bold 14px Inter";
          ctx.fillStyle = beyblade === gameState.winner ? "#FFD700" : "#fff";
          ctx.textAlign = "center";
          ctx.fillText(
            beyblade.config.name,
            imageX + smallImageSize / 2,
            imageY + smallImageSize + 20
          );
        }
      });
    }

    ctx.textAlign = "left";
  }
};

const drawCornerStats = (
  ctx: CanvasRenderingContext2D,
  beyblade: GameBeyblade,
  label: string,
  x: number,
  y: number,
  colors: any,
  isPlayer: boolean
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
  ctx.fillRect(x + 5, spinBarY, spinFillWidth, 8);

  // Acceleration bar
  const accelBarY = y + 50;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(x + 5, accelBarY, width - 10, 8);

  const maxAccel = beyblade.currentMaxAcceleration;
  const accelFillWidth = (beyblade.acceleration / maxAccel) * (width - 10);
  ctx.fillStyle = beyblade.isChargeDashing ? "#FF4500" : colors.secondary.main;
  ctx.fillRect(x + 5, accelBarY, accelFillWidth, 8);

  // Text values
  ctx.font = "bold 10px Inter";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.fillText(`Spin: ${Math.floor(beyblade.spin)}`, x + 5, y + 68);
  ctx.fillText(
    `Accel: ${beyblade.acceleration}/${Math.floor(
      beyblade.currentMaxAcceleration
    )}`,
    x + 5,
    y + 78
  );
};

export default GameArena;
