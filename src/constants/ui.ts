// UI-related constants
export const COLORS = {
  PRIMARY: 'hsl(var(--primary))',
  SECONDARY: 'hsl(var(--secondary))',
  BACKGROUND: 'hsl(var(--background))',
  FOREGROUND: 'hsl(var(--foreground))',
  MUTED: 'hsl(var(--muted))',
  ACCENT: 'hsl(var(--accent))',
  DESTRUCTIVE: 'hsl(var(--destructive))',
  SUCCESS: 'hsl(var(--success))',
  WARNING: 'hsl(var(--warning))',
  INFO: 'hsl(var(--info))',
} as const;

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

export const ANIMATIONS = {
  DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
  },
  EASING: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    IN: 'cubic-bezier(0.4, 0, 1, 1)',
    OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

export const LAYOUTS = {
  HEADER_HEIGHT: '64px',
  SIDEBAR_WIDTH: '256px',
  SIDEBAR_COLLAPSED_WIDTH: '64px',
  FOOTER_HEIGHT: '80px',
} as const;
