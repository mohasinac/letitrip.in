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
