"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { GameState, GameBeyblade, Stadium, Vector2D } from "../types/game";
import {
  updateBeyblade,
  checkCollision,
  resolveCollisionWithAcceleration,
  createBeyblade,
  launchPowerAttack,
  vectorSubtract,
  vectorLength,
} from "../utils/gamePhysics";
import { BEYBLADE_CONFIGS } from "@/constants/beyblades";

interface EnhancedBeybladeArenaProps {
  onGameEnd?: (winner: GameBeyblade | null) => void;
}

const EnhancedBeybladeArena: React.FC<EnhancedBeybladeArenaProps> = ({
  onGameEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beybladeImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<Vector2D>({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const [beybladeImagesLoaded, setBeybladeImagesLoaded] = useState(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const stadium: Stadium = {
      center: { x: 400, y: 300 },
      innerRadius: 160, // Blue speed circle
      outerRadius: 200, // Red segmented circle (20% smaller than blue)
      exitRadius: 200, // Same as outer radius since it's the boundary
      width: 800,
      height: 600,
    };

    const playerBey = createBeyblade(
      "player",
      "dragoon-gt",
      { x: 320, y: 250 }, // Moved closer to center
      true
    );
    // Set initial spin to 1000
    playerBey.spin = 1000;

    // Random AI spawn position within arena
    const randomAngle = Math.random() * Math.PI * 2;
    const randomRadius = 100 + Math.random() * 80; // Between 100-180 pixels from center
    const aiX = stadium.center.x + Math.cos(randomAngle) * randomRadius;
    const aiY = stadium.center.y + Math.sin(randomAngle) * randomRadius;

    const aiBey = createBeyblade("ai", "spriggan", { x: aiX, y: aiY }, false);
    // Set initial spin to 1000
    aiBey.spin = 1000;

    return {
      beyblades: [playerBey, aiBey],
      stadium,
      isPlaying: true,
      winner: null,
      gameTime: 0,
    };
  });

  const [selectedBeyblade, setSelectedBeyblade] = useState("dragoon-gt");
  const [selectedAIBeyblade, setSelectedAIBeyblade] = useState("spriggan");

  // Load Beyblade images only (removed stadium image loading)
  useEffect(() => {
    const loadImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>();
      const loadPromises: Promise<void>[] = [];

      Object.entries(BEYBLADE_CONFIGS).forEach(([key, config]) => {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            imageMap.set(key, img);
            resolve();
          };
          img.onerror = reject;
          img.src = `/assets/svg/beyblades/${config.fileName}`;
        });
        loadPromises.push(promise);
      });

      try {
        await Promise.all(loadPromises);
        beybladeImagesRef.current = imageMap;
        setBeybladeImagesLoaded(true);
      } catch (error) {
        console.error("Failed to load Beyblade images:", error);
        setBeybladeImagesLoaded(true); // Continue with fallback rendering
      }
    };

    loadImages();
  }, []);

  // Mouse event handlers - simplified for real-time movement
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    []
  );

  // Game loop - Real-time movement
  const gameLoop = useCallback(
    (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        1 / 30
      ); // Cap at 30fps
      lastTimeRef.current = currentTime;

      setGameState((prevState) => {
        if (!prevState.isPlaying) return prevState;

        const newState = { ...prevState };
        const playerBey = newState.beyblades.find((b) => b.isPlayer);
        const aiBey = newState.beyblades.find((b) => !b.isPlayer);

        // Real-time movement towards mouse for player Beyblade (player can control even during blue loop)
        if (playerBey && !playerBey.isDead && !playerBey.isOutOfBounds) {
          const mouseDirection = vectorSubtract(
            mouseRef.current,
            playerBey.position
          );
          const mouseDistance = vectorLength(mouseDirection);

          // Player can control even during blue loop (but loop mechanics override position during loop)
          if (mouseDistance > 10) {
            // Smooth acceleration towards mouse
            const maxSpeed = 150; // Increased max speed
            const acceleration = 300; // Acceleration rate
            const normalizedDirection = {
              x: mouseDirection.x / mouseDistance,
              y: mouseDirection.y / mouseDistance,
            };

            // Apply acceleration using Newton's F = ma
            const targetVelocity = {
              x: normalizedDirection.x * maxSpeed,
              y: normalizedDirection.y * maxSpeed,
            };

            // Smooth acceleration towards target velocity
            // During blue loop, this sets the exit velocity direction
            playerBey.velocity.x +=
              ((targetVelocity.x - playerBey.velocity.x) *
                acceleration *
                deltaTime) /
              100;
            playerBey.velocity.y +=
              ((targetVelocity.y - playerBey.velocity.y) *
                acceleration *
                deltaTime) /
              100;
          } else {
            // Decelerate when close to mouse
            const deceleration = 0.85;
            playerBey.velocity = {
              x: playerBey.velocity.x * deceleration,
              y: playerBey.velocity.y * deceleration,
            };
          }
        }

        // AI Beyblade with improved movement and acceleration (only if not in blue loop)
        if (
          aiBey &&
          playerBey &&
          !aiBey.isDead &&
          !aiBey.isOutOfBounds &&
          !aiBey.isInBlueLoop
        ) {
          const targetDirection = vectorSubtract(
            playerBey.position,
            aiBey.position
          );
          const targetDistance = vectorLength(targetDirection);

          // Random movement factor for unpredictability
          const randomFactor = 0.3;
          const randomAngle = Math.random() * Math.PI * 2;
          const randomX = Math.cos(randomAngle) * randomFactor;
          const randomY = Math.sin(randomAngle) * randomFactor;

          if (targetDistance > 60) {
            // Accelerate towards player with some randomness
            const maxSpeed = 130;
            const acceleration = 250;
            const normalizedDirection = {
              x: targetDirection.x / targetDistance + randomX,
              y: targetDirection.y / targetDistance + randomY,
            };

            const targetVelocity = {
              x: normalizedDirection.x * maxSpeed,
              y: normalizedDirection.y * maxSpeed,
            };

            // Smooth acceleration
            aiBey.velocity.x +=
              ((targetVelocity.x - aiBey.velocity.x) *
                acceleration *
                deltaTime) /
              100;
            aiBey.velocity.y +=
              ((targetVelocity.y - aiBey.velocity.y) *
                acceleration *
                deltaTime) /
              100;
          } else {
            // Aggressive close-range movement
            const randomAngle = Math.random() * Math.PI * 2;
            const maxSpeed = 110;
            const targetVelocity = {
              x: Math.cos(randomAngle) * maxSpeed,
              y: Math.sin(randomAngle) * maxSpeed,
            };

            aiBey.velocity.x +=
              ((targetVelocity.x - aiBey.velocity.x) * 200 * deltaTime) / 100;
            aiBey.velocity.y +=
              ((targetVelocity.y - aiBey.velocity.y) * 200 * deltaTime) / 100;
          }
        }

        // Update all beyblades with physics
        newState.beyblades.forEach((beyblade) => {
          // Calculate current acceleration from velocity change
          const velocityMagnitude = Math.sqrt(
            beyblade.velocity.x * beyblade.velocity.x +
              beyblade.velocity.y * beyblade.velocity.y
          );

          // Track acceleration for collision calculations (scaled for game balance)
          beyblade.acceleration = Math.min(
            10,
            Math.floor(velocityMagnitude / 10)
          );

          // Calculate rotational velocity based on spin
          const rotationSpeed = (beyblade.spin / 1000) * 10;
          beyblade.rotation += rotationSpeed * deltaTime;

          // Check if beyblade is in blue speed zone (thin line)
          const distanceFromCenter = vectorLength(
            vectorSubtract(beyblade.position, newState.stadium.center)
          );
          const isOnBlueCircle =
            Math.abs(distanceFromCenter - newState.stadium.innerRadius) <= 5;

          // Blue circle: mandatory 1-second loop with loss of control (with 3-second cooldown)
          const canLoop =
            !beyblade.blueLoopCooldownEnd ||
            newState.gameTime >= beyblade.blueLoopCooldownEnd;
          if (
            isOnBlueCircle &&
            beyblade.spin > 0 &&
            !beyblade.isInBlueLoop &&
            canLoop
          ) {
            // Start blue circle loop
            beyblade.isInBlueLoop = true;
            beyblade.blueCircleLoopStartTime = newState.gameTime;
            beyblade.blueLoopAngle = Math.atan2(
              beyblade.position.y - newState.stadium.center.y,
              beyblade.position.x - newState.stadium.center.x
            );
          }

          // Handle blue circle loop mechanics
          if (
            beyblade.isInBlueLoop &&
            beyblade.blueCircleLoopStartTime !== undefined
          ) {
            const loopDuration = 1.0; // 1 second
            const timeInLoop =
              newState.gameTime - beyblade.blueCircleLoopStartTime;

            if (timeInLoop < loopDuration) {
              // Force circular motion for 1 second with 2x acceleration
              const spinDirection =
                beyblade.config.direction === "left" ? -1 : 1;
              const angularSpeed = (Math.PI * 2) / loopDuration; // Complete circle in 1 second

              beyblade.blueLoopAngle +=
                angularSpeed * spinDirection * deltaTime;

              // Lock position to blue circle
              beyblade.position = {
                x:
                  newState.stadium.center.x +
                  Math.cos(beyblade.blueLoopAngle) *
                    newState.stadium.innerRadius,
                y:
                  newState.stadium.center.y +
                  Math.sin(beyblade.blueLoopAngle) *
                    newState.stadium.innerRadius,
              };

              // Calculate tangent velocity for smooth circular motion with 2x acceleration
              const tangentX =
                -Math.sin(beyblade.blueLoopAngle) * spinDirection;
              const tangentY = Math.cos(beyblade.blueLoopAngle) * spinDirection;
              const circularSpeed = 200;
              const accelerationMultiplier = 2; // 2x acceleration during loop

              beyblade.velocity = {
                x: tangentX * circularSpeed * accelerationMultiplier,
                y: tangentY * circularSpeed * accelerationMultiplier,
              };

              // Boost acceleration value during loop
              beyblade.acceleration = Math.min(
                10,
                beyblade.acceleration * accelerationMultiplier
              );
            } else {
              // End blue circle loop
              beyblade.isInBlueLoop = false;
              beyblade.blueCircleLoopStartTime = undefined;

              // Set 3-second cooldown before next loop
              beyblade.blueLoopCooldownEnd = newState.gameTime + 3.0;

              // Continue moving in the current direction with maintained velocity
              // The beyblade already has the velocity from the loop, so just continue
              // No teleportation - just maintain current trajectory
            }
          } else if (!beyblade.isInBlueLoop) {
            // Normal physics when not in blue loop
            updateBeyblade(beyblade, deltaTime, newState.stadium);

            // Check for wall collisions and exits in the red circle segments
            const distanceFromCenter = vectorLength(
              vectorSubtract(beyblade.position, newState.stadium.center)
            );

            // If beyblade is beyond the red circle boundary
            if (distanceFromCenter > newState.stadium.outerRadius) {
              // Calculate which segment the beyblade is in (0-5)
              const angle = Math.atan2(
                beyblade.position.y - newState.stadium.center.y,
                beyblade.position.x - newState.stadium.center.x
              );
              // Normalize angle to 0-2π
              const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
              const segmentIndex = Math.floor(normalizedAngle / (Math.PI / 3)); // 6 segments = π/3 each

              const isWallSegment = segmentIndex % 2 === 0; // segments 0, 2, 4 are walls

              if (isWallSegment) {
                // Wall collision - damage and rebound to center
                beyblade.spin = Math.max(
                  0,
                  beyblade.spin - 10 * beyblade.acceleration
                );

                // Calculate rebound direction toward center
                const reboundDirection = vectorSubtract(
                  newState.stadium.center,
                  beyblade.position
                );
                const reboundDistance = vectorLength(reboundDirection);

                if (reboundDistance > 0) {
                  const normalizedRebound = {
                    x: reboundDirection.x / reboundDistance,
                    y: reboundDirection.y / reboundDistance,
                  };

                  // Position beyblade just inside the wall
                  beyblade.position = {
                    x:
                      newState.stadium.center.x +
                      Math.cos(normalizedAngle) *
                        (newState.stadium.outerRadius - 5),
                    y:
                      newState.stadium.center.y +
                      Math.sin(normalizedAngle) *
                        (newState.stadium.outerRadius - 5),
                  };

                  // Apply rebound velocity toward center
                  const reboundSpeed = 120;
                  beyblade.velocity = {
                    x: normalizedRebound.x * reboundSpeed,
                    y: normalizedRebound.y * reboundSpeed,
                  };
                }
              } else {
                // Exit segment - game over for this beyblade
                beyblade.isOutOfBounds = true;
                beyblade.isDead = true;
                beyblade.velocity = { x: 0, y: 0 };
              }
            }
          }

          // Reduced physics-based spin decay (only when not in blue loop)
          if (!beyblade.isInBlueLoop) {
            const frictionCoefficient = 0.995;
            const velocityDrag = velocityMagnitude * 0.01;
            const baseLoss = 0.5;

            const totalSpinLoss = baseLoss + velocityDrag;
            beyblade.spin = Math.max(
              0,
              beyblade.spin - totalSpinLoss * deltaTime
            );
          }

          // Mark as dead when spin reaches 0
          if (beyblade.spin <= 0) {
            beyblade.isDead = true;
            beyblade.velocity = { x: 0, y: 0 };
            beyblade.isInBlueLoop = false;
          }
        });

        // Check collisions between beyblades
        for (let i = 0; i < newState.beyblades.length; i++) {
          for (let j = i + 1; j < newState.beyblades.length; j++) {
            const bey1 = newState.beyblades[i];
            const bey2 = newState.beyblades[j];

            if (
              !bey1.isDead &&
              !bey1.isOutOfBounds &&
              !bey2.isDead &&
              !bey2.isOutOfBounds
            ) {
              if (checkCollision(bey1, bey2)) {
                // Use new collision mechanics with acceleration
                resolveCollisionWithAcceleration(bey1, bey2);
              }
            }
          }
        }

        // Check win conditions
        const aliveBeyblades = newState.beyblades.filter(
          (b) => !b.isDead && !b.isOutOfBounds
        );

        if (aliveBeyblades.length <= 1) {
          newState.isPlaying = false;
          newState.winner =
            aliveBeyblades.length === 1 ? aliveBeyblades[0] : null;

          if (onGameEnd) {
            onGameEnd(newState.winner);
          }
        }

        newState.gameTime += deltaTime;

        return newState;
      });

      if (gameState.isPlaying) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [gameState.isPlaying, onGameEnd]
  );

  // Rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw CSS-styled stadium with 2 circles only
    const stadium = gameState.stadium;

    // Draw outer space (beyond red circle)
    ctx.fillStyle = "#2C3E50";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw main arena (light gray) - inner circle
    ctx.fillStyle = "#ECF0F1";
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.innerRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw 6-segment red circle (3 walls + 3 exits)
    const segmentAngle = (Math.PI * 2) / 6; // 6 segments total
    for (let i = 0; i < 6; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;

      // Alternate between wall (red) and exit (yellow) segments
      const isWallSegment = i % 2 === 0; // segments 0, 2, 4 are walls

      ctx.fillStyle = isWallSegment ? "#E74C3C" : "#F1C40F"; // Red for walls, Yellow for exits
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

      // Add spacing between segments
      ctx.strokeStyle = "#2C3E50";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(
        stadium.center.x + Math.cos(startAngle) * stadium.innerRadius,
        stadium.center.y + Math.sin(startAngle) * stadium.innerRadius
      );
      ctx.lineTo(
        stadium.center.x + Math.cos(startAngle) * stadium.outerRadius,
        stadium.center.y + Math.sin(startAngle) * stadium.outerRadius
      );
      ctx.stroke();
    }

    // Draw thin blue speed line (circle)
    ctx.strokeStyle = "#3498DB";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.innerRadius,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Add zone labels
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#2C3E50";
    ctx.textAlign = "center";

    // Blue line label
    ctx.fillText(
      "SPEED ZONE",
      stadium.center.x,
      stadium.center.y - stadium.innerRadius - 20
    );

    // Red segments labels
    ctx.fillText(
      "RED: WALLS | YELLOW: EXITS",
      stadium.center.x,
      stadium.center.y + stadium.outerRadius + 30
    );

    // Draw beyblades
    gameState.beyblades.forEach((beyblade) => {
      if (beyblade.isOutOfBounds) return;

      ctx.save();
      ctx.translate(beyblade.position.x, beyblade.position.y);
      ctx.rotate(beyblade.rotation);

      // Draw beyblade shadow
      if (!beyblade.isDead) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(3, 3, beyblade.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw actual Beyblade SVG
      const beybladeImage = beybladeImagesRef.current.get(
        beyblade.config.fileName.replace(".svg", "")
      );

      if (beybladeImagesLoaded && beybladeImage) {
        // Draw the actual SVG image (smaller size)
        const size = beyblade.radius * 1.6; // Reduced from 2 to 1.6 for smaller size
        ctx.drawImage(beybladeImage, -size / 2, -size / 2, size, size);

        // Add a subtle overlay for dead state
        if (beyblade.isDead) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
          ctx.beginPath();
          ctx.arc(0, 0, beyblade.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw enhanced spin effect with speed zone indicator
      if (!beyblade.isDead && beyblade.spin > 0) {
        const spinAlpha = Math.min(beyblade.spin / 1000, 1);
        const spinIntensity = beyblade.spin / 1000;

        // Check if in speed zone for visual effect
        const distanceFromCenter = vectorLength(
          vectorSubtract(beyblade.position, gameState.stadium.center)
        );
        const isInSpeedZone =
          distanceFromCenter >= gameState.stadium.innerRadius - 10 &&
          distanceFromCenter <= gameState.stadium.innerRadius + 10;

        // More lines for higher spin
        const numLines = Math.max(8, Math.floor(spinIntensity * 16));

        ctx.strokeStyle = `rgba(255, 255, 255, ${spinAlpha * 0.9})`;
        ctx.lineWidth = 1 + spinIntensity * 1.5;

        for (let i = 0; i < numLines; i++) {
          const angle = (i * Math.PI * 2) / numLines + beyblade.rotation;
          const startRadius = beyblade.radius * 0.3;
          const endRadius = beyblade.radius * (0.9 + spinIntensity * 0.3);

          ctx.beginPath();
          ctx.moveTo(
            Math.cos(angle) * startRadius,
            Math.sin(angle) * startRadius
          );
          ctx.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
          ctx.stroke();
        }

        // Speed zone circular trajectory effect
        if (isInSpeedZone) {
          ctx.strokeStyle = `rgba(52, 152, 219, ${spinAlpha * 0.9})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, beyblade.radius + 18, 0, Math.PI * 2);
          ctx.stroke();

          // Pulsing speed effect
          const pulseAlpha =
            ((Math.sin(gameState.gameTime * 15) + 1) / 2) * 0.7;
          ctx.strokeStyle = `rgba(41, 128, 185, ${pulseAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, beyblade.radius + 25, 0, Math.PI * 2);
          ctx.stroke();

          // Speed trail lines
          for (let i = 0; i < 8; i++) {
            const trailAngle = beyblade.rotation + (i * Math.PI) / 4;
            ctx.strokeStyle = `rgba(52, 152, 219, ${0.3 + i * 0.1})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(
              Math.cos(trailAngle) * (beyblade.radius + 15),
              Math.sin(trailAngle) * (beyblade.radius + 15)
            );
            ctx.lineTo(
              Math.cos(trailAngle) * (beyblade.radius + 30),
              Math.sin(trailAngle) * (beyblade.radius + 30)
            );
            ctx.stroke();
          }
        }

        // High spin effects
        if (beyblade.spin > 500) {
          ctx.strokeStyle = `rgba(255, 215, 0, ${
            ((beyblade.spin - 500) / 500) * 0.8
          })`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, beyblade.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Ultra-high spin effect
        if (beyblade.spin > 800) {
          ctx.strokeStyle = `rgba(255, 100, 255, ${
            ((beyblade.spin - 800) / 200) * 0.6
          })`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, beyblade.radius + 12, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();

      // Draw spin and acceleration meters above beyblade
      const meterWidth = 60;
      const meterHeight = 8;
      const meterX = beyblade.position.x - meterWidth / 2;
      const meterY = beyblade.position.y - beyblade.radius - 35;

      // Spin meter background
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

      // Spin meter border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

      // Spin meter fill
      const fillWidth = (beyblade.spin / 1000) * meterWidth;
      let fillColor;
      if (beyblade.spin > 700) fillColor = "#4CAF50";
      else if (beyblade.spin > 400) fillColor = "#FFC107";
      else if (beyblade.spin > 150) fillColor = "#FF9800";
      else fillColor = "#F44336";

      ctx.fillStyle = fillColor;
      ctx.fillRect(meterX, meterY, fillWidth, meterHeight);

      // Acceleration meter (below spin meter)
      const accelMeterY = meterY + 12;
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(meterX, accelMeterY, meterWidth, meterHeight);

      ctx.strokeStyle = "rgba(52, 152, 219, 0.8)";
      ctx.strokeRect(meterX, accelMeterY, meterWidth, meterHeight);

      const accelFillWidth = (beyblade.acceleration / 10) * meterWidth;
      ctx.fillStyle = "#3498DB";
      ctx.fillRect(meterX, accelMeterY, accelFillWidth, meterHeight);

      // Draw spin and acceleration numbers
      ctx.font = "bold 10px Arial";
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;

      const spinText = `S:${Math.floor(beyblade.spin)}`;
      const accelText = `A:${beyblade.acceleration}`;
      const textX = beyblade.position.x - 20;
      const textY = meterY - 5;

      ctx.strokeText(spinText, textX, textY);
      ctx.fillText(spinText, textX, textY);

      ctx.strokeText(accelText, textX + 35, textY);
      ctx.fillText(accelText, textX + 35, textY);
    });

    // Draw UI elements
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    const timeText = `Time: ${gameState.gameTime.toFixed(1)}s`;
    ctx.strokeText(timeText, 20, 35);
    ctx.fillText(timeText, 20, 35);

    // Draw winner announcement
    if (!gameState.isPlaying && gameState.winner) {
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#FFD700";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 4;
      ctx.textAlign = "center";

      const winText = `${gameState.winner.config.name} Wins!`;
      ctx.strokeText(winText, canvas.width / 2, 80);
      ctx.fillText(winText, canvas.width / 2, 80);

      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#fff";
      const subText = gameState.winner.isPlayer ? "Victory!" : "Defeat!";
      ctx.strokeText(subText, canvas.width / 2, 120);
      ctx.fillText(subText, canvas.width / 2, 120);

      ctx.textAlign = "left";
    }

    // Draw instructions
    if (gameState.isPlaying) {
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;

      const instructions = [
        "� Blue: Speed zone - 1-sec loop with 2×acceleration + 3-sec cooldown",
        "🔴 Red segments: Wall collision - lose 10×acceleration spin + rebound to center",
        "� Yellow segments: Exit zones - cross and it's game over!",
        "🎮 Player: Can control during blue loop, AI loses control during loop",
        "💥 Same spin collision: damage = |accel diff| + other's accel",
        "⚡ Opposite spin collision: both get avg spin + accel, take avg accel + other's accel damage",
      ];

      instructions.forEach((text, index) => {
        const y = canvas.height - 80 + index * 16;
        ctx.strokeText(text, 20, y);
        ctx.fillText(text, 20, y);
      });
    }
  }, [gameState, beybladeImagesLoaded]);

  // Setup game loop and rendering
  useEffect(() => {
    render();

    if (gameState.isPlaying) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, render, gameState.isPlaying]);

  const restartGame = () => {
    const stadium: Stadium = {
      center: { x: 400, y: 300 },
      innerRadius: 160, // Blue speed circle
      outerRadius: 200, // Red segmented circle (20% smaller than blue)
      exitRadius: 200, // Same as outer radius since it's the boundary
      width: 800,
      height: 600,
    };

    const playerBey = createBeyblade(
      "player",
      selectedBeyblade,
      { x: 320, y: 250 }, // Closer to center
      true
    );
    // Set initial spin to 1000
    playerBey.spin = 1000;

    // Random AI spawn position within arena
    const randomAngle = Math.random() * Math.PI * 2;
    const randomRadius = 100 + Math.random() * 80; // Between 100-180 pixels from center
    const aiX = stadium.center.x + Math.cos(randomAngle) * randomRadius;
    const aiY = stadium.center.y + Math.sin(randomAngle) * randomRadius;

    const aiBey = createBeyblade(
      "ai",
      selectedAIBeyblade,
      { x: aiX, y: aiY },
      false
    );
    // Set initial spin to 1000
    aiBey.spin = 1000;

    setGameState({
      beyblades: [playerBey, aiBey],
      stadium,
      isPlaying: true,
      winner: null,
      gameTime: 0,
    });
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-6 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Your Beyblade:
          </label>
          <select
            value={selectedBeyblade}
            onChange={(e) => setSelectedBeyblade(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white shadow-sm"
            disabled={gameState.isPlaying}
          >
            {Object.entries(BEYBLADE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            AI Opponent:
          </label>
          <select
            value={selectedAIBeyblade}
            onChange={(e) => setSelectedAIBeyblade(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white shadow-sm"
            disabled={gameState.isPlaying}
          >
            {Object.entries(BEYBLADE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <div className="h-6"></div> {/* Spacer to align with selects */}
          <button
            onClick={restartGame}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            {gameState.isPlaying ? "Restart Battle" : "New Battle"}
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className={`border-4 border-gray-800 rounded-xl shadow-2xl ${
            gameState.isPlaying ? "cursor-crosshair" : "cursor-default"
          }`}
          onMouseMove={handleMouseMove}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
};

export default EnhancedBeybladeArena;
