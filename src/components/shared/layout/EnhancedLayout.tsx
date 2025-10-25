"use client";

import { ReactNode } from "react";
import { NavigationProvider } from "@/contexts/NavigationContext";
import RouteTransition from "@/components/ui/RouteTransition";
import PageHeader from "@/components/ui/PageHeader";

interface EnhancedLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBreadcrumbs?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  enableTransitions?: boolean;
  className?: string;
}

export default function EnhancedLayout({
  children,
  showHeader = true,
  showBreadcrumbs = true,
  headerTitle,
  headerSubtitle,
  enableTransitions = true,
  className = "",
}: EnhancedLayoutProps) {
  const content = enableTransitions ? (
    <RouteTransition>{children}</RouteTransition>
  ) : (
    children
  );

  return (
    <NavigationProvider>
      <div className={`min-h-screen ${className}`}>
        {showHeader && (
          <PageHeader
            title={headerTitle}
            subtitle={headerSubtitle}
            showBreadcrumbs={showBreadcrumbs}
          />
        )}

        <main className="flex-1">{content}</main>
      </div>
    </NavigationProvider>
  );
}

// HOC to wrap existing layouts with enhanced navigation
export function withEnhancedNavigation<T extends object>(
  Component: React.ComponentType<T>
) {
  return function EnhancedComponent(props: T) {
    return (
      <NavigationProvider>
        <Component {...props} />
      </NavigationProvider>
    );
  };
}
