/**
 * Test Workflow Types
 * Shared types for test workflows and dummy data management
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "seller" | "user";
  phone: string;
  avatar?: string;
}

export interface TestShop {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isFeatured: boolean;
}

export interface TestCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  level: number;
  productCount: number;
}

export interface TestProduct {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  price: number;
  stockCount: number;
  status: string;
  isFeatured: boolean;
  sku: string;
}

export interface TestAuction {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  startingBid: number;
  currentBid: number;
  status: string;
  isFeatured: boolean;
}

export interface TestCoupon {
  id: string;
  shopId: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
}

export interface TestOrder {
  id: string;
  userId: string;
  shopId: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
}

/**
 * Test Data Context
 * Shared context for all test workflows
 */
export interface TestDataContext {
  // Users by role
  users: {
    admin: TestUser[];
    sellers: TestUser[];
    customers: TestUser[];
    all: TestUser[];
  };

  // Shops by ownership and status
  shops: {
    verified: TestShop[];
    unverified: TestShop[];
    featured: TestShop[];
    all: TestShop[];
    byOwnerId: Record<string, TestShop[]>;
  };

  // Categories by level
  categories: {
    root: TestCategory[];
    children: TestCategory[];
    all: TestCategory[];
    byParentId: Record<string, TestCategory[]>;
  };

  // Products by status and features
  products: {
    published: TestProduct[];
    draft: TestProduct[];
    featured: TestProduct[];
    inStock: TestProduct[];
    all: TestProduct[];
    byShopId: Record<string, TestProduct[]>;
    byCategoryId: Record<string, TestProduct[]>;
  };

  // Auctions by status
  auctions: {
    live: TestAuction[];
    scheduled: TestAuction[];
    draft: TestAuction[];
    featured: TestAuction[];
    all: TestAuction[];
    byShopId: Record<string, TestAuction[]>;
  };

  // Coupons by shop and status
  coupons: {
    active: TestCoupon[];
    inactive: TestCoupon[];
    all: TestCoupon[];
    byShopId: Record<string, TestCoupon[]>;
  };

  // Orders by status
  orders: {
    pending: TestOrder[];
    confirmed: TestOrder[];
    shipped: TestOrder[];
    delivered: TestOrder[];
    all: TestOrder[];
    byUserId: Record<string, TestOrder[]>;
    byShopId: Record<string, TestOrder[]>;
  };

  // Metadata
  metadata: {
    generatedAt: string;
    totalItems: number;
    prefix: string;
  };
}

/**
 * Test Data Generation Configuration
 */
export interface TestDataConfig {
  users: number;
  shopsPerUser: number;
  categoriesPerShop: number;
  productsPerShop: number;
  auctionsPerShop: number;
  reviewsPerProduct: number;
  ordersPerUser: number;
  ticketsPerUser: number;
  couponsPerShop: number;
  featuredPercentage: number;
  homepagePercentage: number;
  heroSlidesCount: number;
  detailedContext: boolean; // Generate with full context
}

/**
 * Workflow Step Result
 */
export interface WorkflowStepResult {
  step: string;
  status: "success" | "failed" | "skipped";
  message: string;
  duration: number;
  data?: any;
  error?: string;
}

/**
 * Workflow Result
 */
export interface WorkflowResult {
  workflowName: string;
  workflowId: string;
  totalSteps: number;
  passed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
  results: WorkflowStepResult[];
  finalStatus: "success" | "failed" | "partial";
  context?: Partial<TestDataContext>;
}

/**
 * Workflow Execution Options
 */
export interface WorkflowExecutionOptions {
  useExistingData?: boolean; // Use existing test data or generate new
  cleanupAfter?: boolean; // Cleanup after workflow
  pauseBetweenSteps?: number; // Milliseconds
  continueOnError?: boolean;
  testDataContext?: TestDataContext; // Shared test data
}
