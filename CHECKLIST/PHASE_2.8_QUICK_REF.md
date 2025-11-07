# Service Layer Quick Reference

**Quick guide for using the service layer in your components**

---

## Import Services

```typescript
// Import specific services
import { shopsService, productsService, ordersService } from "@/services";

// Or import everything
import * as services from "@/services";
```

---

## Common Patterns

### List with Filters

```typescript
const { data, pagination } = await shopsService.list({
  verified: true,
  page: 1,
  limit: 10,
});

// Access pagination
console.log(pagination.totalPages);
console.log(pagination.hasNext);
```

### Get Single Item

```typescript
const shop = await shopsService.getById(shopId);
const product = await productsService.getBySlug("product-slug");
```

### Create

```typescript
const newShop = await shopsService.create({
  name: "My Shop",
  slug: "my-shop",
  description: "Shop description",
  // ... other required fields
});
```

### Update

```typescript
const updated = await shopsService.update(shopId, {
  name: "New Name",
  description: "New description",
});
```

### Delete

```typescript
await shopsService.delete(shopId);
```

---

## Service Cheatsheet

### Shops

```typescript
shopsService.list(filters?)          // List shops
shopsService.getById(id)             // Get shop
shopsService.getBySlug(slug)         // Get by slug
shopsService.create(data)            // Create shop
shopsService.update(id, data)        // Update shop
shopsService.delete(id)              // Delete shop
shopsService.verify(id, data)        // Verify (admin)
shopsService.ban(id, data)           // Ban (admin)
shopsService.setFeatureFlags(id, data) // Feature (admin)
shopsService.getPayments(id)         // Get payments
shopsService.getStats(id)            // Get statistics
```

### Products

```typescript
productsService.list(filters?)       // List products
productsService.getById(id)          // Get product
productsService.getBySlug(slug)      // Get by slug
productsService.create(data)         // Create product
productsService.update(id, data)     // Update product
productsService.delete(id)           // Delete product
productsService.getReviews(id)       // Get reviews
productsService.getVariants(id)      // Get variants
productsService.getSimilar(id, limit?) // Get similar
productsService.getSellerProducts(id, limit?) // Seller's other products
productsService.updateStock(id, count) // Update stock
productsService.incrementView(id)    // Track view
```

### Orders

```typescript
ordersService.list(filters?)         // List orders
ordersService.getById(id)            // Get order
ordersService.create(data)           // Create order
ordersService.updateStatus(id, data) // Update status
ordersService.createShipment(id, data) // Create shipment
ordersService.cancel(id, data)       // Cancel order
ordersService.track(id)              // Track shipment
ordersService.downloadInvoice(id)    // Download invoice
ordersService.getStats(filters?)     // Get statistics
```

### Coupons

```typescript
couponsService.list(filters?)        // List coupons
couponsService.getById(id)           // Get coupon
couponsService.getByCode(code)       // Get by code
couponsService.create(data)          // Create coupon
couponsService.update(id, data)      // Update coupon
couponsService.delete(id)            // Delete coupon
couponsService.validate(data)        // Validate coupon
couponsService.getPublic(shopId?)    // Get public coupons
```

### Categories

```typescript
categoriesService.list(filters?)     // List categories
categoriesService.getById(id)        // Get category
categoriesService.getBySlug(slug)    // Get by slug
categoriesService.getTree(parentId?) // Get tree
categoriesService.getLeaves()        // Get leaf categories
categoriesService.create(data)       // Create (admin)
categoriesService.update(id, data)   // Update (admin)
categoriesService.delete(id)         // Delete (admin)
categoriesService.getBreadcrumb(id)  // Get breadcrumb
categoriesService.getFeatured()      // Get featured
categoriesService.getHomepage()      // Get homepage
categoriesService.search(query)      // Search
categoriesService.reorder(orders)    // Reorder (admin)
```

### Auctions

```typescript
auctionsService.list(filters?)       // List auctions
auctionsService.getById(id)          // Get auction
auctionsService.getBySlug(slug)      // Get by slug
auctionsService.create(data)         // Create auction
auctionsService.update(id, data)     // Update auction
auctionsService.delete(id)           // Delete auction
auctionsService.getBids(id)          // Get bids
auctionsService.placeBid(id, data)   // Place bid
auctionsService.setFeatured(id, flag, priority?) // Feature (admin)
auctionsService.getLive()            // Get live auctions
auctionsService.getFeatured()        // Get featured
auctionsService.getSimilar(id, limit?) // Get similar
auctionsService.getSellerAuctions(id, limit?) // Seller's auctions
auctionsService.toggleWatch(id)      // Watch/unwatch
auctionsService.getWatchlist()       // Get watchlist
auctionsService.getMyBids()          // Get my bids
auctionsService.getWonAuctions()     // Get won auctions
```

### Returns

```typescript
returnsService.list(filters?)        // List returns
returnsService.getById(id)           // Get return
returnsService.initiate(data)        // Initiate return
returnsService.update(id, data)      // Update return
returnsService.approve(id, data)     // Approve/reject
returnsService.processRefund(id, data) // Process refund
returnsService.resolveDispute(id, data) // Resolve (admin)
returnsService.uploadMedia(id, files) // Upload media
returnsService.getStats(filters?)    // Get statistics
```

### Reviews

```typescript
reviewsService.list(filters?)        // List reviews
reviewsService.getById(id)           // Get review
reviewsService.create(data)          // Create review
reviewsService.update(id, data)      // Update review
reviewsService.delete(id)            // Delete review
reviewsService.moderate(id, data)    // Moderate (owner/admin)
reviewsService.markHelpful(id)       // Mark helpful
reviewsService.uploadMedia(files)    // Upload media
reviewsService.getSummary(filters)   // Get summary
reviewsService.canReview(productId?, auctionId?) // Check eligibility
```

### Users

```typescript
usersService.list(filters?)          // List users (admin)
usersService.getById(id)             // Get user
usersService.update(id, data)        // Update user
usersService.ban(id, data)           // Ban (admin)
usersService.changeRole(id, data)    // Change role (admin)
usersService.getMe()                 // Get current user
usersService.updateMe(data)          // Update profile
usersService.changePassword(data)    // Change password
usersService.sendEmailVerification() // Send email OTP
usersService.verifyEmail(data)       // Verify email
usersService.sendMobileVerification() // Send mobile OTP
usersService.verifyMobile(data)      // Verify mobile
usersService.uploadAvatar(file)      // Upload avatar
usersService.deleteAvatar()          // Delete avatar
usersService.deleteAccount(password) // Delete account
usersService.getStats()              // Get statistics (admin)
```

### Analytics

```typescript
analyticsService.getOverview(filters?) // Get overview
analyticsService.getSalesData(filters?) // Get sales data
analyticsService.getTopProducts(filters?) // Get top products
analyticsService.getCategoryPerformance(filters?) // Category stats
analyticsService.getCustomerAnalytics(filters?) // Customer stats
analyticsService.getTrafficAnalytics(filters?) // Traffic stats
analyticsService.exportData(filters?, format?) // Export data
```

### Media

```typescript
mediaService.upload(data)            // Upload single file
mediaService.uploadMultiple(files, context, contextId?) // Upload multiple
mediaService.getById(id)             // Get media
mediaService.updateMetadata(id, data) // Update metadata
mediaService.delete(id)              // Delete media
mediaService.getByContext(context, contextId) // Get by context
mediaService.getUploadUrl(fileName, type, context) // Get signed URL
mediaService.confirmUpload(url, metadata) // Confirm upload
mediaService.validateFile(file, maxMB, types) // Validate
mediaService.getConstraints(context) // Get constraints
```

### Cart

```typescript
cartService.get(); // Get cart
cartService.addItem(data); // Add item
cartService.updateItem(id, data); // Update item
cartService.removeItem(id); // Remove item
cartService.clear(); // Clear cart
cartService.mergeGuestCart(data); // Merge guest cart
cartService.applyCoupon(data); // Apply coupon
cartService.removeCoupon(); // Remove coupon
cartService.getItemCount(); // Get item count
cartService.validate(); // Validate cart

// Guest cart (localStorage)
cartService.getGuestCart(); // Get guest cart
cartService.addToGuestCart(item); // Add to guest cart
cartService.updateGuestCartItem(id, qty); // Update guest item
cartService.removeFromGuestCart(id); // Remove from guest cart
cartService.clearGuestCart(); // Clear guest cart
cartService.getGuestCartItemCount(); // Get guest count
```

### Favorites

```typescript
favoritesService.list(); // Get favorites
favoritesService.add(productId); // Add favorite
favoritesService.remove(id); // Remove favorite
favoritesService.removeByProductId(productId); // Remove by product
favoritesService.isFavorited(productId); // Check if favorited
favoritesService.getCount(); // Get count
favoritesService.clear(); // Clear favorites

// Guest favorites (localStorage)
favoritesService.getGuestFavorites(); // Get guest favorites
favoritesService.addToGuestFavorites(productId); // Add to guest
favoritesService.removeFromGuestFavorites(productId); // Remove from guest
favoritesService.isGuestFavorited(productId); // Check guest
favoritesService.clearGuestFavorites(); // Clear guest
favoritesService.getGuestFavoritesCount(); // Get guest count
favoritesService.syncGuestFavorites(); // Sync on login
```

### Support

```typescript
supportService.listTickets(filters?) // List tickets
supportService.getTicket(id)         // Get ticket
supportService.createTicket(data)    // Create ticket
supportService.updateTicket(id, data) // Update ticket
supportService.closeTicket(id)       // Close ticket
supportService.getMessages(ticketId) // Get messages
supportService.replyToTicket(id, data) // Reply to ticket
supportService.assignTicket(id, data) // Assign (admin)
supportService.escalateTicket(id, data) // Escalate
supportService.uploadAttachment(file) // Upload attachment
supportService.getStats(filters?)    // Get statistics (admin)
supportService.getMyTickets(filters?) // Get my tickets
supportService.getTicketCount(filters?) // Get count
```

---

## Error Handling

All services throw errors that can be caught:

```typescript
try {
  const shop = await shopsService.getById(shopId);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // Show error to user
  }
}
```

Common errors:

- `401 Unauthorized` - Redirects to login automatically
- `403 Forbidden` - No permission
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limited

---

## React Component Examples

### Using in Component

```typescript
"use client";

import { useState, useEffect } from "react";
import { shopsService } from "@/services";
import type { Shop } from "@/types";

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShops() {
      try {
        const result = await shopsService.list({ verified: true });
        setShops(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shops");
      } finally {
        setLoading(false);
      }
    }

    fetchShops();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {shops.map((shop) => (
        <div key={shop.id}>{shop.name}</div>
      ))}
    </div>
  );
}
```

### Using with React Query (Recommended)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopsService } from "@/services";

export default function ShopsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shops", { verified: true }],
    queryFn: () => shopsService.list({ verified: true }),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((shop) => (
        <div key={shop.id}>{shop.name}</div>
      ))}
    </div>
  );
}
```

### Mutations

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shopsService } from "@/services";

export default function CreateShopForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: shopsService.create,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });

  const handleSubmit = (data: CreateShopData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create Shop"}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </form>
  );
}
```

---

## Best Practices

1. **Always handle errors** - Use try/catch or React Query error handling
2. **Use TypeScript types** - Import types from services for type safety
3. **Use React Query for data fetching** - Better caching and state management
4. **Don't call services in render** - Use useEffect or React Query
5. **Handle loading states** - Show loading indicators
6. **Validate before submit** - Use Zod schemas from `/src/lib/validation/`
7. **Optimize with pagination** - Don't load all data at once
8. **Use guest helpers** - For cart and favorites before login
9. **Sync on login** - Use merge/sync methods for guest data

---

## TypeScript Tips

```typescript
// Import types
import type { Shop, ShopFilters } from "@/services";

// Use type inference
const shops = await shopsService.list(); // shops is automatically typed

// Type function parameters
async function loadShops(filters: ShopFilters) {
  return await shopsService.list(filters);
}

// Type state
const [shop, setShop] = useState<Shop | null>(null);
```

---

**Quick Reference Complete!** Use services instead of direct fetch() for cleaner, type-safe code. 🚀
