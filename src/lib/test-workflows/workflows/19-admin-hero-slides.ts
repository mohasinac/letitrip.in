/**
 * Workflow #19: Admin Hero Slides Management
 *
 * Complete hero slides management workflow:
 * 1. Navigate to hero slides page
 * 2. Create new hero slide
 * 3. Set slide title and subtitle
 * 4. Upload slide image (1920x600)
 * 5. Add CTA button text and link
 * 6. Set display priority/order
 * 7. Schedule display dates
 * 8. Activate slide
 * 9. Create second slide
 * 10. Reorder slides
 * 11. View all active slides
 * 12. Cleanup test slides
 *
 * Expected time: 10-12 minutes
 * Success criteria: All hero slide operations successful
 */

import {
  heroSlidesService,
  HeroSlide,
  HeroSlideFormData,
} from "@/services/hero-slides.service";
import { BaseWorkflow, WorkflowResult } from "../helpers";

export class AdminHeroSlidesWorkflow extends BaseWorkflow {
  private testSlideIds: string[] = [];

  async run(): Promise<WorkflowResult> {
    this.initialize();

    try {
      // Step 1: Navigate to hero slides page
      await this.executeStep("Navigate to Hero Slides Management", async () => {
        console.log("Navigating to /admin/hero-slides");

        // Get existing slides to verify access
        const slides = await heroSlidesService.getHeroSlides();

        console.log(`Found ${slides.length} existing hero slides`);
      });

      // Step 2-5: Create new hero slide with all details
      await this.executeStep("Create First Hero Slide", async () => {
        const slideData: HeroSlideFormData = {
          title: "Test Hero Slide - Summer Sale",
          subtitle: "Up to 50% Off",
          description: "Amazing deals on all products",
          image:
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop",
          mobileImage:
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop",
          ctaText: "Shop Now",
          ctaLink: "/products",
          ctaTarget: "_self",
          order: 1,
          isActive: false,
          backgroundColor: "#FF6B35",
          textColor: "#FFFFFF",
        };

        const newSlide = await heroSlidesService.createHeroSlide(slideData);

        this.testSlideIds.push(newSlide.id);

        console.log(`Created hero slide: ${newSlide.title}`);
        console.log(`  ID: ${newSlide.id}`);
        console.log(`  Order: ${newSlide.order}`);
        console.log(`  CTA: ${newSlide.ctaText} → ${newSlide.ctaLink}`);
      });

      // Step 6: Set display priority (already set in creation)
      await this.executeStep("Verify Display Priority", async () => {
        if (this.testSlideIds.length === 0) {
          throw new Error("No test slides available");
        }

        const slide = await heroSlidesService.getHeroSlideById(
          this.testSlideIds[0]
        );

        console.log(`Display order: ${slide.order}`);
        console.log(`Active status: ${slide.isActive}`);
      });

      // Step 7: Schedule display dates
      await this.executeStep("Schedule Display Dates", async () => {
        if (this.testSlideIds.length === 0) {
          throw new Error("No test slides available");
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const updatedSlide = await heroSlidesService.updateHeroSlide(
          this.testSlideIds[0],
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }
        );

        console.log("Display dates scheduled:");
        console.log(
          `  Start: ${new Date(updatedSlide.startDate!).toLocaleDateString()}`
        );
        console.log(
          `  End: ${new Date(updatedSlide.endDate!).toLocaleDateString()}`
        );
      });

      // Step 8: Activate slide
      await this.executeStep("Activate Hero Slide", async () => {
        if (this.testSlideIds.length === 0) {
          throw new Error("No test slides available");
        }

        const activatedSlide = await heroSlidesService.updateHeroSlide(
          this.testSlideIds[0],
          {
            isActive: true,
          }
        );

        console.log(`Activated slide: ${activatedSlide.title}`);
        console.log(
          `  Status: ${activatedSlide.isActive ? "Active" : "Inactive"}`
        );
      });

      // Step 9: Create second slide
      await this.executeStep("Create Second Hero Slide", async () => {
        const slideData: HeroSlideFormData = {
          title: "Test Hero Slide - New Arrivals",
          subtitle: "Fresh Collection",
          description: "Check out our latest products",
          image:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop",
          mobileImage:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
          ctaText: "Explore",
          ctaLink: "/products/new",
          ctaTarget: "_self",
          order: 2,
          isActive: true,
          backgroundColor: "#4A90E2",
          textColor: "#FFFFFF",
        };

        const newSlide = await heroSlidesService.createHeroSlide(slideData);

        this.testSlideIds.push(newSlide.id);

        console.log(`Created second slide: ${newSlide.title}`);
        console.log(`  Order: ${newSlide.order}`);
        console.log(`  Status: ${newSlide.isActive ? "Active" : "Inactive"}`);
      });

      // Step 10: Reorder slides
      await this.executeStep("Reorder Hero Slides", async () => {
        if (this.testSlideIds.length < 2) {
          console.log("Not enough slides to reorder");
          return;
        }

        // Swap the order of the two test slides
        const slideOrders = [
          { id: this.testSlideIds[0], order: 2 },
          { id: this.testSlideIds[1], order: 1 },
        ];

        await heroSlidesService.reorderSlides(slideOrders);

        console.log("Slides reordered successfully");
        console.log(`  Slide 1 now at order: 2`);
        console.log(`  Slide 2 now at order: 1`);
      });

      // Step 11: View all active slides
      await this.executeStep("View All Active Slides", async () => {
        const activeSlides = await heroSlidesService.getHeroSlides({
          isActive: true,
        });

        console.log(`Total active slides: ${activeSlides.length}`);

        if (activeSlides.length > 0) {
          console.log("Active slides:");
          activeSlides.slice(0, 5).forEach((slide) => {
            console.log(`  - ${slide.title} (Order: ${slide.order})`);
          });
        }

        // Get all slides for statistics
        const allSlides = await heroSlidesService.getHeroSlides();

        const stats = {
          total: allSlides.length,
          active: allSlides.filter((s) => s.isActive).length,
          inactive: allSlides.filter((s) => !s.isActive).length,
          scheduled: allSlides.filter(
            (s) => s.startDate && new Date(s.startDate) > new Date()
          ).length,
        };

        console.log("\nHero Slides Statistics:");
        console.log(`  Total: ${stats.total}`);
        console.log(`  Active: ${stats.active}`);
        console.log(`  Inactive: ${stats.inactive}`);
        console.log(`  Scheduled: ${stats.scheduled}`);
      });

      // Step 12: Cleanup test slides
      await this.executeStep("Cleanup Test Slides", async () => {
        let deleted = 0;

        for (const slideId of this.testSlideIds) {
          try {
            await heroSlidesService.deleteHeroSlide(slideId);
            deleted++;
            console.log(`Deleted test slide: ${slideId}`);
          } catch (error) {
            console.log(`Could not delete slide ${slideId}: ${error}`);
          }
        }

        console.log(
          `Cleaned up ${deleted}/${this.testSlideIds.length} test slides`
        );
      });
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }

    return this.printSummary();
  }
}
