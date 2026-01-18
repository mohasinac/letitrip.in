/**
 * Polyfills for SSR compatibility
 * Libraries like react-quill use 'self' which doesn't exist in Node.js
 */

if (typeof self === "undefined") {
  (global as any).self = global;
}

if (typeof window === "undefined" && typeof global !== "undefined") {
  (global as any).window = (global as any).window || {};
}

export {};
