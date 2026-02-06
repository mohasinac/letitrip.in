/**
 * Queue Class
 *
 * Generic queue implementation for task management
 */

export interface QueueOptions {
  concurrency?: number;
  autoStart?: boolean;
}

export interface Task<T = any> {
  id: string;
  fn: () => Promise<T>;
  priority?: number;
}

export class Queue<T = any> {
  private tasks: Task<T>[] = [];
  private running: number = 0;
  private concurrency: number;
  private autoStart: boolean;
  private results: Map<string, T> = new Map();
  private errors: Map<string, Error> = new Map();

  constructor(options?: QueueOptions) {
    this.concurrency = options?.concurrency || 1;
    this.autoStart = options?.autoStart ?? true;
  }

  /**
   * Add task to queue
   */
  public add(id: string, fn: () => Promise<T>, priority: number = 0): void {
    this.tasks.push({ id, fn, priority });

    // Sort by priority (higher first)
    this.tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    if (this.autoStart) {
      this.process();
    }
  }

  /**
   * Process queue
   */
  private async process(): Promise<void> {
    while (this.running < this.concurrency && this.tasks.length > 0) {
      const task = this.tasks.shift();
      if (!task) break;

      this.running++;

      try {
        const result = await task.fn();
        this.results.set(task.id, result);
      } catch (error) {
        this.errors.set(task.id, error as Error);
      } finally {
        this.running--;
        this.process(); // Continue processing
      }
    }
  }

  /**
   * Start processing queue
   */
  public start(): void {
    this.process();
  }

  /**
   * Pause queue processing
   */
  public pause(): void {
    this.autoStart = false;
  }

  /**
   * Resume queue processing
   */
  public resume(): void {
    this.autoStart = true;
    this.process();
  }

  /**
   * Clear all tasks
   */
  public clear(): void {
    this.tasks = [];
    this.results.clear();
    this.errors.clear();
  }

  /**
   * Get result for task ID
   */
  public getResult(id: string): T | undefined {
    return this.results.get(id);
  }

  /**
   * Get error for task ID
   */
  public getError(id: string): Error | undefined {
    return this.errors.get(id);
  }

  /**
   * Get queue size
   */
  public size(): number {
    return this.tasks.length;
  }

  /**
   * Get number of running tasks
   */
  public getRunning(): number {
    return this.running;
  }

  /**
   * Check if queue is empty
   */
  public isEmpty(): boolean {
    return this.tasks.length === 0 && this.running === 0;
  }

  /**
   * Wait for all tasks to complete
   */
  public async waitForCompletion(): Promise<void> {
    while (!this.isEmpty()) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Get queue statistics
   */
  public getStats(): {
    pending: number;
    running: number;
    completed: number;
    failed: number;
  } {
    return {
      pending: this.tasks.length,
      running: this.running,
      completed: this.results.size,
      failed: this.errors.size,
    };
  }
}
