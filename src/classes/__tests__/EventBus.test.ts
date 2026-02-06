/**
 * @jest-environment jsdom
 */

import { EventBus } from "../EventBus";

describe("EventBus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    // Reset singleton instance
    (EventBus as any).instance = undefined;
    eventBus = EventBus.getInstance();
  });

  afterEach(() => {
    eventBus.removeAllListeners();
  });

  describe("Singleton Pattern", () => {
    it("should return same instance", () => {
      const bus1 = EventBus.getInstance();
      const bus2 = EventBus.getInstance();
      expect(bus1).toBe(bus2);
    });

    it("should initialize properly", () => {
      expect(eventBus).toBeInstanceOf(EventBus);
      expect(eventBus.eventNames()).toEqual([]);
    });
  });

  describe("on()", () => {
    it("should subscribe to event", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);

      expect(eventBus.hasListeners("test-event")).toBe(true);
      expect(eventBus.listenerCount("test-event")).toBe(1);
    });

    it("should return subscription object", () => {
      const callback = jest.fn();
      const subscription = eventBus.on("test-event", callback);

      expect(subscription).toHaveProperty("unsubscribe");
      expect(typeof subscription.unsubscribe).toBe("function");
    });

    it("should allow multiple subscribers", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);
      eventBus.on("test-event", callback3);

      expect(eventBus.listenerCount("test-event")).toBe(3);
    });

    it("should handle different events independently", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on("event1", callback1);
      eventBus.on("event2", callback2);

      expect(eventBus.listenerCount("event1")).toBe(1);
      expect(eventBus.listenerCount("event2")).toBe(1);
    });
  });

  describe("once()", () => {
    it("should subscribe to event once", () => {
      const callback = jest.fn();
      eventBus.once("test-event", callback);

      eventBus.emit("test-event");
      eventBus.emit("test-event");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should auto-unsubscribe after first call", () => {
      const callback = jest.fn();
      eventBus.once("test-event", callback);

      expect(eventBus.listenerCount("test-event")).toBe(1);

      eventBus.emit("test-event");

      expect(eventBus.listenerCount("test-event")).toBe(0);
    });

    it("should return subscription object", () => {
      const callback = jest.fn();
      const subscription = eventBus.once("test-event", callback);

      expect(subscription).toHaveProperty("unsubscribe");
    });

    it("should allow manual unsubscribe before emit", () => {
      const callback = jest.fn();
      const subscription = eventBus.once("test-event", callback);

      subscription.unsubscribe();
      eventBus.emit("test-event");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("emit()", () => {
    it("should call subscribed callbacks", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);

      eventBus.emit("test-event");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to callbacks", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);

      eventBus.emit("test-event", "arg1", "arg2", 123);

      expect(callback).toHaveBeenCalledWith("arg1", "arg2", 123);
    });

    it("should call multiple subscribers", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);
      eventBus.on("test-event", callback3);

      eventBus.emit("test-event");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
    });

    it("should do nothing for non-existent event", () => {
      expect(() => eventBus.emit("non-existent")).not.toThrow();
    });

    it("should handle errors in callbacks gracefully", () => {
      const errorSpy = jest.spyOn(console, "error").mockImplementation();
      const callback1 = jest.fn(() => {
        throw new Error("Callback error");
      });
      const callback2 = jest.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);

      eventBus.emit("test-event");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled(); // Should still be called
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it("should pass complex objects as arguments", () => {
      const callback = jest.fn();
      const data = {
        user: { name: "John", age: 30 },
        items: [1, 2, 3],
      };

      eventBus.on("test-event", callback);
      eventBus.emit("test-event", data);

      expect(callback).toHaveBeenCalledWith(data);
    });
  });

  describe("off()", () => {
    it("should unsubscribe from event", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);

      eventBus.off("test-event", callback);
      eventBus.emit("test-event");

      expect(callback).not.toHaveBeenCalled();
    });

    it("should only remove specified callback", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);

      eventBus.off("test-event", callback1);
      eventBus.emit("test-event");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("should handle non-existent event gracefully", () => {
      const callback = jest.fn();
      expect(() => eventBus.off("non-existent", callback)).not.toThrow();
    });

    it("should handle non-subscribed callback gracefully", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on("test-event", callback1);
      expect(() => eventBus.off("test-event", callback2)).not.toThrow();
    });

    it("should remove event when last listener is removed", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);

      eventBus.off("test-event", callback);

      expect(eventBus.eventNames()).not.toContain("test-event");
    });
  });

  describe("Subscription.unsubscribe()", () => {
    it("should unsubscribe using subscription object", () => {
      const callback = jest.fn();
      const subscription = eventBus.on("test-event", callback);

      subscription.unsubscribe();
      eventBus.emit("test-event");

      expect(callback).not.toHaveBeenCalled();
    });

    it("should be idempotent", () => {
      const callback = jest.fn();
      const subscription = eventBus.on("test-event", callback);

      subscription.unsubscribe();
      subscription.unsubscribe();
      subscription.unsubscribe();

      expect(() => eventBus.emit("test-event")).not.toThrow();
    });
  });

  describe("removeAllListeners()", () => {
    it("should remove all listeners for specific event", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      eventBus.on("test-event", callback1);
      eventBus.on("test-event", callback2);
      eventBus.on("other-event", callback1);

      eventBus.removeAllListeners("test-event");

      expect(eventBus.listenerCount("test-event")).toBe(0);
      expect(eventBus.listenerCount("other-event")).toBe(1);
    });

    it("should remove all listeners when no event specified", () => {
      eventBus.on("event1", jest.fn());
      eventBus.on("event2", jest.fn());
      eventBus.on("event3", jest.fn());

      eventBus.removeAllListeners();

      expect(eventBus.eventNames()).toEqual([]);
    });

    it("should handle non-existent event gracefully", () => {
      expect(() => eventBus.removeAllListeners("non-existent")).not.toThrow();
    });
  });

  describe("listenerCount()", () => {
    it("should return 0 for non-existent event", () => {
      expect(eventBus.listenerCount("non-existent")).toBe(0);
    });

    it("should return correct count", () => {
      eventBus.on("test-event", jest.fn());
      expect(eventBus.listenerCount("test-event")).toBe(1);

      eventBus.on("test-event", jest.fn());
      expect(eventBus.listenerCount("test-event")).toBe(2);

      eventBus.on("test-event", jest.fn());
      expect(eventBus.listenerCount("test-event")).toBe(3);
    });

    it("should update after unsubscribe", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);
      expect(eventBus.listenerCount("test-event")).toBe(1);

      eventBus.off("test-event", callback);
      expect(eventBus.listenerCount("test-event")).toBe(0);
    });
  });

  describe("eventNames()", () => {
    it("should return empty array initially", () => {
      expect(eventBus.eventNames()).toEqual([]);
    });

    it("should return all event names", () => {
      eventBus.on("event1", jest.fn());
      eventBus.on("event2", jest.fn());
      eventBus.on("event3", jest.fn());

      const names = eventBus.eventNames();
      expect(names).toHaveLength(3);
      expect(names).toContain("event1");
      expect(names).toContain("event2");
      expect(names).toContain("event3");
    });

    it("should not include duplicate event names", () => {
      eventBus.on("test-event", jest.fn());
      eventBus.on("test-event", jest.fn());

      const names = eventBus.eventNames();
      expect(names).toEqual(["test-event"]);
    });

    it("should update after removeAllListeners", () => {
      eventBus.on("event1", jest.fn());
      eventBus.on("event2", jest.fn());

      eventBus.removeAllListeners("event1");

      const names = eventBus.eventNames();
      expect(names).toEqual(["event2"]);
    });
  });

  describe("hasListeners()", () => {
    it("should return false for non-existent event", () => {
      expect(eventBus.hasListeners("non-existent")).toBe(false);
    });

    it("should return true when event has listeners", () => {
      eventBus.on("test-event", jest.fn());
      expect(eventBus.hasListeners("test-event")).toBe(true);
    });

    it("should return false after all listeners removed", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);

      eventBus.off("test-event", callback);

      expect(eventBus.hasListeners("test-event")).toBe(false);
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle user login event", () => {
      const onLogin = jest.fn();
      const onActivityLog = jest.fn();

      eventBus.on("user:login", onLogin);
      eventBus.on("user:login", onActivityLog);

      eventBus.emit("user:login", { userId: "123", timestamp: Date.now() });

      expect(onLogin).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "123" }),
      );
      expect(onActivityLog).toHaveBeenCalled();
    });

    it("should handle notification system", () => {
      const notifications: string[] = [];

      eventBus.on("notification", (message: string) => {
        notifications.push(message);
      });

      eventBus.emit("notification", "New message received");
      eventBus.emit("notification", "Friend request accepted");

      expect(notifications).toEqual([
        "New message received",
        "Friend request accepted",
      ]);
    });

    it("should handle theme change event", () => {
      const callback = jest.fn();
      eventBus.on("theme:changed", callback);

      eventBus.emit("theme:changed", { theme: "dark", previousTheme: "light" });

      expect(callback).toHaveBeenCalledWith({
        theme: "dark",
        previousTheme: "light",
      });
    });

    it("should handle modal open/close events", () => {
      const onOpen = jest.fn();
      const onClose = jest.fn();

      eventBus.on("modal:open", onOpen);
      eventBus.on("modal:close", onClose);

      eventBus.emit("modal:open", { modalId: "confirm-dialog" });
      eventBus.emit("modal:close", { modalId: "confirm-dialog" });

      expect(onOpen).toHaveBeenCalledWith({ modalId: "confirm-dialog" });
      expect(onClose).toHaveBeenCalledWith({ modalId: "confirm-dialog" });
    });
  });

  describe("Edge Cases", () => {
    it("should handle event names with special characters", () => {
      const callback = jest.fn();
      eventBus.on("user:action-complete", callback);

      eventBus.emit("user:action-complete");
      expect(callback).toHaveBeenCalled();
    });

    it("should handle many listeners on one event", () => {
      const callbacks = Array(100)
        .fill(null)
        .map(() => jest.fn());
      callbacks.forEach((cb) => eventBus.on("test-event", cb));

      eventBus.emit("test-event");

      callbacks.forEach((cb) => expect(cb).toHaveBeenCalled());
    });

    it("should handle rapid emit calls", () => {
      const callback = jest.fn();
      eventBus.on("test-event", callback);

      for (let i = 0; i < 1000; i++) {
        eventBus.emit("test-event", i);
      }

      expect(callback).toHaveBeenCalledTimes(1000);
    });

    it("should handle callback that emits another event", () => {
      const callback1 = jest.fn(() => {
        eventBus.emit("event2");
      });
      const callback2 = jest.fn();

      eventBus.on("event1", callback1);
      eventBus.on("event2", callback2);

      eventBus.emit("event1");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
});
