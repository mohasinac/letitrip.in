# Game Context Guide

## Overview

The `GameContext` provides centralized state management for game configuration across all game modes (Tryout, Single Battle, PvP, Tournament).

## Location

- **Context**: `src/contexts/GameContext.tsx`
- **Provider**: Wraps all `/game` routes via `src/app/game/layout.tsx`

## Usage

### Basic Import

```tsx
import { useGame } from "@/contexts/GameContext";

function MyComponent() {
  const { settings, setBeyblade, setArena, startGame, isReady } = useGame();

  // Use the context...
}
```

## API Reference

### State

```typescript
interface GameSettings {
  beybladeId: string | null;
  arenaId: string | null;
  gameMode: "tryout" | "single-battle" | "pvp" | "tournament" | null;
  difficulty?: "easy" | "medium" | "hard";
  opponentId?: string;
}
```

### Methods

#### `setBeyblade(beybladeId: string)`

Set the selected beyblade.

```tsx
setBeyblade("dragoon_gt");
```

#### `setArena(arenaId: string)`

Set the selected arena.

```tsx
setArena("standard_arena");
```

#### `setGameMode(mode: GameMode)`

Set the game mode.

```tsx
setGameMode("tryout");
```

#### `setDifficulty(difficulty: "easy" | "medium" | "hard")`

Set AI difficulty (for single-battle mode).

```tsx
setDifficulty("hard");
```

#### `setOpponent(opponentId: string)`

Set opponent player ID (for PvP mode).

```tsx
setOpponent("player_456");
```

#### `startGame(mode: GameMode)`

Convenience method to set game mode and prepare to start.

```tsx
startGame("pvp");
```

#### `resetGame()`

Reset all game settings to defaults.

```tsx
resetGame();
```

### Properties

#### `settings: GameSettings`

Current game settings.

```tsx
const { beybladeId, arenaId, gameMode } = settings;
```

#### `isReady: boolean`

Whether the game has all required settings (beyblade, arena, and mode selected).

```tsx
if (isReady) {
  // Navigate to game
  router.push("/game/tryout");
}
```

## Flow Example

### Selection Flow

**1. Selection Page** (`/game/tryout/select`)

```tsx
import { useGame } from "@/contexts/GameContext";

export default function SelectPage() {
  const { setBeyblade, setArena, setGameMode } = useGame();
  const router = useRouter();

  const handleStart = () => {
    setBeyblade("dragoon_gt");
    setArena("standard_arena");
    setGameMode("tryout");
    router.push("/game/tryout");
  };

  return <button onClick={handleStart}>Start Game</button>;
}
```

**2. Game Page** (`/game/tryout`)

```tsx
import { useGame } from "@/contexts/GameContext";

export default function TryoutPage() {
  const { settings, isReady } = useGame();

  // Redirect if not ready
  useEffect(() => {
    if (!isReady) {
      router.push("/game/tryout/select");
    }
  }, [isReady, router]);

  return (
    <TryoutModeGame
      beybladeId={settings.beybladeId!}
      arenaId={settings.arenaId!}
    />
  );
}
```

## Benefits Over URL Parameters

### Before (URL Parameters)

❌ URL pollution: `/game/tryout?beyblade=dragoon_gt&arena=standard_arena`  
❌ Manual parsing required  
❌ Lost on page refresh  
❌ Hard to share complex state

### After (Context)

✅ Clean URLs: `/game/tryout`  
✅ Type-safe API  
✅ Centralized state management  
✅ Persistent across navigation  
✅ Easy to extend

## Game Mode Patterns

### Tryout Mode

```tsx
setBeyblade("dragoon_gt");
setArena("standard_arena");
setGameMode("tryout");
router.push("/game/tryout");
```

### Single Battle (vs AI)

```tsx
setBeyblade("dragoon_gt");
setArena("standard_arena");
setDifficulty("hard");
setGameMode("single-battle");
router.push("/game/single-battle");
```

### PvP Mode

```tsx
setBeyblade("dragoon_gt");
setArena("standard_arena");
setOpponent("player_456");
setGameMode("pvp");
router.push("/game/pvp");
```

### Tournament Mode

```tsx
setBeyblade("dragoon_gt");
setGameMode("tournament");
router.push("/game/tournament");
// Note: Arena is selected per match in tournament
```

## Error Handling

The context includes an `isReady` check to ensure all required settings are present:

```tsx
const { isReady, settings } = useGame();

if (!isReady) {
  // Missing beybladeId, arenaId, or gameMode
  return <Redirect to="/game/tryout/select" />;
}

// Safe to use settings
const { beybladeId, arenaId } = settings;
```

## Future Enhancements

- [ ] Persist state to localStorage for page refresh
- [ ] Add tournament bracket state
- [ ] Add matchmaking queue state
- [ ] Add replay/spectator mode state
- [ ] Add custom rule sets

## Related Files

- Context: `src/contexts/GameContext.tsx`
- Layout: `src/app/game/layout.tsx`
- Selection: `src/app/game/tryout/select/page.tsx`
- Game Page: `src/app/game/tryout/page.tsx`
