/**
 * Service Adapter Pattern
 *
 * Adapters bridge the gap between @letitrip/react-library components
 * and the Next.js app's service layer.
 *
 * Library components don't make API calls directly. Instead, they accept
 * service interfaces as props, and the app provides adapters that implement
 * these interfaces using the app's services.
 *
 * Benefits:
 * - Library remains framework-agnostic
 * - Easy testing (mock the adapter)
 * - Separation of concerns
 * - Type-safe API contracts
 */

import { BaseServiceAdapter } from "./base-adapter";
import type { ServiceAdapterOptions } from "./types";

/**
 * Base class for all service adapters
 * Provides common functionality like error handling, loading states, etc.
 */
export abstract class ServiceAdapter<TData = any> extends BaseServiceAdapter {
  constructor(options?: ServiceAdapterOptions) {
    super(options);
  }

  /**
   * Execute an API call with standardized error handling
   */
  protected async execute<T>(
    apiCall: () => Promise<T>,
    errorMessage?: string,
  ): Promise<T> {
    try {
      this.setLoading(true);
      const result = await apiCall();
      this.setLoading(false);
      this.clearError();
      return result;
    } catch (error) {
      this.setLoading(false);
      this.setError(error as Error, errorMessage);
      throw error;
    }
  }

  /**
   * Transform backend data to frontend format
   * Override in specific adapters
   */
  protected abstract transformResponse(data: any): TData;
}

export default ServiceAdapter;
