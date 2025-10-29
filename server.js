// Standalone Socket.IO server for Render deployment
const { createServer } = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3001;

// Game rooms storage
const rooms = new Map();
const players = new Map();

// Server capacity limits
const MAX_ROOMS = 10; // Maximum 10 concurrent games
const MAX_PLAYERS = MAX_ROOMS * 2; // 20 players max

// Helper function to check server capacity
function isServerFull() {
  const totalPlayers = players.size;
  const totalRooms = rooms.size;
  
  console.log(`Server status: ${totalPlayers}/${MAX_PLAYERS} players, ${totalRooms}/${MAX_ROOMS} rooms`);
  
  return totalPlayers >= MAX_PLAYERS || totalRooms >= MAX_ROOMS;
}

// ============================================================
// PHYSICS-BASED COLLISION CALCULATION (Server Authority)
// ============================================================

/**
 * Calculate moment of inertia for a solid disk: I = 0.5 * m * r²
 */
function calculateMomentOfInertia(mass, radius) {
  return 0.5 * mass * radius * radius;
}

/**
 * Calculate angular velocity from spin value
 */
function calculateAngularVelocity(spin, maxSpin, direction) {
  const maxAngularVelocity = Math.PI * 2 * 20; // 20 rotations/sec at max spin
  const spinRatio = Math.max(0, Math.min(1, spin / maxSpin));
  const directionMultiplier = direction === 'left' ? -1 : 1;
  return spinRatio * maxAngularVelocity * directionMultiplier;
}

/**
 * Calculate angular momentum: L = I * ω
 */
function calculateAngularMomentum(mass, radius, angularVelocity) {
  const momentOfInertia = calculateMomentOfInertia(mass, radius);
  return momentOfInertia * angularVelocity;
}

/**
 * Calculate linear momentum magnitude: |p| = m * |v|
 */
function calculateLinearMomentum(mass, velocity) {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  return mass * speed;
}

/**
 * Calculate total kinetic energy
 */
function calculateTotalKineticEnergy(mass, radius, velocity, angularVelocity) {
  const speedSquared = velocity.x * velocity.x + velocity.y * velocity.y;
  const linearKE = 0.5 * mass * speedSquared;
  const momentOfInertia = calculateMomentOfInertia(mass, radius);
  const rotationalKE = 0.5 * momentOfInertia * angularVelocity * angularVelocity;
  return linearKE + rotationalKE;
}

/**
 * Server-side collision damage calculation
 * This is the authoritative calculation for multiplayer battles
 */
function calculateServerCollisionDamage(bey1Data, bey2Data) {
  // Calculate angular velocities
  const omega1 = calculateAngularVelocity(bey1Data.spin, bey1Data.maxSpin, bey1Data.direction);
  const omega2 = calculateAngularVelocity(bey2Data.spin, bey2Data.maxSpin, bey2Data.direction);
  
  // Calculate angular momentum magnitudes
  const L1 = Math.abs(calculateAngularMomentum(bey1Data.mass, bey1Data.radius, omega1));
  const L2 = Math.abs(calculateAngularMomentum(bey2Data.mass, bey2Data.radius, omega2));
  
  // Calculate linear momentum magnitudes
  const p1 = calculateLinearMomentum(bey1Data.mass, bey1Data.velocity);
  const p2 = calculateLinearMomentum(bey2Data.mass, bey2Data.velocity);
  
  // Calculate relative velocity
  const relativeVelocity = {
    x: bey1Data.velocity.x - bey2Data.velocity.x,
    y: bey1Data.velocity.y - bey2Data.velocity.y
  };
  const relativeSpeed = Math.sqrt(
    relativeVelocity.x * relativeVelocity.x + 
    relativeVelocity.y * relativeVelocity.y
  );
  
  // Check opposite spins
  const isOppositeSpins = bey1Data.direction !== bey2Data.direction;
  
  // Angular momentum interaction
  const angularMomentumInteraction = isOppositeSpins 
    ? (L1 + L2) * 1.5
    : Math.abs(L1 - L2) * 0.8;
  
  // Collision force
  const momentumDifference = Math.abs(p1 - p2);
  const totalMomentum = p1 + p2;
  const linearCollisionForce = (momentumDifference + totalMomentum * 0.3) * relativeSpeed * 0.01;
  const angularCollisionForce = angularMomentumInteraction * 0.02;
  const collisionForce = linearCollisionForce + angularCollisionForce;
  
  // Energy transfer
  const ke1 = calculateTotalKineticEnergy(bey1Data.mass, bey1Data.radius, bey1Data.velocity, omega1);
  const ke2 = calculateTotalKineticEnergy(bey2Data.mass, bey2Data.radius, bey2Data.velocity, omega2);
  const energyFactor = (ke1 + ke2) * 0.001;
  
  // Mass ratios
  const totalMass = bey1Data.mass + bey2Data.mass;
  const massRatio1 = bey2Data.mass / totalMass;
  const massRatio2 = bey1Data.mass / totalMass;
  
  // Base damage
  const baseDamage1 = (p2 * massRatio1 + angularMomentumInteraction * massRatio1) * 0.15;
  const baseDamage2 = (p1 * massRatio2 + angularMomentumInteraction * massRatio2) * 0.15;
  
  // Attack multipliers
  const bey1AttackMultiplier = bey1Data.ultimateAttackActive ? 2.0 : bey1Data.heavyAttackActive ? 1.5 : 1.0;
  const bey2AttackMultiplier = bey2Data.ultimateAttackActive ? 2.0 : bey2Data.heavyAttackActive ? 1.5 : 1.0;
  
  // Final damage with energy factor
  let damage1 = (baseDamage1 + energyFactor * massRatio1) * bey2AttackMultiplier;
  let damage2 = (baseDamage2 + energyFactor * massRatio2) * bey1AttackMultiplier;
  
  // Spin-based resistance
  const spinResistance1 = 1 - (bey1Data.spin / bey1Data.maxSpin) * 0.3;
  const spinResistance2 = 1 - (bey2Data.spin / bey2Data.maxSpin) * 0.3;
  
  damage1 *= (1 + spinResistance1 * 0.5);
  damage2 *= (1 + spinResistance2 * 0.5);
  
  // Cap damage
  const maxDamage = 200;
  damage1 = Math.min(maxDamage, Math.max(0, damage1));
  damage2 = Math.min(maxDamage, Math.max(0, damage2));
  
  // Calculate knockback
  const dx = bey2Data.position.x - bey1Data.position.x;
  const dy = bey2Data.position.y - bey1Data.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const normalX = distance > 0 ? dx / distance : 0;
  const normalY = distance > 0 ? dy / distance : 0;
  
  const chargeDashMultiplier = (bey1Data.isChargeDashing || bey2Data.isChargeDashing) ? 1.3 : 1.0;
  const knockbackMagnitude1 = (collisionForce / bey1Data.mass) * massRatio1 * chargeDashMultiplier;
  const knockbackMagnitude2 = (collisionForce / bey2Data.mass) * massRatio2 * chargeDashMultiplier;
  
  return {
    damage1,
    damage2,
    knockback1: { x: -normalX * knockbackMagnitude1, y: -normalY * knockbackMagnitude1 },
    knockback2: { x: normalX * knockbackMagnitude2, y: normalY * knockbackMagnitude2 },
    collisionForce,
    timestamp: Date.now()
  };
}

// ============================================================

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'Beyblade Game Socket Server',
      players: players.size,
      rooms: rooms.size,
      capacity: {
        players: `${players.size}/${MAX_PLAYERS}`,
        rooms: `${rooms.size}/${MAX_ROOMS}`
      },
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// CORS origin function to support wildcards
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'https://justforview.vercel.app'];

const corsOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  
  // Check if origin matches any allowed origin
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    // Exact match
    if (allowedOrigin === origin) return true;
    
    // Wildcard match (e.g., https://*.vercel.app)
    if (allowedOrigin.includes('*')) {
      const pattern = allowedOrigin.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }
    
    return false;
  });
  
  if (isAllowed) {
    callback(null, true);
  } else {
    console.log(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Join room
  socket.on('join-room', ({ playerName }) => {
    // CHECK SERVER CAPACITY FIRST
    if (isServerFull()) {
      socket.emit('server-full', {
        message: 'Server is at capacity. Please try again later.',
        currentPlayers: players.size,
        maxPlayers: MAX_PLAYERS,
      });
      console.log(`Server full - rejected player: ${playerName}`);
      return;
    }

    // Find available room or create new one
    let roomId = null;
    let playerNumber = null;

    // Look for a room waiting for a player
    for (const [id, room] of rooms.entries()) {
      if (room.players.length === 1 && room.status === 'waiting') {
        roomId = id;
        playerNumber = 2;
        break;
      }
    }

    // Create new room if none available
    if (!roomId) {
      roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      playerNumber = 1;
      rooms.set(roomId, {
        id: roomId,
        players: [],
        status: 'waiting',
        createdAt: Date.now(),
        gameState: null,
      });
    }

    const room = rooms.get(roomId);
    const player = {
      id: socket.id,
      name: playerName,
      playerNumber,
      beyblade: null,
      ready: false,
      lastInput: null,
      lastInputTime: null,
      beybladeState: null,
      wantsRematch: false,
    };

    room.players.push(player);
    players.set(socket.id, { roomId, playerNumber, name: playerName });
    
    socket.join(roomId);

    // Notify player
    socket.emit('room-joined', {
      roomId,
      playerNumber,
      waitingForOpponent: room.players.length === 1,
    });

    // If room is full, notify both players
    if (room.players.length === 2) {
      room.status = 'selecting';
      io.to(roomId).emit('opponent-joined', {
        player1: room.players[0],
        player2: room.players[1],
      });
    }

    // Set timeout for waiting room
    if (room.players.length === 1) {
      setTimeout(() => {
        const currentRoom = rooms.get(roomId);
        if (currentRoom && currentRoom.players.length === 1 && currentRoom.status === 'waiting') {
          io.to(roomId).emit('waiting-timeout');
        }
      }, 30000); // 30 seconds
    }
  });

  // Extend wait time
  socket.on('extend-wait', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room && room.status === 'waiting') {
        socket.emit('wait-extended');
        
        setTimeout(() => {
          const currentRoom = rooms.get(playerData.roomId);
          if (currentRoom && currentRoom.players.length === 1) {
            io.to(playerData.roomId).emit('final-timeout');
            
            setTimeout(() => {
              socket.disconnect();
              rooms.delete(playerData.roomId);
              players.delete(socket.id);
            }, 10000);
          }
        }, 30000);
      }
    }
  });

  // Select beyblade
  socket.on('select-beyblade', ({ beyblade, ready }) => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.beyblade = beyblade;
          player.ready = ready || false;

          // Notify other player
          socket.to(playerData.roomId).emit('opponent-selected', {
            playerNumber: playerData.playerNumber,
            beyblade,
            ready: player.ready,
          });

          // Check if both players are ready
          if (room.players.every(p => p.ready && p.beyblade)) {
            room.status = 'playing';
            io.to(playerData.roomId).emit('start-game', {
              player1: {
                id: room.players[0].id,
                name: room.players[0].name,
                playerNumber: room.players[0].playerNumber,
                beyblade: room.players[0].beyblade,
              },
              player2: {
                id: room.players[1].id,
                name: room.players[1].name,
                playerNumber: room.players[1].playerNumber,
                beyblade: room.players[1].beyblade,
              },
              roomId: playerData.roomId,
            });
          }
        }
      }
    }
  });

  // Game input (movement, attacks, etc.)
  socket.on('game-input', (inputData) => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        // Store the input in the room
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.lastInput = inputData;
          player.lastInputTime = Date.now();
        }
        
        // Broadcast input to other player in room
        socket.to(playerData.roomId).emit('opponent-input', {
          playerNumber: playerData.playerNumber,
          ...inputData,
        });
      }
    }
  });

  // Game state sync from host (Player 1)
  socket.on('sync-game-state', (gameStateUpdate) => {
    const playerData = players.get(socket.id);
    if (playerData && playerData.playerNumber === 1) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        // Store the game state in the room
        room.gameState = {
          ...gameStateUpdate,
          lastUpdate: Date.now(),
          updateBy: socket.id,
        };
        
        // Broadcast to Player 2
        socket.to(playerData.roomId).emit('game-state-update', gameStateUpdate);
      }
    }
  });

  // Client reports their local beyblade state
  socket.on('update-beyblade-state', (beybladeState) => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.beybladeState = {
            ...beybladeState,
            lastUpdate: Date.now(),
          };
        }
        
        // Broadcast to opponent
        socket.to(playerData.roomId).emit('opponent-beyblade-update', {
          playerNumber: playerData.playerNumber,
          ...beybladeState,
        });
      }
    }
  });

  // Collision event - SERVER-AUTHORITATIVE for multiplayer
  socket.on('collision-detected', (collisionData) => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room && room.players.length === 2) {
        // SERVER CALCULATES DAMAGE AUTHORITATIVELY
        // Extract beyblade data for both players
        const player1 = room.players[0];
        const player2 = room.players[1];
        
        // Use the beyblade states stored in room
        const bey1Data = player1.beybladeState || collisionData.bey1;
        const bey2Data = player2.beybladeState || collisionData.bey2;
        
        // Calculate collision damage on server
        const serverCollisionResult = calculateServerCollisionDamage(bey1Data, bey2Data);
        
        // Broadcast SERVER-AUTHORITATIVE collision result to BOTH players
        io.to(playerData.roomId).emit('server-collision-result', {
          player1Damage: serverCollisionResult.damage1,
          player2Damage: serverCollisionResult.damage2,
          knockback1: serverCollisionResult.knockback1,
          knockback2: serverCollisionResult.knockback2,
          collisionForce: serverCollisionResult.collisionForce,
          timestamp: serverCollisionResult.timestamp,
        });
        
        console.log(`[SERVER] Collision: P1 dmg=${serverCollisionResult.damage1.toFixed(1)}, P2 dmg=${serverCollisionResult.damage2.toFixed(1)}, force=${serverCollisionResult.collisionForce.toFixed(1)}`);
      }
    }
  });

  // Game over
  socket.on('game-over', ({ winner }) => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        room.status = 'finished';
        io.to(playerData.roomId).emit('match-result', {
          winner,
          player1: room.players[0],
          player2: room.players[1],
        });
      }
    }
  });

  // Play again request
  socket.on('request-rematch', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.wantsRematch = true;
          
          // Notify opponent
          socket.to(playerData.roomId).emit('opponent-wants-rematch', {
            playerNumber: playerData.playerNumber,
          });
          
          // Check if both players want rematch
          if (room.players.every(p => p.wantsRematch)) {
            // Reset rematch flags
            room.players.forEach(p => p.wantsRematch = false);
            
            // Start new game
            room.status = 'playing';
            io.to(playerData.roomId).emit('rematch-accepted', {
              player1: room.players[0],
              player2: room.players[1],
            });
          }
        }
      }
    }
  });

  // Cancel rematch request
  socket.on('cancel-rematch', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        const player = room.players.find(p => p.id === socket.id);
        if (player) {
          player.wantsRematch = false;
          
          // Notify opponent
          socket.to(playerData.roomId).emit('opponent-cancelled-rematch', {
            playerNumber: playerData.playerNumber,
          });
        }
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    const playerData = players.get(socket.id);
    
    if (playerData) {
      const room = rooms.get(playerData.roomId);
      if (room) {
        // Notify other player
        socket.to(playerData.roomId).emit('opponent-disconnected');
        
        // Clean up room
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(playerData.roomId);
        }
      }
      players.delete(socket.id);
    }
  });
});

httpServer.listen(port, () => {
  console.log(`🎮 Socket.IO Game Server running on port ${port}`);
  console.log(`📊 Server capacity: ${MAX_PLAYERS} players, ${MAX_ROOMS} rooms`);
  console.log(`✅ Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});
