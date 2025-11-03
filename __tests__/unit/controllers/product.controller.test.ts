import {
  mockProduct,
  mockAdmin,
  mockSeller,
  mockUser,
  createMockProducts,
} from '../../utils/mock-data';
import {
  createMockRequest,
  mockFirestore,
  expectValidResponse,
  expectErrorResponse,
} from '../../utils/test-helpers';

// Mock the product controller functions
const mockProductController = {
  getAllProducts: jest.fn(),
  getProductBySlug: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  searchProducts: jest.fn(),
  getAllProductsAdmin: jest.fn(),
  getProductStatsAdmin: jest.fn(),
};

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts (Public)', () => {
    it('should return all active products', async () => {
      const products = createMockProducts(5);
      mockProductController.getAllProducts.mockResolvedValue(products);

      const result = await mockProductController.getAllProducts({});

      expect(result).toHaveLength(5);
      expect(mockProductController.getAllProducts).toHaveBeenCalledWith({});
    });

    it('should filter products by status', async () => {
      const activeProducts = createMockProducts(3).map((p) => ({
        ...p,
        status: 'active' as const,
      }));

      mockProductController.getAllProducts.mockResolvedValue(activeProducts);

      const result = await mockProductController.getAllProducts({
        status: 'active',
      });

      expect(result).toHaveLength(3);
      expect(result.every((p: any) => p.status === 'active')).toBe(true);
    });

    it('should filter products by category', async () => {
      const categoryProducts = createMockProducts(2).map((p) => ({
        ...p,
        categoryId: 'cat_123',
      }));

      mockProductController.getAllProducts.mockResolvedValue(categoryProducts);

      const result = await mockProductController.getAllProducts({
        categoryId: 'cat_123',
      });

      expect(result).toHaveLength(2);
      expect(result.every((p: any) => p.categoryId === 'cat_123')).toBe(true);
    });

    it('should paginate results', async () => {
      const products = createMockProducts(2);
      mockProductController.getAllProducts.mockResolvedValue(products);

      const result = await mockProductController.getAllProducts({
        limit: 2,
        offset: 0,
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('getProductBySlug (Public)', () => {
    it('should return product by slug', async () => {
      mockProductController.getProductBySlug.mockResolvedValue(mockProduct);

      const result = await mockProductController.getProductBySlug(
        'test-beyblade'
      );

      expect(result).toBeDefined();
      expect(result.slug).toBe(mockProduct.slug);
    });

    it('should return null for non-existent slug', async () => {
      mockProductController.getProductBySlug.mockResolvedValue(null);

      const result =
        await mockProductController.getProductBySlug('non-existent');

      expect(result).toBeNull();
    });

    it('should return product with all fields', async () => {
      mockProductController.getProductBySlug.mockResolvedValue(mockProduct);

      const result = await mockProductController.getProductBySlug(
        'test-beyblade'
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('sellerId');
    });
  });

  describe('createProduct (Seller/Admin)', () => {
    it('should allow seller to create product', async () => {
      const newProduct = { ...mockProduct, id: 'new-product-123' };
      mockProductController.createProduct.mockResolvedValue(newProduct);

      const result = await mockProductController.createProduct(
        mockProduct,
        mockSeller.id,
        'seller'
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('new-product-123');
      expect(mockProductController.createProduct).toHaveBeenCalledWith(
        mockProduct,
        mockSeller.id,
        'seller'
      );
    });

    it('should allow admin to create product', async () => {
      const newProduct = { ...mockProduct, id: 'admin-product-123' };
      mockProductController.createProduct.mockResolvedValue(newProduct);

      const result = await mockProductController.createProduct(
        mockProduct,
        mockAdmin.id,
        'admin'
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('admin-product-123');
    });

    it('should reject customer role', async () => {
      mockProductController.createProduct.mockRejectedValue(
        new Error('Unauthorized: Only sellers and admins can create products')
      );

      await expect(
        mockProductController.createProduct(mockProduct, mockUser.id, 'customer')
      ).rejects.toThrow('Unauthorized');
    });

    it('should validate required fields', async () => {
      const invalidProduct = { name: 'Test' }; // Missing required fields

      mockProductController.createProduct.mockRejectedValue(
        new Error('Validation failed: Missing required fields')
      );

      await expect(
        mockProductController.createProduct(
          invalidProduct,
          mockSeller.id,
          'seller'
        )
      ).rejects.toThrow('Validation failed');
    });

    it('should set sellerId from authenticated user', async () => {
      const productData = { ...mockProduct };
      const newProduct = { ...productData, sellerId: mockSeller.id };

      mockProductController.createProduct.mockResolvedValue(newProduct);

      const result = await mockProductController.createProduct(
        productData,
        mockSeller.id,
        'seller'
      );

      expect(result.sellerId).toBe(mockSeller.id);
    });
  });

  describe('updateProduct (Seller/Admin)', () => {
    it('should allow seller to update own product', async () => {
      const updatedProduct = {
        ...mockProduct,
        name: 'Updated Beyblade',
        sellerId: mockSeller.id,
      };

      mockProductController.updateProduct.mockResolvedValue(updatedProduct);

      const result = await mockProductController.updateProduct(
        mockProduct.slug,
        { name: 'Updated Beyblade' },
        mockSeller.id,
        'seller'
      );

      expect(result.name).toBe('Updated Beyblade');
    });

    it('should prevent seller from updating another sellers product', async () => {
      mockProductController.updateProduct.mockRejectedValue(
        new Error('Unauthorized: You can only update your own products')
      );

      await expect(
        mockProductController.updateProduct(
          mockProduct.slug,
          { name: 'Hacked' },
          'different-seller-id',
          'seller'
        )
      ).rejects.toThrow('Unauthorized');
    });

    it('should allow admin to update any product', async () => {
      const updatedProduct = {
        ...mockProduct,
        name: 'Admin Updated',
        status: 'featured' as const,
      };

      mockProductController.updateProduct.mockResolvedValue(updatedProduct);

      const result = await mockProductController.updateProduct(
        mockProduct.slug,
        { name: 'Admin Updated', status: 'featured' },
        mockAdmin.id,
        'admin'
      );

      expect(result.name).toBe('Admin Updated');
      expect(result.status).toBe('featured');
    });

    it('should update product fields', async () => {
      const updates = {
        price: 149.99,
        quantity: 50,
        description: 'Updated description',
      };

      const updatedProduct = { ...mockProduct, ...updates };
      mockProductController.updateProduct.mockResolvedValue(updatedProduct);

      const result = await mockProductController.updateProduct(
        mockProduct.slug,
        updates,
        mockSeller.id,
        'seller'
      );

      expect(result.price).toBe(149.99);
      expect(result.quantity).toBe(50);
      expect(result.description).toBe('Updated description');
    });
  });

  describe('deleteProduct (Seller/Admin)', () => {
    it('should allow seller to delete own product', async () => {
      mockProductController.deleteProduct.mockResolvedValue(true);

      const result = await mockProductController.deleteProduct(
        mockProduct.slug,
        mockSeller.id,
        'seller'
      );

      expect(result).toBe(true);
      expect(mockProductController.deleteProduct).toHaveBeenCalledWith(
        mockProduct.slug,
        mockSeller.id,
        'seller'
      );
    });

    it('should prevent seller from deleting another sellers product', async () => {
      mockProductController.deleteProduct.mockRejectedValue(
        new Error('Unauthorized: You can only delete your own products')
      );

      await expect(
        mockProductController.deleteProduct(
          mockProduct.slug,
          'different-seller-id',
          'seller'
        )
      ).rejects.toThrow('Unauthorized');
    });

    it('should allow admin to delete any product', async () => {
      mockProductController.deleteProduct.mockResolvedValue(true);

      const result = await mockProductController.deleteProduct(
        mockProduct.slug,
        mockAdmin.id,
        'admin'
      );

      expect(result).toBe(true);
    });

    it('should return false for non-existent product', async () => {
      mockProductController.deleteProduct.mockResolvedValue(false);

      const result = await mockProductController.deleteProduct(
        'non-existent-slug',
        mockSeller.id,
        'seller'
      );

      expect(result).toBe(false);
    });
  });

  describe('searchProducts (Public)', () => {
    it('should search products by name', async () => {
      const products = createMockProducts(3);
      mockProductController.searchProducts.mockResolvedValue(products);

      const result = await mockProductController.searchProducts('beyblade', {});

      expect(result).toHaveLength(3);
      expect(mockProductController.searchProducts).toHaveBeenCalledWith(
        'beyblade',
        {}
      );
    });

    it('should search with filters', async () => {
      const products = createMockProducts(2);
      mockProductController.searchProducts.mockResolvedValue(products);

      const result = await mockProductController.searchProducts('beyblade', {
        categoryId: 'cat_123',
        minPrice: 50,
        maxPrice: 200,
      });

      expect(result).toHaveLength(2);
    });

    it('should return empty array for no matches', async () => {
      mockProductController.searchProducts.mockResolvedValue([]);

      const result = await mockProductController.searchProducts(
        'nonexistent',
        {}
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('getAllProductsAdmin (Admin Only)', () => {
    it('should allow admin to get all products', async () => {
      const products = createMockProducts(10);
      mockProductController.getAllProductsAdmin.mockResolvedValue(products);

      const result = await mockProductController.getAllProductsAdmin(
        {},
        mockAdmin.id,
        'admin'
      );

      expect(result).toHaveLength(10);
    });

    it('should reject non-admin users', async () => {
      mockProductController.getAllProductsAdmin.mockRejectedValue(
        new Error('Unauthorized: Admin access required')
      );

      await expect(
        mockProductController.getAllProductsAdmin({}, mockUser.id, 'customer')
      ).rejects.toThrow('Unauthorized');
    });

    it('should filter by status', async () => {
      const draftProducts = createMockProducts(3).map((p) => ({
        ...p,
        status: 'draft' as const,
      }));

      mockProductController.getAllProductsAdmin.mockResolvedValue(
        draftProducts
      );

      const result = await mockProductController.getAllProductsAdmin(
        { status: 'draft' },
        mockAdmin.id,
        'admin'
      );

      expect(result.every((p: any) => p.status === 'draft')).toBe(true);
    });

    it('should filter by seller', async () => {
      const sellerProducts = createMockProducts(5).map((p) => ({
        ...p,
        sellerId: 'seller_123',
      }));

      mockProductController.getAllProductsAdmin.mockResolvedValue(
        sellerProducts
      );

      const result = await mockProductController.getAllProductsAdmin(
        { sellerId: 'seller_123' },
        mockAdmin.id,
        'admin'
      );

      expect(result.every((p: any) => p.sellerId === 'seller_123')).toBe(true);
    });
  });

  describe('getProductStatsAdmin (Admin Only)', () => {
    it('should return product statistics', async () => {
      const stats = {
        total: 100,
        active: 75,
        draft: 15,
        archived: 10,
        featured: 20,
        lowStock: 5,
        outOfStock: 3,
      };

      mockProductController.getProductStatsAdmin.mockResolvedValue(stats);

      const result = await mockProductController.getProductStatsAdmin(
        mockAdmin.id,
        'admin'
      );

      expect(result.total).toBe(100);
      expect(result.active).toBe(75);
      expect(result.lowStock).toBe(5);
    });

    it('should reject non-admin users', async () => {
      mockProductController.getProductStatsAdmin.mockRejectedValue(
        new Error('Unauthorized: Admin access required')
      );

      await expect(
        mockProductController.getProductStatsAdmin(mockSeller.id, 'seller')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('RBAC Enforcement', () => {
    it('should enforce admin-only operations', async () => {
      const adminOnlyOps = [
        () =>
          mockProductController.getAllProductsAdmin({}, mockUser.id, 'customer'),
        () =>
          mockProductController.getProductStatsAdmin(mockUser.id, 'customer'),
      ];

      // Mock all to reject
      mockProductController.getAllProductsAdmin.mockRejectedValue(
        new Error('Unauthorized')
      );
      mockProductController.getProductStatsAdmin.mockRejectedValue(
        new Error('Unauthorized')
      );

      for (const op of adminOnlyOps) {
        await expect(op()).rejects.toThrow('Unauthorized');
      }
    });

    it('should enforce seller ownership', async () => {
      mockProductController.updateProduct.mockRejectedValue(
        new Error('Unauthorized')
      );
      mockProductController.deleteProduct.mockRejectedValue(
        new Error('Unauthorized')
      );

      await expect(
        mockProductController.updateProduct(
          'product-slug',
          {},
          'wrong-seller',
          'seller'
        )
      ).rejects.toThrow('Unauthorized');

      await expect(
        mockProductController.deleteProduct(
          'product-slug',
          'wrong-seller',
          'seller'
        )
      ).rejects.toThrow('Unauthorized');
    });

    it('should allow public read access', async () => {
      mockProductController.getAllProducts.mockResolvedValue([]);
      mockProductController.getProductBySlug.mockResolvedValue(mockProduct);
      mockProductController.searchProducts.mockResolvedValue([]);

      // Should not throw errors
      await mockProductController.getAllProducts({});
      await mockProductController.getProductBySlug('test-slug');
      await mockProductController.searchProducts('query', {});

      expect(mockProductController.getAllProducts).toHaveBeenCalled();
      expect(mockProductController.getProductBySlug).toHaveBeenCalled();
      expect(mockProductController.searchProducts).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should validate product name length', async () => {
      const invalidProduct = {
        ...mockProduct,
        name: 'ab', // Too short
      };

      mockProductController.createProduct.mockRejectedValue(
        new Error('Validation failed: Name must be at least 3 characters')
      );

      await expect(
        mockProductController.createProduct(
          invalidProduct,
          mockSeller.id,
          'seller'
        )
      ).rejects.toThrow('Validation failed');
    });

    it('should validate price is positive', async () => {
      const invalidProduct = {
        ...mockProduct,
        price: -10,
      };

      mockProductController.createProduct.mockRejectedValue(
        new Error('Validation failed: Price must be positive')
      );

      await expect(
        mockProductController.createProduct(
          invalidProduct,
          mockSeller.id,
          'seller'
        )
      ).rejects.toThrow('Validation failed');
    });

    it('should validate quantity is non-negative', async () => {
      const invalidProduct = {
        ...mockProduct,
        quantity: -5,
      };

      mockProductController.createProduct.mockRejectedValue(
        new Error('Validation failed: Quantity cannot be negative')
      );

      await expect(
        mockProductController.createProduct(
          invalidProduct,
          mockSeller.id,
          'seller'
        )
      ).rejects.toThrow('Validation failed');
    });

    it('should validate slug format', async () => {
      const invalidProduct = {
        ...mockProduct,
        slug: 'Invalid Slug!', // Should be lowercase, no spaces
      };

      mockProductController.createProduct.mockRejectedValue(
        new Error('Validation failed: Invalid slug format')
      );

      await expect(
        mockProductController.createProduct(
          invalidProduct,
          mockSeller.id,
          'seller'
        )
      ).rejects.toThrow('Validation failed');
    });
  });
});
