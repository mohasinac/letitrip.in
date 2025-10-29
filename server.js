const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Game rooms storage
const rooms = new Map();
const players = new Map();

// Server capacity limits
const MAX_ROOMS = 10; // Maximum 10 concurrent games
const MAX_PLAYERS = MAX_ROOMS * 2; // 20 players max

// Helper function to check server capacity
function isServerFull() {
  // Count all players (in rooms + waiting)
  const totalPlayers = players.size;
  const totalRooms = rooms.size;
  
  console.log(`Server status: ${totalPlayers}/${MAX_PLAYERS} players, ${totalRooms}/${MAX_ROOMS} rooms`);
  
  return totalPlayers >= MAX_PLAYERS || totalRooms >= MAX_ROOMS;
}

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SITE_URL,
      methods: ['GET', 'POST']
    }
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
        return; // Don't allow joining
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
    socket.on('select-beyblade', ({ beyblade }) => {
      const playerData = players.get(socket.id);
      if (playerData) {
        const room = rooms.get(playerData.roomId);
        if (room) {
          const player = room.players.find(p => p.id === socket.id);
          if (player) {
            player.beyblade = beyblade;
            player.ready = true;

            // Notify other player
            socket.to(playerData.roomId).emit('opponent-selected', {
              playerNumber: playerData.playerNumber,
              beyblade,
            });

            // Check if both players are ready
            if (room.players.every(p => p.ready)) {
              room.status = 'playing';
              io.to(playerData.roomId).emit('start-game', {
                player1: room.players[0],
                player2: room.players[1],
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
        // Broadcast input to other player in room
        socket.to(playerData.roomId).emit('opponent-input', {
          playerNumber: playerData.playerNumber,
          ...inputData,
        });
      }
    });

    // Game state sync (from host player)
    socket.on('sync-game-state', (gameState) => {
      const playerData = players.get(socket.id);
      if (playerData && playerData.playerNumber === 1) {
        const room = rooms.get(playerData.roomId);
        if (room) {
          room.gameState = gameState;
          socket.to(playerData.roomId).emit('game-state-update', gameState);
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

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running`);
    });
});
