/**
 * Mock Data for Testing
 * Provides sample data for all entities
 */

export const mockProduct = {
  id: 'prod_test_123',
  name: 'Test Beyblade',
  slug: 'test-beyblade',
  description: 'A test beyblade for unit testing',
  price: 99.99,
  comparePrice: 129.99,
  cost: 50.00,
  sku: 'TEST-SKU-001',
  barcode: '1234567890123',
  trackQuantity: true,
  quantity: 100,
  lowStockThreshold: 10,
  status: 'active' as const,
  sellerId: 'seller_123',
  category: 'Attack Type',
  images: ['https://example.com/image1.jpg'],
  tags: ['test', 'beyblade', 'attack'],
  weight: 50,
  dimensions: { length: 10, width: 10, height: 5 },
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockOrder = {
  id: 'order_test_123',
  orderNumber: 'ORD-20250101-001',
  userId: 'user_123',
  items: [
    {
      productId: 'prod_test_123',
      name: 'Test Beyblade',
      slug: 'test-beyblade',
      price: 99.99,
      quantity: 2,
      image: 'https://example.com/image1.jpg',
    },
  ],
  subtotal: 199.98,
  shippingCost: 10.00,
  tax: 20.00,
  discount: 0,
  total: 229.98,
  status: 'pending' as const,
  paymentStatus: 'pending' as const,
  paymentMethod: 'razorpay' as const,
  shippingAddress: {
    fullName: 'John Doe',
    phone: '+1234567890',
    addressLine1: '123 Test St',
    addressLine2: 'Apt 4B',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
    country: 'Test Country',
    isDefault: true,
  },
  billingAddress: {
    fullName: 'John Doe',
    phone: '+1234567890',
    addressLine1: '123 Test St',
    addressLine2: 'Apt 4B',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
    country: 'Test Country',
    isDefault: true,
  },
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockUser = {
  id: 'user_test_123',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'customer' as const,
  photoURL: 'https://example.com/avatar.jpg',
  phoneNumber: '+1234567890',
  emailVerified: true,
  phoneVerified: false,
  banned: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockAdmin = {
  ...mockUser,
  id: 'admin_test_123',
  email: 'admin@example.com',
  displayName: 'Test Admin',
  role: 'admin' as const,
};

export const mockSeller = {
  ...mockUser,
  id: 'seller_test_123',
  email: 'seller@example.com',
  displayName: 'Test Seller',
  role: 'seller' as const,
};

export const mockAddress = {
  id: 'addr_test_123',
  userId: 'user_123',
  fullName: 'John Doe',
  phone: '+1234567890',
  addressLine1: '123 Test St',
  addressLine2: 'Apt 4B',
  city: 'Test City',
  state: 'Test State',
  pincode: '123456',
  country: 'Test Country',
  isDefault: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockPayment = {
  id: 'pay_test_123',
  orderId: 'order_test_123',
  userId: 'user_123',
  amount: 229.98,
  currency: 'USD',
  status: 'success' as const,
  gateway: 'razorpay' as const,
  gatewayOrderId: 'razorpay_order_123',
  gatewayPaymentId: 'razorpay_payment_123',
  gatewaySignature: 'mock_signature',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockCart = {
  id: 'cart_test_123',
  userId: 'user_123',
  items: [
    {
      productId: 'prod_test_123',
      name: 'Test Beyblade',
      slug: 'test-beyblade',
      price: 99.99,
      quantity: 2,
      image: 'https://example.com/image1.jpg',
    },
  ],
  subtotal: 199.98,
  itemCount: 2,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockCategory = {
  id: 'cat_test_123',
  name: 'Attack Type',
  slug: 'attack-type',
  description: 'Beyblades focused on attacking opponents',
  image: 'https://example.com/category.jpg',
  parentId: null,
  level: 1,
  isLeaf: true,
  productCount: 25,
  order: 1,
  active: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockReview = {
  id: 'rev_test_123',
  productId: 'prod_test_123',
  userId: 'user_123',
  userName: 'Test User',
  rating: 5,
  title: 'Great product!',
  comment: 'This beyblade is amazing, highly recommended!',
  status: 'approved' as const,
  helpful: 10,
  notHelpful: 2,
  verified: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockCoupon = {
  id: 'coup_test_123',
  code: 'TEST10',
  discountType: 'percentage' as const,
  discountValue: 10,
  minPurchase: 50,
  maxDiscount: 20,
  usageLimit: 100,
  usageCount: 25,
  validFrom: new Date('2025-01-01'),
  validTo: new Date('2025-12-31'),
  active: true,
  sellerId: 'seller_123',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockArena = {
  id: 'arena_test_123',
  name: 'Test Stadium',
  width: 500,
  height: 500,
  shape: 'circle' as const,
  theme: 'metrocity' as const,
  gameMode: 'player-vs-ai' as const,
  difficulty: 'easy' as const,
  loops: [
    { radius: 150, speedBoost: 1.2, spinBoost: 1.1 },
  ],
  wall: {
    damage: 5,
    recoil: 0.8,
    spikes: false,
    springs: false,
  },
  obstacles: [],
  pits: [],
  physics: {
    gravity: 9.8,
    airResistance: 0.1,
    friction: 0.05,
  },
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockBeyblade = {
  id: 'beyblade_test_123',
  displayName: 'Test Valkyrie',
  type: 'attack' as const,
  spinDirection: 'right' as const,
  mass: 50,
  radius: 25,
  typeDistribution: {
    attack: 200,
    defense: 80,
    stamina: 80,
    total: 360,
  },
  pointsOfContact: [
    { angle: 0, damageMultiplier: 1.5, width: 30 },
    { angle: 120, damageMultiplier: 1.3, width: 25 },
    { angle: 240, damageMultiplier: 1.3, width: 25 },
  ],
  imageUrl: 'https://example.com/valkyrie.png',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

/**
 * Helper to create multiple mock items
 */
export function createMockProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockProduct,
    id: `prod_test_${i + 1}`,
    name: `Test Beyblade ${i + 1}`,
    slug: `test-beyblade-${i + 1}`,
    sku: `TEST-SKU-${String(i + 1).padStart(3, '0')}`,
  }));
}

export function createMockOrders(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockOrder,
    id: `order_test_${i + 1}`,
    orderNumber: `ORD-20250101-${String(i + 1).padStart(3, '0')}`,
  }));
}

export function createMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    ...mockUser,
    id: `user_test_${i + 1}`,
    email: `test${i + 1}@example.com`,
    displayName: `Test User ${i + 1}`,
  }));
}
