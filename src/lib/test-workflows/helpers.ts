/**
 * Type-Safe Workflow Helpers
 *
 * Provides compile-time type safety for accessing and setting fields
 * on typed objects while maintaining IDE autocomplete support.
 *
 * Follows project architecture: "Type Safety: Comprehensive TypeScript types"
 *
 * @module test-workflows/helpers
 */

import type {
  Product,
  Shop,
  Category,
  Order,
  Auction,
  Review,
  Coupon,
  SupportTicket,
} from "@/types";

// ============================================================================
// GENERIC TYPE-SAFE FIELD ACCESSORS
// ============================================================================

/**
 * Type-safe field getter with compile-time checking
 * @example
 * const name = getField(product, 'name'); // Type: string
 * const price = getField(product, 'price'); // Type: number
 */
export function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

/**
 * Type-safe field setter with compile-time type checking
 * @example
 * setField(productData, 'name', 'New Name'); // ✅ OK
 * setField(productData, 'name', 123); // ❌ Type error
 */
export function setField<T, K extends keyof T>(
  obj: Partial<T>,
  key: K,
  value: T[K]
): void {
  obj[key] = value;
}

/**
 * Check if field exists on object
 */
export function hasField<T extends object>(obj: T, key: keyof T): boolean {
  return key in obj;
}

// ============================================================================
// WORKFLOW-SPECIFIC TYPED ACCESSORS
// ============================================================================

export class ProductHelpers {
  static get<K extends keyof Product>(product: Product, field: K): Product[K] {
    return product[field];
  }

  static set<K extends keyof Product>(
    productData: Partial<Product>,
    field: K,
    value: Product[K]
  ): void {
    productData[field] = value;
  }

  static getId(product: Product): string {
    return product.id;
  }

  static getName(product: Product): string {
    return product.name;
  }

  static getPrice(product: Product): number {
    return product.price;
  }

  static getStockCount(product: Product): number {
    return product.stockCount;
  }

  static getStatus(product: Product): string {
    return product.status;
  }

  static getShopId(product: Product): string {
    return product.shopId;
  }

  static getCategoryId(product: Product): string {
    return product.categoryId;
  }

  static getSlug(product: Product): string {
    return product.slug;
  }

  static getImages(product: Product): string[] {
    return product.images || [];
  }

  static getDescription(product: Product): string {
    return product.description || "";
  }
}

export class ShopHelpers {
  static get<K extends keyof Shop>(shop: Shop, field: K): Shop[K] {
    return shop[field];
  }

  static set<K extends keyof Shop>(
    shopData: Partial<Shop>,
    field: K,
    value: Shop[K]
  ): void {
    shopData[field] = value;
  }

  static getId(shop: Shop): string {
    return shop.id;
  }

  static getName(shop: Shop): string {
    return shop.name;
  }

  static getSlug(shop: Shop): string {
    return shop.slug;
  }

  static getOwnerId(shop: Shop): string {
    return shop.ownerId;
  }

  static getVerificationStatus(shop: Shop): boolean {
    return shop.isVerified;
  }

  static isVerified(shop: Shop): boolean {
    return shop.isVerified || false;
  }
}

export class CategoryHelpers {
  static get<K extends keyof Category>(
    category: Category,
    field: K
  ): Category[K] {
    return category[field];
  }

  static set<K extends keyof Category>(
    categoryData: Partial<Category>,
    field: K,
    value: Category[K]
  ): void {
    categoryData[field] = value;
  }

  static getId(category: Category): string {
    return category.id;
  }

  static getName(category: Category): string {
    return category.name;
  }

  static getSlug(category: Category): string {
    return category.slug;
  }

  static getParentId(category: Category): string | null {
    return category.parentId || null;
  }

  static getLevel(category: Category): number {
    return category.level || 0;
  }

  static getIcon(category: Category): string | undefined {
    return category.icon;
  }
}

export class OrderHelpers {
  static get<K extends keyof Order>(order: Order, field: K): Order[K] {
    return order[field];
  }

  static set<K extends keyof Order>(
    orderData: Partial<Order>,
    field: K,
    value: Order[K]
  ): void {
    orderData[field] = value;
  }

  static getId(order: Order): string {
    return order.id;
  }

  static getOrderNumber(order: Order): string {
    return order.orderNumber;
  }

  static getCustomerId(order: Order): string {
    return order.customerId;
  }

  static getStatus(order: Order): string {
    return order.status;
  }

  static getTotal(order: Order): number {
    return order.total;
  }

  static getSubtotal(order: Order): number {
    return order.subtotal;
  }
}

export class AuctionHelpers {
  static get<K extends keyof Auction>(auction: Auction, field: K): Auction[K] {
    return auction[field];
  }

  static set<K extends keyof Auction>(
    auctionData: Partial<Auction>,
    field: K,
    value: Auction[K]
  ): void {
    auctionData[field] = value;
  }

  static getId(auction: Auction): string {
    return auction.id;
  }

  static getName(auction: Auction): string {
    return auction.name;
  }

  static getStartingBid(auction: Auction): number {
    return auction.startingBid;
  }

  static getCurrentBid(auction: Auction): number {
    return auction.currentBid;
  }

  static getStatus(auction: Auction): string {
    return auction.status;
  }

  static getEndTime(auction: Auction): Date {
    return auction.endTime;
  }

  static getStartTime(auction: Auction): Date {
    return auction.startTime;
  }

  static getShopId(auction: Auction): string {
    return auction.shopId;
  }
}

export class CouponHelpers {
  static get<K extends keyof Coupon>(coupon: Coupon, field: K): Coupon[K] {
    return coupon[field];
  }

  static getCode(coupon: Coupon): string {
    return coupon.code;
  }

  static getType(coupon: Coupon): string {
    return coupon.type;
  }

  static getDiscountValue(coupon: Coupon): number | undefined {
    return coupon.discountValue;
  }

  static getId(coupon: Coupon): string {
    return coupon.id;
  }

  static getUsageCount(coupon: Coupon): number {
    return coupon.usageCount || 0;
  }
}

export class TicketHelpers {
  static get<K extends keyof SupportTicket>(
    ticket: SupportTicket,
    field: K
  ): SupportTicket[K] {
    return ticket[field];
  }

  static getId(ticket: SupportTicket): string {
    return ticket.id;
  }

  static getSubject(ticket: SupportTicket): string {
    return ticket.subject;
  }

  static getStatus(ticket: SupportTicket): string {
    return ticket.status;
  }

  static getCategory(ticket: SupportTicket): string {
    return ticket.category;
  }
}

export class ReviewHelpers {
  static get<K extends keyof Review>(review: Review, field: K): Review[K] {
    return review[field];
  }

  static getId(review: Review): string {
    return review.id;
  }

  static getRating(review: Review): number {
    return review.rating;
  }

  static getComment(review: Review): string {
    return review.comment;
  }

  static isApproved(review: Review): boolean {
    return review.isApproved;
  }
}

// ============================================================================
// ABSTRACT BASE WORKFLOW CLASS
// ============================================================================

export interface WorkflowStep {
  name: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  duration?: number;
  error?: string;
}

export interface WorkflowResult {
  success: boolean;
  totalSteps: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  steps: WorkflowStep[];
  errors: string[];
}

export abstract class BaseWorkflow {
  protected results: WorkflowStep[] = [];
  protected passed = 0;
  protected failed = 0;
  protected skipped = 0;
  protected startTime = 0;

  /**
   * Execute a workflow step with error handling
   */
  protected async executeStep(
    name: string,
    fn: () => Promise<void>,
    optional = false
  ): Promise<void> {
    const step: WorkflowStep = {
      name,
      status: "running",
    };

    this.results.push(step);
    const stepStartTime = Date.now();

    try {
      console.log(`\n⏳ ${name}...`);
      await fn();

      step.status = "success";
      step.duration = Date.now() - stepStartTime;
      this.passed++;
      console.log(`✅ ${name} - Success (${step.duration}ms)`);
    } catch (error) {
      step.status = "failed";
      step.duration = Date.now() - stepStartTime;
      step.error = error instanceof Error ? error.message : String(error);

      if (optional) {
        console.log(`⚠️  ${name} - Failed (optional): ${step.error}`);
        step.status = "skipped";
        this.skipped++;
      } else {
        console.error(`❌ ${name} - Failed: ${step.error}`);
        this.failed++;
        throw error;
      }
    }
  }

  /**
   * Print workflow summary
   */
  protected printSummary(): WorkflowResult {
    const duration = Date.now() - this.startTime;
    const totalSteps = this.passed + this.failed + this.skipped;
    const success = this.failed === 0;

    console.log("\n" + "=".repeat(70));
    console.log("📊 WORKFLOW SUMMARY");
    console.log("=".repeat(70));
    console.log(`Total Steps: ${totalSteps}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`⏭️  Skipped: ${this.skipped}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(
      `🎯 Success Rate: ${((this.passed / totalSteps) * 100).toFixed(1)}%`
    );
    console.log("=".repeat(70));

    const errors = this.results
      .filter((r) => r.status === "failed")
      .map((r) => r.error || "Unknown error");

    return {
      success,
      totalSteps,
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      duration,
      steps: this.results,
      errors,
    };
  }

  /**
   * Initialize workflow
   */
  protected initialize(): void {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.startTime = Date.now();
  }

  /**
   * Main workflow execution method - must be implemented by subclasses
   */
  abstract run(): Promise<WorkflowResult>;
}

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/**
 * Pause execution for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Log verbose message (only if verbose mode enabled)
 */
export function logVerbose(message: string, verbose = false): void {
  if (verbose) {
    console.log(`[VERBOSE] ${message}`);
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate random string
 */
export function randomString(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
