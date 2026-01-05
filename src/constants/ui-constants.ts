/**
 * UI Interactions & Performance Constants
 *
 * Constants for debouncing, throttling, animations, and user interaction
 * timing to optimize UI performance and responsiveness.
 */

// ============================================================================
// DEBOUNCE & THROTTLE DELAYS (milliseconds)
// ============================================================================

export const DEBOUNCE_DELAYS = {
  // Search input debouncing
  SEARCH_INPUT: 500, // 500ms for search inputs
  FILTER_INPUT: 300, // 300ms for filter changes

  // Form input debouncing
  FORM_INPUT: 400, // 400ms for form field changes
  TEXT_AREA: 500, // 500ms for textarea

  // Auto-save debouncing
  AUTO_SAVE: 1000, // 1 second before auto-saving
  DRAFT_SAVE: 2000, // 2 seconds for draft saves

  // API calls
  API_CALL: 400, // 400ms for API-triggered actions

  // General purpose
  DEFAULT: 500, // 500ms default
  QUICK: 200, // 200ms for quick operations
  LONG: 1000, // 1 second for longer operations
} as const;

export const THROTTLE_INTERVALS = {
  // Scroll events
  SCROLL: 100, // Check scroll every 100ms
  RESIZE: 150, // Check resize every 150ms

  // Mouse events
  MOUSE_MOVE: 50, // Throttle mouse move every 50ms
  MOUSE_WHEEL: 100, // Throttle scroll every 100ms

  // Touch events
  TOUCH_MOVE: 50, // Throttle touch move every 50ms

  // General purpose
  DEFAULT: 500, // 500ms default interval
} as const;

// ============================================================================
// ANIMATION TIMINGS (milliseconds)
// ============================================================================

export const ANIMATION_TIMINGS = {
  // Quick animations (decorative)
  QUICK: 150, // 150ms for hover effects
  FAST: 200, // 200ms for quick transitions

  // Standard animations
  DEFAULT: 300, // 300ms standard animation
  NORMAL: 350, // 350ms typical transitions

  // Slow animations
  SLOW: 500, // 500ms for emphasis
  VERY_SLOW: 1000, // 1s for important transitions

  // Modal/Dialog animations
  MODAL_OPEN: 300, // Modal opening animation
  MODAL_CLOSE: 200, // Modal closing animation

  // Page transitions
  PAGE_TRANSITION: 300, // Page change animation
} as const;

// ============================================================================
// TRANSITION DELAYS (milliseconds)
// ============================================================================

export const TRANSITION_DELAYS = {
  // Staggered animations
  STAGGER_BASE: 50, // Base stagger unit
  STAGGER_ITEM_1: 50, // First item offset
  STAGGER_ITEM_2: 100, // Second item offset
  STAGGER_ITEM_3: 150, // Third item offset

  // Sequential delays
  SEQUENTIAL_SHORT: 200, // 200ms between sequential items
  SEQUENTIAL_NORMAL: 300, // 300ms between items
  SEQUENTIAL_LONG: 500, // 500ms between items
} as const;

// ============================================================================
// LOADING & POLLING INTERVALS
// ============================================================================

export const POLLING_INTERVALS = {
  // Real-time updates
  VERY_FREQUENT: 3000, // Every 3 seconds
  FREQUENT: 5000, // Every 5 seconds
  NORMAL: 10000, // Every 10 seconds

  // Background polling
  INFREQUENT: 30000, // Every 30 seconds
  RARE: 60000, // Every 1 minute

  // Long polling
  LONG_POLLING: 25000, // Long poll timeout (25s)
} as const;

export const LOADING_TIMINGS = {
  // Minimum show time for loaders
  MIN_LOADER_DISPLAY: 200, // At least 200ms to avoid flashing

  // Skeleton screen delays
  SKELETON_DELAY: 300, // Show skeleton for at least 300ms

  // Loading state timeouts
  TIMEOUT_WARNING: 5000, // Warn if takes > 5s
  TIMEOUT_ERROR: 30000, // Error if takes > 30s
} as const;

// ============================================================================
// TOAST & NOTIFICATION TIMINGS
// ============================================================================

export const NOTIFICATION_TIMINGS = {
  // Toast durations
  SHORT: 3000, // 3 seconds
  MEDIUM: 5000, // 5 seconds
  LONG: 8000, // 8 seconds
  PERMANENT: 0, // Until dismissed

  // Error messages
  ERROR_DURATION: 8000, // 8 seconds for errors
  SUCCESS_DURATION: 3000, // 3 seconds for success
  INFO_DURATION: 5000, // 5 seconds for info
  WARNING_DURATION: 5000, // 5 seconds for warnings

  // Animation timing
  ENTER_ANIMATION: 300, // 300ms to enter
  EXIT_ANIMATION: 250, // 250ms to exit

  // Stacking
  STACK_OFFSET: 70, // 70px between stacked notifications
} as const;

// ============================================================================
// DROPDOWN & MENU TIMINGS
// ============================================================================

export const MENU_TIMINGS = {
  // Open/close animations
  OPEN_DELAY: 0, // Immediate
  CLOSE_DELAY: 100, // 100ms delay before closing

  // Submenu timings
  SUBMENU_OPEN_DELAY: 200, // 200ms before opening submenu
  SUBMENU_CLOSE_DELAY: 300, // 300ms before closing submenu

  // Hover timings
  HOVER_OPEN_DELAY: 100, // 100ms hover before opening
  HOVER_CLOSE_DELAY: 150, // 150ms hover before closing
} as const;

// ============================================================================
// DOUBLE-CLICK & GESTURE DETECTION
// ============================================================================

export const GESTURE_TIMINGS = {
  // Double-click detection
  DOUBLE_CLICK_DELAY: 300, // 300ms between clicks for double-click

  // Long press detection
  LONG_PRESS_DELAY: 500, // 500ms for long press

  // Gesture distance threshold (pixels)
  SWIPE_DISTANCE_MIN: 50, // Minimum swipe distance
  SWIPE_DISTANCE_CANCEL: 20, // Cancel if less than this

  // Tap vs scroll detection
  TAP_SCROLL_THRESHOLD: 100, // ms before considering as scroll vs tap
} as const;

// ============================================================================
// FOCUS & KEYBOARD INTERACTIONS
// ============================================================================

export const KEYBOARD_TIMINGS = {
  // Key repeat timing
  KEY_REPEAT_START: 500, // 500ms before key starts repeating
  KEY_REPEAT_INTERVAL: 30, // 30ms between repeats

  // Input auto-complete delay
  AUTOCOMPLETE_DELAY: 200, // 200ms before showing autocomplete
  AUTOCOMPLETE_CLOSE_DELAY: 100, // 100ms to close autocomplete
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get stagger delay for a list item
 * @param index Item index (0-based)
 * @param staggerAmount Amount to stagger per item
 * @returns Delay in milliseconds
 */
export function getStaggerDelay(
  index: number,
  staggerAmount: number = TRANSITION_DELAYS.STAGGER_BASE
): number {
  return index * staggerAmount;
}

/**
 * Get sequential item delay
 * @param index Item index
 * @param delayBetweenItems Delay between items
 * @returns Total delay for this item
 */
export function getSequentialDelay(
  index: number,
  delayBetweenItems: number = TRANSITION_DELAYS.SEQUENTIAL_NORMAL
): number {
  return index * delayBetweenItems;
}

/**
 * Convert animation duration to CSS animation string
 * @param duration Duration in milliseconds
 * @returns CSS animation-duration string
 */
export function toCSSAnimation(duration: number): string {
  return `${duration}ms`;
}

/**
 * Check if double-click occurred based on timestamps
 * @param lastClickTime Previous click timestamp
 * @param currentClickTime Current click timestamp
 * @returns True if double-click detected
 */
export function isDoubleClick(
  lastClickTime: number,
  currentClickTime: number
): boolean {
  return currentClickTime - lastClickTime < GESTURE_TIMINGS.DOUBLE_CLICK_DELAY;
}
