# `@lir/react` Package

**Package:** `packages/react/`  
**Alias:** `@lir/react`  
**Purpose:** Framework-level React hooks for device input, responsive design, gestures, camera, and timers. No business logic — purely presentational / device-level.

All hooks are re-exported through `src/hooks/` so feature code imports them via `@/hooks`.

---

## `useBreakpoint`

Returns the current active Tailwind CSS breakpoint.

```ts
function useBreakpoint(): "base" | "sm" | "md" | "lg" | "xl" | "2xl";
```

```ts
const bp = useBreakpoint();
if (bp === "lg") showDesktopLayout();
```

---

## `useMediaQuery`

Subscribes to a raw CSS media query.

```ts
function useMediaQuery(query: string): boolean;
```

```ts
const isDark = useMediaQuery("(prefers-color-scheme: dark)");
const isMobile = useMediaQuery("(max-width: 767px)");
```

---

## `useClickOutside`

Calls a handler when a click occurs outside the referenced element. Used for dismissing dropdowns and modals.

```ts
interface UseClickOutsideOptions {
  enabled?: boolean; // default: true
  events?: string[]; // default: ["mousedown", "touchstart"]
}

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  options?: UseClickOutsideOptions,
): void;
```

---

## `useKeyPress`

Fires a callback when a specific keyboard key is pressed.

```ts
interface KeyModifiers {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

interface UseKeyPressOptions {
  modifiers?: KeyModifiers;
  target?: EventTarget; // default: document
  enabled?: boolean;
  preventDefault?: boolean;
}

function useKeyPress(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options?: UseKeyPressOptions,
): void;
```

```ts
useKeyPress("Escape", () => closeModal());
useKeyPress("k", () => openSearch(), { modifiers: { ctrl: true } });
```

---

## `useLongPress`

Detects long press / touch hold interactions (fires after configurable delay).

```ts
function useLongPress<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  delay?: number, // default: 500ms
): void;
```

---

## `useGesture`

Multi-gesture recognizer: pinch, rotate, swipe, pan.

```ts
type GestureType = "pinch" | "rotate" | "swipe" | "pan";

interface UseGestureOptions {
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onSwipe?: (direction: SwipeDirection, distance: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  threshold?: number; // minimum movement to trigger (default: 10px)
  enabled?: boolean;
}

function useGesture<T extends HTMLElement>(
  ref: RefObject<T>,
  options: UseGestureOptions,
): void;
```

---

## `useSwipe`

Simplified swipe-only gesture detection (subset of `useGesture`).

```ts
type SwipeDirection = "left" | "right" | "up" | "down";

interface UseSwipeOptions {
  threshold?: number; // default: 50px
  timeout?: number; // max gesture duration ms (default: 500)
  enabled?: boolean;
}

function useSwipe<T extends HTMLElement>(
  ref: RefObject<T>,
  options: {
    onSwipe: (direction: SwipeDirection) => void;
  } & UseSwipeOptions,
): void;
```

---

## `useCamera`

Accesses the device camera for photo capture. Used in `AvatarUpload` and `CameraCapture`.

```ts
interface UseCameraOptions {
  facingMode?: "user" | "environment"; // default: "environment"
  quality?: number; // 0-1 JPEG quality (default: 0.9)
  maxWidth?: number; // downscale captured image
}

interface UseCameraReturn {
  videoRef: RefObject<HTMLVideoElement>;
  isReady: boolean;
  isCapturing: boolean;
  error: Error | null;
  capture: () => Promise<Blob>;
  start: () => Promise<void>;
  stop: () => void;
  switchCamera: () => Promise<void>;
}

function useCamera(options?: UseCameraOptions): UseCameraReturn;
```

---

## `usePullToRefresh`

Adds pull-to-refresh behaviour to a scrollable container.

```ts
interface UsePullToRefreshOptions {
  threshold?: number; // pull distance to trigger refresh (default: 80px)
  resistance?: number; // pull resistance multiplier (default: 2.5)
  enabled?: boolean;
}

interface UsePullToRefreshReturn {
  containerRef: RefObject<HTMLDivElement>;
  isPulling: boolean;
  pullDistance: number; // current pull offset in px
  isRefreshing: boolean;
}

function usePullToRefresh(
  onRefresh: () => Promise<void>,
  options?: UsePullToRefreshOptions,
): UsePullToRefreshReturn;
```

---

## `useCountdown`

Countdown timer that re-renders every second until the target date.

```ts
interface CountdownRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  expired: boolean;
}

function useCountdown(targetDate: Date | string | number): CountdownRemaining;
```

```ts
const { days, hours, minutes, seconds, expired } = useCountdown(auction.endsAt);

if (expired) return <span>Auction ended</span>;
return <span>{hours}h {minutes}m {seconds}s</span>;
```

Used in `AuctionCard`, `EventBanner`, and `CountdownDisplay`.
