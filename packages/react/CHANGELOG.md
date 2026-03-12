# @mohasinac/react — Changelog

## [0.1.0] — 2026-01-01 — Initial extraction

### Added

- **`useMediaQuery(query: string): boolean`** — Detects if a CSS media query matches the current viewport. SSR-safe (returns `false` on server).
- **`useBreakpoint()`** — Returns `{ isMobile, isTablet, isDesktop, breakpoint }` based on Tailwind default breakpoints (< 768px / 768–1023px / ≥ 1024px).
- **`useClickOutside(ref, callback, options?)`** — Fires `callback` when a click/touch occurs outside `ref`. Supports `additionalRefs`, `enabled`, and `eventType` options.
- **`useKeyPress(key, callback, options?)`** — Detects keyboard events with optional modifier keys (`ctrl`, `shift`, `alt`, `meta`). Supports multiple keys and custom targets.
- **`useLongPress(callback, ms?)`** — Fires `callback` after holding for `ms` ms (default 500). Returns pointer/touch event handlers to spread onto an element.
- **`useGesture(ref, options?)`** — Detects tap, double-tap, pinch, and rotate touch gestures. Mouse events handled for basic tap/double-tap on desktop.
- **`useSwipe(ref, options?)`** — Detects swipe gestures in all 4 directions (`left|right|up|down`) on touch and mouse. Configurable `minSwipeDistance`, `maxSwipeTime`, `velocityThreshold`.
- **`useCamera()`** — MediaDevices camera hook. `startCamera`, `stopCamera`, `takePhoto`, `startRecording`, `stopRecording`, `switchCamera`. Auto-cleanup on unmount.
- **`usePullToRefresh(onRefresh, options?)`** — Touch pull-to-refresh hook. Returns `{ containerRef, isPulling, progress }`. Triggers `onRefresh` when pull distance exceeds threshold.
- **`useCountdown(endDate)`** — Countdown timer returning `{ days, hours, minutes, seconds }` or `null` when expired. Updates every second. Handles `Date`, ISO string, and Firestore Timestamp shapes.
