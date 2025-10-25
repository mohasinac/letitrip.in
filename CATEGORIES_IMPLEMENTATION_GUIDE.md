# Categories Implementation Guide

## Quick Start

### 1. Setup Categories in Admin Panel

```typescript
// Navigate to: /admin/categories

// Create root category
await CategoryService.createCategory({
  name: "Electronics",
  slug: "electronics",
  description: "Electronic devices and gadgets",
  isActive: true,
  featured: true,
  sortOrder: 1
});

// Create child categories
await CategoryService.createCategory({
  name: "Computers",
  slug: "computers", 
  parentId: "electronics-id",
  isActive: true,
  sortOrder: 1
});

// Create leaf category for products
await CategoryService.createCategory({
  name: "Gaming Laptops",
  slug: "gaming-laptops",
  parentId: "computers-id", 
  isActive: true,
  sortOrder: 1
});
```

### 2. Assign Products to Leaf Categories

```typescript
// Only assign products to leaf categories (🍃 badge in admin)
const leafCategories = await fetch('/api/admin/categories/leaf');

await ProductService.createProduct({
  name: "Gaming Laptop XYZ",
  category: leafCategoryId, // Must be leaf category
  price: 1299.99,
  quantity: 10
});
```

### 3. Display Categories in Frontend

```tsx
// Get category tree for navigation
const { data: tree } = await CategoryService.getCategoryTree({
  withProductCounts: true,
  maxDepth: 3
});

// Render navigation
<CategoryNavigation 
  categories={tree.categories}
  showCounts={true}
/>
```

## Integration Examples

### E-commerce Store Navigation

```tsx
// components/Navigation.tsx
import { CategoryService } from '@/lib/services/category.service';

export function CategoryNavigation() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      const { data } = await CategoryService.getCategoryTree({
        withProductCounts: true
      });
      setCategories(data.categories);
    }
    loadCategories();
  }, []);

  return (
    <nav className="category-nav">
      {categories.map(category => (
        <CategoryMenuItem 
          key={category.id}
          category={category}
          level={0}
        />
      ))}
    </nav>
  );
}

function CategoryMenuItem({ category, level }) {
  return (
    <div className={`menu-item level-${level}`}>
      <Link href={`/categories/${category.slug}`}>
        {category.icon} {category.name}
        {category.productCount > 0 && (
          <span className="count">({category.productCount})</span>
        )}
      </Link>
      
      {category.children && (
        <div className="submenu">
          {category.children.map(child => (
            <CategoryMenuItem 
              key={child.id}
              category={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Product Filtering

```tsx
// pages/products.tsx
export function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  // Load leaf categories for filtering
  const { data: leafCategories } = useSWR(
    '/api/admin/categories/leaf',
    () => CategoryService.getCategories({ 
      rootOnly: false,
      withProductCounts: true 
    }).then(res => res.data.filter(cat => cat.isLeaf))
  );

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId);
    
    // Load products for this category
    const response = await fetch(`/api/products?category=${categoryId}`);
    const { data } = await response.json();
    setProducts(data);
  };

  return (
    <div className="products-page">
      <aside className="filters">
        <h3>Categories</h3>
        {leafCategories?.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryFilter(category.id)}
            className={selectedCategory === category.id ? 'active' : ''}
          >
            {category.name} ({category.productCount})
          </button>
        ))}
      </aside>
      
      <main className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </main>
    </div>
  );
}
```

### Admin Category Management

```tsx
// components/admin/CategoryManager.tsx
export function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadCategories = async () => {
    const { data } = await CategoryService.getCategories({
      withProductCounts: true,
      includeInactive: true
    });
    setCategories(data);
  };

  const handleCreate = async (formData) => {
    try {
      await CategoryService.createCategory(formData);
      await loadCategories(); // Refresh list
      toast.success('Category created successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await CategoryService.updateCategory(id, formData);
      await loadCategories();
      toast.success('Category updated successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure? This cannot be undone.')) {
      try {
        await CategoryService.deleteCategory(id);
        await loadCategories();
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="category-manager">
      <div className="toolbar">
        <button onClick={() => setSelectedCategory({})}>
          Add Category
        </button>
        <button onClick={loadCategories}>
          Refresh
        </button>
      </div>

      <CategoryTree 
        categories={categories}
        onEdit={setSelectedCategory}
        onDelete={handleDelete}
      />

      {selectedCategory && (
        <CategoryForm
          category={selectedCategory}
          categories={categories}
          onSave={selectedCategory.id ? handleUpdate : handleCreate}
          onCancel={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
```

## Best Practices

### 1. Category Structure Design

```typescript
// ✅ Good hierarchy - logical and shallow
Electronics
├── Computers (Parent)
│   ├── Laptops (Leaf) 
│   └── Desktops (Leaf)
└── Mobile (Parent)
    ├── Smartphones (Leaf)
    └── Tablets (Leaf)

// ❌ Avoid deep nesting
Electronics
├── Computers
│   ├── Laptops  
│   │   ├── Gaming
│   │   │   ├── High-End
│   │   │   │   ├── RTX-4090 (Too deep!)
```

### 2. SEO Optimization

```typescript
// ✅ Good SEO structure
const category = {
  name: "Gaming Laptops",
  slug: "gaming-laptops",
  seo: {
    title: "Gaming Laptops | High Performance | YourStore",
    description: "Discover powerful gaming laptops with latest GPUs and processors. Free shipping on orders over $1000.",
    keywords: ["gaming laptops", "gaming computers", "RTX laptops", "high performance"]
  }
};

// ❌ Poor SEO
const category = {
  name: "Laptops123",
  slug: "cat-456",
  seo: {
    title: "Laptops", // Too generic
    description: "Laptops", // Not descriptive
    keywords: ["laptops"] // Too few keywords
  }
};
```

### 3. Performance Optimization

```typescript
// ✅ Efficient category loading
// Load tree once, cache on client
const categoryTree = useMemo(() => {
  return CategoryService.getCategoryTree({ withProductCounts: true });
}, []);

// ✅ Lazy load product counts when needed
const [showCounts, setShowCounts] = useState(false);
const categoriesWithCounts = useSWR(
  showCounts ? '/api/admin/categories?withProductCounts=true' : null,
  () => CategoryService.getCategories({ withProductCounts: true })
);

// ❌ Inefficient - loads counts on every render
const categories = await CategoryService.getCategories({ 
  withProductCounts: true // Heavy operation
});
```

### 4. Error Handling

```typescript
// ✅ Robust error handling
async function createCategory(data) {
  try {
    // Validate slug first
    const slugCheck = await CategoryService.validateSlug(data.slug);
    if (!slugCheck.data.available) {
      throw new Error(`Slug "${data.slug}" is already taken`);
    }
    
    const result = await CategoryService.createCategory(data);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create category');
    }
    
    return result.data;
  } catch (error) {
    console.error('Category creation failed:', error);
    
    // User-friendly error messages
    if (error.message.includes('slug')) {
      throw new Error('Please choose a different URL slug');
    } else if (error.message.includes('parent')) {
      throw new Error('Selected parent category is invalid');
    } else {
      throw new Error('Failed to create category. Please try again.');
    }
  }
}
```

## Testing

### Unit Tests

```typescript
// __tests__/categories.test.ts
describe('CategoryService', () => {
  test('should create root category', async () => {
    const category = await CategoryService.createCategory({
      name: 'Test Category',
      slug: 'test-category'
    });
    
    expect(category.data.level).toBe(0);
    expect(category.data.parentIds).toEqual([]);
    expect(category.data.isLeaf).toBe(true);
  });

  test('should create child category with correct hierarchy', async () => {
    const parent = await CategoryService.createCategory({
      name: 'Parent',
      slug: 'parent'
    });
    
    const child = await CategoryService.createCategory({
      name: 'Child',
      slug: 'child',
      parentId: parent.data.id
    });
    
    expect(child.data.level).toBe(1);
    expect(child.data.parentIds).toContain(parent.data.id);
  });

  test('should prevent circular references', async () => {
    const category = await CategoryService.createCategory({
      name: 'Test',
      slug: 'test'
    });
    
    await expect(
      CategoryService.updateCategory(category.data.id, {
        parentId: category.data.id // Self-reference
      })
    ).rejects.toThrow('Circular reference detected');
  });
});
```

### Integration Tests

```typescript
// __tests__/category-integration.test.ts
describe('Category Integration', () => {
  test('should update product counts when products added', async () => {
    // Create category
    const category = await CategoryService.createCategory({
      name: 'Test Electronics',
      slug: 'test-electronics'
    });
    
    // Add products
    await ProductService.createProduct({
      name: 'Test Product',
      category: category.data.id,
      quantity: 5
    });
    
    // Check counts updated
    const updated = await CategoryService.getCategory(category.data.id);
    expect(updated.data.productCount).toBe(1);
    expect(updated.data.inStockCount).toBe(1);
  });
});
```

## Deployment Checklist

### Before Deploying Categories System

- [ ] Deploy Firestore indices (`firebase deploy --only firestore:indexes`)
- [ ] Update security rules with category validation
- [ ] Test hierarchy operations in staging
- [ ] Verify stock count calculations
- [ ] Check admin authentication works
- [ ] Test category tree performance with large datasets
- [ ] Validate SEO metadata generation
- [ ] Test mobile responsiveness of category navigation
- [ ] Run integration tests
- [ ] Update API documentation

### Post-Deployment Verification

```bash
# Test API endpoints
curl -X GET "https://your-domain.com/api/admin/categories?withProductCounts=true"

# Verify authentication
curl -X POST "https://your-domain.com/api/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","slug":"test"}'

# Check Firestore indices
firebase firestore:indexes --project your-project
```

---

*Implementation Guide v2.0.0*
*Ready for production deployment*
