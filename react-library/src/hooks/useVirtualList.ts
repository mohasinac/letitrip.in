/**
 * useVirtualList Hook
 *
 * Framework-agnostic hook for implementing virtual scrolling with large lists.
 * Virtual scrolling only renders items visible in the viewport, dramatically
 * improving performance for lists with hundreds or thousands of items.
 *
 * Uses @tanstack/react-virtual under the hood.
 *
 * Features:
 * - Virtual scrolling for vertical and horizontal lists
 * - Dynamic item sizing support
 * - Overscan for smoother scrolling
 * - Gap/spacing support
 * - Grid virtualization helper
 * - Scroll to index/offset
 * - Element measurement for dynamic sizes
 *
 * @example
 * ```tsx
 * // Basic vertical list
 * function ProductList({ products }) {
 *   const { virtualItems, totalSize, parentRef } = useVirtualList({
 *     count: products.length,
 *     estimateSize: 200,
 *     overscan: 5
 *   });
 *
 *   return (
 *     <div ref={parentRef} className="h-screen overflow-auto">
 *       <div style={{ height: `${totalSize}px`, position: 'relative' }}>
 *         {virtualItems.map((item) => (
 *           <div
 *             key={item.key}
 *             style={{
 *               position: 'absolute',
 *               top: 0,
 *               left: 0,
 *               width: '100%',
 *               height: `${item.size}px`,
 *               transform: `translateY(${item.start}px)`
 *             }}
 *           >
 *             <ProductCard product={products[item.index]} />
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 *
 * // With dynamic sizing
 * function DynamicList({ items }) {
 *   const { virtualItems, totalSize, parentRef, measureElement } = useVirtualList({
 *     count: items.length,
 *     estimateSize: 100,
 *     dynamic: true
 *   });
 *
 *   return (
 *     <div ref={parentRef} className="h-screen overflow-auto">
 *       <div style={{ height: `${totalSize}px`, position: 'relative' }}>
 *         {virtualItems.map((item) => (
 *           <div
 *             key={item.key}
 *             data-index={item.index}
 *             ref={measureElement}
 *             style={{
 *               position: 'absolute',
 *               top: 0,
 *               left: 0,
 *               width: '100%',
 *               transform: `translateY(${item.start}px)`
 *             }}
 *           >
 *             <ItemCard item={items[item.index]} />
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 *
 * // Horizontal scrolling
 * function HorizontalCarousel({ items }) {
 *   const { virtualItems, totalSize, parentRef } = useVirtualList({
 *     count: items.length,
 *     estimateSize: 300,
 *     horizontal: true,
 *     gap: 16
 *   });
 *
 *   return (
 *     <div ref={parentRef} className="w-screen overflow-x-auto">
 *       <div style={{ width: `${totalSize}px`, display: 'flex' }}>
 *         {virtualItems.map((item) => (
 *           <div
 *             key={item.key}
 *             style={{
 *               width: `${item.size}px`,
 *               marginLeft: item.index === 0 ? 0 : '16px'
 *             }}
 *           >
 *             <ItemCard item={items[item.index]} />
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";

export interface UseVirtualListOptions {
  /** Total number of items in the list */
  count: number;
  /** Estimated size of each item in pixels (default: 50) */
  estimateSize?: number;
  /** Number of items to render outside visible area (default: 5) */
  overscan?: number;
  /** Enable horizontal scrolling instead of vertical (default: false) */
  horizontal?: boolean;
  /** Scroll margin in pixels (default: 0) */
  scrollMargin?: number;
  /** Gap between items in pixels (default: 0) */
  gap?: number;
  /** Enable dynamic item sizing (default: false) */
  dynamic?: boolean;
}

export interface UseVirtualListReturn<
  TScrollElement extends Element = HTMLDivElement,
  TItemElement extends Element = Element
> {
  /** Array of virtual items to render */
  virtualItems: VirtualItem[];
  /** Total size of the scrollable area */
  totalSize: number;
  /** Ref to attach to the scrollable container */
  parentRef: React.RefObject<TScrollElement>;
  /** Measure an item's actual size (for dynamic sizing) */
  measureElement: (element: TItemElement | null | undefined) => void;
  /** Scroll to a specific item index */
  scrollToIndex: ReturnType<
    typeof useVirtualizer<TScrollElement, TItemElement>
  >["scrollToIndex"];
  /** Scroll to a specific offset */
  scrollToOffset: ReturnType<
    typeof useVirtualizer<TScrollElement, TItemElement>
  >["scrollToOffset"];
  /** Get the virtualizer instance for advanced use cases */
  virtualizer: ReturnType<typeof useVirtualizer<TScrollElement, TItemElement>>;
}

/**
 * Hook for implementing virtual scrolling with large lists
 */
export function useVirtualList<
  TScrollElement extends Element = HTMLDivElement,
  TItemElement extends Element = Element
>(
  options: UseVirtualListOptions
): UseVirtualListReturn<TScrollElement, TItemElement> {
  const {
    count,
    estimateSize = 50,
    overscan = 5,
    horizontal = false,
    scrollMargin = 0,
    gap = 0,
    dynamic = false,
  } = options;

  const parentRef = useRef<TScrollElement>(null);

  // Adjust estimate size to include gap
  const adjustedEstimateSize = useMemo(() => {
    return gap > 0 ? estimateSize + gap : estimateSize;
  }, [estimateSize, gap]);

  // Create virtualizer
  const virtualizer = useVirtualizer<TScrollElement, TItemElement>({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => adjustedEstimateSize,
    overscan,
    horizontal,
    scrollMargin,
    // Enable measurement for dynamic sizing
    ...(dynamic && {
      measureElement:
        typeof window !== "undefined" &&
        navigator.userAgent.indexOf("Firefox") === -1
          ? (element) =>
              element?.getBoundingClientRect()[horizontal ? "width" : "height"]
          : undefined,
    }),
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return {
    virtualItems,
    totalSize,
    parentRef,
    measureElement: virtualizer.measureElement,
    scrollToIndex: virtualizer.scrollToIndex,
    scrollToOffset: virtualizer.scrollToOffset,
    virtualizer,
  };
}

/**
 * Hook for grid-based virtual scrolling
 *
 * @example
 * ```tsx
 * function ProductGrid({ products }) {
 *   const columns = 4;
 *   const { virtualItems, totalSize, parentRef } = useVirtualGrid({
 *     count: products.length,
 *     columns,
 *     estimateSize: 300 // Height of each row
 *   });
 *
 *   return (
 *     <div ref={parentRef} className="h-screen overflow-auto">
 *       <div style={{ height: `${totalSize}px`, position: 'relative' }}>
 *         {virtualItems.map((virtualRow) => {
 *           const startIndex = virtualRow.index * columns;
 *           const rowProducts = products.slice(startIndex, startIndex + columns);
 *           return (
 *             <div
 *               key={virtualRow.key}
 *               style={{
 *                 position: 'absolute',
 *                 top: 0,
 *                 left: 0,
 *                 width: '100%',
 *                 height: `${virtualRow.size}px`,
 *                 transform: `translateY(${virtualRow.start}px)`
 *               }}
 *             >
 *               <div className="grid grid-cols-4 gap-4">
 *                 {rowProducts.map((product) => (
 *                   <ProductCard key={product.id} product={product} />
 *                 ))}
 *               </div>
 *             </div>
 *           );
 *         })}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVirtualGrid(
  options: UseVirtualListOptions & {
    /** Number of columns in the grid */
    columns: number;
  }
) {
  const { columns, ...virtualOptions } = options;

  // Calculate row count
  const rowCount = Math.ceil(virtualOptions.count / columns);

  const result = useVirtualList({
    ...virtualOptions,
    count: rowCount,
  });

  return {
    ...result,
    columns,
    rowCount,
  };
}

export default useVirtualList;
