# Portal & Pit Sliders - Quick Reference

## 🎯 What Changed

Added comprehensive slider controls for portal and pit positioning/sizing, with all values now resolution-aware.

---

## 🎨 Portal Sliders (Manual Mode)

### Position

- **X Slider**: Range -535 to +535 px (for 1080px arena)
- **Y Slider**: Range -535 to +535 px (for 1080px arena)
- **Display**: Shows current position in pixels
- **Precision**: Number input for exact values

### Radius

- **Slider Range**: 10.8 to 108 px (1% to 10% of arena)
- **Default**: 43.2 px (4% of arena @ 1080px)
- **Display**: Shows both pixels and percentage
- **Example**: "Radius: 43.2 px (4.0% of arena)"

---

## 🕳️ Pit Sliders (Manual Mode)

### Position

- **X Slider**: Range -537 to +537 px (for 1080px arena)
- **Y Slider**: Range -537 to +537 px (for 1080px arena)
- **Display**: Shows current position in pixels
- **Precision**: Number input for exact values

### Radius

- **Slider Range**: 5.4 to 86.4 px (0.5% to 8% of arena)
- **Default (Crater)**: 32.4 px (3% of arena @ 1080px)
- **Default (Edge)**: 16.2 px (1.5% of arena @ 1080px)
- **Default (Center)**: 43.2 px (4% of arena @ 1080px)
- **Display**: Shows both pixels and percentage

---

## 📊 Resolution Scaling

All sizes scale proportionally with `ARENA_RESOLUTION`:

| Resolution | Portal (4%) | Pit Edge (1.5%) | Pit Crater (3%) |
| ---------- | ----------- | --------------- | --------------- |
| 720px      | 28.8px      | 10.8px          | 21.6px          |
| **1080px** | **43.2px**  | **16.2px**      | **32.4px**      |
| 1440px     | 57.6px      | 21.6px          | 43.2px          |

---

## 🎮 Usage

### Portal Setup

1. Go to **Portals** tab
2. Click **"+ Manual Portal"** or switch from auto-place
3. Use **Position X/Y** sliders to move portal
4. Use **Radius** slider to resize (10.8-108px)
5. Preview updates in real-time

### Pit Setup

1. Go to **Pits** tab
2. Click **"+ Add Crater Pit"**
3. Use **Position X/Y** sliders to move pit
4. Use **Radius** slider to resize (5.4-86.4px)
5. Preview updates in real-time

---

## ✅ Key Features

- ✅ **Range sliders** for visual feedback
- ✅ **Number inputs** for precise control
- ✅ **Real-time preview** updates
- ✅ **Percentage display** shows scale
- ✅ **Center-relative** coordinates (0,0 = center)
- ✅ **Resolution-aware** sizing
- ✅ **Consistent** with other features

---

## 🐛 Troubleshooting

**Q: Sliders don't appear?**  
A: Make sure you're in **manual mode** (not auto-place)

**Q: Values seem too large/small?**  
A: Check ARENA_RESOLUTION setting (should be 1080)

**Q: Preview doesn't update?**  
A: Try clicking **Reset** on zoom controls

**Q: Position slider at wrong scale?**  
A: Sliders use center-relative coords: 0 = center, -540/+540 = edges

---

## 📚 Related Docs

- Full details: `PORTAL_PIT_SLIDERS_RESOLUTION_SCALING.md`
- Previous session: `CHARGE_POINT_SLIDERS_LIST_AND_ZOOM.md`
- Constants reference: `docs/CONSTANTS_REFERENCE.md`
