# Mobile Optimization & Gesture Support Documentation

Complete guide to mobile-optimized features and gesture support in the LetItRip application.

## Overview

The application now includes comprehensive mobile optimization with touch gesture support, efficient event handling, and mobile-first interactive components.

## Table of Contents

- [Gesture Hooks](#gesture-hooks)
- [Global Event Handlers](#global-event-handlers)
- [Mobile-Optimized Components](#mobile-optimized-components)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Gesture Hooks

### useSwipe

Detects swipe gestures on both touch and mouse events.

**Import:**
```tsx
import { useSwipe } from '@/hooks';
```

**Usage:**
```tsx
const ref = useRef<HTMLDivElement>(null);

useSwipe(ref, {
  onSwipeLeft: () => console.log('Swiped left'),
  onSwipeRight: () => console.log('Swiped right'),
  onSwipeUp: () => console.log('Swiped up'),
  onSwipeDown: () => console.log('Swiped down'),
  onSwiping: (deltaX, deltaY) => {
    // Track swipe progress
  },
  minSwipeDistance: 50, // Minimum distance in px
  maxSwipeTime: 300, // Maximum time in ms
  velocityThreshold: 0.3, // Minimum velocity
  preventDefault: false,
});

<div ref={ref}>Swipe me!</div>
```

**Options:**
- `minSwipeDistance` (default: 50) - Minimum pixels to register as swipe
- `maxSwipeTime` (default: 300) - Maximum milliseconds for swipe gesture
- `velocityThreshold` (default: 0.3) - Minimum swipe velocity (px/ms)
- `onSwipe` - Callback with direction, distance, and velocity
- `onSwipeLeft/Right/Up/Down` - Direction-specific callbacks
- `onSwiping` - Called during swipe for drag effects
- `onSwipeStart/End` - Lifecycle callbacks
- `preventDefault` - Prevent default touch behavior

---

### useGesture

Detects multiple gesture types including tap, double tap, long press, pinch, and rotate.

**Import:**
```tsx
import { useGesture } from '@/hooks';
```

**Usage:**
```tsx
const ref = useRef<HTMLDivElement>(null);

useGesture(ref, {
  onTap: (x, y) => console.log('Tapped at', x, y),
  onDoubleTap: (x, y) => console.log('Double tapped'),
  onLongPress: (x, y) => console.log('Long pressed'),
  onPinch: (scale, distance) => {
    // Pinch completed
    setZoom(scale);
  },
  onPinching: (scale) => {
    // During pinch
    setPreviewZoom(scale);
  },
  onRotate: (angle) => console.log('Rotated', angle),
  doubleTapDelay: 300, // Time between taps
  longPressDelay: 500, // Time to trigger long press
  tapMovementThreshold: 10, // Max movement for tap
});

<div ref={ref}>Touch me!</div>
```

**Options:**
- `onTap` - Single tap callback with coordinates
- `onDoubleTap` - Double tap callback
- `onLongPress` - Long press callback
- `onPinch` - Pinch gesture complete (scale, distance)
- `onPinching` - During pinch gesture (scale)
- `onRotate` - Rotation complete (angle in degrees)
- `onRotating` - During rotation (angle)
- `doubleTapDelay` (default: 300ms)
- `longPressDelay` (default: 500ms)
- `tapMovementThreshold` (default: 10px)

---

### useLongPress

Simplified hook for long press detection.

**Import:**
```tsx
import { useLongPress } from '@/hooks';
```

**Usage:**
```tsx
const longPressHandlers = useLongPress({
  onLongPress: (e) => {
    console.log('Long pressed!');
    showContextMenu(e);
  },
  onLongPressStart: () => setHighlight(true),
  onLongPressCancel: () => setHighlight(false),
  delay: 500,
  movementThreshold: 10,
  preventContextMenu: true,
});

<button {...longPressHandlers}>
  Press and hold
</button>
```

**Options:**
- `onLongPress` (required) - Callback when long press triggers
- `onLongPressStart` - Called when long press starts
- `onLongPressCancel` - Called if cancelled
- `delay` (default: 500ms) - Time to trigger
- `movementThreshold` (default: 10px) - Max movement allowed
- `preventContextMenu` (default: true) - Prevent native context menu

---

### useClickOutside

Detects clicks outside element(s).

**Import:**
```tsx
import { useClickOutside } from '@/hooks';
```

**Usage:**
```tsx
const dropdownRef = useRef<HTMLDivElement>(null);
const triggerRef = useRef<HTMLButtonElement>(null);

useClickOutside(
  dropdownRef,
  () => setIsOpen(false),
  {
    enabled: isOpen,
    additionalRefs: [triggerRef], // Don't close when clicking trigger
    eventType: 'mousedown', // or 'mouseup', 'click'
  }
);
```

**Options:**
- `enabled` (default: true) - Enable/disable the hook
- `eventType` (default: 'mousedown') - Event to listen for
- `additionalRefs` - Array of refs that should be considered "inside"

---

### useKeyPress

Keyboard event detection with modifier support.

**Import:**
```tsx
import { useKeyPress } from '@/hooks';
```

**Usage:**
```tsx
// Simple key
useKeyPress('Escape', handleClose);

// Key combination (Ctrl+S)
useKeyPress('s', handleSave, {
  ctrl: true,
  preventDefault: true,
});

// Multiple keys
useKeyPress(['Enter', 'NumpadEnter'], handleSubmit);

// With all modifiers
useKeyPress('z', handleUndo, {
  ctrl: true,
  shift: true,
  alt: false,
  meta: false,
});
```

**Options:**
- `enabled` (default: true) - Enable/disable hook
- `eventType` (default: 'keydown') - 'keydown', 'keyup', or 'keypress'
- `preventDefault` (default: false) - Prevent default behavior
- `ctrl`, `shift`, `alt`, `meta` - Modifier key requirements

---

## Global Event Handlers

Centralized event management for improved performance.

### Global Event Manager

**Import:**
```tsx
import { globalEventManager } from '@/utils/eventHandlers';
```

**Usage:**
```tsx
// Add event listener
const handlerId = globalEventManager.add(
  window,
  'scroll',
  handleScroll,
  { passive: true }
);

// Remove specific handler
globalEventManager.remove(handlerId);

// Remove all handlers for target
globalEventManager.removeAllForTarget(window, 'scroll');

// Clear all handlers
globalEventManager.clear();

// Check handler count
const count = globalEventManager.getHandlerCount();
```

### Helper Functions

**Throttle:**
```tsx
import { throttle } from '@/utils/eventHandlers';

const handleScroll = throttle(() => {
  console.log('Scrolled');
}, 100); // Execute at most once per 100ms
```

**Debounce:**
```tsx
import { debounce } from '@/utils/eventHandlers';

const handleSearch = debounce((query) => {
  performSearch(query);
}, 300); // Wait 300ms after last call
```

**Global Handlers:**
```tsx
import {
  addGlobalScrollHandler,
  addGlobalResizeHandler,
  addGlobalClickHandler,
  addGlobalKeyHandler,
  removeGlobalHandler,
} from '@/utils/eventHandlers';

// Scroll with throttling
const scrollId = addGlobalScrollHandler(
  handleScroll,
  { throttle: 100, target: window }
);

// Resize with throttling
const resizeId = addGlobalResizeHandler(
  handleResize,
  { throttle: 200 }
);

// Delegated click handler
const clickId = addGlobalClickHandler(
  '.button',
  (event, element) => {
    console.log('Button clicked', element);
  },
  { preventDefault: true }
);

// Global keyboard shortcut
const keyId = addGlobalKeyHandler(
  's',
  handleSave,
  { ctrl: true, preventDefault: true }
);

// Remove when done
removeGlobalHandler(scrollId);
```

### Utility Functions

```tsx
import {
  isMobileDevice,
  hasTouchSupport,
  getViewportDimensions,
  isInViewport,
  smoothScrollTo,
  preventBodyScroll,
} from '@/utils/eventHandlers';

// Device detection
if (isMobileDevice()) {
  // Mobile-specific code
}

if (hasTouchSupport()) {
  // Touch-enabled device
}

// Viewport
const { width, height } = getViewportDimensions();

// Check visibility
if (isInViewport(element, 100)) {
  // Element is visible (with 100px offset)
}

// Smooth scroll
smoothScrollTo(element, { offset: 80, duration: 500 });
smoothScrollTo('#section', { offset: 80 });

// Body scroll lock (for modals)
preventBodyScroll(true); // Lock
preventBodyScroll(false); // Unlock
```

---

## Mobile-Optimized Components

### Sidebar

**Features:**
- Swipe right to close
- Automatic body scroll prevention
- Touch-optimized interactions

**Usage:**
```tsx
<Sidebar
  isOpen={sidebarOpen}
  isDark={isDark}
  onClose={() => setSidebarOpen(false)}
/>
```

The sidebar automatically:
- Locks body scroll when open
- Allows swipe-right gesture to close
- Prevents touch propagation

---

### Modal

**Features:**
- Swipe down to dismiss
- Visual feedback during swipe
- Touch-optimized close button
- Body scroll prevention

**Usage:**
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
  size="md"
>
  Content here
</Modal>
```

The modal automatically:
- Locks body scroll when open
- Allows swipe-down gesture to dismiss (requires 100px swipe)
- Shows visual feedback during swipe
- Resets position if swipe is cancelled

---

### Dropdown & Menu

**Features:**
- Click outside to close
- Escape key to close
- Touch-optimized spacing

**Usage:**
```tsx
<Dropdown>
  <DropdownTrigger>
    <button>Menu</button>
  </DropdownTrigger>
  <DropdownMenu>
    <DropdownItem onClick={handleAction}>Action</DropdownItem>
  </DropdownMenu>
</Dropdown>
```

Both components now use:
- `useClickOutside` for better performance
- `useKeyPress` for keyboard support
- Touch-friendly button sizes

---

### ImageGallery (New)

**Features:**
- Swipe navigation between images
- Pinch to zoom
- Double tap to zoom
- Touch-optimized thumbnail scrolling
- Keyboard navigation (arrows, escape)

**Usage:**
```tsx
import { ImageGallery } from '@/components';

<ImageGallery
  images={[
    {
      src: '/image1.jpg',
      alt: 'Beautiful sunset',
      caption: 'Sunset at the beach',
      thumbnail: '/thumb1.jpg', // Optional
    },
    {
      src: '/image2.jpg',
      alt: 'Mountain view',
    },
  ]}
  initialIndex={0}
  showThumbnails={true}
  showCaptions={true}
  allowZoom={true}
  onImageChange={(index) => console.log('Image changed', index)}
/>
```

**Props:**
- `images` (required) - Array of image objects
- `initialIndex` (default: 0) - Starting image
- `showThumbnails` (default: true) - Show thumbnail strip
- `showCaptions` (default: true) - Show image captions
- `allowZoom` (default: true) - Enable pinch-to-zoom
- `onImageChange` - Callback when image changes

**Gestures:**
- Swipe left/right: Navigate images
- Double tap: Zoom in/out
- Pinch: Zoom with precise control
- Drag: Scroll thumbnail strip
- Arrow keys: Navigate
- Escape: Reset zoom

---

## Best Practices

### 1. Performance

**Use Global Event Manager:**
```tsx
// ❌ Bad: Multiple event listeners
useEffect(() => {
  window.addEventListener('scroll', handleScroll1);
  window.addEventListener('scroll', handleScroll2);
  window.addEventListener('scroll', handleScroll3);
}, []);

// ✅ Good: Centralized management
const scrollId = addGlobalScrollHandler(
  handleScroll,
  { throttle: 100 }
);
```

**Throttle/Debounce Expensive Operations:**
```tsx
// ❌ Bad: Runs on every scroll
const handleScroll = () => {
  // Expensive calculation
  updateLayout();
};

// ✅ Good: Throttled
const handleScroll = throttle(() => {
  updateLayout();
}, 100);
```

### 2. Touch Targets

**Minimum Touch Target Size:**
```tsx
// ✅ Good: 44x44px minimum (Apple HIG)
<button className="p-3 min-w-[44px] min-h-[44px]">
  Icon
</button>

// ✅ Better: Touch-friendly spacing
<button className="p-3 md:p-2 touch-manipulation">
  Icon
</button>
```

### 3. Gesture Conflicts

**Prevent Scroll During Gestures:**
```tsx
useSwipe(ref, {
  onSwiping: (deltaX, deltaY) => {
    // Visual feedback
  },
  preventDefault: true, // Prevents scroll during swipe
});
```

**Conditional Gestures:**
```tsx
// Only allow swipe when not zoomed
useSwipe(containerRef, {
  onSwipeLeft: () => {
    if (!isZoomed) nextImage();
  },
  onSwipeRight: () => {
    if (!isZoomed) previousImage();
  },
});
```

### 4. Accessibility

**Support Both Touch and Keyboard:**
```tsx
// Swipe gestures
useSwipe(ref, {
  onSwipeLeft: nextSlide,
  onSwipeRight: previousSlide,
});

// Keyboard navigation
useKeyPress('ArrowLeft', previousSlide);
useKeyPress('ArrowRight', nextSlide);
```

**Provide Visual Feedback:**
```tsx
const [isDragging, setIsDragging] = useState(false);

useSwipe(ref, {
  onSwipeStart: () => setIsDragging(true),
  onSwipeEnd: () => setIsDragging(false),
});

<div className={isDragging ? 'opacity-50' : ''}>
  Swipeable content
</div>
```

### 5. Mobile-First CSS

**Touch Optimization:**
```css
/* Improve touch responsiveness */
.touch-manipulation {
  touch-action: manipulation;
}

/* Prevent text selection during gestures */
.select-none {
  user-select: none;
  -webkit-user-select: none;
}

/* Smooth scrolling for touch */
.overflow-scroll {
  -webkit-overflow-scrolling: touch;
}

/* Snap scrolling */
.snap-x {
  scroll-snap-type: x mandatory;
}
.snap-center {
  scroll-snap-align: center;
}
```

---

## Examples

### Image Viewer with Zoom

```tsx
function ImageViewer({ src }: { src: string }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useGesture(imageRef, {
    onDoubleTap: () => {
      setScale(scale === 1 ? 2 : 1);
    },
    onPinch: (newScale) => {
      setScale(Math.max(1, Math.min(newScale, 3)));
    },
  });

  useSwipe(imageRef, {
    onSwiping: (deltaX, deltaY) => {
      if (scale > 1) {
        setPosition({ x: deltaX, y: deltaY });
      }
    },
  });

  return (
    <div ref={imageRef} className="overflow-hidden">
      <img
        src={src}
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
        }}
        className="transition-transform"
      />
    </div>
  );
}
```

### Dismissible Card

```tsx
function DismissibleCard({ onDismiss }: { onDismiss: () => void }) {
  const [offset, setOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useSwipe(cardRef, {
    onSwiping: (deltaX) => {
      if (deltaX < 0) setOffset(deltaX);
    },
    onSwipeLeft: (distance) => {
      if (distance > 100) {
        onDismiss();
      } else {
        setOffset(0);
      }
    },
    onSwipeEnd: () => setOffset(0),
  });

  return (
    <div
      ref={cardRef}
      style={{
        transform: `translateX(${offset}px)`,
        transition: offset === 0 ? 'transform 0.2s' : 'none',
      }}
      className="bg-white p-4 rounded shadow"
    >
      Swipe left to dismiss
    </div>
  );
}
```

### Context Menu

```tsx
function ContextMenuItem() {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const longPressHandlers = useLongPress({
    onLongPress: (e) => {
      const pos = 'touches' in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };
      setMenuPosition(pos);
    },
    delay: 500,
  });

  return (
    <>
      <div {...longPressHandlers} className="p-4 bg-gray-100">
        Press and hold for menu
      </div>

      {menuPosition && (
        <ContextMenu
          x={menuPosition.x}
          y={menuPosition.y}
          onClose={() => setMenuPosition(null)}
        />
      )}
    </>
  );
}
```

### Pull to Refresh

```tsx
function PullToRefresh({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useSwipe(containerRef, {
    onSwiping: (_, deltaY) => {
      if (deltaY > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(deltaY, 100));
      }
    },
    onSwipeDown: async (distance) => {
      if (distance > 80 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
      setPullDistance(0);
    },
    onSwipeEnd: () => setPullDistance(0),
  });

  return (
    <div ref={containerRef}>
      <div
        style={{
          height: pullDistance,
          transition: isRefreshing ? 'height 0.2s' : 'none',
        }}
        className="flex items-center justify-center"
      >
        {pullDistance > 80 && '↻ Release to refresh'}
        {pullDistance > 0 && pullDistance < 80 && '↓ Pull down'}
      </div>
      {/* Content */}
    </div>
  );
}
```

---

## Migration Guide

### Updating Existing Components

**Before:**
```tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setIsOpen(false);
  };

  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('keydown', handleEscape);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  };
}, []);
```

**After:**
```tsx
import { useClickOutside, useKeyPress } from '@/hooks';

useClickOutside(ref, () => setIsOpen(false), { enabled: isOpen });
useKeyPress('Escape', () => setIsOpen(false), { enabled: isOpen });
```

---

## Testing

### Testing Gesture Hooks

```tsx
import { renderHook } from '@testing-library/react';
import { useSwipe } from '@/hooks';

describe('useSwipe', () => {
  it('detects swipe left', () => {
    const ref = { current: document.createElement('div') };
    const onSwipeLeft = jest.fn();

    renderHook(() => useSwipe(ref, { onSwipeLeft }));

    // Simulate touch events
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 0 }],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 20, clientY: 0 }],
    });

    ref.current.dispatchEvent(touchStart);
    ref.current.dispatchEvent(touchEnd);

    expect(onSwipeLeft).toHaveBeenCalled();
  });
});
```

---

## Browser Support

- ✅ iOS Safari 12+
- ✅ Android Chrome 70+
- ✅ Desktop Chrome, Firefox, Safari, Edge
- ✅ Progressive enhancement: Falls back to click/keyboard on non-touch devices

---

## Performance Considerations

1. **Event Listener Cleanup**: All hooks properly clean up listeners
2. **Passive Events**: Touch events use `passive: true` where possible
3. **Throttling**: Scroll/resize handlers are throttled by default
4. **Memory Management**: Global event manager tracks all handlers
5. **Bundle Size**: Hooks are tree-shakeable

---

## Troubleshooting

### Swipe Not Working

```tsx
// ✅ Ensure ref is attached
const ref = useRef<HTMLDivElement>(null);
useSwipe(ref, options);
<div ref={ref}>...</div>

// ✅ Check preventDefault setting
useSwipe(ref, {
  preventDefault: true, // May be needed for some browsers
});
```

### Gesture Conflicts

```tsx
// ✅ Conditional gesture handling
useSwipe(ref, {
  onSwipeLeft: () => {
    if (!isZoomed && !isModal) {
      nextSlide();
    }
  },
});
```

### Performance Issues

```tsx
// ✅ Use throttling
const handleMove = throttle((deltaX, deltaY) => {
  updatePosition(deltaX, deltaY);
}, 16); // ~60fps

useSwipe(ref, { onSwiping: handleMove });
```

---

## Further Reading

- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [Apple Human Interface Guidelines - Touch](https://developer.apple.com/design/human-interface-guidelines/inputs/touchscreen-gestures/)
- [Material Design - Gestures](https://material.io/design/interaction/gestures.html)
