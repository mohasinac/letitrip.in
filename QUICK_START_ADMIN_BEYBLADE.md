# Quick Start: New Admin Beyblade System

## Access the New Pages

### Beyblade Management (Settings)

```
http://localhost:3000/admin/game/settings
```

- Create new Beyblades
- Edit existing Beyblades
- Upload and edit images
- Delete Beyblades

### Game Statistics

```
http://localhost:3000/admin/game/stats
```

- View all Beyblade stats
- See type distribution
- Analyze averages
- Full data table

## Creating a New Beyblade (3 Steps)

### Step 1: Name & Image

1. Click **"Create New Beyblade"**
2. Enter beyblade name (e.g., "Storm Pegasus")
3. Select type (Attack/Defense/Stamina/Balanced)
4. Choose spin direction (Left/Right)
5. Click **"Upload Image"**
6. Select image file (PNG/JPG/GIF, max 5MB)
7. **Edit the image**:
   - Drag scale slider to resize (50%-200%)
   - Click **"🔄 Rotate"** to rotate 90°
   - Click **"Change Image"** to pick different file
8. Click **"Next →"**

### Step 2: Physical Properties

1. **Basic Properties**:

   - Mass (kg): 45
   - Radius (px): 40
   - Visual Size (px): 80
   - Max Spin: 100
   - Spin Decay Rate: 1.5
   - Spin Steal Factor: 0.15

2. **Type Distribution** (must equal 320):

   - Attack: 0-150 (use slider)
   - Defense: 0-150 (use slider)
   - Stamina: 0-150 (use slider)
   - Watch total update in real-time
   - ⚠️ Must equal exactly 320 to proceed

3. **Contact Points (Spikes)**:

   - Edit damage multiplier for each spike
   - Default: 4 spikes at 0°, 90°, 180°, 270°

4. Click **"Next →"**

### Step 3: Special Move

1. **Choose a Preset** (click any card):

   - **Speed Demon**: Fast attacker (15 power)
   - **Tank Mode**: Defensive + healing (20 power)
   - **Vampire Spin**: Steal + heal (20 power)
   - **Berserker Rage**: High damage, low defense (25 power)
   - **Shadow Wraith**: Invisible phantom (25 power)
   - **Fortress Shield**: Ultimate defense (25 power)

2. **OR Customize Your Own**:

   - Move Name
   - Power Cost (0-25)
   - Description
   - Flags:
     - Speed Boost (1.0-3.0x)
     - Damage Multiplier (1.0-3.0x)
     - Duration (1-30 seconds)
     - Cooldown (5-60 seconds)

3. Click **"Create Beyblade"**

## Using the Fixed Preview

The **right panel** shows a live preview:

- Updates as you type/change values
- Shows beyblade rendering
- Displays special move effects (Step 3)
- Always visible throughout all steps
- No need to "preview" separately

## Image Editing (WhatsApp-Style)

### Scale

- Slider: 50% to 200%
- See percentage below slider
- Preview updates in real-time

### Rotate

- Click **"🔄 Rotate"** button
- Rotates 90° clockwise each click
- Cycles: 0° → 90° → 180° → 270° → 0°

### Change

- Click **"Change Image"** to pick new file
- Preserves scale and rotation settings

## Navigation Tips

### Admin Sidebar

- Click **"Game"** in left sidebar
- Two sub-options appear:
  - **Settings** → Create/edit Beyblades
  - **Stats** → View statistics

### Tab Navigation

Once in `/admin/game/*`:

- **⚙️ Settings** tab → Beyblade management
- **📊 Stats** tab → Analytics

### Going Back

- Click **"← Previous"** to go back a step
- Click **"Cancel"** to exit without saving
- All progress preserved when going back

## Quick Actions

### Edit Existing Beyblade

1. Go to `/admin/game/settings`
2. Find beyblade card
3. Click **"Edit"**
4. Goes to multi-step editor (same 3 steps)
5. Make changes
6. Click **"Update Beyblade"**

### Upload Image for Existing Beyblade

1. Find beyblade card
2. Click **📷** camera icon on image
3. Upload and edit new image
4. Image updates immediately

### Delete Beyblade

1. Find beyblade card
2. Click **"Delete"**
3. Confirm deletion
4. Beyblade removed

### Filter by Type

1. Use dropdown at top: "Filter by Type"
2. Select: All / Attack / Defense / Stamina / Balanced
3. Grid updates automatically

### Initialize Defaults

1. Click **"Initialize Defaults"**
2. Adds all default Beyblades
3. Won't overwrite existing data
4. Useful for first-time setup

## Preset Special Moves Details

### Speed Demon (15 power)

- Speed: 2.5x
- Radius: 1.2x
- Duration: 6s
- Use for: Fast attackers

### Tank Mode (20 power)

- Damage Reduction: 90%
- Knockback Immunity: Yes
- Heal: 40 spin
- Reflect: 40%
- Duration: 12s
- Use for: Defensive Beyblades

### Vampire Spin (20 power)

- Spin Steal: 3.0x
- Vortex Pull: 180px radius
- Steal Rate: 15/sec
- Heal from Steal: Yes
- Speed: 1.4x
- Duration: 12s
- Use for: Spin-stealing types

### Berserker Rage (25 power)

- Damage: 2.5x
- Speed: 1.8x
- Defense: -60% (glass cannon)
- Visual: 3.0x intensity
- Duration: 8s
- Use for: All-out attack

### Shadow Wraith (25 power)

- Opacity: 0.3 (near invisible)
- Phase Through: Yes
- Teleport on Hit: Yes
- Speed: 2.0x
- Damage Immune: Yes
- Duration: 5s
- Use for: Evasive Beyblades

### Fortress Shield (25 power)

- Absorb All Damage: Yes
- Reflect: 50%
- Push Enemies: 150px
- Heal: 8/sec
- Knockback Immune: Yes
- Duration: 12s
- Use for: Ultimate defense

## Type Distribution Guide

Total **MUST** equal **320**. Max per stat: **150**.

### Attack Type

- Attack: 130-150
- Defense: 80-100
- Stamina: 80-90
- Total: 320

### Defense Type

- Attack: 80-90
- Defense: 130-150
- Stamina: 80-100
- Total: 320

### Stamina Type

- Attack: 80-90
- Defense: 80-100
- Stamina: 130-150
- Total: 320

### Balanced Type

- Attack: 100-110
- Defense: 100-110
- Stamina: 100-110
- Total: 320

## Troubleshooting

### "Total must equal 320" Error

- Check type distribution sliders
- Adjust values until total = 320
- Can't proceed to next step until fixed

### Image Won't Upload

- Check file size (max 5MB)
- Use PNG, JPG, or GIF format
- Try a different image

### Preview Not Updating

- Refresh the page
- Check browser console for errors
- Try different browser

### Can't Save Beyblade

- Ensure all required fields filled
- Type distribution must equal 320
- Check for validation errors (red text)

### Old Route Not Working

- Update links to new routes:
  - OLD: `/admin/beyblade-stats`
  - NEW: `/admin/game/settings`
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

## Keyboard Shortcuts

- **Enter**: Next step (when valid)
- **Escape**: Cancel/Close modal
- **Tab**: Navigate between fields
- **Space**: Select/toggle in dropdowns

## Mobile Support

- Fully responsive design
- Touch-friendly sliders
- Swipe to rotate image
- Pinch to zoom preview
- Works on tablets and phones

## Best Practices

### Image Quality

- Use transparent PNG for best results
- Square aspect ratio (1:1) recommended
- 300x300px minimum resolution
- Clear, centered beyblade image

### Naming Convention

- Use official names when possible
- Capitalize properly: "Storm Pegasus"
- Avoid special characters
- Keep under 30 characters

### Stat Balance

- Don't min-max too hard
- Consider gameplay balance
- Test in actual matches
- Adjust based on performance

### Special Move Power

- 10-15: Light moves
- 15-20: Medium moves
- 20-25: Ultimate moves
- Match to beyblade strength

## Next Steps

1. Create your first Beyblade
2. Test in game mode
3. Adjust stats based on performance
4. Share configurations with team
5. Import/export for backups (future)

## Need Help?

- Check `ADMIN_BEYBLADE_RESTRUCTURE.md` for full documentation
- See `COMPREHENSIVE_SPECIAL_MOVES.md` for special move flags
- Review `SPECIAL_MOVES_QUICK_REF.md` for flag reference
- Contact development team for support

---

**Happy Beyblade Creating! 🎮⚡**
