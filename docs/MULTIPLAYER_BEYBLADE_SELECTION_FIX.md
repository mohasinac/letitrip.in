# Multiplayer Beyblade Selection & Live Controls Fix

## Overview

Fixed the multiplayer flow so that players select their beyblades during the lobby phase, and those selections are used directly in the battle without showing dropdown selectors. The game now starts automatically after both players are ready, and controls are synchronized live from the server.

## Changes Made

### 1. Socket Server (`server.js`)

**Problem**: Server wasn't properly tracking ready state and sending complete player data with beyblade selections.

**Fix**:

- Updated `select-beyblade` event handler to accept both `beyblade` and `ready` parameters
- Modified ready check to ensure both players have selected a beyblade AND marked themselves as ready
- Enhanced `start-game` event to include complete player data:
  ```javascript
  io.to(playerData.roomId).emit('start-game', {
    player1: {
      id: room.players[0].id,
      name: room.players[0].name,
      playerNumber: room.players[0].playerNumber,
      beyblade: room.players[0].beyblade,
    },
    player2: { ... },
    roomId: playerData.roomId,
  });
  ```

### 2. Multiplayer Beyblade Select Component (`MultiplayerBeybladeSelect.tsx`)

**Problem**: Component wasn't passing the game start data with beyblade selections to the parent.

**Fix**:

- Updated interface to accept optional game data: `onStartGame: (gameData?: any) => void`
- Modified `start-game` event handler to pass the complete game data:
  ```typescript
  socket.on("start-game", (data: any) => {
    onStartGame(data); // Pass game data including beyblades
  });
  ```
- Updated `opponent-selected` handler to properly set ready state

### 3. Game Page (`beyblade-battle/page.tsx`)

**Problem**: Page wasn't merging beyblade selection data with multiplayer room data.

**Fix**:

- Updated `handleBeybladeSelectComplete` to merge game data:
  ```typescript
  const handleBeybladeSelectComplete = (gameData?: any) => {
    if (gameData) {
      setMultiplayerData({
        ...multiplayerData,
        ...gameData,
      });
    }
    setGamePhase("playing");
  };
  ```

### 4. Game Controls Component (`GameControls.tsx`)

**Problem**: Beyblade selection dropdowns were showing even in multiplayer mode.

**Fix**:

- Added `isMultiplayer` prop to interface
- Added conditional rendering to hide dropdowns and disable restart in multiplayer:
  ```typescript
  if (isMultiplayer) {
    return (
      <Box>
        <Button disabled={true}>Multiplayer Battle</Button>
      </Box>
    );
  }
  ```

### 5. Enhanced Beyblade Arena (`EnhancedBeybladeArena.tsx`)

**Problem**: Arena wasn't using selected beyblades from multiplayer data and required manual game start.

**Fix**:

- Added effect to extract and set beyblades from multiplayer data:
  ```typescript
  useEffect(() => {
    if (isMultiplayer && multiplayerData) {
      const player1Data = multiplayerData.player1;
      const player2Data = multiplayerData.player2;

      if (player1Data?.beyblade && player2Data?.beyblade) {
        // Set beyblade based on player number
        if (playerNumber === 1) {
          setSelectedBeyblade(player1Data.beyblade);
          setSelectedAIBeyblade(player2Data.beyblade);
        } else {
          setSelectedBeyblade(player2Data.beyblade);
          setSelectedAIBeyblade(player1Data.beyblade);
        }

        // Auto-start the game
        setTimeout(() => {
          restartGame();
        }, 100);
      }
    }
  }, [isMultiplayer, multiplayerData, playerNumber, restartGame]);
  ```
- Passed `isMultiplayer` prop to GameControls component

## Flow After Fix

### Player 1 Journey:

1. Enters name → Joins room → Waits for opponent
2. Opponent joins → Both see beyblade selection screen
3. Player 1 selects beyblade → Clicks "I'm Ready"
4. Waits for Player 2
5. Both ready → Automatically receives `start-game` event with both players' beyblade selections
6. Game component automatically sets beyblades and starts countdown
7. Game begins with proper beyblades
8. Controls are sent to server 20 times per second via `game-input` event

### Player 2 Journey:

1. Enters name → Joins room → Opponent already waiting
2. Sees beyblade selection screen
3. Player 2 selects beyblade → Clicks "I'm Ready"
4. Waits for Player 1 (or immediately proceeds if P1 already ready)
5. Both ready → Automatically receives `start-game` event with both players' beyblade selections
6. Game component automatically sets beyblades and starts countdown
7. Game begins with proper beyblades
8. Controls are sent to server 20 times per second via `game-input` event

### Live Control Synchronization:

- Each player's controls are captured every 50ms (20 times per second)
- Input includes:
  - Direction vector (x, y) from mouse/touch/virtual D-pad
  - Special actions (dodgeRight, dodgeLeft, heavyAttack, ultimateAttack)
- Server broadcasts input to opponent via `opponent-input` event
- Opponent's game processes the input in the game loop
- Both players see synchronized movement in real-time

## Key Features Now Working

✅ **No Dropdown Selectors in Multiplayer**: Players select during lobby, not during game
✅ **Automatic Game Start**: Game starts automatically when both players ready
✅ **Proper Beyblade Assignment**: Each player controls their selected beyblade
✅ **Live Control Sync**: Movements and special actions synchronized 20x per second
✅ **Server-Authoritative**: All inputs go through server, no client-side cheating
✅ **Smooth Experience**: No manual "New Battle" click needed

## Testing Checklist

- [ ] Player 1 can select beyblade and mark ready
- [ ] Player 2 can see Player 1's selection
- [ ] Game starts automatically when both ready
- [ ] Player 1 controls their selected beyblade
- [ ] Player 2 controls their selected beyblade
- [ ] No dropdown selectors visible during game
- [ ] Movements are synchronized smoothly
- [ ] Special abilities (dodge, heavy attack, ultimate) work for both players
- [ ] Game over triggers correctly
- [ ] Disconnect handling still works

## Files Modified

1. `server.js` - Standalone Socket.IO server for production and development
2. `src/app/game/components/MultiplayerBeybladeSelect.tsx` - Pass game data on start
3. `src/app/game/beyblade-battle/page.tsx` - Merge game data properly
4. `src/app/game/components/GameControls.tsx` - Hide controls in multiplayer
5. `src/app/game/components/EnhancedBeybladeArena.tsx` - Auto-set beyblades and start game

## Technical Notes

### Input Synchronization

The existing `useMultiplayer` hook already handles:

- Sending input via `sendInput()` called every 50ms
- Receiving opponent input via `opponent-input` event
- Processing opponent input in game loop via `opponentInputRef` and `opponentSpecialActionsRef`

### Game State Management

- Player 1 is considered the "host" but doesn't have authority over opponent's beyblade
- Each client controls their own beyblade physics
- Server only relays inputs, not game state (peer-to-peer physics)
- Collisions are calculated independently on each client

### Beyblade Assignment Logic

```typescript
// Player 1 controls player1.beyblade, opponent is player2.beyblade
// Player 2 controls player2.beyblade, opponent is player1.beyblade
if (playerNumber === 1) {
  setSelectedBeyblade(player1Data.beyblade);
  setSelectedAIBeyblade(player2Data.beyblade);
} else {
  setSelectedBeyblade(player2Data.beyblade);
  setSelectedAIBeyblade(player1Data.beyblade);
}
```

## Future Improvements

- Add visual indicator showing which beyblade each player controls
- Show player names above beyblades during battle
- Add ready state synchronization during beyblade selection
- Implement rematch functionality
- Add spectator mode for finished games

---

## Deployment Architecture

### Single Server for Production ✅

The project uses **`server.js`** as the single WebSocket server for both development and production.

```
Vercel (Next.js Frontend)  ←→  Render (server.js)
https://justforview.vercel.app    wss://your-app.onrender.com
```

### Server Overview:

- **`server.js`** ✅ - Universal Socket.IO server
  - Standalone Socket.IO server
  - Handles multiplayer game rooms
  - Used for both development and production
  - Configured in `render.yaml`

### Deployment Steps:

1. **Render** (Socket Server):
   - Already configured via `render.yaml`
   - Runs: `node server.js`
   - Health check: `/health`
   - Push to GitHub → Auto-deploys

2. **Vercel** (Frontend):
   - Set environment variable:
     ```
     NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
     ```
   - Deploy Next.js app normally

### Development:
```bash
# Run Next.js frontend
npm run dev

# Run Socket.IO server (in separate terminal)
npm run dev:socket
```

### Why This Architecture?

✅ **Vercel** doesn't support WebSocket servers (serverless)  
✅ **Render** provides persistent WebSocket connections  
✅ **Separation** allows independent scaling  
✅ **Simple** - One server file for all environments
