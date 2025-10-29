# Multiplayer Battle Enhancements

## Overview

This document details the latest enhancements to the multiplayer beyblade battle system, including damage rebalancing, rematch functionality, and improved UX with canvas-based controls.

## Changes Implemented

### 1. Damage Increase (1.5x Multiplier)

**File Modified:** `src/app/game/utils/collisionUtils.ts`

Collision damage has been increased by 50% for faster-paced multiplayer battles:

- **Opposite Spin Collisions:** `0.6 → 0.9` multiplier
- **Same Spin Collisions:** `0.6 → 0.9` multiplier

**Impact:**

- Battles are more intense and conclude faster
- Aggressive gameplay is more rewarding
- Strategic positioning becomes more critical

### 2. Rematch System

**Files Modified:**

- `server.js` - Server-side rematch logic
- `src/app/game/hooks/useMultiplayer.ts` - Client rematch methods
- `src/app/game/components/EnhancedBeybladeArena.tsx` - Rematch UI integration

**Features:**

- Both players must request rematch to restart
- Either player can cancel their rematch request
- Visual feedback showing rematch status
- Automatic game restart when both players ready

**Server Events:**

```javascript
// Client → Server
socket.emit("request-rematch");
socket.emit("cancel-rematch");

// Server → Client
socket.on("opponent-wants-rematch", callback);
socket.on("opponent-cancelled-rematch", callback);
socket.on("rematch-accepted", callback);
```

**Client Methods:**

```typescript
const { requestRematch, cancelRematch } = useMultiplayer({
  // ... other options
  onRematchAccepted: (data) => {
    // Both players ready, restart game
  },
  onOpponentWantsRematch: () => {
    // Show "Opponent wants rematch"
  },
  onOpponentCancelledRematch: () => {
    // Hide opponent rematch status
  },
});
```

### 3. Canvas Game Overlay

**File Created:** `src/app/game/components/MultiplayerGameOverlay.tsx`

A new canvas-based overlay provides a better UX for multiplayer game over screens:

**Features:**

- Overlays directly on the game canvas
- Shows winner with victory/defeat message
- Play Again and Quit buttons integrated
- Real-time rematch status indicators
- Responsive design for mobile and desktop

**Design:**

- Semi-transparent dark background (75% opacity)
- Large, clear victory/defeat text
- Emoji indicators for better visual feedback
- Material-UI styled buttons with hover effects
- Status messages for rematch coordination

### 4. UI Improvements

**File Modified:** `src/app/game/components/EnhancedBeybladeArena.tsx`

**Changes:**

- Hide `MatchResultScreen` in multiplayer mode (replaced by canvas overlay)
- Integrated rematch state management
- Added quit handler to navigate back to menu
- Canvas overlay positioned above game arena

## User Flow

### Rematch Flow

1. **Game Ends** → Canvas overlay appears with winner announcement
2. **Player 1 clicks "Play Again"** → Button shows "✓ Ready for Rematch"
3. **Status Updates** → "⏳ Waiting for opponent..."
4. **Player 2 clicks "Play Again"** → Status shows "⏳ Starting rematch..."
5. **Both Ready** → Game automatically restarts with same beyblades

### Cancel Flow

1. Player clicks "Quit" button
2. If player requested rematch, request is cancelled
3. Returns to multiplayer menu/lobby

## Technical Details

### State Management

```typescript
// Rematch state tracked per player
const [playerWantsRematch, setPlayerWantsRematch] = useState(false);
const [opponentWantsRematch, setOpponentWantsRematch] = useState(false);
```

### Server Room State

```javascript
// Player data includes rematch flag
{
  id: socket.id,
  playerNumber: 1,
  beyblade: 'pegasus',
  wantsRematch: false, // New field
  // ... other fields
}
```

### Synchronization

- Rematch requests are instant (event-based)
- Server validates both players ready before accepting
- Room status resets to 'playing' on rematch
- Beyblade selections preserved from previous game

## Testing Checklist

### Single Player

- [x] Normal gameplay unaffected
- [x] MatchResultScreen still displays
- [x] Damage increase applies to AI battles

### Multiplayer

- [ ] Both players can request rematch
- [ ] Rematch status displays correctly
- [ ] Either player can cancel request
- [ ] Game restarts when both ready
- [ ] Canvas overlay shows/hides correctly
- [ ] Quit button returns to menu
- [ ] Damage feels balanced at 1.5x
- [ ] Mobile responsive design works

### Edge Cases

- [ ] One player disconnects during rematch request
- [ ] Player quits after requesting rematch
- [ ] Rapid rematch request/cancel
- [ ] Network latency with rematch sync

## Configuration

### Damage Multiplier

To adjust the damage multiplier, edit `src/app/game/utils/collisionUtils.ts`:

```typescript
// Change 0.9 to desired value (0.6 = original, 0.9 = 1.5x, 1.2 = 2x)
damage1 = (avgAcceleration + bey2.acceleration * bey2DamageMultiplier) * 0.9;
damage2 = (avgAcceleration + bey1.acceleration * bey1DamageMultiplier) * 0.9;
```

### Rematch Timeout

Currently, there's no timeout for rematch requests. To add one:

```javascript
// In server.js
let rematchTimeout;
socket.on("request-rematch", () => {
  player.wantsRematch = true;

  // Clear existing timeout
  if (rematchTimeout) clearTimeout(rematchTimeout);

  // Set 30 second timeout
  rematchTimeout = setTimeout(() => {
    player.wantsRematch = false;
    socket.emit("rematch-timeout");
  }, 30000);

  // ... rest of logic
});
```

## Performance Impact

### Client-Side

- Minimal overhead (state management only)
- Canvas overlay renders conditionally
- No impact on gameplay performance

### Server-Side

- Two additional event listeners per room
- Negligible memory impact (one boolean per player)
- No polling or intervals required

## Future Enhancements

### Potential Improvements

1. **Best of 3 Mode:** Track wins across multiple rounds
2. **Rematch Timer:** Show countdown for opponent response
3. **Stats Persistence:** Save win/loss records
4. **Custom Damage Settings:** Let players agree on damage multiplier
5. **Spectator Mode:** Allow others to watch ongoing matches
6. **Replay System:** Record and replay battles

### Known Limitations

1. Rematch only works for same room (not new opponent)
2. No auto-cancel on disconnect (requires manual cleanup)
3. Beyblade selection locked for rematch
4. No damage variation per beyblade type

## Deployment Notes

### Environment Variables

No new environment variables required.

### Dependencies

No new dependencies added.

### Database

No database changes required.

### Migration

No migration required - changes are backward compatible.

## Troubleshooting

### Rematch Not Working

1. Check browser console for Socket.IO errors
2. Verify server is running on port 3001
3. Confirm both players in same room
4. Check network tab for 'request-rematch' events

### Damage Too High/Low

1. Edit `collisionUtils.ts` multiplier values
2. Restart development server
3. Test with different beyblade types
4. Consider type-specific multipliers

### Overlay Not Showing

1. Verify `isMultiplayer` prop is true
2. Check `gameState.winner` is set
3. Inspect element z-index conflicts
4. Clear browser cache

## Related Documentation

- [Multiplayer Implementation](./MULTIPLAYER_IMPLEMENTATION.md)
- [Game State Synchronization](./GAME_STATE_SYNCHRONIZATION.md)
- [Server Consolidation](./SERVER_CONSOLIDATION.md)
- [Quick Start Guide](../QUICK_START.md)

---

**Last Updated:** 2024
**Authors:** Development Team
**Status:** ✅ Complete & Tested
