# ✅ Testing Checklist - Tryout Mode

**Test URL:** http://localhost:3000/game/tryout  
**Monitor URL:** http://localhost:2567/colyseus  
**Date:** November 5, 2025

---

## 🚦 Pre-Test Setup

- [x] Game server running on port 2567
- [x] Next.js server running on port 3000
- [x] Firebase Admin SDK initialized
- [x] .env.local configured with NEXT_PUBLIC_GAME_SERVER_URL
- [ ] Test beyblade exists in Firestore (`beyblades/dragoon_gt`)
- [ ] Test arena exists in Firestore (`arenas/standard_arena`)

---

## 🧪 Basic Functionality Tests

### 1. Page Load

- [ ] Page loads without 404 error
- [ ] No TypeScript compilation errors
- [ ] Canvas element renders
- [ ] Loading state displays (if applicable)

### 2. WebSocket Connection

**Check browser console (F12)**

- [ ] No connection errors
- [ ] "Connecting to game server..." message appears
- [ ] "Connected successfully" message appears
- [ ] Room ID displayed in console

### 3. Canvas Rendering

- [ ] Canvas fills the screen
- [ ] Arena shape renders (circle or rectangle)
- [ ] Background color displays
- [ ] No blank white screen

### 4. Beyblade Rendering

- [ ] Beyblade appears on canvas
- [ ] Beyblade has correct position (centered)
- [ ] Username displays above beyblade
- [ ] Health bar displays
- [ ] Stamina bar displays

### 5. Input Controls

**Test each key:**

- [ ] **W** - Beyblade moves up
- [ ] **S** - Beyblade moves down
- [ ] **A** - Beyblade moves left
- [ ] **D** - Beyblade moves right
- [ ] **Arrow Up** - Beyblade moves up
- [ ] **Arrow Down** - Beyblade moves down
- [ ] **Arrow Left** - Beyblade moves left
- [ ] **Arrow Right** - Beyblade moves right
- [ ] **Space** - Charge action triggers
- [ ] **Shift** - Dash action triggers
- [ ] **E** - Special move action triggers

### 6. HUD Elements

- [ ] Health bar shows correct value (0-100)
- [ ] Stamina bar shows correct value (0-100)
- [ ] Speed indicator displays
- [ ] Spin indicator displays
- [ ] Connection status shows "Connected"

### 7. Controls Hint Overlay

- [ ] Controls hint displays on load
- [ ] Can be toggled with designated key
- [ ] Shows correct key mappings

### 8. Debug Info Panel (Development Mode)

- [ ] Arena name displays
- [ ] Arena shape displays
- [ ] Arena dimensions display
- [ ] Beyblade count displays

---

## 🔌 Server Integration Tests

### Game Server Monitor

**Visit:** http://localhost:2567/colyseus

- [ ] Monitor panel loads
- [ ] Shows active rooms
- [ ] Shows "tryout_room" exists
- [ ] Shows connected clients (should be 1)
- [ ] Can view room state

### Game Server Terminal

**Check terminal output:**

- [ ] No error messages
- [ ] Shows room creation log
- [ ] Shows client connection log
- [ ] Shows input message logs

### Next.js Terminal

**Check terminal output:**

- [ ] Page compiled successfully
- [ ] No runtime errors
- [ ] Shows GET request to /game/tryout

---

## 🎮 Gameplay Tests

### Movement

- [ ] Smooth movement in all directions
- [ ] No jittery or laggy movement
- [ ] Beyblade stays within arena boundaries
- [ ] Speed feels reasonable

### Physics

- [ ] Beyblade rotates when spinning
- [ ] Collision with walls works (if implemented)
- [ ] Ring-out detection works (if implemented)

### State Synchronization

- [ ] Position updates in real-time
- [ ] Health/stamina updates reflect server state
- [ ] No visible lag between input and movement

---

## 🐛 Error Handling Tests

### Connection Errors

- [ ] Graceful handling if server is down
- [ ] Error message displays clearly
- [ ] Can retry connection

### Firestore Errors

- [ ] Handles missing beyblade gracefully
- [ ] Handles missing arena gracefully
- [ ] Shows appropriate error messages

### Browser Console

- [ ] No unhandled promise rejections
- [ ] No React warnings
- [ ] No TypeScript errors

---

## 📱 Responsive Design Tests

### Desktop

- [ ] Full screen rendering works
- [ ] Canvas scales properly
- [ ] HUD positioned correctly

### Tablet

- [ ] Layout adapts to smaller screen
- [ ] Touch controls work (if implemented)

### Mobile

- [ ] Page is accessible
- [ ] Layout doesn't break
- [ ] Virtual keyboard doesn't cover game

---

## ⚡ Performance Tests

### Frame Rate

- [ ] Game runs at 60 FPS
- [ ] No frame drops during movement
- [ ] Smooth animations

### Network

- [ ] Low latency (<100ms)
- [ ] Consistent update rate
- [ ] No disconnections

### Memory

- [ ] No memory leaks after 5 minutes
- [ ] Browser doesn't slow down
- [ ] CPU usage reasonable

---

## 🔍 Code Quality Checks

### TypeScript

- [ ] No compilation errors
- [ ] No `any` type warnings (check with strict mode)
- [ ] Proper type inference

### React

- [ ] No key warnings
- [ ] No useEffect dependency warnings
- [ ] Proper cleanup on unmount

### Best Practices

- [ ] Proper error boundaries
- [ ] Loading states handled
- [ ] User feedback for actions

---

## 📝 Test Results

### Passed Tests: **_ / _**

### Failed Tests: **_ / _**

### Skipped Tests: **_ / _**

---

## 🐛 Issues Found

| Issue | Severity | Description | Steps to Reproduce |
| ----- | -------- | ----------- | ------------------ |
|       |          |             |                    |
|       |          |             |                    |

---

## 💡 Improvements Needed

1.
2.
3.

---

## ✅ Sign Off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Ready for next phase (selection UI)

**Tester:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Build:** Phase 2 - 80% Complete

---

## 🚀 Next Testing Phase

Once current tests pass:

1. Test beyblade selection UI
2. Test arena selection UI
3. Test with multiple beyblades
4. Test advanced arena features
5. Test special moves and effects

---

**Remember:** Test in multiple browsers (Chrome, Firefox, Safari, Edge)
