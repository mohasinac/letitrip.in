/**
 * Event Bus Class
 *
 * Singleton class for event-driven communication
 */

type EventCallback = (...args: any[]) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

export class EventBus {
  private static instance: EventBus;
  private events: Map<string, EventCallback[]>;

  private constructor() {
    this.events = new Map();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  public on(event: string, callback: EventCallback): EventSubscription {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const callbacks = this.events.get(event)!;
    callbacks.push(callback);

    // Return subscription object
    return {
      unsubscribe: () => this.off(event, callback),
    };
  }

  /**
   * Subscribe to an event once (auto-unsubscribes after first call)
   */
  public once(event: string, callback: EventCallback): EventSubscription {
    const wrappedCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, wrappedCallback);
    };

    return this.on(event, wrappedCallback);
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event
   */
  public emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  public listenerCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }

  /**
   * Get all event names
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Check if event has listeners
   */
  public hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
