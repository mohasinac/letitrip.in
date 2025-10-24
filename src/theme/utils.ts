import { theme } from './index';

// Utility functions for theme access
export const getColor = (colorName: string, shade?: string | number) => {
  const colorPath = colorName.split('.');
  let color: any = theme.colors;
  
  for (const path of colorPath) {
    color = color[path];
    if (!color) return undefined;
  }
  
  if (shade && typeof color === 'object') {
    return color[shade];
  }
  
  return color;
};

// CSS custom property helper
export const getCSSVar = (property: string) => {
  return `var(--${property})`;
};

// Create CSS classes dynamically
export const createColorClasses = (colorName: string, type: 'bg' | 'text' | 'border' = 'bg') => {
  const color = getColor(colorName);
  if (!color || typeof color === 'string') return '';
  
  const classes: string[] = [];
  Object.keys(color).forEach(shade => {
    classes.push(`${type}-${colorName}-${shade}`);
  });
  
  return classes;
};

// Responsive helper
export const responsive = (styles: Record<string, any>) => {
  const breakpoints = theme.screens;
  let css = '';
  
  Object.entries(styles).forEach(([breakpoint, style]) => {
    if (breakpoint === 'default') {
      css += style;
    } else if (breakpoints[breakpoint as keyof typeof breakpoints]) {
      css += `@media (min-width: ${breakpoints[breakpoint as keyof typeof breakpoints]}) { ${style} }`;
    }
  });
  
  return css;
};

// Theme-aware component props
export interface ThemeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Common component styles
export const buttonStyles = {
  base: 'btn',
  variants: {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'bg-success text-white hover:bg-success-600',
    warning: 'bg-warning text-white hover:bg-warning-600',
    error: 'btn-destructive',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  },
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  },
};

export const cardStyles = {
  base: 'card',
  variants: {
    default: '',
    elevated: 'shadow-md',
    bordered: 'border-2',
    ghost: 'border-0 shadow-none',
  },
  padding: {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
};

// Generate className helper
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Theme-aware spacing
export const spacing = theme.spacing;
export const colors = theme.colors;
export const typography = theme.typography;
export const borderRadius = theme.borderRadius;
export const boxShadow = theme.boxShadow;
export const screens = theme.screens;
