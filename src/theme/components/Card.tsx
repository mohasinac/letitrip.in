import React from "react";
import { cn, cardStyles } from "../utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "bordered" | "ghost";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className,
  ...props
}) => {
  const baseClasses = cardStyles.base;
  const variantClasses = cardStyles.variants[variant];
  const paddingClasses = cardStyles.padding[padding];

  return (
    <div
      className={cn(baseClasses, variantClasses, paddingClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("border-b border-border pb-4 mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("border-t border-border pt-4 mt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};
