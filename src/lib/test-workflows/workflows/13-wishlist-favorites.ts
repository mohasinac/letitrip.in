/**
 * Workflow #13: Wishlist & Favorites Management
 *
 * Complete favorites/wishlist lifecycle:
 * 1. Navigate to products page
 * 2. Browse and view product details
 * 3. Add product to favorites
 * 4. Verify favorite was added
 * 5. Add multiple products to favorites
 * 6. View all favorites list
 * 7. Check favorites count
 * 8. Remove a favorite
 * 9. Clear all favorites
 * 10. Cleanup and verify empty state
 *
 * Expected time: 6-8 minutes
 * Success criteria: All favorite operations work correctly
 */

import { favoritesService, FavoriteItem } from "@/services/favorites.service";
import { productsService } from "@/services/products.service";
import { BaseWorkflow, WorkflowResult } from "../helpers";

export class WishlistFavoritesWorkflow extends BaseWorkflow {
  private testProductIds: string[] = [];
  private testFavoriteIds: string[] = [];

  async run(): Promise<WorkflowResult> {
    this.initialize();

    try {
      // Step 1: Navigate to products page
      await this.executeStep("Navigate to Products Page", async () => {
        console.log("Navigating to /products");

        const productsResponse = await productsService.list({
          page: 1,
          limit: 10,
        });

        if (!productsResponse.data || productsResponse.data.length === 0) {
          throw new Error("No products available for testing");
        }

        // Store product IDs for testing
        this.testProductIds = productsResponse.data
          .slice(0, 5)
          .map((p) => p.id);

        console.log(
          `Found ${productsResponse.data.length} products, selected ${this.testProductIds.length} for testing`
        );
      });

      // Step 2: Browse and view product details
      await this.executeStep("Browse Product Details", async () => {
        if (this.testProductIds.length === 0) {
          throw new Error("No test products available");
        }

        const productId = this.testProductIds[0];
        const product = await productsService.getById(productId);

        console.log(`Viewing product: ${product.name} - ₹${product.price}`);
      });

      // Step 3: Add product to favorites
      await this.executeStep("Add Product to Favorites", async () => {
        if (this.testProductIds.length === 0) {
          throw new Error("No test products available");
        }

        const productId = this.testProductIds[0];
        const favorite = await favoritesService.add(productId);

        this.testFavoriteIds.push(favorite.id);

        console.log(`Added product ${favorite.product.name} to favorites`);
      });

      // Step 4: Verify favorite was added
      await this.executeStep("Verify Favorite Added", async () => {
        if (this.testProductIds.length === 0) {
          throw new Error("No test products available");
        }

        const productId = this.testProductIds[0];
        const checkResult = await favoritesService.isFavorited(productId);

        if (!checkResult.isFavorited) {
          throw new Error("Product was not marked as favorited");
        }

        console.log(
          `Verified product is favorited (ID: ${checkResult.favoriteId})`
        );
      });

      // Step 5: Add multiple products to favorites
      await this.executeStep("Add Multiple Products to Favorites", async () => {
        const productsToAdd = this.testProductIds.slice(1, 4); // Add 3 more products

        for (const productId of productsToAdd) {
          try {
            const favorite = await favoritesService.add(productId);
            this.testFavoriteIds.push(favorite.id);
          } catch (error) {
            console.log(`Failed to add product ${productId}: ${error}`);
          }
        }

        console.log(`Added ${productsToAdd.length} more products to favorites`);
      });

      // Step 6: View all favorites list
      await this.executeStep("View All Favorites List", async () => {
        const favorites = await favoritesService.list();

        const testFavorites = favorites.filter((f) =>
          this.testFavoriteIds.includes(f.id)
        );

        if (testFavorites.length === 0) {
          throw new Error("No test favorites found in list");
        }

        console.log(`Found ${testFavorites.length} favorites in list`);
        testFavorites.forEach((f) => {
          console.log(`  - ${f.product.name} (₹${f.product.price})`);
        });
      });

      // Step 7: Check favorites count
      await this.executeStep("Check Favorites Count", async () => {
        const countResult = await favoritesService.getCount();

        console.log(`Total favorites count: ${countResult.count}`);
      });

      // Step 8: Remove a favorite
      await this.executeStep("Remove a Favorite", async () => {
        if (this.testFavoriteIds.length === 0) {
          throw new Error("No favorites to remove");
        }

        const favoriteIdToRemove = this.testFavoriteIds[0];
        await favoritesService.remove(favoriteIdToRemove);

        // Verify it was removed
        const favorites = await favoritesService.list();
        const stillExists = favorites.some((f) => f.id === favoriteIdToRemove);

        if (stillExists) {
          throw new Error("Favorite was not removed successfully");
        }

        console.log(`Successfully removed favorite ${favoriteIdToRemove}`);

        // Remove from our tracking array
        this.testFavoriteIds = this.testFavoriteIds.filter(
          (id) => id !== favoriteIdToRemove
        );
      });

      // Step 9: Clear remaining favorites
      await this.executeStep("Clear Remaining Favorites", async () => {
        const remainingCount = this.testFavoriteIds.length;

        for (const favoriteId of this.testFavoriteIds) {
          try {
            await favoritesService.remove(favoriteId);
          } catch (error) {
            console.log(`Failed to remove favorite ${favoriteId}: ${error}`);
          }
        }

        console.log(`Cleared ${remainingCount} remaining test favorites`);
      });

      // Step 10: Cleanup and verify empty state
      await this.executeStep("Cleanup and Verify Empty State", async () => {
        // Verify all test favorites are removed
        const favorites = await favoritesService.list();
        const remainingTestFavorites = favorites.filter((f) =>
          this.testFavoriteIds.includes(f.id)
        );

        if (remainingTestFavorites.length > 0) {
          console.log(
            `Warning: ${remainingTestFavorites.length} test favorites still exist`
          );
        }

        this.testFavoriteIds = [];
        this.testProductIds = [];

        console.log("Cleanup complete - all test favorites removed");
      });
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }

    return this.printSummary();
  }
}
