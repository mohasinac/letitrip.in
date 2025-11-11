/**
 * Workflow #8: Seller Product Creation Flow
 *
 * Complete seller product creation journey with inline shop creation:
 * 1. Check/Create seller shop (inline if needed)
 * 2. Validate shop ownership
 * 3. Browse categories for selection
 * 4. Create product draft
 * 5. Add product details (price, stock, description)
 * 6. Upload product images
 * 7. Set shipping details
 * 8. Add SEO metadata
 * 9. Publish product
 * 10. Verify product is live and searchable
 *
 * Expected time: 10-15 minutes
 * Success criteria: Product published and visible in shop
 */

import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import { categoriesService } from "@/services/categories.service";
import { TEST_CONFIG, getSafeUserId, getSafeShopId } from "../test-config";
import {
  BaseWorkflow,
  WorkflowResult,
  ProductHelpers,
  ShopHelpers,
  CategoryHelpers,
  sleep,
} from "../helpers";

export class SellerProductCreationWorkflow extends BaseWorkflow {
  private createdShopId: string | null = null;
  private createdProductId: string | null = null;

  async run(): Promise<WorkflowResult> {
    this.initialize();

    console.log("\n" + "=".repeat(70));
    console.log("🛍️  SELLER PRODUCT CREATION WORKFLOW");
    console.log("=".repeat(70));
    console.log(
      "Testing complete seller product creation with inline shop setup\n"
    );

    // Execute all steps
    await this.step1_CheckOrCreateShop();
    await this.step2_ValidateShopOwnership();
    await this.step3_BrowseCategories();
    await this.step4_CreateProductDraft();
    await this.step5_AddProductDetails();
    await this.step6_UploadProductImages();
    await this.step7_SetShippingDetails();
    await this.step8_AddSEOMetadata();
    await this.step9_PublishProduct();
    await this.step10_VerifyProductLive();

    return this.printSummary();
  }

  // Step 1: Check or Create Shop (Inline Creation)
  private async step1_CheckOrCreateShop(): Promise<void> {
    await this.executeStep("Step 1: Check or Create Seller Shop", async () => {
      const sellerId = getSafeUserId("SELLER_ID");
      const existingShopId = getSafeShopId();

      if (existingShopId) {
        // Verify existing shop
        try {
          const shop = await shopsService.getBySlug(existingShopId);
          if (shop && ShopHelpers.getOwnerId(shop) === sellerId) {
            this.createdShopId = ShopHelpers.getId(shop);
            console.log(
              `   ℹ️  Using existing shop: ${ShopHelpers.getName(shop)}`
            );
            return;
          }
        } catch (error) {
          console.log("   ⚠️  Existing shop not found, creating new one...");
        }
      }

      // Create new shop inline
      const timestamp = Date.now();
      const newShop = await shopsService.create({
        name: `Test Shop ${timestamp}`,
        slug: `test-shop-${timestamp}`,
        description: "Automated test shop for product creation workflow",
        phone: "+919876543210",
        email: "testshop@example.com",
      });

      this.createdShopId = ShopHelpers.getId(newShop);
      console.log(
        `   ✅ Created new shop: ${ShopHelpers.getName(newShop)} (${
          this.createdShopId
        })`
      );
    });
  }

  // Step 2: Validate Shop Ownership
  private async step2_ValidateShopOwnership(): Promise<void> {
    await this.executeStep("Step 2: Validate Shop Ownership", async () => {
      if (!this.createdShopId) {
        throw new Error("Shop ID not available");
      }

      const sellerId = getSafeUserId("SELLER_ID");
      const shop = await shopsService.getBySlug(this.createdShopId);

      if (ShopHelpers.getOwnerId(shop) !== sellerId) {
        throw new Error("Shop ownership validation failed");
      }

      if (
        !ShopHelpers.isVerified(shop) &&
        !ShopHelpers.getVerificationStatus(shop)
      ) {
        console.log(
          "   ⚠️  Shop not yet verified (this is normal for new shops)"
        );
      }

      console.log("   ✅ Shop ownership validated");
    });
  }

  // Step 3: Browse Categories
  private async step3_BrowseCategories(): Promise<void> {
    await this.executeStep("Step 3: Browse Available Categories", async () => {
      const categories = await categoriesService.list({
        isActive: true,
      });

      if (!categories || categories.length === 0) {
        throw new Error("No active categories found");
      }

      console.log(`   ✅ Found ${categories.length} active categories`);
    });
  }

  // Step 4: Create Product Draft
  private async step4_CreateProductDraft(): Promise<void> {
    await this.executeStep("Step 4: Create Product Draft", async () => {
      if (!this.createdShopId) {
        throw new Error("Shop ID not available");
      }

      const timestamp = Date.now();
      const product = await productsService.create({
        name: `Test Product ${timestamp}`,
        slug: `test-product-${timestamp}`,
        description: "Draft product - details coming soon",
        price: 999,
        categoryId: TEST_CONFIG.CATEGORIES.ELECTRONICS_ID,
        shopId: this.createdShopId,
        stockCount: 0,
        lowStockThreshold: 5,
        condition: "new",
        countryOfOrigin: "India",
        isReturnable: true,
        returnWindowDays: 7,
        status: "draft",
      });

      this.createdProductId = ProductHelpers.getId(product);
      console.log(
        `   ✅ Product draft created: ${ProductHelpers.getName(product)} (${
          this.createdProductId
        })`
      );
    });
  }

  // Step 5: Add Product Details
  private async step5_AddProductDetails(): Promise<void> {
    await this.executeStep("Step 5: Add Product Details", async () => {
      if (!this.createdProductId) {
        throw new Error("Product ID not available");
      }

      const updatedProduct = await productsService.update(
        this.createdProductId,
        {
          description:
            "This is a comprehensive test product with full details. It includes specifications, features, and benefits.",
          price: 1499,
          stockCount: 50,
          sku: `SKU-${Date.now()}`,
          brand: "Test Brand",
          specifications: [
            { name: "Color", value: "Black" },
            { name: "Material", value: "Plastic" },
            { name: "Warranty", value: "1 Year" },
          ],
          tags: ["high-quality", "durable", "easy-to-use", "value"],
        }
      );

      console.log(
        `   ✅ Product details updated: ₹${ProductHelpers.getPrice(
          updatedProduct
        )}, Stock: ${ProductHelpers.getStockCount(updatedProduct)}`
      );
    });
  }

  // Step 6: Upload Product Images
  private async step6_UploadProductImages(): Promise<void> {
    await this.executeStep("Step 6: Upload Product Images", async () => {
      if (!this.createdProductId) {
        throw new Error("Product ID not available");
      }

      // Simulate image upload with placeholder URLs (images are string[])
      const updatedProduct = await productsService.update(
        this.createdProductId,
        {
          images: [
            `https://picsum.photos/800/800?random=${Date.now()}`,
            `https://picsum.photos/800/800?random=${Date.now() + 1}`,
            `https://picsum.photos/800/800?random=${Date.now() + 2}`,
          ],
        }
      );

      const images = ProductHelpers.getImages(updatedProduct);
      console.log(`   ✅ Uploaded ${images.length} product images`);
    });
  }

  // Step 7: Set Shipping Details
  private async step7_SetShippingDetails(): Promise<void> {
    await this.executeStep("Step 7: Set Shipping Details", async () => {
      if (!this.createdProductId) {
        throw new Error("Product ID not available");
      }

      // Update shipping-related properties
      const updatedProduct = await productsService.update(
        this.createdProductId,
        {
          shippingClass: "standard",
          dimensions: {
            length: 20,
            width: 15,
            height: 10,
            unit: "cm",
            weight: 0.5,
            weightUnit: "kg",
          },
          isReturnable: true,
          returnWindowDays: 7,
          warranty: "1 Year Manufacturer Warranty",
        }
      );

      console.log("   ✅ Shipping details configured");
    });
  }

  // Step 8: Add SEO Metadata
  private async step8_AddSEOMetadata(): Promise<void> {
    await this.executeStep("Step 8: Add SEO Metadata", async () => {
      if (!this.createdProductId) {
        throw new Error("Product ID not available");
      }

      const product = await productsService.getById(this.createdProductId);
      const productName = ProductHelpers.getName(product);
      const productImages = ProductHelpers.getImages(product);

      const updatedProduct = await productsService.update(
        this.createdProductId,
        {
          metaTitle: `${productName} | Buy Online`,
          metaDescription: `Buy ${productName} at best price. High quality product with fast shipping.`,
          tags: ["test-product", "online-shopping", "best-deals"],
        }
      );

      console.log("   ✅ SEO metadata added");
    });
  }

  // Step 9: Publish Product
  private async step9_PublishProduct(): Promise<void> {
    await this.executeStep("Step 9: Publish Product", async () => {
      if (!this.createdProductId) {
        throw new Error("Product ID not available");
      }

      const updatedProduct = await productsService.update(
        this.createdProductId,
        {
          status: "published",
        }
      );

      const productStatus = ProductHelpers.getStatus(updatedProduct);
      if (productStatus !== "published") {
        throw new Error("Failed to publish product");
      }

      console.log("   ✅ Product published successfully");
    });
  }

  // Step 10: Verify Product is Live
  private async step10_VerifyProductLive(): Promise<void> {
    await this.executeStep(
      "Step 10: Verify Product is Live and Searchable",
      async () => {
        if (!this.createdProductId) {
          throw new Error("Product ID not available");
        }

        // Verify product is accessible
        const product = await productsService.getById(this.createdProductId);
        const productStatus = ProductHelpers.getStatus(product);

        if (productStatus !== "published") {
          throw new Error("Product is not published");
        }

        // Verify product appears in shop's products
        const shopProducts = await productsService.list({
          shopId: this.createdShopId!,
          status: "published",
        });

        const productExists = shopProducts.data.some(
          (p) => ProductHelpers.getId(p) === this.createdProductId
        );
        if (!productExists) {
          throw new Error("Product not found in shop's products");
        }

        const productSlug = ProductHelpers.getSlug(product);
        const productShopId = ProductHelpers.getShopId(product);

        console.log("   ✅ Product is live and searchable");
        console.log(`   📦 Product URL: /products/${productSlug}`);
        console.log(`   🏪 Shop ID: ${productShopId}`);

        if (this.createdShopId) {
          console.log(`\n🏪 Created Shop ID: ${this.createdShopId}`);
        }
        if (this.createdProductId) {
          console.log(`📦 Created Product ID: ${this.createdProductId}`);
        }
      }
    );
  }
}

// Allow direct execution
if (require.main === module) {
  const workflow = new SellerProductCreationWorkflow();

  workflow
    .run()
    .then((result) => {
      console.log("\n✅ Workflow completed successfully!");
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Workflow failed:", error.message);
      process.exit(1);
    });
}
