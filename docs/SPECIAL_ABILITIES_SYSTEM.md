# Special Abilities System - Beyblade Battle

## Overview

The game now features advanced combat mechanics with special abilities, dodge maneuvers, and strategic charge point selection.

## 🎮 Special Abilities

### 1. **Dodge Right** (Key: `1` | Mouse: `Right Click`)

- **Cost**: 20 spin
- **Cooldown**: 0.5 seconds
- **Effect**: Quick burst dash to the right with 400 velocity
- **Strategy**: Use to evade incoming attacks or reposition quickly

### 2. **Heavy Attack** (Key: `2` | Mouse: `Left Click`)

- **Cost**: Free
- **Duration**: 0.3 seconds
- **Effect**: 1.25× damage multiplier on next collision
- **Strategy**: Time it right before impact for extra damage

### 3. **Dodge Left** (Key: `3` | Mouse: `Middle Button`)

- **Cost**: 20 spin
- **Cooldown**: 0.5 seconds
- **Effect**: Quick burst dash to the left with 400 velocity
- **Strategy**: Use to evade incoming attacks or reposition quickly

### 4. **Ultimate Attack** (Key: `4` | Mouse: `Double Click`)

- **Cost**: 100 spin
- **Duration**: 0.5 seconds
- **Effect**: 2× damage multiplier on next collision
- **Strategy**: Save for critical moments, devastating when combined with charge dash

## 🔵 Blue Loop Charge Point Selection

### How It Works

When your Beyblade enters the blue loop (inner circle), you have **1 second** to select your preferred charge point:

- **Press `1`** (or `Right Click`): Select Point 1 at 30° angle
- **Press `2`** (or `Left Click`): Select Point 2 at 150° angle
- **Press `3`** (or `Middle Click`): Select Point 3 at 270° angle
- **No selection**: Random charge point is chosen automatically

### Charge Points Explained

```
        Point 2 (150°)
              |
              |
Point 3 ------+------ Point 1 (30°)
   (270°)     |
              |
           Center
```

### Strategy Tips

- **Point 1 (30°)**: Right side exit - good for aggressive right positioning
- **Point 2 (150°)**: Top-left exit - strategic for corner control
- **Point 3 (270°)**: Bottom exit - excellent for center control

## ⚡ Combat Mechanics

### Damage Calculation

Base damage is now affected by special attack multipliers:

```typescript
// Base damage (60% of original for easier gameplay)
baseDamage = (avgAccel + opponentAccel) * 0.6

// With Heavy Attack
damage = baseDamage * 1.25

// With Ultimate Attack
damage = baseDamage * 2.0

// Ultimate + Charge Dash combo
damage = baseDamage * 2.0 (from ultimate) + enhanced knockback
```

### Attack Duration

- **Heavy Attack**: Active for 0.3 seconds
- **Ultimate Attack**: Active for 0.5 seconds
- Attacks auto-expire after duration
- Can't stack multiple attacks simultaneously

## 🎯 Advanced Tactics

### 1. **Dodge Canceling**

- Use dodge to escape blue loop early
- Quick repositioning during charge dash
- Evade predictable AI patterns

### 2. **Attack Timing**

- Activate Heavy Attack just before collision
- Ultimate Attack during charge dash for maximum impact
- Combine with blue loop exit for devastating combos

### 3. **Spin Management**

- Dodges cost 20 spin each - use wisely
- Ultimate costs 100 spin - save for key moments
- Heavy Attack is free - spam-friendly but short duration

### 4. **Charge Point Strategy**

- Predict opponent position
- Select point that exits toward center for follow-up attacks
- Random selection can surprise experienced opponents

## 🔧 Balance Changes

### Blue Loop Acceleration

- **Previous**: 4× acceleration multiplier during loop
- **Current**: 1.3× acceleration multiplier
- **Reason**: Better control, less chaotic exits

### Charge Dash

- Still provides 1.25× knockback multiplier
- 3-second duration for strategic play
- Enhanced acceleration cap of 25 (up from 15)

### Cooldowns

- Dodge cooldown: 0.5 seconds (prevents spam)
- No cooldown on attacks (balanced by duration)

## 🖱️ Mouse Button Reference

| Button           | Primary Action      | Blue Loop Action      |
| ---------------- | ------------------- | --------------------- |
| **Left Click**   | Heavy Attack (2)    | Select Charge Point 2 |
| **Right Click**  | Dodge Right (1)     | Select Charge Point 1 |
| **Middle Click** | Dodge Left (3)      | Select Charge Point 3 |
| **Double Click** | Ultimate Attack (4) | N/A                   |

## 🎮 Keyboard Controls

| Key          | Action                        |
| ------------ | ----------------------------- |
| `1`          | Dodge Right / Charge Point 1  |
| `2`          | Heavy Attack / Charge Point 2 |
| `3`          | Dodge Left / Charge Point 3   |
| `4`          | Ultimate Attack               |
| `W/A/S/D`    | Movement                      |
| `Arrow Keys` | Alternative Movement          |

## 📊 UI Indicators

### Attack Status Display

- Player statistics show current active buffs
- Visual feedback during active attacks
- Spin cost deduction is immediate

### Charge Point Selection

- 1-second window starts when entering blue loop
- No visual indicator yet (potential future enhancement)
- Selection locks in immediately when pressed

## 🐛 Known Behaviors

- Context menu disabled (right-click now triggers dodge)
- Double-click may select text - this is normal
- Dodge can push beyblade out of bounds if near edge
- Ultimate attack requires exactly 100+ spin

## 🚀 Future Enhancements

Potential additions:

- Visual effects for active attacks
- Sound effects for special abilities
- Charge point selection UI indicator
- Combo counter system
- Special ability unlocks/upgrades

---

**Version**: 3.0 (Special Abilities Update)
**Last Updated**: October 29, 2025
