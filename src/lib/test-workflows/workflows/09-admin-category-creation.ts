/**
 * Workflow #9: Admin Category Creation Flow
 *
 * Complete admin category management with parent-child hierarchy:
 * 1. List existing categories
 * 2. Create parent category (Level 1)
 * 3. Add parent icon/image
 * 4. Set parent SEO metadata
 * 5. Create first child category (Level 2)
 * 6. Link child to parent
 * 7. Create second child category (Level 2)
 * 8. Create grandchild category (Level 3)
 * 9. Reorder categories
 * 10. Add category attributes
 * 11. Publish category hierarchy
 * 12. Verify tree structure & breadcrumbs
 *
 * Expected time: 12-15 minutes
 * Success criteria: 3-level category tree created and visible
 */

import { categoriesService } from "@/services/categories.service";
import { TEST_CONFIG, getSafeUserId } from "../test-config";
import {
  BaseWorkflow,
  WorkflowResult,
  CategoryHelpers,
  generateSlug,
  sleep,
} from "../helpers";

export class AdminCategoryCreationWorkflow extends BaseWorkflow {
  private createdParentId: string | null = null;
  private createdChild1Id: string | null = null;
  private createdChild2Id: string | null = null;
  private createdGrandchildId: string | null = null;

  async run(): Promise<WorkflowResult> {
    this.initialize();

    console.log("\n" + "=".repeat(70));
    console.log("📂 ADMIN CATEGORY CREATION WORKFLOW");
    console.log("=".repeat(70));
    console.log("Testing complete category hierarchy creation with 3 levels\n");

    // Execute all steps
    await this.step1_ListExistingCategories();
    await this.step2_CreateParentCategory();
    await this.step3_AddParentIcon();
    await this.step4_SetParentSEO();
    await this.step5_CreateFirstChild();
    await this.step6_LinkChildToParent();
    await this.step7_CreateSecondChild();
    await this.step8_CreateGrandchild();
    await this.step9_ReorderCategories();
    await this.step10_AddCategoryAttributes();
    await this.step11_PublishHierarchy();
    await this.step12_VerifyTreeStructure();

    return this.printSummary();
  }

  // Step 1: List Existing Categories
  private async step1_ListExistingCategories(): Promise<void> {
    await this.executeStep("Step 1: List Existing Categories", async () => {
      const categories = await categoriesService.list({
        isActive: true,
      });

      console.log(`   📊 Found ${categories.length} existing categories`);

      // Show top-level categories
      const topLevel = categories.filter(
        (c) => CategoryHelpers.getLevel(c) === 0
      );
      console.log(`   📁 Top-level categories: ${topLevel.length}`);
    });
  }

  // Step 2: Create Parent Category
  private async step2_CreateParentCategory(): Promise<void> {
    await this.executeStep("Step 2: Create Parent Category", async () => {
      const timestamp = Date.now();
      const categoryName = `Test Category ${timestamp}`;

      const parent = await categoriesService.create({
        name: categoryName,
        slug: generateSlug(categoryName),
        description: "Test parent category for workflow testing",
        parentId: null,
        sortOrder: 999,
        isFeatured: false,
        showOnHomepage: false,
        isActive: true,
        commissionRate: 10,
      });

      this.createdParentId = CategoryHelpers.getId(parent);
      console.log(
        `   ✅ Parent category created: ${CategoryHelpers.getName(
          parent
        )} (Level ${CategoryHelpers.getLevel(parent)})`
      );
    });
  }

  // Step 3: Add Parent Icon/Image
  private async step3_AddParentIcon(): Promise<void> {
    await this.executeStep("Step 3: Add Parent Icon/Image", async () => {
      if (!this.createdParentId) {
        throw new Error("Parent category ID not available");
      }

      const updated = await categoriesService.update(this.createdParentId, {
        icon: "📂",
        image: `https://picsum.photos/400/300?random=${Date.now()}`,
        color: "#4F46E5",
      });

      console.log(`   ✅ Added icon, image, and banner to parent category`);
    });
  }

  // Step 4: Set Parent SEO
  private async step4_SetParentSEO(): Promise<void> {
    await this.executeStep("Step 4: Set Parent SEO Metadata", async () => {
      if (!this.createdParentId) {
        throw new Error("Parent category ID not available");
      }

      const category = await categoriesService.getById(this.createdParentId);
      const categoryName = CategoryHelpers.getName(category);

      const updated = await categoriesService.update(this.createdParentId, {
        metaTitle: `${categoryName} - Shop Online | Best Deals`,
        metaDescription: `Browse ${categoryName.toLowerCase()} products at best prices. Wide range of products with fast delivery and easy returns.`,
      });

      console.log(`   ✅ SEO metadata configured for parent`);
    });
  }

  // Step 5: Create First Child Category
  private async step5_CreateFirstChild(): Promise<void> {
    await this.executeStep("Step 5: Create First Child Category", async () => {
      if (!this.createdParentId) {
        throw new Error("Parent category ID not available");
      }

      const timestamp = Date.now();
      const childName = `Child 1 - ${timestamp}`;
      const childSlug = generateSlug(childName);

      const child = await categoriesService.create({
        name: childName,
        slug: childSlug,
        description: "First child category in hierarchy",
        parentId: this.createdParentId,
        sortOrder: 1,
        isFeatured: false,
        showOnHomepage: false,
        isActive: true,
        commissionRate: 12,
      });

      this.createdChild1Id = CategoryHelpers.getId(child);
      console.log(
        `   ✅ Child 1 created: ${CategoryHelpers.getName(
          child
        )} (Level ${CategoryHelpers.getLevel(child)})`
      );
    });
  }

  // Step 6: Link Child to Parent
  private async step6_LinkChildToParent(): Promise<void> {
    await this.executeStep(
      "Step 6: Update Parent hasChildren Flag",
      async () => {
        if (!this.createdParentId) {
          throw new Error("Parent category ID not available");
        }

        // Note: hasChildren and childCount are managed by the backend automatically
        // when child categories are created with parentId set

        const parent = await categoriesService.getById(this.createdParentId);

        console.log(
          `   ✅ Parent auto-updated by backend: hasChildren=${parent.hasChildren}, childCount=${parent.childCount}`
        );
      }
    );
  }

  // Step 7: Create Second Child
  private async step7_CreateSecondChild(): Promise<void> {
    await this.executeStep("Step 7: Create Second Child Category", async () => {
      if (!this.createdParentId) {
        throw new Error("Parent category ID not available");
      }

      const timestamp = Date.now();
      const childName = `Child 2 - ${timestamp}`;
      const childSlug = generateSlug(childName);

      const child = await categoriesService.create({
        name: childName,
        slug: childSlug,
        description: "Second child category in hierarchy",
        parentId: this.createdParentId,
        sortOrder: 2,
        isFeatured: false,
        showOnHomepage: false,
        isActive: true,
        commissionRate: 12,
      });

      this.createdChild2Id = CategoryHelpers.getId(child);

      // Backend automatically updates parent childCount

      console.log(
        `   ✅ Child 2 created: ${CategoryHelpers.getName(
          child
        )} (Level ${CategoryHelpers.getLevel(child)})`
      );
    });
  }

  // Step 8: Create Grandchild (Level 3)
  private async step8_CreateGrandchild(): Promise<void> {
    await this.executeStep("Step 8: Create Grandchild (Level 3)", async () => {
      if (!this.createdChild1Id) {
        throw new Error("Child 1 category ID not available");
      }

      const timestamp = Date.now();
      const grandchildName = `Grandchild - ${timestamp}`;
      const grandchildSlug = generateSlug(grandchildName);

      const grandchild = await categoriesService.create({
        name: grandchildName,
        slug: grandchildSlug,
        description: "Third level category - grandchild",
        parentId: this.createdChild1Id,
        sortOrder: 1,
        isFeatured: false,
        showOnHomepage: false,
        isActive: true,
        commissionRate: 15,
      });

      this.createdGrandchildId = CategoryHelpers.getId(grandchild);

      // Backend automatically updates child1 hasChildren and childCount

      console.log(
        `   ✅ Grandchild created: ${CategoryHelpers.getName(
          grandchild
        )} (Level ${CategoryHelpers.getLevel(grandchild)})`
      );
    });
  }

  // Step 9: Reorder Categories
  private async step9_ReorderCategories(): Promise<void> {
    await this.executeStep("Step 9: Reorder Category Sort Order", async () => {
      if (!this.createdChild1Id || !this.createdChild2Id) {
        throw new Error("Child category IDs not available");
      }

      // Swap sort orders
      await categoriesService.update(this.createdChild1Id, {
        sortOrder: 2,
      });

      await categoriesService.update(this.createdChild2Id, {
        sortOrder: 1,
      });

      console.log(
        `   ✅ Categories reordered: Child 2 now comes before Child 1`
      );
    });
  }

  // Step 10: Add Category Attributes
  private async step10_AddCategoryAttributes(): Promise<void> {
    await this.executeStep(
      "Step 10: Add Category Attributes & Features",
      async () => {
        if (!this.createdParentId) {
          throw new Error("Parent category ID not available");
        }

        const updated = await categoriesService.update(this.createdParentId, {
          isFeatured: true,
          showOnHomepage: true,
        });

        console.log(
          `   ✅ Parent category marked as featured and shown on homepage`
        );
      }
    );
  }

  // Step 11: Publish Hierarchy
  private async step11_PublishHierarchy(): Promise<void> {
    await this.executeStep("Step 11: Publish Category Hierarchy", async () => {
      // Ensure all categories are active
      const categoryIds = [
        this.createdParentId,
        this.createdChild1Id,
        this.createdChild2Id,
        this.createdGrandchildId,
      ].filter(Boolean) as string[];

      for (const catId of categoryIds) {
        await categoriesService.update(catId, {
          isActive: true,
        });
      }

      console.log(
        `   ✅ Published ${categoryIds.length} categories in hierarchy`
      );
    });
  }

  // Step 12: Verify Tree Structure
  private async step12_VerifyTreeStructure(): Promise<void> {
    await this.executeStep(
      "Step 12: Verify Category Tree & Breadcrumbs",
      async () => {
        if (
          !this.createdParentId ||
          !this.createdChild1Id ||
          !this.createdGrandchildId
        ) {
          throw new Error("Category IDs not available for verification");
        }

        // Verify parent
        const parent = await categoriesService.getById(this.createdParentId);
        if (CategoryHelpers.getLevel(parent) !== 0) {
          throw new Error("Parent level incorrect");
        }
        if (!parent.hasChildren || parent.childCount !== 2) {
          throw new Error("Parent childCount incorrect");
        }

        // Verify child1
        const child1 = await categoriesService.getById(this.createdChild1Id);
        if (CategoryHelpers.getLevel(child1) !== 1) {
          throw new Error("Child1 level incorrect");
        }
        if (CategoryHelpers.getParentId(child1) !== this.createdParentId) {
          throw new Error("Child1 parent link incorrect");
        }

        // Verify grandchild
        const grandchild = await categoriesService.getById(
          this.createdGrandchildId
        );
        if (CategoryHelpers.getLevel(grandchild) !== 2) {
          throw new Error("Grandchild level incorrect");
        }
        if (CategoryHelpers.getParentId(grandchild) !== this.createdChild1Id) {
          throw new Error("Grandchild parent link incorrect");
        }

        // Verify paths (breadcrumbs)
        const parentPath = parent.path;
        const child1Path = child1.path;
        const grandchildPath = grandchild.path;

        if (!child1Path.startsWith(parentPath)) {
          throw new Error("Child1 path doesn't start with parent path");
        }
        if (!grandchildPath.startsWith(child1Path)) {
          throw new Error("Grandchild path doesn't start with child1 path");
        }

        console.log(`   ✅ Category tree structure verified`);
        console.log(
          `   📁 Parent: ${CategoryHelpers.getName(parent)} (Level 0)`
        );
        console.log(`      ├─ ${CategoryHelpers.getName(child1)} (Level 1)`);
        console.log(
          `      │  └─ ${CategoryHelpers.getName(grandchild)} (Level 2)`
        );
        console.log(`      └─ Child 2 (Level 1)`);
        console.log(`\n   🔗 Breadcrumb paths verified:`);
        console.log(`      Parent: /${parentPath}`);
        console.log(`      Child 1: /${child1Path}`);
        console.log(`      Grandchild: /${grandchildPath}`);

        if (this.createdParentId) {
          console.log(`\n   📂 Created Parent ID: ${this.createdParentId}`);
        }
        if (this.createdChild1Id) {
          console.log(`   📂 Created Child 1 ID: ${this.createdChild1Id}`);
        }
        if (this.createdChild2Id) {
          console.log(`   📂 Created Child 2 ID: ${this.createdChild2Id}`);
        }
        if (this.createdGrandchildId) {
          console.log(
            `   📂 Created Grandchild ID: ${this.createdGrandchildId}`
          );
        }
      }
    );
  }
}

// Allow direct execution
if (require.main === module) {
  const workflow = new AdminCategoryCreationWorkflow();

  workflow
    .run()
    .then((result) => {
      console.log("\n✅ Workflow completed!");
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Workflow failed:", error.message);
      process.exit(1);
    });
}
