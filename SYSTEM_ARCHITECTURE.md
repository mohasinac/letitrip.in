# Beyblade Stats System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       BEYBLADE STATS SYSTEM                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          1. DATA LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/types/beybladeStats.ts                                │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ • BeybladeStats                                     │   │   │
│  │  │ • SpecialMove with SpecialMoveFlags                │   │   │
│  │  │ • PointOfContact                                    │   │   │
│  │  │ • TypeDistribution (320 points)                    │   │   │
│  │  │ • calculateTypeBonuses()                           │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/constants/beybladeStatsData.ts                       │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ DEFAULT_BEYBLADE_STATS: 8 Beyblades                │   │   │
│  │  │ • Dragoon GT  • Dran Buster  • Dranzer GT          │   │   │
│  │  │ • Hells Hammer • Meteo • Pegasus                   │   │   │
│  │  │ • Spriggan • Valkyrie                              │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      2. FIREBASE / DATABASE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/lib/database/beybladeStatsService.ts                 │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ • initializeDefaultBeyblades()                      │   │   │
│  │  │ • getBeybladeStats(id)                             │   │   │
│  │  │ • getAllBeybladeStats()                            │   │   │
│  │  │ • getBeybladesByType(type)                         │   │   │
│  │  │ • saveBeybladeStats(stats, userId)                 │   │   │
│  │  │ • searchBeybladesByName(query)                     │   │   │
│  │  │ • getTopBeybladesByCategory(category)              │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Firebase Firestore                                         │   │
│  │  Collection: beyblade_stats                                 │   │
│  │  ┌───────────────────────────────────────────────────┐     │   │
│  │  │ dragoon-gt: { ...stats, specialMove, contacts }  │     │   │
│  │  │ dran-buster: { ...stats, specialMove, contacts } │     │   │
│  │  │ meteo: { ...stats, specialMove, contacts }       │     │   │
│  │  │ ... 8 Beyblades total                            │     │   │
│  │  └───────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          3. API LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  GET  /api/beyblades         → Get all Beyblades                    │
│  GET  /api/beyblades?type=attack → Filter by type                   │
│  GET  /api/beyblades?search=meteo → Search by name                  │
│  GET  /api/beyblades/[id]    → Get specific Beyblade                │
│  POST /api/beyblades/init    → Initialize default data              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       4. GAME LOGIC LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/app/game/utils/enhancedCollision.ts                  │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ resolveEnhancedCollision()                          │   │   │
│  │  │ ├─ Calculate collision angle                        │   │   │
│  │  │ ├─ Get contact point multiplier (1.0x - 2.5x)      │   │   │
│  │  │ ├─ Apply type bonuses (attack/defense/stamina)     │   │   │
│  │  │ ├─ Calculate spin steal                            │   │   │
│  │  │ ├─ Apply special move modifiers                    │   │   │
│  │  │ └─ Return collision result with damages            │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/app/game/utils/specialMovesManager.ts                │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ canActivateSpecialMove() → Check power & cooldown  │   │   │
│  │  │ activateSpecialMove() → Deduct power, apply flags  │   │   │
│  │  │ updateSpecialMoves() → Update each frame           │   │   │
│  │  │ calculateDamageWithSpecialMoves()                  │   │   │
│  │  │ isImmuneToKnockback()                              │   │   │
│  │  │ shouldTriggerCounterAttack()                       │   │   │
│  │  │ getRemainingCooldown()                             │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/app/game/utils/beybladeUtils.ts                      │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ createBeyblade() → Load stats from database        │   │   │
│  │  │ updateBeyblade() → Apply stamina bonus to decay    │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      5. VISUAL/UI LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/app/game/utils/visualIndicators.ts                   │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ drawContactPoints() → Arrow indicators              │   │   │
│  │  │ drawSpecialMoveAura() → Purple/orange glow          │   │   │
│  │  │ drawHitQualityIndicator() → PERFECT!/Good!/Hit      │   │   │
│  │  │ drawTypeBadge() → Color-coded type badge            │   │   │
│  │  │ drawSpinStealEffect() → Particle flow               │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /src/app/admin/beyblade-stats/page.tsx                    │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │ Beautiful Admin Interface                           │   │   │
│  │  │ • View all Beyblades                               │   │   │
│  │  │ • Filter by type                                   │   │   │
│  │  │ • Initialize defaults                              │   │   │
│  │  │ • Visual stat displays                             │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. Game Start                                                       │
│     └─> Load Beyblade stats from Firebase                           │
│         └─> Cache in Map for fast lookup                            │
│                                                                       │
│  2. Game Loop (60 FPS)                                               │
│     ├─> Update Beyblades (physics)                                  │
│     ├─> Update special moves (check duration, apply effects)        │
│     ├─> Check collisions                                            │
│     │   ├─> Calculate collision angle                               │
│     │   ├─> Get contact point multiplier                            │
│     │   ├─> Apply type bonuses                                      │
│     │   ├─> Calculate spin steal                                    │
│     │   └─> Apply damage                                            │
│     └─> Render (canvas)                                             │
│         ├─> Draw Beyblades                                          │
│         ├─> Draw contact points (arrows)                            │
│         ├─> Draw special move auras                                 │
│         ├─> Draw hit indicators                                     │
│         └─> Draw type badges                                        │
│                                                                       │
│  3. User Input                                                       │
│     └─> Press SPACE / Click button                                  │
│         └─> Check if can activate special move                      │
│             ├─> Yes: Activate move, apply flags                     │
│             └─> No: Show reason (power/cooldown)                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     SPECIAL MOVE FLAGS FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Special Move: Spriggan's Counter Break                             │
│                                                                       │
│  Flags: {                                                            │
│    damageImmune: true,                                              │
│    counterAttack: true,                                             │
│    performLoop: true,                                               │
│    damageMultiplier: 1.8,                                           │
│    duration: 2s,                                                     │
│    cooldown: 12s                                                     │
│  }                                                                   │
│                                                                       │
│  Execution:                                                          │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ 1. User activates move                                 │        │
│  │    ├─> Deduct 22 power                                │        │
│  │    └─> Set active flag                                │        │
│  │                                                        │        │
│  │ 2. On collision (every frame check)                   │        │
│  │    ├─> damageImmune: true → damage = 0               │        │
│  │    ├─> counterAttack: true → attack opponent         │        │
│  │    └─> damageMultiplier: 1.8 → deal 1.8x damage      │        │
│  │                                                        │        │
│  │ 3. During move                                         │        │
│  │    └─> performLoop: true → trigger loop mechanic     │        │
│  │                                                        │        │
│  │ 4. After 2 seconds (duration)                          │        │
│  │    └─> Deactivate move, start 12s cooldown           │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   CONTACT POINT SYSTEM FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Example: Valkyrie (3 blades)                                       │
│                                                                       │
│  Contact Points:                                                     │
│  ┌────────────────────────────────────────────────────┐            │
│  │  [0°: 2.1x, width: 32°]   ← Strongest blade       │            │
│  │  [120°: 1.7x, width: 28°] ← Side blade            │            │
│  │  [240°: 1.7x, width: 28°] ← Side blade            │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                       │
│  Collision Scenario:                                                 │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ 1. Valkyrie hits opponent                              │        │
│  │    Rotation: 45°                                       │        │
│  │    Collision point: Right side                         │        │
│  │                                                         │        │
│  │ 2. Calculate collision angle relative to rotation      │        │
│  │    Absolute angle: 90°                                 │        │
│  │    Relative angle: 90° - 45° = 45°                    │        │
│  │                                                         │        │
│  │ 3. Check contact points                                │        │
│  │    0° contact: |45° - 0°| = 45° > 16° ✗              │        │
│  │    120° contact: |45° - 120°| = 75° > 14° ✗          │        │
│  │    240° contact: |45° - 240°| = 195° > 14° ✗         │        │
│  │    → No direct hit, use 1.0x multiplier               │        │
│  │                                                         │        │
│  │ 4. If collision was at 10° instead:                    │        │
│  │    Relative: 10° - 45° = -35° → 325° (normalized)    │        │
│  │    0° contact: |325° - 0°| = 35° > 16° ✗             │        │
│  │    0° contact: |360° - 325°| = 35° > 16° ✗           │        │
│  │    Actually: |0° - 325°| → check both sides           │        │
│  │    Forward: 35° > 16° ✗                               │        │
│  │    Backward: 325° from opposite = 35° > 16° ✗        │        │
│  │                                                         │        │
│  │ 5. Direct hit at 0° ± 16°:                            │        │
│  │    → Use 2.1x multiplier                              │        │
│  │    → Show "PERFECT!" indicator                        │        │
│  │    → Massive damage!                                   │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```
