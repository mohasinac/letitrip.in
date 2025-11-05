# Game Files Quick Reference

## 🎯 Import Cheat Sheet

### Services (API Calls)
```typescript
// ✅ Recommended
import { GameService } from "@/lib/game/services";

// ✅ Also works
import { GameService } from "@/lib/game";
import { GameService } from "@/lib/api"; // Backward compatible
```

### UI Components
```typescript
// ✅ Recommended
import { GameLayout } from "@/components/game/ui";
import { HUD } from "@/components/game/ui";
import { Canvas } from "@/components/game/ui";

// ✅ Also works
import { GameLayout, HUD, Canvas } from "@/components/game/ui";
import { GameLayout } from "@/components/game"; // Via barrel export
```

### Dropdowns
```typescript
// ✅ Recommended
import { BeybladeDropdown, ArenaDropdown } from "@/components/game/dropdowns";

// ✅ Also works
import { BeybladeDropdown } from "@/components/game"; // Via barrel export
```

### Context
```typescript
// ✅ Recommended
import { useGame, GameProvider } from "@/contexts/game";

// ✅ Get types
import type { GameSettings } from "@/contexts/game";
```

---

## 📂 Folder Structure (Quick View)

```
src/
├── lib/game/                  # 🔧 Business Logic
│   ├── services/              # API calls
│   ├── utils/                 # Utilities
│   ├── constants/             # Constants
│   └── arena/                 # Arena logic
│
├── components/game/           # 🎨 UI Components
│   ├── ui/                    # GameLayout, HUD, Canvas
│   └── dropdowns/             # Selection dropdowns
│
├── contexts/game/             # 🌐 State Management
│   └── GameContext.tsx
│
└── hooks/game/                # 🎣 Custom Hooks
    └── (add as needed)
```

---

## 🚀 Common Usage Patterns

### Using GameService
```typescript
import { GameService } from "@/lib/game/services";

// Fetch beyblades
const beyblades = await GameService.getBeyblades();

// Fetch arenas
const arenas = await GameService.getArenas();

// Create beyblade
const newBey = await GameService.createBeyblade(data);
```

### Using GameContext
```typescript
import { useGame } from "@/contexts/game";

function MyComponent() {
  const { settings, setBeyblade, setArena, startGame } = useGame();
  
  // Use game state
  const isReady = settings.beybladeId && settings.arenaId;
}
```

### Using GameLayout
```typescript
import { GameLayout } from "@/components/game/ui";

export default function GamePage() {
  return (
    <GameLayout
      gameTitle="Beyblade Arena"
      enableFullscreen={true}
      onExitGame={() => router.push('/game')}
    >
      {/* Your game content */}
    </GameLayout>
  );
}
```

### Using Dropdowns
```typescript
import { BeybladeDropdown, ArenaDropdown } from "@/components/game/dropdowns";

function GameSetup() {
  return (
    <>
      <BeybladeDropdown
        beyblades={beyblades}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      
      <ArenaDropdown
        arenas={arenas}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
    </>
  );
}
```

---

## 🎯 When to Use What

| Need | Use | Location |
|------|-----|----------|
| API calls | `GameService` | `@/lib/game/services` |
| Game state | `useGame()` | `@/contexts/game` |
| Layout wrapper | `GameLayout` | `@/components/game/ui` |
| HUD display | `HUD` | `@/components/game/ui` |
| Canvas rendering | `Canvas` | `@/components/game/ui` |
| Select beyblade | `BeybladeDropdown` | `@/components/game/dropdowns` |
| Select arena | `ArenaDropdown` | `@/components/game/dropdowns` |

---

## 📝 File Locations

| File | Path |
|------|------|
| GameService | `src/lib/game/services/game.service.ts` |
| GameLayout | `src/components/game/ui/GameLayout.tsx` |
| HUD | `src/components/game/ui/HUD.tsx` |
| Canvas | `src/components/game/ui/Canvas.tsx` |
| BeybladeArenaDropdowns | `src/components/game/dropdowns/BeybladeArenaDropdowns.tsx` |
| GameContext | `src/contexts/game/GameContext.tsx` |

---

## ✅ Best Practices

1. **Always use barrel exports** (`@/components/game/ui` not `/GameLayout`)
2. **Keep logic separate from UI** (services in `lib/`, UI in `components/`)
3. **Use GameContext for state** (not prop drilling)
4. **Create custom hooks** for reusable logic (in `hooks/game/`)

---

**Quick Start:** Copy the import patterns above for your use case!
