"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameState, GameBeyblade, Stadium, Vector2D } from "../types/game";
import {
  updateBeyblade,
  checkCollision,
  resolveCollisionWithAcceleration,
  createBeyblade,
  vectorSubtract,
  vectorLength,
} from "../utils/gamePhysics";

interface UseGameStateOptions {
  onGameEnd?: (winner: GameBeyblade | null) => void;
}

export const useGameState = (options: UseGameStateOptions = {}) => {
  const { onGameEnd } = options;
  
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<Vector2D>({ x: 0, y: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<Vector2D>({ x: 0, y: 0 });
  const isTouchActiveRef = useRef(false);
  const virtualDPadRef = useRef<Vector2D>({ x: 0, y: 0 });

  const [gameState, setGameState] = useState<GameState>(() => {
    return createInitialGameState();
  });

  const [selectedBeyblade, setSelectedBeyblade] = useState("dragoon-gt");
  const [selectedAIBeyblade, setSelectedAIBeyblade] = useState("spriggan");

  // Create initial game state
  function createInitialGameState(): GameState {
    const stadium: Stadium = {
      center: { x: 400, y: 300 },
      innerRadius: 240,
      outerRadius: 290,
      exitRadius: 290,
      width: 800,
      height: 600,
    };

    return {
      beyblades: [],
      stadium,
      isPlaying: false,
      winner: null,
      gameTime: 0,
      countdownActive: false,
      countdownValue: 0,
    };
  }

  // Input handlers
  const handleMouseMove = useCallback((position: Vector2D) => {
    mouseRef.current = position;
  }, []);

  const handleTouchStart = useCallback((position: Vector2D) => {
    touchRef.current = position;
    isTouchActiveRef.current = true;
  }, []);

  const handleTouchMove = useCallback((position: Vector2D) => {
    touchRef.current = position;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouchActiveRef.current = false;
  }, []);

  const handleVirtualDPad = useCallback((direction: Vector2D) => {
    virtualDPadRef.current = direction;
  }, []);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault();
        keysRef.current.add(key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keysRef.current.delete(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Get movement direction from inputs
  const getMovementDirection = useCallback((): Vector2D => {
    // No input during countdown
    if (gameState.countdownActive) {
      return { x: 0, y: 0 };
    }

    // Check if player beyblade is in automated sequence (blue loop or charge dash)
    const playerBey = gameState.beyblades.find(b => b.isPlayer);
    if (playerBey && (playerBey.isInBlueLoop || playerBey.isChargeDashing)) {
      return { x: 0, y: 0 }; // No user control during automated sequences
    }

    // Check virtual D-Pad first
    if (virtualDPadRef.current.x !== 0 || virtualDPadRef.current.y !== 0) {
      return virtualDPadRef.current;
    }

    // Check keyboard input
    let x = 0;
    let y = 0;
    if (keysRef.current.has("a") || keysRef.current.has("arrowleft")) x -= 1;
    if (keysRef.current.has("d") || keysRef.current.has("arrowright")) x += 1;
    if (keysRef.current.has("w") || keysRef.current.has("arrowup")) y -= 1;
    if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) y += 1;

    if (x !== 0 || y !== 0) {
      // Normalize diagonal movement
      const length = Math.sqrt(x * x + y * y);
      return { x: x / length, y: y / length };
    }

    // Check touch input
    if (isTouchActiveRef.current && playerBey) {
      const direction = vectorSubtract(touchRef.current, playerBey.position);
      const distance = vectorLength(direction);
      if (distance > 10) {
        return { x: direction.x / distance, y: direction.y / distance };
      }
    }

    // Fall back to mouse input
    if (playerBey) {
      const direction = vectorSubtract(mouseRef.current, playerBey.position);
      const distance = vectorLength(direction);
      if (distance > 10) {
        return { x: direction.x / distance, y: direction.y / distance };
      }
    }

    return { x: 0, y: 0 };
  }, [gameState.beyblades, gameState.countdownActive]);

  // Main game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 1 / 30);
    lastTimeRef.current = currentTime;

    setGameState((prevState) => {
      if (!prevState.isPlaying) return prevState;

      const newState = { ...prevState };
      const playerBey = newState.beyblades.find((b) => b.isPlayer);
      const aiBey = newState.beyblades.find((b) => !b.isPlayer);

      // Update player movement - only allow control when not in automated sequences
      if (playerBey && !playerBey.isDead && !playerBey.isOutOfBounds && 
          !playerBey.isInBlueLoop && !playerBey.isChargeDashing) {
        const direction = getMovementDirection();
        
        if (direction.x !== 0 || direction.y !== 0) {
          const maxSpeed = 250; // Increased from 200 for faster movement
          const acceleration = 500; // Increased from 400 for quicker response
          const targetVelocity = {
            x: direction.x * maxSpeed,
            y: direction.y * maxSpeed,
          };

          playerBey.velocity.x += ((targetVelocity.x - playerBey.velocity.x) * acceleration * deltaTime) / 100;
          playerBey.velocity.y += ((targetVelocity.y - playerBey.velocity.y) * acceleration * deltaTime) / 100;
        } else {
          const deceleration = 0.90; // Slightly higher deceleration for more responsive stops
          playerBey.velocity = {
            x: playerBey.velocity.x * deceleration,
            y: playerBey.velocity.y * deceleration,
          };
        }
      }

      // Update AI movement
      if (aiBey && playerBey && !aiBey.isDead && !aiBey.isOutOfBounds && !aiBey.isInBlueLoop && !aiBey.isChargeDashing) {
        const targetDirection = vectorSubtract(playerBey.position, aiBey.position);
        const targetDistance = vectorLength(targetDirection);

        const randomFactor = 0.3;
        const randomAngle = Math.random() * Math.PI * 2;
        const randomX = Math.cos(randomAngle) * randomFactor;
        const randomY = Math.sin(randomAngle) * randomFactor;

        if (targetDistance > 60) {
          const maxSpeed = 220; // Increased from 170 for faster AI
          const acceleration = 450; // Increased from 350 for quicker AI response
          const normalizedDirection = {
            x: targetDirection.x / targetDistance + randomX,
            y: targetDirection.y / targetDistance + randomY,
          };

          const targetVelocity = {
            x: normalizedDirection.x * maxSpeed,
            y: normalizedDirection.y * maxSpeed,
          };

          aiBey.velocity.x += ((targetVelocity.x - aiBey.velocity.x) * acceleration * deltaTime) / 100;
          aiBey.velocity.y += ((targetVelocity.y - aiBey.velocity.y) * acceleration * deltaTime) / 100;
        }
      }

      // Update all beyblades
      newState.beyblades.forEach((beyblade) => {
        updateBeybladeLogic(beyblade, deltaTime, newState);
        
        // Apply velocity cap for controllability
        const maxVelocity = beyblade.isChargeDashing ? 400 : 300; // Higher cap during charge dash
        const currentSpeed = vectorLength(beyblade.velocity);
        
        if (currentSpeed > maxVelocity) {
          const scale = maxVelocity / currentSpeed;
          beyblade.velocity = {
            x: beyblade.velocity.x * scale,
            y: beyblade.velocity.y * scale,
          };
        }
      });

      // Check collisions
      for (let i = 0; i < newState.beyblades.length; i++) {
        for (let j = i + 1; j < newState.beyblades.length; j++) {
          const bey1 = newState.beyblades[i];
          const bey2 = newState.beyblades[j];

          if (!bey1.isDead && !bey1.isOutOfBounds && !bey2.isDead && !bey2.isOutOfBounds) {
            if (checkCollision(bey1, bey2)) {
              resolveCollisionWithAcceleration(bey1, bey2);
            }
          }
        }
      }

      // Check win conditions
      const aliveBeyblades = newState.beyblades.filter((b) => !b.isDead && !b.isOutOfBounds);
      if (aliveBeyblades.length <= 1) {
        newState.isPlaying = false;
        newState.winner = aliveBeyblades.length === 1 ? aliveBeyblades[0] : null;
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
  }, [gameState.isPlaying, getMovementDirection, onGameEnd]);

  // Start game loop when playing
  useEffect(() => {
    if (gameState.isPlaying) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.isPlaying]);

  // Restart game function
  const restartGame = useCallback(() => {
    const stadium: Stadium = {
      center: { x: 400, y: 300 },
      innerRadius: 240,
      outerRadius: 290,
      exitRadius: 290,
      width: 800,
      height: 600,
    };

    const playerBey = createBeyblade("player", selectedBeyblade, { x: 320, y: 250 }, true);
    playerBey.spin = 2000;
    playerBey.currentMaxAcceleration = 15; // Start with normal max acceleration
    playerBey.accelerationDecayStartTime = 0; // Start decay immediately

    const randomAngle = Math.random() * Math.PI * 2;
    const randomRadius = 100 + Math.random() * 80;
    const aiX = stadium.center.x + Math.cos(randomAngle) * randomRadius;
    const aiY = stadium.center.y + Math.sin(randomAngle) * randomRadius;

    const aiBey = createBeyblade("ai", selectedAIBeyblade, { x: aiX, y: aiY }, false);
    aiBey.spin = 2000;
    aiBey.currentMaxAcceleration = 15; // Start with normal max acceleration
    aiBey.accelerationDecayStartTime = 0; // Start decay immediately

    // Start countdown instead of immediately playing
    setGameState({
      beyblades: [playerBey, aiBey],
      stadium,
      isPlaying: false,
      winner: null,
      gameTime: 0,
      countdownActive: true,
      countdownValue: 3,
    });

    // Start countdown sequence
    let countValue = 3;
    const countdownInterval = setInterval(() => {
      countValue--;
      if (countValue > 0) {
        setGameState(prev => ({
          ...prev,
          countdownValue: countValue,
        }));
      } else {
        // Show "LET IT RIP!" for 0.5 seconds then start game
        setGameState(prev => ({
          ...prev,
          countdownValue: 0,
        }));
        
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            isPlaying: true,
            countdownActive: false,
          }));
        }, 500);
        
        clearInterval(countdownInterval);
      }
    }, 1000);
  }, [selectedBeyblade, selectedAIBeyblade]);

  return {
    gameState,
    selectedBeyblade,
    selectedAIBeyblade,
    setSelectedBeyblade,
    setSelectedAIBeyblade,
    restartGame,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleVirtualDPad,
  };
};

// Helper function for beyblade logic
function updateBeybladeLogic(beyblade: GameBeyblade, deltaTime: number, gameState: GameState) {
  // Calculate acceleration and rotation
  const velocityMagnitude = Math.sqrt(
    beyblade.velocity.x * beyblade.velocity.x + beyblade.velocity.y * beyblade.velocity.y
  );
  
  // Handle gradual acceleration decay and gain from velocity
  if (beyblade.currentMaxAcceleration > 15) {
    if (beyblade.accelerationDecayStartTime !== undefined && gameState.gameTime >= beyblade.accelerationDecayStartTime) {
      // Different decay rates based on context
      let decayRate;
      if (beyblade.isChargeDashing) {
        decayRate = 6; // Faster decay during charge dash
      } else if (gameState.gameTime < 5.0) {
        decayRate = 2; // No decay for first 5 seconds
      } else {
        decayRate = 4; // Slightly faster normal decay
      }
      
      // Calculate velocity-based gain (2 per velocity magnitude)
      const velocityGain = velocityMagnitude * 0.01; // 2 per 100 velocity units
      
      // Apply decay and gain
      const netChange = velocityGain - (decayRate * deltaTime);
      const newMaxAccel = beyblade.currentMaxAcceleration + netChange;
      
      // Set caps: normal max 15, charge dash max 25
      const maxCap = beyblade.isChargeDashing ? 25 : 15;
      beyblade.currentMaxAcceleration = Math.max(15, Math.min(maxCap, newMaxAccel));
      
      // Clean up decay tracking when we reach normal level and no movement
      if (beyblade.currentMaxAcceleration <= 15 && velocityMagnitude < 5) {
        beyblade.accelerationDecayStartTime = undefined;
      }
    }
  }
  
  // Use current max acceleration cap
  beyblade.acceleration = Math.min(beyblade.currentMaxAcceleration, Math.floor(velocityMagnitude / 10));
  
  // Check if charge dash period has ended
  if (beyblade.isChargeDashing && beyblade.chargeDashEndTime && gameState.gameTime >= beyblade.chargeDashEndTime) {
    beyblade.isChargeDashing = false;
    beyblade.chargeDashEndTime = undefined;
    // Start gradual decay instead of immediate drop
    beyblade.accelerationDecayStartTime = gameState.gameTime;
  }

  const baseRotationsPerSecond = 20;
  const spinRatio = Math.max(0, beyblade.spin / 2000);
  const rotationSpeed = baseRotationsPerSecond * spinRatio * (Math.PI * 2);
  const direction = beyblade.config.direction === "left" ? -1 : 1;
  beyblade.rotation += rotationSpeed * direction * deltaTime;

  // Handle blue loop mechanics with charge point detection
  const distanceFromCenter = vectorLength(
    vectorSubtract(beyblade.position, gameState.stadium.center)
  );
  const isOnBlueCircle = Math.abs(distanceFromCenter - gameState.stadium.innerRadius) <= 5;

  const canLoop = !beyblade.blueLoopCooldownEnd || gameState.gameTime >= beyblade.blueLoopCooldownEnd;

  // Start blue loop if on blue circle and conditions are met
  if (isOnBlueCircle && beyblade.spin > 0 && !beyblade.isInBlueLoop && canLoop && !beyblade.isChargeDashing) {
    beyblade.isInBlueLoop = true;
    beyblade.blueCircleLoopStartTime = gameState.gameTime;
    beyblade.blueLoopAngle = Math.atan2(
      beyblade.position.y - gameState.stadium.center.y,
      beyblade.position.x - gameState.stadium.center.x
    );
    
    // Randomly select one charge point for this loop
    const chargePointAngles = [30, 150, 270];
    const randomIndex = Math.floor(Math.random() * chargePointAngles.length);
    beyblade.selectedChargePointAngle = chargePointAngles[randomIndex];
  }

  // Process blue loop with charge point detection
  if (beyblade.isInBlueLoop && beyblade.blueCircleLoopStartTime !== undefined) {
    const spinDirection = beyblade.config.direction === "left" ? -1 : 1;
    const angularSpeed = (Math.PI * 2) / 1.0; // 1 second per loop

    beyblade.blueLoopAngle += angularSpeed * spinDirection * deltaTime;

    // Check if beyblade has reached the selected charge point angle
    let currentAngleDegrees = (beyblade.blueLoopAngle * 180) / Math.PI;
    if (currentAngleDegrees < 0) currentAngleDegrees += 360;
    
    let shouldTriggerChargeDash = false;
    if (beyblade.selectedChargePointAngle !== undefined) {
      const angleThreshold = 5; // degrees tolerance
      const angleDiff = Math.abs(currentAngleDegrees - beyblade.selectedChargePointAngle);
      const angleDiffWrapped = Math.min(angleDiff, 360 - angleDiff);
      
      if (angleDiffWrapped <= angleThreshold) {
        shouldTriggerChargeDash = true;
      }
    }

    if (shouldTriggerChargeDash) {
      // Stop loop and initiate charge dash to center
      beyblade.isInBlueLoop = false;
      beyblade.blueCircleLoopStartTime = undefined;
      beyblade.blueLoopCooldownEnd = gameState.gameTime + 3.0;
      beyblade.selectedChargePointAngle = undefined; // Clear the selected charge point
      
      // Start charge dash mode
      beyblade.isChargeDashing = true;
      beyblade.chargeDashEndTime = gameState.gameTime + 3.0; // Increased to 3 seconds for extended strategic play
      beyblade.currentMaxAcceleration = 25; // Set enhanced acceleration cap to 25 for charge dash
      
      // Dash towards center with enhanced speed
      const directionToCenter = vectorSubtract(gameState.stadium.center, beyblade.position);
      const normalizedDirection = {
        x: directionToCenter.x / vectorLength(directionToCenter),
        y: directionToCenter.y / vectorLength(directionToCenter),
      };
      
      const chargeDashSpeed = 350; // Reduced from 550 to prevent stadium exits
      beyblade.velocity = {
        x: normalizedDirection.x * chargeDashSpeed,
        y: normalizedDirection.y * chargeDashSpeed,
      };
      
      beyblade.acceleration = 25; // Maximum acceleration during charge dash
    } else {
      // Continue normal blue loop movement
      beyblade.position = {
        x: gameState.stadium.center.x + Math.cos(beyblade.blueLoopAngle) * gameState.stadium.innerRadius,
        y: gameState.stadium.center.y + Math.sin(beyblade.blueLoopAngle) * gameState.stadium.innerRadius,
      };

      const tangentX = -Math.sin(beyblade.blueLoopAngle) * spinDirection;
      const tangentY = Math.cos(beyblade.blueLoopAngle) * spinDirection;
      const circularSpeed = 200;
      const accelerationMultiplier = 4; // Increased from 2 for faster blue loop movement
      beyblade.velocity = {
        x: tangentX * circularSpeed * accelerationMultiplier,
        y: tangentY * circularSpeed * accelerationMultiplier,
      };

      beyblade.acceleration = Math.min(15, beyblade.acceleration * accelerationMultiplier); // Cap at normal max of 15
    }
  } else if (!beyblade.isInBlueLoop) {
    updateBeyblade(beyblade, deltaTime, gameState.stadium);
    handleStadiumBounds(beyblade, gameState);
    
    // Additional stadium boundary checking for charge dash - allow strategic exits but provide control
    if (beyblade.isChargeDashing) {
      const distanceFromCenter = vectorLength(
        vectorSubtract(beyblade.position, gameState.stadium.center)
      );
      
      // Only redirect if beyblade is very close to exit (allow strategic positioning)
      if (distanceFromCenter > gameState.stadium.outerRadius - 20) {
        const directionToCenter = vectorSubtract(gameState.stadium.center, beyblade.position);
        const normalizedDirection = {
          x: directionToCenter.x / vectorLength(directionToCenter),
          y: directionToCenter.y / vectorLength(directionToCenter),
        };
        
        // Gentle redirect toward safe zone with moderate speed
        const redirectSpeed = 250; // Reduced from 300 for better control
        beyblade.velocity = {
          x: normalizedDirection.x * redirectSpeed,
          y: normalizedDirection.y * redirectSpeed,
        };
      }
    }
  }

  // Handle spin decay and death
  if (!beyblade.isInBlueLoop) {
    const frictionCoefficient = 0.995;
    const velocityDrag = velocityMagnitude * 0.01;
    const baseLoss = 0.5;
    const totalSpinLoss = baseLoss + velocityDrag;
    beyblade.spin = Math.max(0, beyblade.spin - totalSpinLoss * deltaTime);
  }

  if (beyblade.spin <= 0 && !beyblade.justRespawned) {
    beyblade.isDead = true;
    beyblade.velocity = { x: 0, y: 0 };
    beyblade.isInBlueLoop = false;
    beyblade.isChargeDashing = false;
  }

  if (beyblade.justRespawned) {
    beyblade.justRespawned = false;
  }
}

// Get charge points on blue circle at specific angles
function getChargePoints(stadium: Stadium) {
  const chargePoints: Vector2D[] = [];
  
  // Charge points on blue circle at 90°, 210°, 330° (centers of wall zones)
 const chargePointAngles = [30, 150, 270];
  
  for (const angleDegrees of chargePointAngles) {
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const chargePoint = {
      x: stadium.center.x + Math.cos(angleRadians) * stadium.innerRadius,
      y: stadium.center.y + Math.sin(angleRadians) * stadium.innerRadius,
    };
    chargePoints.push(chargePoint);
  }
  
  return chargePoints;
}

// Handle stadium boundary collisions
function handleStadiumBounds(beyblade: GameBeyblade, gameState: GameState) {
  const distanceFromCenter = vectorLength(
    vectorSubtract(beyblade.position, gameState.stadium.center)
  );

  if (distanceFromCenter > gameState.stadium.outerRadius) {
    const angle = Math.atan2(
      beyblade.position.y - gameState.stadium.center.y,
      beyblade.position.x - gameState.stadium.center.x
    );

    let angleDegrees = (angle * 180) / Math.PI;
    if (angleDegrees < 0) angleDegrees += 360;

    const isWallSegment =
      (angleDegrees >= 0 && angleDegrees < 60) ||
      (angleDegrees >= 120 && angleDegrees < 180) ||
      (angleDegrees >= 240 && angleDegrees < 300);

    if (isWallSegment) {
      // Wall collision
      const spinLoss = 10 + beyblade.acceleration;
      beyblade.spin = Math.max(50, beyblade.spin - spinLoss);
      beyblade.isOutOfBounds = false;
      beyblade.isDead = false;
      beyblade.justRespawned = true;

      // Respawn logic
      const directionToCenter = {
        x: gameState.stadium.center.x - beyblade.position.x,
        y: gameState.stadium.center.y - beyblade.position.y,
      };
      const directionLength = Math.sqrt(
        directionToCenter.x * directionToCenter.x + directionToCenter.y * directionToCenter.y
      );
      const normalizedDirection = {
        x: directionToCenter.x / directionLength,
        y: directionToCenter.y / directionLength,
      };

      const respawnDistance = gameState.stadium.innerRadius - 10;
      beyblade.position = {
        x: gameState.stadium.center.x + normalizedDirection.x * -respawnDistance,
        y: gameState.stadium.center.y + normalizedDirection.y * -respawnDistance,
      };

      const inwardSpeed = 60 + Math.random() * 30;
      beyblade.velocity = {
        x: normalizedDirection.x * inwardSpeed,
        y: normalizedDirection.y * inwardSpeed,
      };
    } else {
      // Exit zone
      beyblade.isOutOfBounds = true;
      beyblade.isDead = true;
      beyblade.velocity = { x: 0, y: 0 };
    }
  }
}
