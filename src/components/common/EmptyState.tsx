"use client";

import { ReactNode } from "react";
import {
  ShoppingBag,
  Heart,
  Gavel,
  Package,
  Search,
  Users,
  FileText,
} from "lucide-react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="mb-6 p-4 rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 mb-8 max-w-md leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Predefined empty state scenarios
export const EmptyStates = {
  NoProducts: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<ShoppingBag className="w-12 h-12" />}
      title="No products found"
      description="We couldn't find any products matching your criteria. Try adjusting your filters or search terms."
      {...props}
    />
  ),

  EmptyCart: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<ShoppingBag className="w-12 h-12" />}
      title="Your cart is empty"
      description="Start adding products to your cart to see them here. Browse our collection to find what you need."
      {...props}
    />
  ),

  NoFavorites: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Heart className="w-12 h-12" />}
      title="No favorites yet"
      description="You haven't added any products to your favorites. Click the heart icon on products you love to save them here."
      {...props}
    />
  ),

  NoAuctions: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Gavel className="w-12 h-12" />}
      title="No active auctions"
      description="There are no active auctions at the moment. Check back soon or create your first auction."
      {...props}
    />
  ),

  NoOrders: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Package className="w-12 h-12" />}
      title="No orders yet"
      description="You haven't placed any orders. Start shopping to see your order history here."
      {...props}
    />
  ),

  NoSearchResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Search className="w-12 h-12" />}
      title="No results found"
      description="We couldn't find anything matching your search. Try using different keywords or check your spelling."
      {...props}
    />
  ),

  NoUsers: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<Users className="w-12 h-12" />}
      title="No users found"
      description="There are no users matching your criteria. Try adjusting your filters."
      {...props}
    />
  ),

  NoData: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={<FileText className="w-12 h-12" />}
      title="No data available"
      description="There is no data to display at this time. Check back later or try refreshing."
      {...props}
    />
  ),
};
