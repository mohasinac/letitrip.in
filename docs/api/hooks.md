# Gesture Hooks API

Complete API reference for gesture and interaction hooks.

## Overview

LetItRip provides 5 comprehensive hooks for mobile and desktop gestures:

- `useSwipe` - Swipe detection (touch & mouse)
- `useGesture` - Multi-touch gestures (tap, pinch, rotate)
- `useLongPress` - Long press detection
- `useClickOutside` - Outside click handler
- `useKeyPress` - Keyboard shortcuts

All hooks are:
- ✅ TypeScript typed
- ✅ Mobile & desktop compatible
- ✅ Performance optimized
- ✅ Fully tested

## useSwipe

Detects swipe gestures on touch and mouse events.

### Import

```tsx
import { useSwipe } from '@/hooks';
```

### Signature

```typescript
function useSwipe<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  options: UseSwipeOptions
): void
```

### Options

```typescript
interface UseSwipeOptions {
  // Minimum distance to register swipe (default: 50px)
  minSwipeDistance?: number;
  
  // Maximum time for swipe (default: 300ms)
  maxSwipeTime?: number;
  
  // Velocity threshold (default: 0.3 pixels/ms)
  velocityThreshold?: number;
  
  // Callbacks
  onSwipeLeft?: (distance: number, velocity: number) => void;
  onSwipeRight?: (distance: number, velocity: number) => void;
  onSwipeUp?: (distance: number, velocity: number) => void;
  onSwipeDown?: (distance: number, velocity: number) => void;
  
  // Real-time swipe tracking
  onSwiping?: (deltaX: number, deltaY: number) => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  
  // Prevent default browser behavior
  preventDefault?: boolean;
}
```

### Example

```tsx
function SwipeableCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [translation, setTranslation] = useState(0);
  
  useSwipe(cardRef, {
    onSwiping: (deltaX) => {
      setTranslation(deltaX);
    },
    onSwipeLeft: (distance) => {
      console.log('Swiped left:', distance);
      // Navigate next
    },
    onSwipeRight: (distance) => {
      console.log('Swiped right:', distance);
      // Navigate previous
    },
    onSwipeEnd: () => {
      setTranslation(0);
    },
    minSwipeDistance: 100,
  });
  
  return (
    <div 
      ref={cardRef}
      style={{ transform: `translateX(${translation}px)` }}
    >
      Swipe me!
    </div>
  );
}
```

### Use Cases

- Image galleries
- Carousel navigation
- Dismissible cards
- Drawer/sidebar controls
- Modal swipe-to-dismiss

---

## useGesture

Comprehensive multi-touch gesture detection.

### Import

```tsx
import { useGesture } from '@/hooks';
```

### Signature

```typescript
function useGesture<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  options: UseGestureOptions
): void
```

### Options

```typescript
interface UseGestureOptions {
  // Single tap
  onTap?: (x: number, y: number) => void;
  
  // Double tap
  onDoubleTap?: (x: number, y: number) => void;
  doubleTapDelay?: number; // default: 300ms
  
  // Long press
  onLongPress?: (x: number, y: number) => void;
  longPressDelay?: number; // default: 500ms
  
  // Pinch zoom
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onPinching?: (scale: number, center: { x: number; y: number }) => void;
  
  // Rotation
  onRotate?: (angle: number, center: { x: number; y: number }) => void;
  onRotating?: (angle: number, center: { x: number; y: number }) => void;
  
  // Configuration
  tapMovementThreshold?: number; // default: 10px
  preventDefault?: boolean;
}
```

### Example

```tsx
function ZoomableImage({ src }: { src: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  useGesture(imageRef, {
    onDoubleTap: () => {
      setScale(scale === 1 ? 2 : 1);
    },
    onPinching: (newScale) => {
      setScale(newScale);
    },
    onRotating: (angle) => {
      setRotation(angle);
    },
    onTap: () => {
      console.log('Tapped');
    },
    onLongPress: () => {
      console.log('Long pressed');
    },
  });
  
  return (
    <img
      ref={imageRef}
      src={src}
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transition: 'transform 0.2s',
      }}
    />
  );
}
```

### Use Cases

- Image viewers
- Maps
- Drawing apps
- Photo editors
- Interactive diagrams

---

## useLongPress

Simple long press detection with movement tolerance.

### Import

```tsx
import { useLongPress } from '@/hooks';
```

### Signature

```typescript
function useLongPress(
  options: UseLongPressOptions
): LongPressHandlers
```

### Options

```typescript
interface UseLongPressOptions {
  // Long press callback
  onLongPress: (event: MouseEvent | TouchEvent) => void;
  
  // Delay before triggering (default: 500ms)
  delay?: number;
  
  // Movement threshold before cancel (default: 10px)
  movementThreshold?: number;
  
  // Lifecycle callbacks
  onLongPressStart?: () => void;
  onLongPressCancel?: () => void;
  
  // Prevent context menu (default: true)
  preventContextMenu?: boolean;
}

interface LongPressHandlers {
  onMouseDown: (e: MouseEvent) => void;
  onMouseUp: (e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseLeave: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onContextMenu: (e: Event) => void;
}
```

### Example

```tsx
function ContextMenuItem() {
  const [showMenu, setShowMenu] = useState(false);
  
  const handlers = useLongPress({
    onLongPress: () => {
      setShowMenu(true);
    },
    onLongPressStart: () => {
      // Visual feedback
    },
    delay: 600,
  });
  
  return (
    <div {...handlers}>
      Press and hold
      {showMenu && <ContextMenu />}
    </div>
  );
}
```

### Use Cases

- Context menus
- Reordering lists
- Selection mode
- Custom actions
- Alternative interactions

---

## useClickOutside

Detects clicks outside specified elements.

### Import

```tsx
import { useClickOutside } from '@/hooks';
```

### Signature

```typescript
function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
  options?: UseClickOutsideOptions
): void
```

### Options

```typescript
interface UseClickOutsideOptions {
  // Enable/disable hook
  enabled?: boolean; // default: true
  
  // Event type to listen for
  eventType?: 'mousedown' | 'mouseup' | 'click'; // default: 'mousedown'
  
  // Additional refs to consider "inside"
  additionalRefs?: RefObject<HTMLElement | null>[];
}
```

### Example

```tsx
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  useClickOutside(
    dropdownRef,
    () => setIsOpen(false),
    {
      enabled: isOpen,
      additionalRefs: [triggerRef],
    }
  );
  
  return (
    <>
      <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </button>
      {isOpen && (
        <div ref={dropdownRef}>
          Dropdown content
        </div>
      )}
    </>
  );
}
```

### Use Cases

- Dropdowns
- Modals
- Popovers
- Tooltips
- Context menus

---

## useKeyPress

Keyboard shortcut detection with modifiers.

### Import

```tsx
import { useKeyPress } from '@/hooks';
```

### Signature

```typescript
function useKeyPress(
  targetKey: string,
  callback: (event: KeyboardEvent) => void,
  options?: UseKeyPressOptions
): void
```

### Options

```typescript
interface UseKeyPressOptions {
  // Enable/disable hook
  enabled?: boolean; // default: true
  
  // Require modifiers
  requireCtrl?: boolean;
  requireShift?: boolean;
  requireAlt?: boolean;
  requireMeta?: boolean; // Cmd on Mac, Win on Windows
  
  // Event phase
  eventPhase?: 'keydown' | 'keyup'; // default: 'keydown'
  
  // Prevent default
  preventDefault?: boolean;
}
```

### Example

```tsx
function Editor() {
  const [content, setContent] = useState('');
  
  // Save: Ctrl+S / Cmd+S
  useKeyPress('s', () => {
    saveContent(content);
  }, {
    requireCtrl: true,
    preventDefault: true,
  });
  
  // Undo: Ctrl+Z / Cmd+Z
  useKeyPress('z', () => {
    undo();
  }, {
    requireCtrl: true,
  });
  
  // Close: Escape
  useKeyPress('Escape', () => {
    close();
  });
  
  return <textarea value={content} onChange={e => setContent(e.target.value)} />;
}
```

### Use Cases

- Keyboard shortcuts
- Modal close (Escape)
- Form submission (Enter)
- Navigation (Arrow keys)
- Accessibility

---

## Global Event Manager

Centralized event management utility.

### Import

```tsx
import { globalEventManager } from '@/utils/eventHandlers';
```

### API

```typescript
class GlobalEventManager {
  // Add event listener
  addEventListener(
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void;
  
  // Remove specific listener
  removeEventListener(event: string, handler: EventListener): void;
  
  // Remove all listeners for event
  removeAllListeners(event?: string): void;
}
```

### Example

```tsx
useEffect(() => {
  const removeScrollHandler = globalEventManager.addEventListener(
    'scroll',
    () => console.log('Scrolled'),
    { passive: true }
  );
  
  return removeScrollHandler;
}, []);
```

---

## Utility Functions

### Throttle

```typescript
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void
```

**Example:**
```tsx
const handleScroll = throttle(() => {
  console.log('Scrolled');
}, 100);
```

### Debounce

```typescript
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void
```

**Example:**
```tsx
const handleSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);
```

### Mobile Detection

```typescript
function isMobileDevice(): boolean
```

### Prevent Body Scroll

```typescript
function preventBodyScroll(prevent: boolean): void
```

### Smooth Scroll

```typescript
function smoothScrollTo(
  element: HTMLElement,
  options?: ScrollOptions
): void
```

---

## Best Practices

### 1. Cleanup

All hooks automatically cleanup event listeners:

```tsx
useEffect(() => {
  // Hook registers listeners
  useSwipe(ref, options);
  
  // Automatically cleaned up on unmount
}, []);
```

### 2. Conditional Enabling

```tsx
useClickOutside(ref, callback, {
  enabled: isOpen, // Only when needed
});
```

### 3. Prevent Memory Leaks

```tsx
const stableCallback = useCallback(() => {
  // Handler
}, [dependencies]);

useSwipe(ref, { onSwipeLeft: stableCallback });
```

### 4. Performance

Use throttle/debounce for frequent events:

```tsx
const throttledHandler = useMemo(
  () => throttle(() => {
    // Handler
  }, 16), // ~60fps
  []
);
```

---

## TypeScript Support

All hooks have full TypeScript support:

```tsx
// Generic type for element
const ref = useRef<HTMLDivElement>(null);
useSwipe(ref, options);

// Type-safe options
const options: UseSwipeOptions = {
  onSwipeLeft: (distance, velocity) => {
    // distance and velocity are typed as number
  },
};
```

---

## Next Steps

- Review [Mobile Gestures Guide](../guides/mobile-gestures.md)
- Check [Component Documentation](../components/README.md)
- Explore [Testing Hooks](../guides/testing.md)
