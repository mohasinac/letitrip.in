/**
 * Newsletter Subscribers Seed Data
 * Sample subscribers for development and testing
 *
 * Covers: active subscribers, unsubscribed users, various sources
 */

import type { NewsletterSubscriberDocument } from "@/db/schema";

export const newsletterSeedData: Partial<NewsletterSubscriberDocument>[] = [
  // ─── Active subscribers from homepage ─────────────────────────────────────
  {
    id: "newsletter-sub-001",
    email: "john.doe@example.com",
    status: "active",
    source: "homepage",
    createdAt: new Date("2026-01-05T10:30:00Z"),
    updatedAt: new Date("2026-01-05T10:30:00Z"),
  },
  {
    id: "newsletter-sub-002",
    email: "priya.sharma@example.com",
    status: "active",
    source: "homepage",
    createdAt: new Date("2026-01-10T14:00:00Z"),
    updatedAt: new Date("2026-01-10T14:00:00Z"),
  },
  {
    id: "newsletter-sub-003",
    email: "meera.nair@example.com",
    status: "active",
    source: "homepage",
    createdAt: new Date("2026-01-15T09:00:00Z"),
    updatedAt: new Date("2026-01-15T09:00:00Z"),
  },
  {
    id: "newsletter-sub-004",
    email: "aditya.kumar@example.com",
    status: "active",
    source: "homepage",
    createdAt: new Date("2026-01-18T11:45:00Z"),
    updatedAt: new Date("2026-01-18T11:45:00Z"),
  },
  {
    id: "newsletter-sub-005",
    email: "sneha.verma@example.com",
    status: "active",
    source: "homepage",
    createdAt: new Date("2026-01-22T16:30:00Z"),
    updatedAt: new Date("2026-01-22T16:30:00Z"),
  },
  // ─── Active subscribers from checkout ─────────────────────────────────────
  {
    id: "newsletter-sub-006",
    email: "raj.patel@example.com",
    status: "active",
    source: "checkout",
    createdAt: new Date("2026-01-25T12:00:00Z"),
    updatedAt: new Date("2026-01-25T12:00:00Z"),
  },
  {
    id: "newsletter-sub-007",
    email: "jane.smith@example.com",
    status: "active",
    source: "checkout",
    createdAt: new Date("2026-01-28T18:00:00Z"),
    updatedAt: new Date("2026-01-28T18:00:00Z"),
  },
  {
    id: "newsletter-sub-008",
    email: "arjun.reddy@example.com",
    status: "active",
    source: "checkout",
    createdAt: new Date("2026-02-01T09:15:00Z"),
    updatedAt: new Date("2026-02-01T09:15:00Z"),
  },
  {
    id: "newsletter-sub-009",
    email: "kavita.menon@example.com",
    status: "active",
    source: "checkout",
    createdAt: new Date("2026-02-04T15:30:00Z"),
    updatedAt: new Date("2026-02-04T15:30:00Z"),
  },
  // ─── Active subscribers from product pages ────────────────────────────────
  {
    id: "newsletter-sub-010",
    email: "rohit.sharma@example.com",
    status: "active",
    source: "product_page",
    createdAt: new Date("2026-02-07T11:00:00Z"),
    updatedAt: new Date("2026-02-07T11:00:00Z"),
  },
  {
    id: "newsletter-sub-011",
    email: "nisha.gupta@example.com",
    status: "active",
    source: "product_page",
    createdAt: new Date("2026-02-10T14:45:00Z"),
    updatedAt: new Date("2026-02-10T14:45:00Z"),
  },
  {
    id: "newsletter-sub-012",
    email: "vikram.singh@example.com",
    status: "active",
    source: "product_page",
    createdAt: new Date("2026-02-13T10:00:00Z"),
    updatedAt: new Date("2026-02-13T10:00:00Z"),
  },
  // ─── Active subscribers from register flow ────────────────────────────────
  {
    id: "newsletter-sub-013",
    email: "mike.johnson@example.com",
    status: "active",
    source: "register",
    createdAt: new Date("2026-02-15T08:30:00Z"),
    updatedAt: new Date("2026-02-15T08:30:00Z"),
  },
  {
    id: "newsletter-sub-014",
    email: "ananya.bose@example.com",
    status: "active",
    source: "register",
    createdAt: new Date("2026-02-17T12:00:00Z"),
    updatedAt: new Date("2026-02-17T12:00:00Z"),
  },
  {
    id: "newsletter-sub-015",
    email: "suresh.pillai@example.com",
    status: "active",
    source: "register",
    createdAt: new Date("2026-02-18T17:00:00Z"),
    updatedAt: new Date("2026-02-18T17:00:00Z"),
  },
  // ─── Unsubscribed (for testing unsubscribe flow) ──────────────────────────
  {
    id: "newsletter-sub-016",
    email: "unsubscribed.user@example.com",
    status: "unsubscribed",
    source: "homepage",
    createdAt: new Date("2025-11-01T09:00:00Z"),
    updatedAt: new Date("2026-01-10T11:00:00Z"),
    unsubscribedAt: new Date("2026-01-10T11:00:00Z"),
  },
  {
    id: "newsletter-sub-017",
    email: "opted.out@example.com",
    status: "unsubscribed",
    source: "checkout",
    createdAt: new Date("2025-12-15T14:00:00Z"),
    updatedAt: new Date("2026-02-05T09:30:00Z"),
    unsubscribedAt: new Date("2026-02-05T09:30:00Z"),
  },
];
