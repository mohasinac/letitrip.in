/**
 * Base Service Adapter
 * Common functionality for all service adapters
 */

import type { AdapterState, ServiceAdapterOptions } from "./types";

export class BaseServiceAdapter {
  protected state: AdapterState = {
    loading: false,
    error: null,
  };

  protected options: ServiceAdapterOptions;

  constructor(options: ServiceAdapterOptions = {}) {
    this.options = {
      throwOnError: true,
      retryAttempts: 0,
      ...options,
    };
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.state.loading = loading;
    this.options.onLoadingChange?.(loading);
  }

  /**
   * Set error state
   */
  protected setError(error: Error, customMessage?: string): void {
    this.state.error = customMessage ? new Error(customMessage) : error;
    this.options.onError?.(this.state.error);

    if (this.options.throwOnError) {
      throw this.state.error;
    }
  }

  /**
   * Clear error state
   */
  protected clearError(): void {
    this.state.error = null;
  }

  /**
   * Get current state
   */
  public getState(): AdapterState {
    return { ...this.state };
  }

  /**
   * Check if adapter is loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Get current error
   */
  public getError(): Error | null {
    return this.state.error;
  }
}
