import { Vector2D } from "../types/game";

/**
 * Vector utility functions for 2D game physics
 */

export const vectorAdd = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const vectorSubtract = (a: Vector2D, b: Vector2D): Vector2D => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const vectorMultiply = (v: Vector2D, scalar: number): Vector2D => ({
  x: v.x * scalar,
  y: v.y * scalar,
});

export const vectorDivide = (v: Vector2D, scalar: number): Vector2D => {
  if (scalar === 0) throw new Error("Division by zero");
  return {
    x: v.x / scalar,
    y: v.y / scalar,
  };
};

export const vectorLength = (v: Vector2D): number => {
  return Math.sqrt(v.x * v.x + v.y * v.y);
};

export const vectorLengthSquared = (v: Vector2D): number => {
  return v.x * v.x + v.y * v.y;
};

export const vectorNormalize = (v: Vector2D): Vector2D => {
  const length = vectorLength(v);
  if (length === 0) return { x: 0, y: 0 };
  return { x: v.x / length, y: v.y / length };
};

export const vectorDistance = (a: Vector2D, b: Vector2D): number => {
  return vectorLength(vectorSubtract(a, b));
};

export const vectorDistanceSquared = (a: Vector2D, b: Vector2D): number => {
  return vectorLengthSquared(vectorSubtract(a, b));
};

export const vectorDot = (a: Vector2D, b: Vector2D): number => {
  return a.x * b.x + a.y * b.y;
};

export const vectorCross = (a: Vector2D, b: Vector2D): number => {
  return a.x * b.y - a.y * b.x;
};

export const vectorAngle = (v: Vector2D): number => {
  return Math.atan2(v.y, v.x);
};

export const vectorFromAngle = (
  angle: number,
  length: number = 1,
): Vector2D => ({
  x: Math.cos(angle) * length,
  y: Math.sin(angle) * length,
});

export const vectorRotate = (v: Vector2D, angle: number): Vector2D => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: v.x * cos - v.y * sin,
    y: v.x * sin + v.y * cos,
  };
};

export const vectorLerp = (a: Vector2D, b: Vector2D, t: number): Vector2D => {
  t = Math.max(0, Math.min(1, t)); // Clamp t between 0 and 1
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
};

export const vectorClamp = (
  v: Vector2D,
  min: Vector2D,
  max: Vector2D,
): Vector2D => ({
  x: Math.max(min.x, Math.min(max.x, v.x)),
  y: Math.max(min.y, Math.min(max.y, v.y)),
});

export const vectorProject = (a: Vector2D, b: Vector2D): Vector2D => {
  const bLengthSq = vectorLengthSquared(b);
  if (bLengthSq === 0) return { x: 0, y: 0 };

  const dot = vectorDot(a, b);
  const scalar = dot / bLengthSq;
  return vectorMultiply(b, scalar);
};

export const vectorReflect = (
  incident: Vector2D,
  normal: Vector2D,
): Vector2D => {
  const dot = vectorDot(incident, normal);
  return vectorSubtract(incident, vectorMultiply(normal, 2 * dot));
};
