"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Application,
  Graphics,
  Sprite,
  Text,
  Container,
  Assets,
} from "pixi.js";
import { GameState, GameBeyblade, Vector2D } from "../types/game";

interface GameArenaProps {
  gameState: GameState;
  onMouseMove?: (position: Vector2D) => void;
  onTouchMove?: (position: Vector2D) => void;
  onTouchStart?: (position: Vector2D) => void;
  onTouchEnd?: () => void;
  className?: string;
}

const GameArenaPixi: React.FC<GameArenaProps> = ({
  gameState,
  onMouseMove,
  onTouchMove,
  onTouchStart,
  onTouchEnd,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const beybladeSpritesRef = useRef<Map<string, Sprite>>(new Map());
  const graphicsRef = useRef<{
    background?: Graphics;
    stadium?: Container;
    ui?: Container;
    effects?: Container;
  }>({});
  const theme = useTheme();

  // Initialize PixiJS Application
  useEffect(() => {
    if (!containerRef.current) return;

    const initPixi = async () => {
      // Create PixiJS application with WebGL renderer
      const app = new Application();
      await app.init({
        width: 800,
        height: 800,
        backgroundColor: theme.palette.background.default,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      containerRef.current?.appendChild(app.canvas);
      appRef.current = app;

      // Create layer containers for organized rendering
      const backgroundLayer = new Container();
      const stadiumLayer = new Container();
      const beybladeLayer = new Container();
      const effectsLayer = new Container();
      const uiLayer = new Container();

      app.stage.addChild(backgroundLayer);
      app.stage.addChild(stadiumLayer);
      app.stage.addChild(beybladeLayer);
      app.stage.addChild(effectsLayer);
      app.stage.addChild(uiLayer);

      graphicsRef.current = {
        background: backgroundLayer as any,
        stadium: stadiumLayer,
        ui: uiLayer,
        effects: effectsLayer,
      };

      // Load beyblade textures
      const texturePromises = gameState.beyblades.map(async (beyblade) => {
        try {
          const texture = await Assets.load(
            `/assets/svg/beyblades/${beyblade.config.fileName}`
          );
          const sprite = new Sprite(texture);
          sprite.anchor.set(0.5);
          beybladeLayer.addChild(sprite);
          beybladeSpritesRef.current.set(
            beyblade.config.fileName.replace(".svg", ""),
            sprite
          );
        } catch (error) {
          console.error(
            `Failed to load texture for ${beyblade.config.fileName}:`,
            error
          );
        }
      });

      await Promise.all(texturePromises);

      // Draw static stadium elements
      drawStadium(stadiumLayer, gameState.stadium, theme.palette);
    };

    initPixi();

    return () => {
      appRef.current?.destroy(true, { children: true, texture: true });
      appRef.current = null;
    };
  }, [theme.palette.background.default]);

  // Handle mouse/touch events
  const getPositionFromEvent = useCallback(
    (clientX: number, clientY: number): Vector2D | null => {
      if (!appRef.current) return null;

      const canvas = appRef.current.canvas;
      const rect = canvas.getBoundingClientRect();
      const scale = 800 / rect.width;

      return {
        x: (clientX - rect.left) * scale,
        y: (clientY - rect.top) * scale,
      };
    },
    []
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onMouseMove) return;
      const position = getPositionFromEvent(event.clientX, event.clientY);
      if (position) onMouseMove(position);
    },
    [onMouseMove, getPositionFromEvent]
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!onTouchStart) return;
      const touch = event.touches[0];
      const position = getPositionFromEvent(touch.clientX, touch.clientY);
      if (position) onTouchStart(position);
    },
    [onTouchStart, getPositionFromEvent]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!onTouchMove) return;
      const touch = event.touches[0];
      const position = getPositionFromEvent(touch.clientX, touch.clientY);
      if (position) onTouchMove(position);
    },
    [onTouchMove, getPositionFromEvent]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (onTouchEnd) onTouchEnd();
    },
    [onTouchEnd]
  );

  // Render loop
  useEffect(() => {
    if (
      !appRef.current ||
      !graphicsRef.current.effects ||
      !graphicsRef.current.ui
    )
      return;

    const app = appRef.current;
    const stadium = gameState.stadium;
    const currentTime = Date.now();

    // Clear dynamic layers
    graphicsRef.current.effects!.removeChildren();
    graphicsRef.current.ui!.removeChildren();

    // Update beyblade positions and effects
    gameState.beyblades.forEach((beyblade) => {
      const sprite = beybladeSpritesRef.current.get(
        beyblade.config.fileName.replace(".svg", "")
      );
      if (sprite) {
        sprite.x = beyblade.position.x;
        sprite.y = beyblade.position.y;
        sprite.rotation = beyblade.rotation;
        sprite.width = beyblade.radius * 2;
        sprite.height = beyblade.radius * 2;
        sprite.alpha = beyblade.isOutOfBounds ? 0.4 : 1.0;

        // Draw effects (dodge, attacks, etc.)
        drawBeybladeEffects(
          graphicsRef.current.effects!,
          beyblade,
          currentTime,
          theme.palette
        );
      }
    });

    // Draw dynamic stadium elements (blue circles)
    drawDynamicStadiumElements(
      graphicsRef.current.stadium!,
      gameState,
      theme.palette,
      currentTime
    );

    // Draw UI
    drawUI(graphicsRef.current.ui!, gameState, theme.palette, currentTime);
  }, [gameState, theme.palette]);

  return (
    <div
      ref={containerRef}
      className={`${className}`}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        maxWidth: "min(100vw - 2rem, 70vh, 800px)",
        margin: "0 auto",
        aspectRatio: "1/1",
        cursor: gameState.isPlaying ? "crosshair" : "default",
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};

// Helper function to draw static stadium
function drawStadium(container: Container, stadium: any, colors: any) {
  container.removeChildren();

  const graphics = new Graphics();

  // Draw main arena floor
  graphics.circle(stadium.center.x, stadium.center.y, stadium.innerRadius);
  graphics.fill({ color: 0x2a2a2a });

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
      // Yellow wall zones
      graphics.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius,
        startAngle,
        endAngle
      );
      graphics.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.innerRadius,
        endAngle,
        startAngle,
        true
      );
      graphics.fill({ color: 0xfbbf24 });

      // Black wall pattern
      const wallThickness = 15;
      graphics.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius,
        startAngle,
        endAngle
      );
      graphics.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius - wallThickness,
        endAngle,
        startAngle,
        true
      );
      graphics.fill({ color: 0x000000 });
    } else {
      // Red exit zones
      graphics.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.outerRadius,
        startAngle,
        endAngle
      );
      graphics.arc(
        stadium.center.x,
        stadium.center.y,
        stadium.innerRadius,
        endAngle,
        startAngle,
        true
      );
      graphics.fill({ color: 0xef4444 });
    }
  }

  container.addChild(graphics);
}

// Helper function to draw dynamic stadium elements
function drawDynamicStadiumElements(
  container: Container,
  gameState: GameState,
  colors: any,
  currentTime: number
) {
  container.removeChildren();

  const graphics = new Graphics();
  const stadium = gameState.stadium;

  // Check if any beyblade can use normal loop
  const canNormalLoop = gameState.beyblades.some(
    (b) =>
      !b.isDead &&
      !b.isOutOfBounds &&
      (!b.normalLoopCooldownEnd ||
        gameState.gameTime >= b.normalLoopCooldownEnd)
  );

  if (canNormalLoop) {
    graphics.circle(
      stadium.center.x,
      stadium.center.y,
      stadium.normalLoopRadius
    );
    graphics.stroke({ width: 3, color: 0x3b82f6, alpha: 0.6 });
  }

  // Check if any beyblade can charge dash
  const canChargeDash = gameState.beyblades.some(
    (b) =>
      !b.isDead &&
      !b.isOutOfBounds &&
      (!b.blueLoopCooldownEnd || gameState.gameTime >= b.blueLoopCooldownEnd)
  );

  if (canChargeDash) {
    graphics.circle(
      stadium.center.x,
      stadium.center.y,
      stadium.chargeDashRadius
    );
    graphics.stroke({ width: 4, color: 0x3b82f6, alpha: 0.6 });
  }

  // Draw charge points
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

    graphics.circle(chargePointX, chargePointY, pointSize);
    graphics.fill({ color: isSelected ? 0xff4500 : 0x3b82f6 });
  }

  container.addChild(graphics);
}

// Helper function to draw beyblade effects
function drawBeybladeEffects(
  container: Container,
  beyblade: GameBeyblade,
  currentTime: number,
  colors: any
) {
  const graphics = new Graphics();

  // Dodge effect
  if (beyblade.lastDodgeTime && currentTime - beyblade.lastDodgeTime < 500) {
    const dodgeProgress = (currentTime - beyblade.lastDodgeTime) / 500;
    const dodgeOpacity = 1 - dodgeProgress;

    for (let i = 1; i <= 3; i++) {
      graphics.circle(
        beyblade.position.x - i * 15,
        beyblade.position.y,
        beyblade.radius * 0.8
      );
      graphics.fill({ color: 0x22c55e, alpha: dodgeOpacity * (0.3 / i) });
    }
  }

  // Heavy attack effect
  if (beyblade.heavyAttackActive && beyblade.heavyAttackEndTime) {
    const attackProgress =
      1 - (beyblade.heavyAttackEndTime - currentTime) / 2000;
    const attackOpacity = Math.sin(attackProgress * Math.PI);

    graphics.circle(
      beyblade.position.x,
      beyblade.position.y,
      beyblade.radius + 10 + attackProgress * 15
    );
    graphics.stroke({ width: 4, color: 0xfb923c, alpha: attackOpacity * 0.8 });
  }

  // Ultimate attack effect
  if (beyblade.ultimateAttackActive && beyblade.ultimateAttackEndTime) {
    const ultimateProgress =
      1 - (beyblade.ultimateAttackEndTime - currentTime) / 3000;
    const ultimateOpacity = Math.sin(ultimateProgress * Math.PI);
    const explosionRadius = beyblade.radius + ultimateProgress * 50;

    graphics.circle(beyblade.position.x, beyblade.position.y, explosionRadius);
    graphics.fill({ color: 0xef4444, alpha: ultimateOpacity * 0.5 });
  }

  container.addChild(graphics);
}

// Helper function to draw UI
function drawUI(
  container: Container,
  gameState: GameState,
  colors: any,
  currentTime: number
) {
  // Time display
  const timeText = new Text({
    text: `Time: ${gameState.gameTime.toFixed(1)}s`,
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 18,
      fontWeight: "bold",
      fill: 0xffffff,
    },
  });
  timeText.x = 400;
  timeText.y = 30;
  timeText.anchor.set(0.5, 0.5);
  container.addChild(timeText);

  // Player stats
  const playerBey = gameState.beyblades.find((b) => b.isPlayer);
  if (playerBey && !playerBey.isOutOfBounds && !playerBey.isDead) {
    drawCornerStatsPixi(container, playerBey, "PLAYER", 20, 15, colors, true);
  }

  // AI stats
  const aiBey = gameState.beyblades.find((b) => !b.isPlayer);
  if (aiBey && !aiBey.isOutOfBounds && !aiBey.isDead) {
    drawCornerStatsPixi(container, aiBey, "AI", 680, 15, colors, false);
  }

  // Countdown overlay
  if (gameState.countdownActive) {
    const overlay = new Graphics();
    overlay.rect(0, 0, 800, 800);
    overlay.fill({ color: 0x000000, alpha: 0.7 });
    container.addChild(overlay);

    const countdownText = new Text({
      text:
        gameState.countdownValue > 0
          ? gameState.countdownValue.toString()
          : "LET IT RIP!",
      style: {
        fontFamily: "Inter, sans-serif",
        fontSize: gameState.countdownValue > 0 ? 120 : 80,
        fontWeight: "bold",
        fill: gameState.countdownValue > 0 ? 0xffd700 : 0xff4500,
        stroke: { color: 0x000000, width: 6 },
      },
    });
    countdownText.x = 400;
    countdownText.y = 400;
    countdownText.anchor.set(0.5);
    container.addChild(countdownText);
  }

  // Winner announcement
  if (!gameState.isPlaying && gameState.winner) {
    const overlay = new Graphics();
    overlay.rect(0, 0, 800, 800);
    overlay.fill({ color: 0x000000, alpha: 0.8 });
    container.addChild(overlay);

    const winnerText = new Text({
      text: `${gameState.winner.config.name} Wins!`,
      style: {
        fontFamily: "Inter, sans-serif",
        fontSize: 48,
        fontWeight: "bold",
        fill: 0xffd700,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    winnerText.x = 400;
    winnerText.y = 350;
    winnerText.anchor.set(0.5);
    container.addChild(winnerText);
  }
}

// Helper function to draw corner stats with PixiJS
function drawCornerStatsPixi(
  container: Container,
  beyblade: GameBeyblade,
  label: string,
  x: number,
  y: number,
  colors: any,
  isPlayer: boolean
) {
  const width = 100;
  const height = 80;

  const graphics = new Graphics();

  // Background
  graphics.rect(x, y, width, height);
  graphics.fill({ color: 0x000000, alpha: 0.7 });
  graphics.stroke({ width: 2, color: isPlayer ? 0x3b82f6 : 0xf59e0b });

  // Spin bar
  const spinBarY = y + 35;
  graphics.rect(x + 5, spinBarY, width - 10, 8);
  graphics.fill({ color: 0xffffff, alpha: 0.3 });

  const spinFillWidth = (beyblade.spin / 2000) * (width - 10);
  let spinColor = 0x22c55e;
  if (beyblade.spin <= 1400) spinColor = 0xf59e0b;
  if (beyblade.spin <= 800) spinColor = 0xff9800;
  if (beyblade.spin <= 300) spinColor = 0xef4444;

  if (!isPlayer) {
    graphics.rect(x + width - 5 - spinFillWidth, spinBarY, spinFillWidth, 8);
  } else {
    graphics.rect(x + 5, spinBarY, spinFillWidth, 8);
  }
  graphics.fill({ color: spinColor });

  // Acceleration bar
  const accelBarY = y + 50;
  graphics.rect(x + 5, accelBarY, width - 10, 8);
  graphics.fill({ color: 0xffffff, alpha: 0.3 });

  const maxAccel = beyblade.currentMaxAcceleration;
  const accelFillWidth = (beyblade.acceleration / maxAccel) * (width - 10);
  const accelColor = beyblade.isChargeDashing ? 0xff4500 : 0xf59e0b;

  if (!isPlayer) {
    graphics.rect(x + width - 5 - accelFillWidth, accelBarY, accelFillWidth, 8);
  } else {
    graphics.rect(x + 5, accelBarY, accelFillWidth, 8);
  }
  graphics.fill({ color: accelColor });

  container.addChild(graphics);

  // Labels
  const labelText = new Text({
    text: label,
    style: {
      fontFamily: "Inter",
      fontSize: 12,
      fontWeight: "bold",
      fill: isPlayer ? 0x3b82f6 : 0xf59e0b,
    },
  });
  labelText.x = x + width / 2;
  labelText.y = y + 15;
  labelText.anchor.set(0.5, 0.5);
  container.addChild(labelText);

  const spinText = new Text({
    text: `Spin: ${Math.floor(beyblade.spin)}`,
    style: {
      fontFamily: "Inter",
      fontSize: 10,
      fontWeight: "bold",
      fill: 0xffffff,
    },
  });
  spinText.x = x + 5;
  spinText.y = y + 68;
  container.addChild(spinText);

  const accelText = new Text({
    text: `Accel: ${beyblade.acceleration}/${Math.floor(
      beyblade.currentMaxAcceleration
    )}`,
    style: {
      fontFamily: "Inter",
      fontSize: 10,
      fontWeight: "bold",
      fill: 0xffffff,
    },
  });
  accelText.x = x + 5;
  accelText.y = y + 78;
  container.addChild(accelText);
}

export default GameArenaPixi;
