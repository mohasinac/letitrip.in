# Mobile Button Position Fix

## Issue

Special move buttons were overlapping with HUD elements (power and spin status) in the top corners.

## Solution

Moved top buttons (Dodge Left/Right) down to avoid HUD overlap while keeping bottom buttons in place.

## Updated Layout

```
Mobile Game Arena (800x800px):

┌─────────────────────────────────────────┐
│ [PLAYER HUD]              [AI HUD]      │ ← y: 15px (100x80px boxes)
│  Spin: 2500                Spin: 1800   │
│  Power: 15/25              Power: 12/25 │
│                                         │
│ [◄]                              [►]    │ ← y: 110px (Dodge buttons - MOVED DOWN)
│ DODGE L                        DODGE R  │
│                                         │
│                                         │
│            🎮 GAMEPLAY AREA 🎮          │
│                                         │
│                                         │
│                                         │
│                                         │
│ [⚔]                              [⚡]    │ ← y: bottom 10px (Attack buttons)
│ HEAVY                          ULTIMATE │
└─────────────────────────────────────────┘
```

## Button Positions

### Top Buttons (Dodge - Green)

- **Previous**: `top: 10-20px` (overlapping HUD)
- **Updated**: `top: 110-130px` (below HUD)
- **Reason**: HUD is ~100px tall (80px height + margins), so 110px+ clears it

### Bottom Buttons (Attacks - Orange/Red)

- **Position**: `bottom: 10-20px` (unchanged)
- **No overlap**: HUD is only at top

## Responsive Values

| Screen Size  | Top Dodge Y | Bottom Attack Y  |
| ------------ | ----------- | ---------------- |
| Mobile (xs)  | 110px       | 10px from bottom |
| Tablet (sm)  | 120px       | 15px from bottom |
| Desktop (md) | 130px       | 20px from bottom |

## HUD Dimensions (Reference)

- **Player HUD**: Top-left (20, 15) - 100x80px
- **AI HUD**: Top-right (680, 15) - 100x80px
- **Time Display**: Center top (400, 30)

## Visual Clearance

```
Top Section:
├─ 0-15px: Margin
├─ 15-95px: HUD boxes (80px height)
├─ 95-110px: Safety margin (15px)
└─ 110px+: Dodge buttons START HERE ✅
```

## Testing Checklist

- [x] Dodge Left button doesn't overlap Player HUD
- [x] Dodge Right button doesn't overlap AI HUD
- [x] All HUD text is readable
- [x] Power bars are fully visible
- [x] Spin values not obscured
- [x] Bottom buttons still accessible
- [x] No TypeScript errors

## Files Modified

- ✅ `src/app/game/components/MobileSpecialButtons.tsx`
  - Changed top button Y positions from 10-20px to 110-130px
  - Added comments explaining positioning
  - Bottom buttons unchanged

---

**Status**: ✅ Fixed - HUD no longer obscured by buttons
**Impact**: Better visibility of game stats on mobile
