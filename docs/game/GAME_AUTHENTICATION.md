# Game Authentication Guide

## Overview

The game system supports **anonymous/guest play** for single-player modes (Tryout, Single Battle) and requires authentication only for multiplayer features (PvP, Tournaments).

## Authentication Status by Game Mode

### ✅ No Authentication Required (Guest Play)

- **Tryout Mode** - Practice and test skills in a solo environment
- **Single Battle** - Battle against AI opponents (coming soon)

For these modes:

- No login required
- Guest player IDs are automatically generated
- Username defaults to "Guest Player"
- Progress is not saved (session-based only)

### 🔒 Authentication Required

- **PvP Mode** - Challenge other players in real-time battles
- **Tournament Mode** - Compete in organized tournaments

For these modes:

- User must be logged in
- Progress and stats are saved to their profile
- Leaderboards and rankings are tracked
- Matchmaking uses player skill levels

## Implementation Details

### 1. Middleware Configuration

The `/game` routes are **NOT** in the `protectedRoutes` array in `middleware.ts`, meaning:

- Anyone can access `/game/*` pages
- No automatic redirect to login
- Session check is optional

```typescript
// middleware.ts
const protectedRoutes = [
  "/profile",
  "/dashboard",
  "/admin",
  "/seller",
  "/orders",
  "/cart/checkout",
  // Note: /game is NOT here - it's public!
];
```

### 2. API Client Configuration

The API client treats `/game` as a public path:

```typescript
// src/lib/api/client.ts
const publicPaths = [
  "/",
  "/products",
  "/categories",
  "/game", // <- Game pages are public
  "/contact",
  // ...
];
```

This ensures:

- Failed API calls on game pages don't trigger login redirects
- Guest players can access game resources
- No authentication errors interrupt gameplay

### 3. Guest Player Implementation

In **Tryout Mode** (`src/app/game/tryout/page.tsx`):

```typescript
// Generate temporary guest credentials
connect("game", {
  userId: "guest-" + Math.random().toString(36).substr(2, 9),
  username: "Guest Player",
  beybladeId: settings.beybladeId,
  arenaId: settings.arenaId,
});
```

Guest players:

- Get a random temporary user ID (e.g., `guest-abc123xyz`)
- Use default username "Guest Player"
- Can play the game fully
- Data is not persisted after session ends

### 4. Future: Authenticated Players

For players who ARE logged in during tryout mode, we can enhance the experience:

```typescript
// Future implementation
import { useSession } from "@/contexts/SessionContext";

const { session } = useSession();

connect("game", {
  userId: session?.userId || "guest-" + Math.random().toString(36).substr(2, 9),
  username: session?.username || "Guest Player",
  beybladeId: settings.beybladeId,
  arenaId: settings.arenaId,
});
```

Benefits for authenticated users:

- Save game statistics
- Track progress over time
- Unlock achievements
- Compare with friends
- Persistent leaderboard rankings

## Game Server Considerations

The Colyseus game server should:

1. **Accept Guest Players**

   - Don't require valid user IDs from database
   - Accept any `userId` format
   - Handle guest players in matchmaking

2. **Differentiate User Types**

   ```typescript
   // Server-side logic
   const isGuest = userId.startsWith("guest-");

   if (isGuest) {
     // Don't save stats to database
     // Don't add to leaderboards
     // Limited features
   } else {
     // Full features
     // Save progress
     // Update rankings
   }
   ```

3. **Rate Limiting**
   - Guests: More restrictive limits
   - Authenticated: Higher limits
   - Prevents abuse of guest system

## Security Notes

### Guest System Safety

✅ **Safe:**

- Temporary IDs that don't persist
- No database writes for guest users
- Isolated game sessions
- No access to user data

⚠️ **Considerations:**

- Rate limit guest connections
- Monitor for abuse (spam, cheating)
- Implement cooldowns if needed
- Consider captcha for repeated guest play

### Upgrading Guests to Users

When a guest wants to save their progress:

1. Prompt them to create account
2. Link current session to new account
3. Save their tryout stats retroactively
4. Unlock full features

```typescript
// Conversion flow
if (isGuest && wantsToSave) {
  showRegistrationModal({
    message: "Create an account to save your progress!",
    onComplete: (newUserId) => {
      // Migrate guest session data to new user
      migrateGuestData(guestId, newUserId);
    },
  });
}
```

## Testing Guest Play

To test the guest system:

1. **Clear Browser Data**

   ```bash
   # Clear cookies/storage to simulate new visitor
   ```

2. **Navigate to Game**

   ```
   http://localhost:3000/game
   ```

3. **Select Tryout Mode**

   - Choose a beyblade
   - Choose an arena
   - Start playing

4. **Verify No Auth Required**

   - Should NOT redirect to login
   - Should generate guest ID
   - Gameplay should work normally

5. **Check Console**
   ```javascript
   // Should see guest ID in logs
   "Connecting with userId: guest-abc123xyz";
   ```

## Summary

| Feature        | Guest Players    | Authenticated Players  |
| -------------- | ---------------- | ---------------------- |
| Tryout Mode    | ✅ Full Access   | ✅ Full Access + Stats |
| Single Battle  | ✅ Full Access   | ✅ Full Access + Stats |
| PvP Mode       | ❌ Must Register | ✅ Full Access         |
| Tournament     | ❌ Must Register | ✅ Full Access         |
| Progress Saved | ❌ Session Only  | ✅ Persistent          |
| Leaderboards   | ❌ Not Ranked    | ✅ Ranked              |
| Achievements   | ❌ Not Tracked   | ✅ Tracked             |

This approach provides:

- **Low barrier to entry** - Try before you buy
- **User acquisition** - Get players hooked first
- **Conversion funnel** - Encourage registration to save progress
- **Better UX** - No forced registration to try the game
