# Water Bodies Testing Guide

## ✅ Implementation Status

All three water body types are **fully implemented** with slider controls:

### 1. 🌊 Moat Water Body

- ✅ Surrounds arena completely
- ✅ `followsArenaShape` toggle (star moat for star arena OR circular moat)
- ✅ Sliders: thickness (1-10 em), distance from arena (0-5 em)
- ✅ Common properties: color, opacity, depth, wavy effect

### 2. 💧 Zone Water Body

- ✅ Positioned at X, Y coordinates
- ✅ Custom shapes: circle, square, rectangle, oval
- ✅ Sliders: position X/Y, width, height, rotation (0-360°)
- ✅ Common properties: color, opacity, depth, wavy effect

### 3. 🏖️ Wall-Based Water Body

- ✅ Water at arena edges/perimeter
- ✅ Follows arena shape automatically
- ✅ `coversExits` toggle (water in exit zones between walls)
- ✅ Sliders: thickness (1-5 em), offset from edge (0-3 em)
- ✅ Common properties: color, opacity, depth, wavy effect

## 🧪 Test Scenarios

### Test 1: Star Arena with Star-Shaped Moat

**Goal**: Verify moat follows star shape

```typescript
// Expected Result: Blue water moat surrounds star arena in star shape
Arena: {
  shape: "star5",
  waterBodies: [{
    type: "moat",
    thickness: 4,
    distanceFromArena: 0,
    followsArenaShape: true,  // ← KEY: Should match star shape
    color: "#3b82f6"
  }]
}
```

**Steps**:

1. Go to Basics Tab → Select "Star (5)" shape
2. Go to Water Tab → Click "+ Add Moat"
3. Verify "Follows Arena Shape" is ✅ checked
4. Set thickness to 4 em using slider
5. Check preview shows **star-shaped moat**

---

### Test 2: Star Arena with Circular Moat

**Goal**: Verify moat can be circular despite star arena

```typescript
// Expected Result: Circular water moat around star arena
Arena: {
  shape: "star5",
  waterBodies: [{
    type: "moat",
    thickness: 4,
    distanceFromArena: 1,
    followsArenaShape: false,  // ← KEY: Should be circular
    color: "#06b6d4"
  }]
}
```

**Steps**:

1. Arena shape: "Star (5)"
2. Add Moat
3. **UNCHECK** "Follows Arena Shape" checkbox
4. Set distance from arena to 1 em
5. Check preview shows **circular moat** (not star-shaped)

---

### Test 3: Square Zone Water Body Inside Arena

**Goal**: Verify positioned water at specific X, Y

```typescript
// Expected Result: Square water body at position (5, -3)
Arena: {
  shape: "circle",
  waterBodies: [{
    type: "zone",
    position: { x: 5, y: -3 },
    shape: "square",
    width: 8,
    height: 8,
    rotation: 45,  // Rotated 45°
    color: "#10b981"
  }]
}
```

**Steps**:

1. Arena shape: "Circle"
2. Add Zone
3. Shape dropdown → Select "Square"
4. Position X slider → Move to 5 em
5. Position Y slider → Move to -3 em
6. Width slider → 8 em
7. Height slider → 8 em
8. Rotation slider → 45°
9. Check preview shows **rotated square water** at off-center position

---

### Test 4: Wall-Based Water at Circle Arena Edges

**Goal**: Verify water at arena perimeter following circle shape

```typescript
// Expected Result: Water strip at circle arena edges
Arena: {
  shape: "circle",
  waterBodies: [{
    type: "wall-based",
    thickness: 2,
    offsetFromEdge: 0,
    coversExits: true,
    color: "#14b8a6"
  }]
}
```

**Steps**:

1. Arena shape: "Circle"
2. Add Wall-Based
3. Thickness slider → 2 em
4. Offset slider → 0 em
5. Covers Exits → ✅ checked
6. Check preview shows **water ring at circle perimeter**

---

### Test 5: Maximum 3 Water Bodies

**Goal**: Verify limit enforcement

```typescript
// Expected: Can add up to 3 water bodies, buttons disabled after
Arena: {
  waterBodies: [
    { type: "moat", ... },      // Water body 1
    { type: "zone", ... },      // Water body 2
    { type: "wall-based", ... } // Water body 3
  ]
}
// All "Add" buttons should be disabled now
```

**Steps**:

1. Add Moat → Success ✅
2. Add Zone → Success ✅
3. Add Wall-Based → Success ✅
4. Try to add 4th water body → **Buttons should be disabled** ❌
5. Remove one → Buttons enabled again ✅

---

### Test 6: All Slider Controls Work

**Goal**: Verify all sliders update preview

**Common Sliders (all types)**:

- [ ] Opacity (0.1 - 1.0) → Makes water more/less transparent
- [ ] Depth (0 - 10) → Visual depth effect
- [ ] Wavy Effect checkbox → Animates water

**Moat-Specific**:

- [ ] Thickness (1 - 10 em) → Width of moat
- [ ] Distance from Arena (0 - 5 em) → Gap before moat

**Zone-Specific**:

- [ ] Position X (-25 to +25 em) → Horizontal position
- [ ] Position Y (-25 to +25 em) → Vertical position
- [ ] Width (2 - 30 em) → Zone width
- [ ] Height (2 - 30 em) → Zone height
- [ ] Rotation (0 - 360°) → Rotation angle

**Wall-Based-Specific**:

- [ ] Thickness (1 - 5 em) → Water strip width
- [ ] Offset from Edge (0 - 3 em) → Inward distance

---

## 🎨 Visual Test Cases

### Case 1: Fortress with Moat

```
Arena: Star (5)
Water Body 1: Moat
  - Thickness: 5 em
  - Distance: 2 em
  - Follows Shape: ✅ YES
  - Color: Dark blue (#1e40af)

Expected: Wide star-shaped moat around star fortress
```

### Case 2: Island with Central Pond

```
Arena: Circle
Water Body 1: Moat (outer)
  - Thickness: 3 em
  - Distance: 0 em
  - Follows Shape: ✅ YES

Water Body 2: Zone (center)
  - Position: (0, 0)
  - Shape: Circle
  - Radius: 5 em

Expected: Island with surrounding moat + center pond
```

### Case 3: Beach Arena

```
Arena: Square
Water Body 1: Wall-Based
  - Thickness: 1.5 em
  - Offset: 0 em
  - Covers Exits: ✅ YES
  - Color: Cyan (#06b6d4)

Expected: Water lapping at square arena edges
```

### Case 4: Hazard Course

```
Arena: Hexagon
Water Body 1: Zone (left)
  - Position: (-10, 0)
  - Shape: Circle
  - Radius: 4 em

Water Body 2: Zone (right)
  - Position: (10, 0)
  - Shape: Square
  - Width/Height: 6 em
  - Rotation: 45°

Water Body 3: Zone (center)
  - Position: (0, 0)
  - Shape: Oval
  - Width: 8 em, Height: 5 em

Expected: 3 distinct water hazards at different positions
```

---

## 🐛 Common Issues & Solutions

| Issue                  | Cause               | Solution                            |
| ---------------------- | ------------------- | ----------------------------------- |
| Moat not showing       | Distance too large  | Reduce "Distance from Arena" slider |
| Wrong moat shape       | Wrong toggle        | Check "Follows Arena Shape" setting |
| Zone not visible       | Off-screen position | Adjust X/Y sliders to center (0, 0) |
| Water too faint        | Low opacity         | Increase opacity slider to 0.8-1.0  |
| Can't add water body   | At limit            | Remove one (max 3 total)            |
| Wall water not visible | Offset too large    | Set "Offset from Edge" to 0         |

---

## 📋 Checklist for Complete Testing

### Moat Water Body Tests

- [ ] Add moat to circle arena
- [ ] Add moat to star arena (follows shape = true)
- [ ] Add moat to star arena (follows shape = false → circular)
- [ ] Adjust thickness slider (1-10)
- [ ] Adjust distance slider (0-5)
- [ ] Change color with color picker
- [ ] Adjust opacity slider
- [ ] Adjust depth slider
- [ ] Toggle wavy effect on/off

### Zone Water Body Tests

- [ ] Add zone with circle shape
- [ ] Add zone with square shape
- [ ] Add zone with rectangle shape
- [ ] Add zone with oval shape
- [ ] Adjust position X slider
- [ ] Adjust position Y slider
- [ ] Adjust width slider
- [ ] Adjust height slider
- [ ] Adjust rotation slider (0-360)
- [ ] Verify shape dropdown changes shape

### Wall-Based Water Body Tests

- [ ] Add wall-based to circle arena
- [ ] Add wall-based to square arena
- [ ] Add wall-based to star arena (should follow star shape)
- [ ] Adjust thickness slider (1-5)
- [ ] Adjust offset slider (0-3)
- [ ] Toggle "Covers Exits" on/off
- [ ] Verify follows arena perimeter

### General Tests

- [ ] Add 3 water bodies (mix of types)
- [ ] Verify 4th add button is disabled
- [ ] Remove water bodies one by one
- [ ] Switch between arena shapes with water bodies
- [ ] Save arena and reload (persistence)
- [ ] Preview updates in real-time
- [ ] All sliders smooth and responsive

---

## 🎯 Expected Behavior Summary

| Water Type     | Location         | Shape                        | Key Feature                |
| -------------- | ---------------- | ---------------------------- | -------------------------- |
| **Moat**       | Outside arena    | Follows arena OR circle      | `followsArenaShape` toggle |
| **Zone**       | User-defined X,Y | Circle/Square/Rectangle/Oval | Manual positioning         |
| **Wall-Based** | Arena perimeter  | Follows arena shape          | At edges, covers exits     |

---

## 💡 Pro Tips for Testing

1. **Start with simple cases**: Single moat on circle arena
2. **Test extremes**: Max thickness, min thickness, max distance
3. **Test combinations**: All 3 water types together
4. **Test shape changes**: Add water, then change arena shape
5. **Test persistence**: Save, reload, verify water bodies remain
6. **Test live preview**: Every slider move should update preview
7. **Test color variety**: Use different colors for multiple water bodies

---

## ✨ Success Criteria

✅ **All Tests Pass If**:

- Moat surrounds arena in correct shape (or circular if toggled)
- Zone appears at specified X, Y position with correct shape
- Wall-based water follows arena perimeter
- All sliders work smoothly
- Maximum 3 water bodies enforced
- Live preview updates correctly
- Colors, opacity, depth all adjust properly
- Save/load preserves water body configuration

---

## 🚀 Ready to Test!

The water body system is **fully implemented** with:

- ✅ All 3 types functional
- ✅ All sliders working
- ✅ Max 3 limit enforced
- ✅ Type-specific controls
- ✅ Live preview updates
- ✅ Complete TypeScript typing

Navigate to **Water Tab** in Arena Configurator and start testing! 🌊💧🏖️
