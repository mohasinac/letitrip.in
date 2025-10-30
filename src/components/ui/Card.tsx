/**
 * Reusable Card Component with Theme Support
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'feature' | 'hero';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variantClasses = {
  default: 'card',
  elevated: 'card-elevated',
  feature: 'card-feature',
  hero: 'card-hero',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { 
      children, 
      variant = 'default', 
      hover = false, 
      padding = 'md',
      className, 
      ...props 
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          hover && 'card-hover',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('mb-4', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('heading-sm', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-muted text-small', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('mt-4 pt-4 border-t border-border', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
