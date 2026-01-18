/**
 * Service Adapters Index
 *
 * Exports all service adapters for use with @letitrip/react-library components.
 *
 * Adapters bridge the gap between pure React library components and the
 * Next.js app's service layer (which makes actual API calls).
 *
 * @example
 * import { productServiceAdapter, auctionServiceAdapter } from '@/lib/adapters';
 * import { ProductList } from '@letitrip/react-library';
 *
 * <ProductList service={productServiceAdapter} />
 */

// Base adapter exports
export { BaseServiceAdapter } from "./base-adapter";
export { ServiceAdapter } from "./service-adapter";

// Type exports
export type {
  AdapterState,
  BulkOperationResponse,
  FilterParams,
  ListQueryParams,
  PaginatedResponse,
  PaginationParams,
  ServiceAdapterOptions,
  SortParams,
} from "./types";

// Product adapter
export {
  ProductServiceAdapter,
  productServiceAdapter,
} from "./product-adapter";
export type { IProductService } from "./product-adapter";

// TODO: Add more adapters as needed:
// export { AuctionServiceAdapter, auctionServiceAdapter } from './auction-adapter';
// export { ShopServiceAdapter, shopServiceAdapter } from './shop-adapter';
// export { CategoryServiceAdapter, categoryServiceAdapter } from './category-adapter';
// export { CartServiceAdapter, cartServiceAdapter } from './cart-adapter';
// export { CheckoutServiceAdapter, checkoutServiceAdapter } from './checkout-adapter';
// export { UserServiceAdapter, userServiceAdapter } from './user-adapter';

/**
 * Create custom adapter options
 */
export function createAdapterOptions(
  overrides?: Partial<ServiceAdapterOptions>,
): ServiceAdapterOptions {
  return {
    throwOnError: true,
    retryAttempts: 0,
    ...overrides,
  };
}
