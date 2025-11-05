# Firestore Undefined Values Fix + Charge Point Radius Fix

## Date
2025-11-06

## Issues Fixed

### 1. Firestore "Cannot use undefined" Error ❌ → ✅

**Error:**
```
Error: Value for argument "data" is not a valid Firestore document. 
Cannot use "undefined" as a Firestore value (found in field "backgroundColor"). 
If you want to ignore undefined values, enable `ignoreUndefinedProperties`.
```

**Root Cause:**
The API was trying to save optional fields (`backgroundColor`, `floorColor`, `floorTexture`) with `undefined` values to Firestore, which doesn't accept undefined values.

**Solution:**
Only add optional fields to the document if they have defined values.

**Code Change in `/api/arenas/route.ts`:**

**Before:**
```typescript
const arenaData = {
  name,
  description: description || '',
  // ... other fields
  backgroundColor,      // ❌ Could be undefined
  floorColor,          // ❌ Could be undefined
  floorTexture,        // ❌ Could be undefined
  // ... rest
};

await db.collection('arenas').add(arenaData);
```

**After:**
```typescript
const arenaData: any = {
  name,
  description: description || '',
  // ... required fields only
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

// Add optional fields only if defined ✅
if (backgroundColor !== undefined) arenaData.backgroundColor = backgroundColor;
if (floorColor !== undefined) arenaData.floorColor = floorColor;
if (floorTexture !== undefined) arenaData.floorTexture = floorTexture;

await db.collection('arenas').add(arenaData);
```

**Result:**
✅ Arenas now save successfully without Firestore errors
✅ Optional customization fields only included when set
✅ No need to enable `ignoreUndefinedProperties` globally

---

### 2. Charge Point Radius Not Scaling Properly ❌ → ✅

**Issue:**
Charge points on speed paths were using `(radius || 1) * scale * 3` which resulted in:
- Inconsistent sizing based on zoom/scale
- Too small or too large depending on arena size
- Not predictable 10-50px range

**User Request:**
"let it be 10px to 50px"

**Solution:**
Use fixed pixel range (10-50px) regardless of scale factor.

**Code Changes:**

#### File: `src/components/arena/renderers/SpeedPathRenderer.tsx`

**Before:**
```typescript
const cpRadius = (cp.radius || 1) * scale;

<circle
  r={cpRadius * 3}  // ❌ Unpredictable size
  // ...
/>
```

**After:**
```typescript
// Fixed pixel range: 10-50px regardless of scale
const cpRadius = cp.radius ? Math.max(10, Math.min(50, cp.radius)) : 25;

<circle
  r={cpRadius}  // ✅ Always between 10-50px
  // ...
/>
```

**Auto-generated charge points:**
```typescript
chargePoints.push({
  id: i + 1,
  pathPosition,
  target: "center",
  radius: 25,  // ✅ Fixed 25px (middle of 10-50 range)
  color: "#fbbf24",
});
```

#### File: `src/components/admin/ArenaConfiguratorNew.tsx`

**Before:**
```typescript
newSpeedPaths[idx].chargePoints!.push({
  // ...
  radius: 1,  // ❌ Too small
  // ...
});
```

**After:**
```typescript
newSpeedPaths[idx].chargePoints!.push({
  // ...
  radius: 25,  // ✅ Fixed 25px (will be clamped to 10-50px)
  // ...
});
```

**Result:**
✅ Charge points always visible at 25px default
✅ User can set custom radius (10-50px range enforced)
✅ Consistent size across all zoom levels
✅ No more tiny or giant charge points

---

## Testing

### Test Firestore Fix
1. Navigate to `/admin/game/stadiums/create`
2. Fill in only required fields (name, shape, theme)
3. Leave backgroundColor, floorColor, floorTexture empty
4. Click "Save Arena"
5. ✅ Should save successfully without errors

### Test Charge Point Fix
1. Navigate to `/admin/game/stadiums/create`
2. Go to "Speed Paths" tab
3. Add a speed path
4. Enable "Auto-place Charge Points"
5. Set count to 3
6. Check preview
7. ✅ Charge points should be clearly visible at 25px radius
8. ✅ Should be consistent size regardless of zoom

---

## Files Modified

### Backend
- ✅ `src/app/(backend)/api/arenas/route.ts`
  - Added conditional field addition for optional properties
  - Changed `arenaData` to `any` type for dynamic property assignment

### Frontend
- ✅ `src/components/arena/renderers/SpeedPathRenderer.tsx`
  - Changed charge point radius calculation to fixed 10-50px range
  - Updated auto-generated charge points to use 25px default
  
- ✅ `src/components/admin/ArenaConfiguratorNew.tsx`
  - Changed manual charge point creation to use 25px default

---

## Impact

### Firestore Fix
- **Breaking Changes:** None
- **Backward Compatible:** Yes (old arenas unaffected)
- **Database Changes:** None (only affects new saves)

### Charge Point Fix
- **Breaking Changes:** None
- **Backward Compatible:** Yes (old charge points will use default 25px if radius not set)
- **Visual Impact:** High (charge points now consistently visible)

---

## Related Issues

### Future Improvements
1. **Firestore Configuration:**
   - Could enable `ignoreUndefinedProperties` globally in Firebase config
   - Would be cleaner but requires Firebase Admin SDK configuration update
   
2. **Charge Point Customization:**
   - Add UI slider for charge point radius (10-50px range)
   - Add per-charge-point radius control
   - Add visual feedback of radius in editor

3. **Type Safety:**
   - Create proper type for Firestore document (exclude undefined fields)
   - Use TypeScript utility types: `Required<T>` and `Partial<T>`

---

## Validation

✅ **Compilation:** No TypeScript errors
✅ **API:** Firestore saves without errors
✅ **Preview:** Charge points visible at correct size
✅ **Backward Compatible:** Old data works seamlessly

---

**Status:** ✅ Fixed and Ready
**Date:** 2025-11-06
**Impact:** High (fixes critical save error + improves UX)
