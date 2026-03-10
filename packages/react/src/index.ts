/**
 * @lir/react — Generic React hooks
 *
 * Stage F2: 10 pure browser/React hooks extracted from the app.
 * Zero domain dependencies — safe for use in any React project.
 */

// Viewport / media breakpoints
export { useMediaQuery } from "./hooks/useMediaQuery";
export { useBreakpoint } from "./hooks/useBreakpoint";

// DOM interaction
export { useClickOutside } from "./hooks/useClickOutside";
export type { UseClickOutsideOptions } from "./hooks/useClickOutside";
export { useKeyPress } from "./hooks/useKeyPress";
export type { KeyModifiers, UseKeyPressOptions } from "./hooks/useKeyPress";
export { useLongPress } from "./hooks/useLongPress";

// Touch / gesture
export { useGesture } from "./hooks/useGesture";
export type { GestureType, UseGestureOptions } from "./hooks/useGesture";
export { useSwipe } from "./hooks/useSwipe";
export type { SwipeDirection, UseSwipeOptions } from "./hooks/useSwipe";
export { usePullToRefresh } from "./hooks/usePullToRefresh";
export type {
  UsePullToRefreshOptions,
  UsePullToRefreshReturn,
} from "./hooks/usePullToRefresh";

// Timer / countdown
export { useCountdown } from "./hooks/useCountdown";
export type { CountdownRemaining } from "./hooks/useCountdown";

// Device / hardware
export { useCamera } from "./hooks/useCamera";
export type { UseCameraOptions, UseCameraReturn } from "./hooks/useCamera";
