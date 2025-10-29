"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameState, GameBeyblade, Stadium, Vector2D } from "../types/game";
import {
  updateBeyblade,
  createBeyblade,
  vectorSubtract,
  vectorLength,
} from "../utils/gamePhysics";
import { checkCollision } from "../utils/collisionUtils";
import { resolvePhysicsCollision } from "../utils/physicsCollision";

interface UseGameStateOptions {
  onGameEnd?: (winner: GameBeyblade | null) => void;
  gameMode?: "1p" | "2p";
  multiplayerData?: {
    playerNumber: number;
    roomId: string;
  };
  onCollision?: (collisionData: any) => void;
}

export const useGameState = (options: UseGameStateOptions = {}) => {
  const { onGameEnd, gameMode = "1p", multiplayerData, onCollision } = options;
  
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<Vector2D>({ x: 0, y: 0 });
  const keysRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<Vector2D>({ x: 0, y: 0 });
  const isTouchActiveRef = useRef(false);
  const virtualDPadRef = useRef<Vector2D>({ x: 0, y: 0 });
  const controlModeRef = useRef<'mouse' | 'gamepad'>('mouse'); // Track active control mode
  const specialActionsRef = useRef<{
    dodgeRight: boolean;
    dodgeLeft: boolean;
    heavyAttack: boolean;
    ultimateAttack: boolean;
    selectChargePoint1: boolean;
    selectChargePoint2: boolean;
    selectChargePoint3: boolean;
  }>({
    dodgeRight: false,
    dodgeLeft: false,
    heavyAttack: false,
    ultimateAttack: false,
    selectChargePoint1: false,
    selectChargePoint2: false,
    selectChargePoint3: false,
  });

  // Multiplayer state
  const opponentInputRef = useRef<Vector2D>({ x: 0, y: 0 });
  const opponentSpecialActionsRef = useRef<{
    dodgeRight: boolean;
    dodgeLeft: boolean;
    heavyAttack: boolean;
    ultimateAttack: boolean;
  }>({
    dodgeRight: false,
    dodgeLeft: false,
    heavyAttack: false,
    ultimateAttack: false,
  });
  const isMultiplayer = gameMode === "2p";
  const playerNumber = multiplayerData?.playerNumber || 1;

  const [gameState, setGameState] = useState<GameState>(() => {
    return createInitialGameState();
  });

  const [selectedBeyblade, setSelectedBeyblade] = useState("dragoon-gt");
  const [selectedAIBeyblade, setSelectedAIBeyblade] = useState("spriggan");
  const [isLoading, setIsLoading] = useState(false);

  // Create initial game state
  function createInitialGameState(): GameState {
    const stadium: Stadium = {
      center: { x: 400, y: 400 }, // Centered in square canvas (800x800)
      innerRadius: 360, // Outer playing area boundary
      outerRadius: 380, // Wall/exit zone boundary
      exitRadius: 380,
      chargeDashRadius: 300, // Blue circle for charge dash with charge points
      normalLoopRadius: 200, // Blue circle for normal loop (center)
      width: 800,
      height: 800, // Square canvas
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
    // Switch to mouse mode when mouse is moved in arena
    controlModeRef.current = 'mouse';
  }, []);

  const handleTouchStart = useCallback((position: Vector2D) => {
    touchRef.current = position;
    isTouchActiveRef.current = true;
    // Switch to mouse mode when touch is used in arena
    controlModeRef.current = 'mouse';
  }, []);

  const handleTouchMove = useCallback((position: Vector2D) => {
    touchRef.current = position;
    controlModeRef.current = 'mouse';
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouchActiveRef.current = false;
  }, []);

  const handleVirtualDPad = useCallback((direction: Vector2D) => {
    virtualDPadRef.current = direction;
    // Switch to gamepad mode when D-pad is used
    if (direction.x !== 0 || direction.y !== 0) {
      controlModeRef.current = 'gamepad';
    }
  }, []);

  const handleVirtualAction = useCallback((action: 1 | 2 | 3 | 4) => {
    // Switch to gamepad mode when action buttons are pressed
    controlModeRef.current = 'gamepad';
    
    // Map action buttons to special actions
    // 1 = Dodge Left (keyboard 1, left click)
    // 2 = Dodge Right (keyboard 2, right click)
    // 3 = Normal Attack (keyboard 3, middle mouse)
    // 4 = Power Attack (keyboard 4, double click)
    if (action === 1) {
      specialActionsRef.current.dodgeLeft = true;
      specialActionsRef.current.selectChargePoint1 = true;
    } else if (action === 2) {
      specialActionsRef.current.dodgeRight = true;
      specialActionsRef.current.selectChargePoint2 = true;
    } else if (action === 3) {
      specialActionsRef.current.heavyAttack = true;
      specialActionsRef.current.selectChargePoint3 = true;
    } else if (action === 4) {
      specialActionsRef.current.ultimateAttack = true;
    }
  }, []);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Movement keys
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault();
        keysRef.current.add(key);
        controlModeRef.current = 'gamepad'; // Switch to gamepad mode for keyboard controls
      }
      
      // Special action keys
      // 1 = Dodge Left
      if (key === "1") {
        event.preventDefault();
        specialActionsRef.current.dodgeLeft = true;
        specialActionsRef.current.selectChargePoint1 = true;
      }
      // 2 = Dodge Right
      if (key === "2") {
        event.preventDefault();
        specialActionsRef.current.dodgeRight = true;
        specialActionsRef.current.selectChargePoint2 = true;
      }
      // 3 = Normal Attack
      if (key === "3") {
        event.preventDefault();
        specialActionsRef.current.heavyAttack = true;
        specialActionsRef.current.selectChargePoint3 = true;
      }
      // 4 = Power Attack
      if (key === "4") {
        event.preventDefault();
        specialActionsRef.current.ultimateAttack = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keysRef.current.delete(key);
    };

    const handleMouseDown = (event: MouseEvent) => {
      event.preventDefault();
      // Left click = Dodge Left (1)
      if (event.button === 0) {
        specialActionsRef.current.dodgeLeft = true;
        specialActionsRef.current.selectChargePoint1 = true;
      }
      // Right click = Dodge Right (2)
      if (event.button === 2) {
        specialActionsRef.current.dodgeRight = true;
        specialActionsRef.current.selectChargePoint2 = true;
      }
      // Middle button = Normal Attack (3)
      if (event.button === 1) {
        specialActionsRef.current.heavyAttack = true;
        specialActionsRef.current.selectChargePoint3 = true;
      }
    };

    const handleDoubleClick = (event: MouseEvent) => {
      // Only trigger on canvas double-click, not UI elements
      const target = event.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        event.preventDefault();
        // Double click = Power Attack (4)
        specialActionsRef.current.ultimateAttack = true;
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault(); // Prevent context menu on right click
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Get movement direction from inputs
  const getMovementDirection = useCallback((): Vector2D => {
    // No input during countdown
    if (gameState.countdownActive) {
      return { x: 0, y: 0 };
    }

    // In multiplayer, find MY beyblade by player number (not just isPlayer)
    // Player 1 controls beyblade at index 0, Player 2 controls beyblade at index 1
    const myBeybladeIndex = isMultiplayer ? (playerNumber - 1) : 0;
    const playerBey = gameState.beyblades[myBeybladeIndex];
    
    if (!playerBey) {
      return { x: 0, y: 0 };
    }

    // Players can now control during loops and charge dash for special moves
    // But not during heavy/ultimate attacks or dodges
    if (playerBey.heavyAttackActive || playerBey.ultimateAttackActive || playerBey.isDodging) {
      return { x: 0, y: 0 }; // No control during active attacks/dodges
    }

    // GAMEPAD MODE: Use virtual D-Pad or keyboard
    if (controlModeRef.current === 'gamepad') {
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

      return { x: 0, y: 0 };
    }

    // MOUSE MODE: Move towards mouse/touch position (directional)
    if (playerBey) {
      // Check touch input first
      if (isTouchActiveRef.current) {
        const direction = vectorSubtract(touchRef.current, playerBey.position);
        const distance = vectorLength(direction);
        if (distance > 10) {
          return { x: direction.x / distance, y: direction.y / distance };
        }
      }

      // Fall back to mouse input
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
    const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 1 / 60);
    lastTimeRef.current = currentTime;

    setGameState((prevState) => {
      // Allow game loop to run during countdown for animation
      if (!prevState.isPlaying && !prevState.countdownActive) return prevState;

      const newState = { ...prevState };
      
      // In multiplayer, identify MY beyblade and OPPONENT beyblade by index
      // Player 1 = index 0, Player 2 = index 1
      const myBeybladeIndex = isMultiplayer ? (playerNumber - 1) : 0;
      const opponentBeybladeIndex = isMultiplayer ? (playerNumber === 1 ? 1 : 0) : 1;
      
      const playerBey = newState.beyblades[myBeybladeIndex];
      const aiBey = newState.beyblades[opponentBeybladeIndex];

      // Keep beyblades stationary during countdown
      if (newState.countdownActive) {
        newState.beyblades.forEach((bey) => {
          bey.velocity = { x: 0, y: 0 };
        });
        
        // Still update game time and continue loop
        newState.gameTime += deltaTime;
        return newState;
      }

      // Process special actions for player (can now be used during loops/charge dash)
      if (playerBey && !playerBey.isDead && !playerBey.isOutOfBounds) {
        // Calculate direction to opponent for attack movements (if opponent exists)
        let normalizedDirection = { x: 0, y: 0 };
        if (aiBey && !aiBey.isDead && !aiBey.isOutOfBounds) {
          const directionToOpponent = vectorSubtract(aiBey.position, playerBey.position);
          const distanceToOpponent = vectorLength(directionToOpponent);
          normalizedDirection = distanceToOpponent > 0 ? {
            x: directionToOpponent.x / distanceToOpponent,
            y: directionToOpponent.y / distanceToOpponent,
          } : { x: 0, y: 0 };
        }

        // Process dodge right (2 or right click) - Fixed 50 units distance
        if (specialActionsRef.current.dodgeRight) {
          const canDodge = !playerBey.dodgeCooldownEnd || newState.gameTime >= playerBey.dodgeCooldownEnd;
          if (canDodge && playerBey.spin >= 20) {
            playerBey.spin = Math.max(0, playerBey.spin - 20);
            playerBey.isDodging = true;
            playerBey.attackStartPosition = { ...playerBey.position };
            playerBey.attackTargetDistance = 50;
            const dodgeSpeed = 400;
            playerBey.velocity.x += dodgeSpeed;
            playerBey.dodgeCooldownEnd = newState.gameTime + 2.0;
            playerBey.lastDodgeTime = Date.now();
          }
          specialActionsRef.current.dodgeRight = false;
        }
        
        // Process dodge left (1 or left click) - Fixed 50 units distance
        if (specialActionsRef.current.dodgeLeft) {
          const canDodge = !playerBey.dodgeCooldownEnd || newState.gameTime >= playerBey.dodgeCooldownEnd;
          if (canDodge && playerBey.spin >= 20) {
            playerBey.spin = Math.max(0, playerBey.spin - 20);
            playerBey.isDodging = true;
            playerBey.attackStartPosition = { ...playerBey.position };
            playerBey.attackTargetDistance = 50;
            const dodgeSpeed = 400;
            playerBey.velocity.x -= dodgeSpeed;
            playerBey.dodgeCooldownEnd = newState.gameTime + 2.0;
            playerBey.lastDodgeTime = Date.now();
          }
          specialActionsRef.current.dodgeLeft = false;
        }
        
        // Clear dodging flag after distance traveled
        if (playerBey.isDodging && playerBey.attackStartPosition && playerBey.attackTargetDistance) {
          const distanceTraveled = vectorLength(
            vectorSubtract(playerBey.position, playerBey.attackStartPosition)
          );
          if (distanceTraveled >= playerBey.attackTargetDistance) {
            playerBey.isDodging = false;
            playerBey.attackStartPosition = undefined;
            playerBey.attackTargetDistance = undefined;
          }
        }
        
        // Process heavy attack (3 or middle mouse) - Travel in joystick/mouse direction
        if (specialActionsRef.current.heavyAttack) {
          const canAttack = !playerBey.attackCooldownEnd || newState.gameTime >= playerBey.attackCooldownEnd;
          if (canAttack) {
            playerBey.heavyAttackActive = true;
            playerBey.attackStartPosition = { ...playerBey.position };
            playerBey.attackTargetDistance = 100; // Travel 100 units
            playerBey.attackCooldownEnd = newState.gameTime + 5.0; // 5 second cooldown
            
            // Move in current joystick/mouse direction (or towards opponent if no input)
            const currentDirection = getMovementDirection();
            const attackDirection = (currentDirection.x !== 0 || currentDirection.y !== 0)
              ? currentDirection
              : normalizedDirection; // Fall back to opponent direction
              
            const attackSpeed = 350;
            playerBey.velocity.x = attackDirection.x * attackSpeed;
            playerBey.velocity.y = attackDirection.y * attackSpeed;
          }
          specialActionsRef.current.heavyAttack = false;
        }
        
        // Process ultimate attack (4 or double click) - Travel in joystick/mouse direction
        if (specialActionsRef.current.ultimateAttack) {
          const canAttack = !playerBey.attackCooldownEnd || newState.gameTime >= playerBey.attackCooldownEnd;
          if (canAttack && playerBey.spin >= 100) { // Requires 100 spin
            playerBey.spin = Math.max(0, playerBey.spin - 100);
            playerBey.ultimateAttackActive = true;
            playerBey.attackStartPosition = { ...playerBey.position };
            playerBey.attackTargetDistance = 150; // Travel 150 units
            playerBey.attackCooldownEnd = newState.gameTime + 5.0; // 5 second cooldown
            
            // Move in current joystick/mouse direction (or towards opponent if no input)
            const currentDirection = getMovementDirection();
            const attackDirection = (currentDirection.x !== 0 || currentDirection.y !== 0)
              ? currentDirection
              : normalizedDirection; // Fall back to opponent direction
              
            const ultimateAttackSpeed = 500;
            playerBey.velocity.x = attackDirection.x * ultimateAttackSpeed;
            playerBey.velocity.y = attackDirection.y * ultimateAttackSpeed;
          }
          specialActionsRef.current.ultimateAttack = false;
        }
        
        // Check if heavy attack distance traveled
        if (playerBey.heavyAttackActive && playerBey.attackStartPosition && playerBey.attackTargetDistance) {
          const distanceTraveled = vectorLength(
            vectorSubtract(playerBey.position, playerBey.attackStartPosition)
          );
          if (distanceTraveled >= playerBey.attackTargetDistance) {
            playerBey.heavyAttackActive = false;
            playerBey.attackStartPosition = undefined;
            playerBey.attackTargetDistance = undefined;
          }
        }
        
        // Check if ultimate attack distance traveled
        if (playerBey.ultimateAttackActive && playerBey.attackStartPosition && playerBey.attackTargetDistance) {
          const distanceTraveled = vectorLength(
            vectorSubtract(playerBey.position, playerBey.attackStartPosition)
          );
          if (distanceTraveled >= playerBey.attackTargetDistance) {
            playerBey.ultimateAttackActive = false;
            playerBey.attackStartPosition = undefined;
            playerBey.attackTargetDistance = undefined;
          }
        }
        
        // Process charge point selection during blue loop
        if (playerBey.isInBlueLoop) {
          if (specialActionsRef.current.selectChargePoint1) {
            playerBey.selectedChargePoint = 1;
            specialActionsRef.current.selectChargePoint1 = false;
          }
          if (specialActionsRef.current.selectChargePoint2) {
            playerBey.selectedChargePoint = 2;
            specialActionsRef.current.selectChargePoint2 = false;
          }
          if (specialActionsRef.current.selectChargePoint3) {
            playerBey.selectedChargePoint = 3;
            specialActionsRef.current.selectChargePoint3 = false;
          }
        }
      }

      // Update player movement - allow control except during attacks and dodges
      // Players can now move during loops and charge dash
      if (playerBey && !playerBey.isDead && !playerBey.isOutOfBounds && 
          !playerBey.heavyAttackActive && !playerBey.ultimateAttackActive && !playerBey.isDodging) {
        const direction = getMovementDirection();
        
        if (direction.x !== 0 || direction.y !== 0) {
          const maxSpeed = 250;
          const acceleration = 500;
          const targetVelocity = {
            x: direction.x * maxSpeed,
            y: direction.y * maxSpeed,
          };

          playerBey.velocity.x += ((targetVelocity.x - playerBey.velocity.x) * acceleration * deltaTime) / 100;
          playerBey.velocity.y += ((targetVelocity.y - playerBey.velocity.y) * acceleration * deltaTime) / 100;
        } else {
          const deceleration = 0.90;
          playerBey.velocity = {
            x: playerBey.velocity.x * deceleration,
            y: playerBey.velocity.y * deceleration,
          };
        }
      }

      // Update AI movement and special actions (ONLY in single-player mode)
      if (!isMultiplayer && aiBey && playerBey && !aiBey.isDead && !aiBey.isOutOfBounds && !aiBey.isInBlueLoop && !aiBey.isChargeDashing) {
        const targetDirection = vectorSubtract(playerBey.position, aiBey.position);
        const targetDistance = vectorLength(targetDirection);

        // AI Special Moves Logic
        if (!aiBey.heavyAttackActive && !aiBey.ultimateAttackActive) {
          // Ultimate Attack: 150 units distance, requires 100+ spin
          const canAttack = !aiBey.attackCooldownEnd || newState.gameTime >= aiBey.attackCooldownEnd;
          if (canAttack && targetDistance >= 60 && targetDistance <= 150 && aiBey.spin >= 100 && Math.random() < 0.015) {
            aiBey.spin = Math.max(0, aiBey.spin - 100);
            aiBey.ultimateAttackActive = true;
            aiBey.attackStartPosition = { ...aiBey.position };
            aiBey.attackTargetDistance = 150; // 150 units for ultimate
            aiBey.attackCooldownEnd = newState.gameTime + 5.0; // 5 second cooldown
            
            const normalizedDirection = {
              x: targetDirection.x / targetDistance,
              y: targetDirection.y / targetDistance,
            };
            const ultimateAttackSpeed = 500;
            aiBey.velocity.x = normalizedDirection.x * ultimateAttackSpeed;
            aiBey.velocity.y = normalizedDirection.y * ultimateAttackSpeed;
          }
          // Heavy Attack: 100 units distance at medium range
          else if (canAttack && targetDistance >= 40 && targetDistance <= 120 && Math.random() < 0.02) {
            aiBey.heavyAttackActive = true;
            aiBey.attackStartPosition = { ...aiBey.position };
            aiBey.attackTargetDistance = 100; // 100 units for heavy
            aiBey.attackCooldownEnd = newState.gameTime + 5.0; // 5 second cooldown
            
            const normalizedDirection = {
              x: targetDirection.x / targetDistance,
              y: targetDirection.y / targetDistance,
            };
            const attackSpeed = 350;
            aiBey.velocity.x = normalizedDirection.x * attackSpeed;
            aiBey.velocity.y = normalizedDirection.y * attackSpeed;
          }
          // Dodge: Fixed 50 units distance when very close
          else if (targetDistance < 50 && aiBey.spin >= 20) {
            const canDodge = !aiBey.dodgeCooldownEnd || newState.gameTime >= aiBey.dodgeCooldownEnd;
            if (canDodge && Math.random() < 0.025) {
              aiBey.spin = Math.max(0, aiBey.spin - 20);
              aiBey.isDodging = true;
              aiBey.attackStartPosition = { ...aiBey.position };
              aiBey.attackTargetDistance = 50; // Fixed 50 units
              const dodgeSpeed = 400;
              // Randomly dodge left or right
              if (Math.random() < 0.5) {
                aiBey.velocity.x += dodgeSpeed;
              } else {
                aiBey.velocity.x -= dodgeSpeed;
              }
              aiBey.dodgeCooldownEnd = newState.gameTime + 2.0; // 2 second cooldown
              aiBey.lastDodgeTime = Date.now();
            }
          }
        }

        // Clear dodging flag after distance traveled
        if (aiBey.isDodging && aiBey.attackStartPosition && aiBey.attackTargetDistance) {
          const distanceTraveled = vectorLength(
            vectorSubtract(aiBey.position, aiBey.attackStartPosition)
          );
          if (distanceTraveled >= aiBey.attackTargetDistance) {
            aiBey.isDodging = false;
            aiBey.attackStartPosition = undefined;
            aiBey.attackTargetDistance = undefined;
          }
        }

        // Check if AI heavy attack distance traveled
        if (aiBey.heavyAttackActive && aiBey.attackStartPosition && aiBey.attackTargetDistance) {
          const distanceTraveled = vectorLength(
            vectorSubtract(aiBey.position, aiBey.attackStartPosition)
          );
          if (distanceTraveled >= aiBey.attackTargetDistance) {
            aiBey.heavyAttackActive = false;
            aiBey.attackStartPosition = undefined;
            aiBey.attackTargetDistance = undefined;
          }
        }

        // Check if AI ultimate attack distance traveled
        if (aiBey.ultimateAttackActive && aiBey.attackStartPosition && aiBey.attackTargetDistance) {
          const distanceTraveled = vectorLength(
            vectorSubtract(aiBey.position, aiBey.attackStartPosition)
          );
          if (distanceTraveled >= aiBey.attackTargetDistance) {
            aiBey.ultimateAttackActive = false;
            aiBey.attackStartPosition = undefined;
            aiBey.attackTargetDistance = undefined;
          }
        }

        // Normal AI movement (only when not attacking or dodging)
        if (!aiBey.heavyAttackActive && !aiBey.ultimateAttackActive && !aiBey.isDodging) {
          const randomFactor = 0.4; // Increased from 0.3 for less accurate AI
          const randomAngle = Math.random() * Math.PI * 2;
          const randomX = Math.cos(randomAngle) * randomFactor;
          const randomY = Math.sin(randomAngle) * randomFactor;

          if (targetDistance > 60) {
            const maxSpeed = 180; // Reduced from 220 for slower AI
            const acceleration = 380; // Reduced from 450 for slower AI response
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
        } else {
          // Apply slight deceleration during special moves to prevent sliding
          const deceleration = 0.95;
          if (!aiBey.heavyAttackActive && !aiBey.ultimateAttackActive) {
            aiBey.velocity.x *= deceleration;
            aiBey.velocity.y *= deceleration;
          }
        }
      }

      // In multiplayer mode, opponent beyblade state comes entirely from network
      // No local AI simulation - all movement/actions are received via setOpponentBeybladeState

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
              // Store pre-collision state for comparison
              const bey1SpinBefore = bey1.spin;
              const bey2SpinBefore = bey2.spin;
              
              // Use NEW physics-based collision system
              const collisionResult = resolvePhysicsCollision(bey1, bey2);
              
              // Report collision to multiplayer if this is my beyblade
              // In multiplayer, send collision to server for authoritative calculation
              if (isMultiplayer && onCollision) {
                // Determine which beyblade is mine based on player number
                const myBeybladeIndex = playerNumber - 1;
                const myBey = newState.beyblades[myBeybladeIndex];
                const opponentBeybladeIndex = playerNumber === 1 ? 1 : 0;
                const opponentBey = newState.beyblades[opponentBeybladeIndex];
                
                const spinLoss = myBey === bey1 
                  ? (bey1SpinBefore - bey1.spin)
                  : (bey2SpinBefore - bey2.spin);
                
                // Send beyblade states to server for authoritative collision calculation
                onCollision({
                  bey1: {
                    mass: bey1.mass,
                    radius: bey1.radius,
                    velocity: bey1.velocity,
                    position: bey1.position,
                    spin: bey1SpinBefore, // Use pre-collision spin
                    maxSpin: bey1.maxSpin,
                    direction: bey1.config.direction,
                    isChargeDashing: bey1.isChargeDashing,
                    heavyAttackActive: bey1.heavyAttackActive,
                    ultimateAttackActive: bey1.ultimateAttackActive,
                  },
                  bey2: {
                    mass: bey2.mass,
                    radius: bey2.radius,
                    velocity: bey2.velocity,
                    position: bey2.position,
                    spin: bey2SpinBefore, // Use pre-collision spin
                    maxSpin: bey2.maxSpin,
                    direction: bey2.config.direction,
                    isChargeDashing: bey2.isChargeDashing,
                    heavyAttackActive: bey2.heavyAttackActive,
                    ultimateAttackActive: bey2.ultimateAttackActive,
                  },
                  mySpinLoss: spinLoss,
                  myNewSpin: myBey.spin,
                  opponentSpinLoss: myBey === bey1 
                    ? (bey2SpinBefore - bey2.spin)
                    : (bey1SpinBefore - bey1.spin),
                  collisionForce: collisionResult.collisionForce,
                });
              }
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

    // Continue game loop if playing OR if countdown is active
    if (gameState.isPlaying || gameState.countdownActive) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState.isPlaying, gameState.countdownActive, getMovementDirection, onGameEnd, isMultiplayer, onCollision]);

  // Start game loop when playing or countdown is active
  useEffect(() => {
    if (gameState.isPlaying || gameState.countdownActive) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.isPlaying, gameState.countdownActive]);

  // Restart game function
  const restartGame = useCallback(() => {
    // Set loading state
    setIsLoading(true);
    
    const stadium: Stadium = {
      center: { x: 400, y: 400 }, // Centered in square canvas (800x800)
      innerRadius: 360, // Outer playing area boundary
      outerRadius: 380, // Wall/exit zone boundary
      exitRadius: 380,
      chargeDashRadius: 300, // Blue circle for charge dash with charge points
      normalLoopRadius: 200, // Blue circle for normal loop (center)
      width: 800,
      height: 800, // Square canvas
    };

    const playerBey = createBeyblade("player", selectedBeyblade, { x: 320, y: 400 }, true);
    playerBey.spin = 3500; // Increased from 2000 for longer gameplay
    playerBey.currentMaxAcceleration = 15; // Start with normal max acceleration
    playerBey.accelerationDecayStartTime = 0; // Start decay immediately

    const randomAngle = Math.random() * Math.PI * 2;
    const randomRadius = 100 + Math.random() * 80;
    const aiX = stadium.center.x + Math.cos(randomAngle) * randomRadius;
    const aiY = stadium.center.y + Math.sin(randomAngle) * randomRadius;

    const aiBey = createBeyblade("ai", selectedAIBeyblade, { x: aiX, y: aiY }, false);
    aiBey.spin = 2800; // Increased from 2000, but less than player for easier gameplay
    aiBey.currentMaxAcceleration = 15; // Start with normal max acceleration
    aiBey.accelerationDecayStartTime = 0; // Start decay immediately

    // Skip loading screen - start game with countdown immediately
    // Set the game state with countdown and start the game loop
    setGameState({
      beyblades: [playerBey, aiBey],
      stadium,
      isPlaying: false, // Will be set to true after countdown
      winner: null,
      gameTime: 0,
      countdownActive: true,
      countdownValue: 3,
    });
    
    // End loading screen immediately
    setIsLoading(false);

    // Start countdown sequence - game will animate during countdown
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
    }, 1000); // 1 second per countdown number
  }, [selectedBeyblade, selectedAIBeyblade]);

  // Functions to receive opponent input in multiplayer
  const setOpponentInput = useCallback((input: Vector2D) => {
    opponentInputRef.current = input;
  }, []);

  const setOpponentSpecialAction = useCallback((action: {
    dodgeRight?: boolean;
    dodgeLeft?: boolean;
    heavyAttack?: boolean;
    ultimateAttack?: boolean;
  }) => {
    if (action.dodgeRight !== undefined) {
      opponentSpecialActionsRef.current.dodgeRight = action.dodgeRight;
    }
    if (action.dodgeLeft !== undefined) {
      opponentSpecialActionsRef.current.dodgeLeft = action.dodgeLeft;
    }
    if (action.heavyAttack !== undefined) {
      opponentSpecialActionsRef.current.heavyAttack = action.heavyAttack;
    }
    if (action.ultimateAttack !== undefined) {
      opponentSpecialActionsRef.current.ultimateAttack = action.ultimateAttack;
    }
  }, []);

  // Function to get current input for sending to opponent
  const getCurrentInput = useCallback((): {
    direction: Vector2D;
    specialActions: {
      dodgeRight: boolean;
      dodgeLeft: boolean;
      heavyAttack: boolean;
      ultimateAttack: boolean;
    };
  } => {
    return {
      direction: getMovementDirection(),
      specialActions: {
        dodgeRight: specialActionsRef.current.dodgeRight,
        dodgeLeft: specialActionsRef.current.dodgeLeft,
        heavyAttack: specialActionsRef.current.heavyAttack,
        ultimateAttack: specialActionsRef.current.ultimateAttack,
      },
    };
  }, [getMovementDirection]);

  // Function to get current beyblade state for sending to opponent
  const getMyBeybladeState = useCallback(() => {
    // In multiplayer, use player number to find MY beyblade
    // Player 1 = index 0, Player 2 = index 1
    const myBeybladeIndex = isMultiplayer ? (playerNumber - 1) : 0;
    const myBey = gameState.beyblades[myBeybladeIndex];
    
    if (!myBey) return null;
    
    return {
      position: myBey.position,
      velocity: myBey.velocity,
      rotation: myBey.rotation,
      spin: myBey.spin,
      acceleration: myBey.acceleration,                          // ✅ Current acceleration
      currentMaxAcceleration: myBey.currentMaxAcceleration,      // ✅ Max acceleration cap
      isDead: myBey.isDead,
      isOutOfBounds: myBey.isOutOfBounds,
      isInBlueLoop: myBey.isInBlueLoop,
      isChargeDashing: myBey.isChargeDashing,
      isDodging: myBey.isDodging,
      heavyAttackActive: myBey.heavyAttackActive,
      ultimateAttackActive: myBey.ultimateAttackActive,
      // Animation states
      blueLoopAngle: myBey.blueLoopAngle,
      isInNormalLoop: myBey.isInNormalLoop,
      normalLoopAngle: myBey.normalLoopAngle,
    };
  }, [gameState.beyblades, isMultiplayer]);

  // Function to apply opponent's beyblade state
  const setOpponentBeybladeState = useCallback((beybladeState: any) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      
      // In multiplayer, opponent is at the opposite index
      // If I'm Player 1 (index 0), opponent is at index 1
      // If I'm Player 2 (index 1), opponent is at index 0
      const opponentBeybladeIndex = isMultiplayer ? (playerNumber === 1 ? 1 : 0) : 1;
      const opponentBey = newState.beyblades[opponentBeybladeIndex];
      
      if (opponentBey && beybladeState) {
        // Apply the authoritative state from opponent
        // These are the source of truth from the network
        opponentBey.position = { ...beybladeState.position };
        opponentBey.velocity = { ...beybladeState.velocity };
        opponentBey.rotation = beybladeState.rotation;
        opponentBey.spin = beybladeState.spin;
        opponentBey.acceleration = beybladeState.acceleration;
        opponentBey.currentMaxAcceleration = beybladeState.currentMaxAcceleration;
        opponentBey.isDead = beybladeState.isDead;
        opponentBey.isOutOfBounds = beybladeState.isOutOfBounds;
        opponentBey.isInBlueLoop = beybladeState.isInBlueLoop;
        opponentBey.isChargeDashing = beybladeState.isChargeDashing;
        opponentBey.isDodging = beybladeState.isDodging;
        opponentBey.heavyAttackActive = beybladeState.heavyAttackActive;
        opponentBey.ultimateAttackActive = beybladeState.ultimateAttackActive;
        
        // Animation states
        if (beybladeState.blueLoopAngle !== undefined) {
          opponentBey.blueLoopAngle = beybladeState.blueLoopAngle;
        }
        if (beybladeState.isInNormalLoop !== undefined) {
          opponentBey.isInNormalLoop = beybladeState.isInNormalLoop;
        }
        if (beybladeState.normalLoopAngle !== undefined) {
          opponentBey.normalLoopAngle = beybladeState.normalLoopAngle;
        }
        
        // Mark that this beyblade just received network update
        // This prevents local physics from overriding it immediately
        opponentBey.lastNetworkUpdate = Date.now();
      }
      
      return newState;
    });
  }, []);

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
    handleVirtualAction,
    isLoading,
    // Multiplayer functions
    setOpponentInput,
    setOpponentSpecialAction,
    getCurrentInput,
    getMyBeybladeState,
    setOpponentBeybladeState,
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

  // Calculate distance from center for loop mechanics
  const distanceFromCenter = vectorLength(
    vectorSubtract(beyblade.position, gameState.stadium.center)
  );

  // NORMAL LOOP (200 radius) - 2x Acceleration Boost
  const isOnNormalLoop = Math.abs(distanceFromCenter - gameState.stadium.normalLoopRadius) <= 5;
  const canNormalLoop = !beyblade.normalLoopCooldownEnd || gameState.gameTime >= beyblade.normalLoopCooldownEnd;

  // Track if beyblade is entering normal loop
  if (isOnNormalLoop && beyblade.spin > 0 && !beyblade.isInNormalLoop && canNormalLoop && 
      !beyblade.isChargeDashing && !beyblade.isDodging && !beyblade.isInBlueLoop) {
    beyblade.isInNormalLoop = true;
    beyblade.normalLoopStartTime = gameState.gameTime;
    beyblade.normalLoopAngle = Math.atan2(
      beyblade.position.y - gameState.stadium.center.y,
      beyblade.position.x - gameState.stadium.center.x
    );
    beyblade.normalLoopStartAngle = beyblade.normalLoopAngle;
  }

  // Process normal loop - full circle for 2x acceleration
  if (beyblade.isInNormalLoop && beyblade.normalLoopStartTime !== undefined && beyblade.normalLoopStartAngle !== undefined) {
    const spinDirection = beyblade.config.direction === "left" ? -1 : 1;
    const angularSpeed = (Math.PI * 2) / 2.0; // 2 seconds per loop (slower than blue loop)

    beyblade.normalLoopAngle! += angularSpeed * spinDirection * deltaTime;

    // Force beyblade to stay on the normal loop circle
    beyblade.position = {
      x: gameState.stadium.center.x + Math.cos(beyblade.normalLoopAngle!) * gameState.stadium.normalLoopRadius,
      y: gameState.stadium.center.y + Math.sin(beyblade.normalLoopAngle!) * gameState.stadium.normalLoopRadius,
    };

    // Time-based completion check (primary method - more reliable)
    const timeInLoop = gameState.gameTime - beyblade.normalLoopStartTime;
    
    // Complete after 2 seconds (guaranteed exit to prevent infinite loops)
    if (timeInLoop >= 2.0) {
      // Loop complete! Grant 2x acceleration boost
      beyblade.isInNormalLoop = false;
      beyblade.normalLoopStartTime = undefined;
      beyblade.normalLoopStartAngle = undefined;
      beyblade.normalLoopCooldownEnd = gameState.gameTime + 5.0; // 5 second cooldown
      
      // Grant 2x acceleration
      const currentAccel = beyblade.acceleration;
      beyblade.acceleration = Math.min(beyblade.currentMaxAcceleration, currentAccel * 2);
      
      // Boost velocity to exit the loop
      const exitAngle = beyblade.normalLoopAngle!;
      const exitSpeed = 300;
      beyblade.velocity = {
        x: Math.cos(exitAngle) * exitSpeed,
        y: Math.sin(exitAngle) * exitSpeed,
      };
    }
  }

  // BLUE LOOP (300 radius) - Charge Dash with Charge Points
  const isOnBlueCircle = Math.abs(distanceFromCenter - gameState.stadium.chargeDashRadius) <= 5;

  const canBlueLoop = !beyblade.blueLoopCooldownEnd || gameState.gameTime >= beyblade.blueLoopCooldownEnd;

  // Start blue loop if on blue circle and conditions are met (but not while dodging or in normal loop)
  if (isOnBlueCircle && beyblade.spin > 0 && !beyblade.isInBlueLoop && canBlueLoop && 
      !beyblade.isChargeDashing && !beyblade.isDodging && !beyblade.isInNormalLoop) {
    beyblade.isInBlueLoop = true;
    beyblade.blueCircleLoopStartTime = gameState.gameTime;
    beyblade.blueLoopAngle = Math.atan2(
      beyblade.position.y - gameState.stadium.center.y,
      beyblade.position.x - gameState.stadium.center.x
    );
    
    // For player: wait 1 second for charge point selection, then use random if not selected
    if (beyblade.isPlayer) {
      beyblade.selectedChargePoint = null; // Reset selection
      beyblade.selectedChargePointAngle = undefined; // Will be set after 1 second or by player input
    } else {
      // AI: Randomly select one charge point immediately
      const chargePointAngles = [30, 150, 270];
      const randomIndex = Math.floor(Math.random() * chargePointAngles.length);
      beyblade.selectedChargePointAngle = chargePointAngles[randomIndex];
    }
  }

  // Process blue loop with charge point detection
  if (beyblade.isInBlueLoop && beyblade.blueCircleLoopStartTime !== undefined) {
    const spinDirection = beyblade.config.direction === "left" ? -1 : 1;
    const angularSpeed = (Math.PI * 2) / 1.0; // 1 second per loop

    beyblade.blueLoopAngle += angularSpeed * spinDirection * deltaTime;
    
    // For player: check if 1 second has passed and no selection made
    if (beyblade.isPlayer && beyblade.selectedChargePointAngle === undefined) {
      const timeInLoop = gameState.gameTime - beyblade.blueCircleLoopStartTime;
      
      // Check if player has selected a charge point
      if (beyblade.selectedChargePoint !== null && beyblade.selectedChargePoint !== undefined) {
        const chargePointAngles = [30, 150, 270];
        beyblade.selectedChargePointAngle = chargePointAngles[beyblade.selectedChargePoint - 1];
      } else if (timeInLoop >= 1.0) {
        // 1 second passed, use random
        const chargePointAngles = [30, 150, 270];
        const randomIndex = Math.floor(Math.random() * chargePointAngles.length);
        beyblade.selectedChargePointAngle = chargePointAngles[randomIndex];
      }
    }

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
        x: gameState.stadium.center.x + Math.cos(beyblade.blueLoopAngle) * gameState.stadium.chargeDashRadius,
        y: gameState.stadium.center.y + Math.sin(beyblade.blueLoopAngle) * gameState.stadium.chargeDashRadius,
      };

      const tangentX = -Math.sin(beyblade.blueLoopAngle) * spinDirection;
      const tangentY = Math.cos(beyblade.blueLoopAngle) * spinDirection;
      const circularSpeed = 200;
      const accelerationMultiplier = 1.3; // Reduced from 4 for better control
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
    const velocityDrag = velocityMagnitude * 0.008; // Reduced from 0.01 for slower spin loss
    const baseLoss = 0.35; // Reduced from 0.5 for slower spin decay
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
      x: stadium.center.x + Math.cos(angleRadians) * stadium.chargeDashRadius,
      y: stadium.center.y + Math.sin(angleRadians) * stadium.chargeDashRadius,
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
      const spinLoss = 8 + beyblade.acceleration * 0.7; // Reduced from 10 + acceleration for less harsh penalty
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
