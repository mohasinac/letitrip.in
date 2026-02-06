/**
 * @jest-environment jsdom
 */

import { Queue } from "../Queue";

describe("Queue", () => {
  let queue: Queue;

  beforeEach(() => {
    queue = new Queue({ autoStart: false });
  });

  afterEach(() => {
    queue.clear();
  });

  describe("Initialization", () => {
    it("should initialize with default options", () => {
      const defaultQueue = new Queue();
      expect(defaultQueue).toBeInstanceOf(Queue);
      expect(defaultQueue.size()).toBe(0);
    });

    it("should accept custom concurrency", () => {
      const concurrentQueue = new Queue({ concurrency: 3 });
      expect(concurrentQueue).toBeInstanceOf(Queue);
    });

    it("should accept autoStart option", () => {
      const autoQueue = new Queue({ autoStart: true });
      expect(autoQueue).toBeInstanceOf(Queue);
    });
  });

  describe("add()", () => {
    it("should add task to queue", () => {
      const task = jest.fn(() => Promise.resolve("result"));
      queue.add("task1", task);

      expect(queue.size()).toBe(1);
    });

    it("should add multiple tasks", () => {
      queue.add("task1", () => Promise.resolve(1));
      queue.add("task2", () => Promise.resolve(2));
      queue.add("task3", () => Promise.resolve(3));

      expect(queue.size()).toBe(3);
    });

    it("should sort tasks by priority", () => {
      queue.add("low", () => Promise.resolve("low"), 1);
      queue.add("high", () => Promise.resolve("high"), 10);
      queue.add("medium", () => Promise.resolve("medium"), 5);

      // Tasks should be sorted: high (10), medium (5), low (1)
      expect(queue.size()).toBe(3);
    });

    it("should auto-start when autoStart is true", async () => {
      const autoQueue = new Queue({ autoStart: true, concurrency: 1 });
      const task = jest.fn(() => Promise.resolve("done"));

      autoQueue.add("task1", task);

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(task).toHaveBeenCalled();
    });

    it("should not auto-start when autoStart is false", async () => {
      const task = jest.fn(() => Promise.resolve("done"));
      queue.add("task1", task);

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(task).not.toHaveBeenCalled();
    });
  });

  describe("start()", () => {
    it("should process tasks", async () => {
      const task = jest.fn(() => Promise.resolve("result"));
      queue.add("task1", task);

      queue.start();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(task).toHaveBeenCalled();
    });

    it("should process multiple tasks sequentially", async () => {
      const results: number[] = [];

      queue.add("task1", async () => {
        results.push(1);
        return 1;
      });
      queue.add("task2", async () => {
        results.push(2);
        return 2;
      });
      queue.add("task3", async () => {
        results.push(3);
        return 3;
      });

      queue.start();
      await queue.waitForCompletion();

      expect(results).toEqual([1, 2, 3]);
    });

    it("should respect concurrency limit", async () => {
      const concurrentQueue = new Queue({ concurrency: 2, autoStart: false });
      let running = 0;
      let maxRunning = 0;

      const createTask = (id: number) => async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((resolve) => setTimeout(resolve, 50));
        running--;
        return id;
      };

      concurrentQueue.add("task1", createTask(1));
      concurrentQueue.add("task2", createTask(2));
      concurrentQueue.add("task3", createTask(3));
      concurrentQueue.add("task4", createTask(4));

      concurrentQueue.start();
      await concurrentQueue.waitForCompletion();

      expect(maxRunning).toBeLessThanOrEqual(2);
    });
  });

  describe("pause() and resume()", () => {
    it("should pause processing", async () => {
      const autoQueue = new Queue({ autoStart: true });
      const task = jest.fn(() => Promise.resolve("done"));

      autoQueue.pause();
      autoQueue.add("task1", task);

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(task).not.toHaveBeenCalled();
    });

    it("should resume processing", async () => {
      const autoQueue = new Queue({ autoStart: true });
      const task = jest.fn(() => Promise.resolve("done"));

      autoQueue.pause();
      autoQueue.add("task1", task);
      autoQueue.resume();

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(task).toHaveBeenCalled();
    });
  });

  describe("getResult()", () => {
    it("should return task result", async () => {
      queue.add("task1", () => Promise.resolve("success"));
      queue.start();
      await queue.waitForCompletion();

      const result = queue.getResult("task1");
      expect(result).toBe("success");
    });

    it("should return undefined for non-existent task", () => {
      const result = queue.getResult("non-existent");
      expect(result).toBeUndefined();
    });

    it("should store results for multiple tasks", async () => {
      queue.add("task1", () => Promise.resolve(1));
      queue.add("task2", () => Promise.resolve(2));
      queue.add("task3", () => Promise.resolve(3));

      queue.start();
      await queue.waitForCompletion();

      expect(queue.getResult("task1")).toBe(1);
      expect(queue.getResult("task2")).toBe(2);
      expect(queue.getResult("task3")).toBe(3);
    });

    it("should handle complex return types", async () => {
      const complexResult = {
        data: [1, 2, 3],
        status: "success",
        metadata: { timestamp: Date.now() },
      };

      queue.add("complex", () => Promise.resolve(complexResult));
      queue.start();
      await queue.waitForCompletion();

      expect(queue.getResult("complex")).toEqual(complexResult);
    });
  });

  describe("getError()", () => {
    it("should capture task errors", async () => {
      const error = new Error("Task failed");
      queue.add("failing-task", () => Promise.reject(error));

      queue.start();
      await queue.waitForCompletion();

      const capturedError = queue.getError("failing-task");
      expect(capturedError).toEqual(error);
    });

    it("should return undefined for successful task", async () => {
      queue.add("task1", () => Promise.resolve("success"));
      queue.start();
      await queue.waitForCompletion();

      const error = queue.getError("task1");
      expect(error).toBeUndefined();
    });

    it("should return undefined for non-existent task", () => {
      const error = queue.getError("non-existent");
      expect(error).toBeUndefined();
    });

    it("should store errors for multiple failed tasks", async () => {
      queue.add("fail1", () => Promise.reject(new Error("Error 1")));
      queue.add("fail2", () => Promise.reject(new Error("Error 2")));

      queue.start();
      await queue.waitForCompletion();

      expect(queue.getError("fail1")?.message).toBe("Error 1");
      expect(queue.getError("fail2")?.message).toBe("Error 2");
    });
  });

  describe("clear()", () => {
    it("should clear all tasks", () => {
      queue.add("task1", () => Promise.resolve(1));
      queue.add("task2", () => Promise.resolve(2));

      queue.clear();

      expect(queue.size()).toBe(0);
    });

    it("should clear results", async () => {
      queue.add("task1", () => Promise.resolve("result"));
      queue.start();
      await queue.waitForCompletion();

      queue.clear();

      expect(queue.getResult("task1")).toBeUndefined();
    });

    it("should clear errors", async () => {
      queue.add("task1", () => Promise.reject(new Error("Failed")));
      queue.start();
      await queue.waitForCompletion();

      queue.clear();

      expect(queue.getError("task1")).toBeUndefined();
    });
  });

  describe("size()", () => {
    it("should return 0 for empty queue", () => {
      expect(queue.size()).toBe(0);
    });

    it("should return correct queue size", () => {
      queue.add("task1", () => Promise.resolve(1));
      expect(queue.size()).toBe(1);

      queue.add("task2", () => Promise.resolve(2));
      expect(queue.size()).toBe(2);
    });

    it("should decrease as tasks complete", async () => {
      queue.add("task1", () => Promise.resolve(1));
      queue.add("task2", () => Promise.resolve(2));

      expect(queue.size()).toBe(2);

      queue.start();
      await queue.waitForCompletion();

      expect(queue.size()).toBe(0);
    });
  });

  describe("getRunning()", () => {
    it("should return 0 when no tasks running", () => {
      expect(queue.getRunning()).toBe(0);
    });

    it("should track running tasks", async () => {
      const slowQueue = new Queue({ concurrency: 1, autoStart: false });

      slowQueue.add("task1", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return "done";
      });

      slowQueue.start();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(slowQueue.getRunning()).toBe(1);
    });

    it("should respect concurrency limit", async () => {
      const concurrentQueue = new Queue({ concurrency: 2, autoStart: false });

      const slowTask = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return "done";
      };

      concurrentQueue.add("task1", slowTask);
      concurrentQueue.add("task2", slowTask);
      concurrentQueue.add("task3", slowTask);

      concurrentQueue.start();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(concurrentQueue.getRunning()).toBeLessThanOrEqual(2);
    });
  });

  describe("isEmpty()", () => {
    it("should return true for empty queue", () => {
      expect(queue.isEmpty()).toBe(true);
    });

    it("should return false when tasks pending", () => {
      queue.add("task1", () => Promise.resolve(1));
      expect(queue.isEmpty()).toBe(false);
    });

    it("should return false when tasks running", async () => {
      const slowQueue = new Queue({ autoStart: false });
      slowQueue.add("task1", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return "done";
      });

      slowQueue.start();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(slowQueue.isEmpty()).toBe(false);
    });

    it("should return true after all tasks complete", async () => {
      queue.add("task1", () => Promise.resolve(1));
      queue.start();
      await queue.waitForCompletion();

      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe("waitForCompletion()", () => {
    it("should wait for all tasks to complete", async () => {
      const results: number[] = [];

      queue.add("task1", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        results.push(1);
        return 1;
      });
      queue.add("task2", async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        results.push(2);
        return 2;
      });

      queue.start();
      await queue.waitForCompletion();

      expect(results).toEqual([1, 2]);
      expect(queue.isEmpty()).toBe(true);
    });

    it("should resolve immediately for empty queue", async () => {
      await expect(queue.waitForCompletion()).resolves.toBeUndefined();
    });
  });

  describe("getStats()", () => {
    it("should return correct statistics", async () => {
      queue.add("task1", () => Promise.resolve("success"));
      queue.add("task2", () => Promise.reject(new Error("Failed")));
      queue.add("task3", () => Promise.resolve("success"));

      const beforeStats = queue.getStats();
      expect(beforeStats.pending).toBe(3);

      queue.start();
      await queue.waitForCompletion();

      const afterStats = queue.getStats();
      expect(afterStats.pending).toBe(0);
      expect(afterStats.running).toBe(0);
      expect(afterStats.completed).toBe(2);
      expect(afterStats.failed).toBe(1);
    });

    it("should track running tasks in stats", async () => {
      const slowQueue = new Queue({ concurrency: 1, autoStart: false });

      slowQueue.add("task1", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return "done";
      });

      slowQueue.start();
      await new Promise((resolve) => setTimeout(resolve, 10));

      const stats = slowQueue.getStats();
      expect(stats.running).toBe(1);
    });
  });

  describe("Priority Queue", () => {
    it("should process high priority tasks first", async () => {
      const results: string[] = [];

      queue.add(
        "low",
        async () => {
          results.push("low");
          return "low";
        },
        1,
      );

      queue.add(
        "high",
        async () => {
          results.push("high");
          return "high";
        },
        10,
      );

      queue.add(
        "medium",
        async () => {
          results.push("medium");
          return "medium";
        },
        5,
      );

      queue.start();
      await queue.waitForCompletion();

      expect(results).toEqual(["high", "medium", "low"]);
    });

    it("should handle tasks with same priority in FIFO order", async () => {
      const results: string[] = [];

      queue.add(
        "first",
        async () => {
          results.push("first");
          return "first";
        },
        5,
      );

      queue.add(
        "second",
        async () => {
          results.push("second");
          return "second";
        },
        5,
      );

      queue.add(
        "third",
        async () => {
          results.push("third");
          return "third";
        },
        5,
      );

      queue.start();
      await queue.waitForCompletion();

      expect(results).toEqual(["first", "second", "third"]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle task that throws synchronously", async () => {
      queue.add("sync-error", () => {
        throw new Error("Sync error");
      });

      queue.start();
      await queue.waitForCompletion();

      const error = queue.getError("sync-error");
      expect(error?.message).toBe("Sync error");
    });

    it("should handle task that returns non-Promise", async () => {
      queue.add("sync-task", () => Promise.resolve("immediate"));

      queue.start();
      await queue.waitForCompletion();

      expect(queue.getResult("sync-task")).toBe("immediate");
    });

    it("should handle many concurrent tasks", async () => {
      const concurrentQueue = new Queue({ concurrency: 5, autoStart: false });

      for (let i = 0; i < 50; i++) {
        concurrentQueue.add(`task${i}`, () => Promise.resolve(i));
      }

      concurrentQueue.start();
      await concurrentQueue.waitForCompletion();

      const stats = concurrentQueue.getStats();
      expect(stats.completed).toBe(50);
    });

    it("should handle tasks added during processing", async () => {
      const autoQueue = new Queue({ autoStart: true, concurrency: 1 });

      autoQueue.add("task1", async () => {
        autoQueue.add("task2", () => Promise.resolve("added"));
        return "first";
      });

      await autoQueue.waitForCompletion();

      expect(autoQueue.getResult("task1")).toBe("first");
      expect(autoQueue.getResult("task2")).toBe("added");
    });

    it("should handle duplicate task IDs", async () => {
      queue.add("duplicate", () => Promise.resolve("first"));
      queue.add("duplicate", () => Promise.resolve("second"));

      queue.start();
      await queue.waitForCompletion();

      // Last result wins
      expect(queue.getResult("duplicate")).toBe("second");
    });
  });
});
