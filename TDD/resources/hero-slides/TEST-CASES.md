# Hero Slides Resource - Test Cases

## Unit Tests

### Hero Slide Operations

```typescript
describe("Hero Slides Service", () => {
  describe("getHeroSlides", () => {
    it("should return active slides", async () => {
      const slides = await homepageService.getHeroSlides();
      slides.forEach((slide) => {
        expect(slide.isActive).toBe(true);
      });
    });

    it("should respect scheduling", async () => {
      const slides = await homepageService.getHeroSlides();
      const now = new Date();
      slides.forEach((slide) => {
        if (slide.startDate) {
          expect(new Date(slide.startDate) <= now).toBe(true);
        }
        if (slide.endDate) {
          expect(new Date(slide.endDate) >= now).toBe(true);
        }
      });
    });

    it("should order by sortOrder", async () => {
      const slides = await homepageService.getHeroSlides();
      for (let i = 1; i < slides.length; i++) {
        expect(slides[i - 1].sortOrder).toBeLessThanOrEqual(
          slides[i].sortOrder,
        );
      }
    });
  });
});
```

### Admin Hero Slide Management

```typescript
describe("Admin Hero Slides", () => {
  describe("getHeroSlidesAdmin", () => {
    it("should return all slides including inactive", async () => {
      const slides = await homepageService.getHeroSlidesAdmin();
      expect(slides.some((s) => !s.isActive)).toBe(true);
    });
  });

  describe("createHeroSlide", () => {
    it("should create slide", async () => {
      const slide = await homepageService.createHeroSlide({
        title: "Summer Sale",
        subtitle: "Up to 50% off",
        image: "https://...",
        link: "/categories/electronics",
        isActive: true,
      });
      expect(slide.id).toBeDefined();
    });

    it("should set sortOrder automatically", async () => {
      const slide = await homepageService.createHeroSlide({
        title: "New Slide",
        image: "https://...",
      });
      expect(slide.sortOrder).toBeDefined();
    });

    it("should validate required fields", async () => {
      await expect(
        homepageService.createHeroSlide({ title: "No Image" }),
      ).rejects.toThrow("Image is required");
    });

    it("should support scheduling", async () => {
      const slide = await homepageService.createHeroSlide({
        title: "Scheduled Sale",
        image: "https://...",
        startDate: "2024-12-01T00:00:00Z",
        endDate: "2024-12-31T23:59:59Z",
      });
      expect(slide.startDate).toBe("2024-12-01T00:00:00Z");
    });
  });

  describe("updateHeroSlide", () => {
    it("should update slide", async () => {
      const updated = await homepageService.updateHeroSlide("slide_001", {
        title: "Updated Title",
      });
      expect(updated.title).toBe("Updated Title");
    });

    it("should toggle active status", async () => {
      const updated = await homepageService.updateHeroSlide("slide_001", {
        isActive: false,
      });
      expect(updated.isActive).toBe(false);
    });

    it("should update styling", async () => {
      const updated = await homepageService.updateHeroSlide("slide_001", {
        backgroundColor: "#ff0000",
        textColor: "#ffffff",
      });
      expect(updated.backgroundColor).toBe("#ff0000");
    });
  });

  describe("deleteHeroSlide", () => {
    it("should delete slide", async () => {
      const result = await homepageService.deleteHeroSlide("slide_001");
      expect(result.success).toBe(true);
    });
  });

  describe("reorderHeroSlides", () => {
    it("should reorder slides", async () => {
      await homepageService.reorderHeroSlides([
        { id: "slide_001", sortOrder: 2 },
        { id: "slide_002", sortOrder: 1 },
      ]);

      const slides = await homepageService.getHeroSlides();
      expect(slides[0].id).toBe("slide_002");
    });
  });
});
```

### Scheduled Slides

```typescript
describe("Scheduled Hero Slides", () => {
  it("should not show future slides", async () => {
    // Create slide that starts tomorrow
    await homepageService.createHeroSlide({
      title: "Future Sale",
      image: "https://...",
      startDate: new Date(Date.now() + 86400000).toISOString(),
      isActive: true,
    });

    const slides = await homepageService.getHeroSlides();
    expect(slides.find((s) => s.title === "Future Sale")).toBeUndefined();
  });

  it("should not show expired slides", async () => {
    // Create slide that ended yesterday
    await homepageService.createHeroSlide({
      title: "Expired Sale",
      image: "https://...",
      endDate: new Date(Date.now() - 86400000).toISOString(),
      isActive: true,
    });

    const slides = await homepageService.getHeroSlides();
    expect(slides.find((s) => s.title === "Expired Sale")).toBeUndefined();
  });

  it("should show slides within date range", async () => {
    await homepageService.createHeroSlide({
      title: "Current Sale",
      image: "https://...",
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      isActive: true,
    });

    const slides = await homepageService.getHeroSlides();
    expect(slides.find((s) => s.title === "Current Sale")).toBeDefined();
  });
});
```

---

## Integration Tests

### Public Hero Slides API

```typescript
describe("Hero Slides API Integration", () => {
  describe("GET /api/hero-slides", () => {
    it("should return active slides", async () => {
      const response = await fetch("/api/hero-slides");
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toBeInstanceOf(Array);
    });

    it("should be publicly accessible", async () => {
      const response = await fetch("/api/hero-slides");
      expect(response.status).toBe(200);
    });
  });
});
```

### Admin Hero Slides API

```typescript
describe("Admin Hero Slides API Integration", () => {
  let adminToken: string;

  beforeAll(async () => {
    adminToken = await getTestAdminToken();
  });

  describe("GET /api/admin/hero-slides", () => {
    it("should require admin role", async () => {
      const userToken = await getTestUserToken();
      const response = await fetch("/api/admin/hero-slides", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(response.status).toBe(403);
    });

    it("should return all slides", async () => {
      const response = await fetch("/api/admin/hero-slides", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/admin/hero-slides", () => {
    it("should create slide", async () => {
      const response = await fetch("/api/admin/hero-slides", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Slide",
          image: "https://test.jpg",
          link: "/test",
          isActive: true,
        }),
      });
      expect(response.status).toBe(201);
    });
  });

  describe("PATCH /api/admin/hero-slides/:id", () => {
    it("should update slide", async () => {
      const response = await fetch("/api/admin/hero-slides/slide_001", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Updated" }),
      });
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/admin/hero-slides/:id", () => {
    it("should delete slide", async () => {
      const response = await fetch("/api/admin/hero-slides/slide_001", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(response.status).toBe(200);
    });
  });

  describe("PATCH /api/admin/hero-slides/reorder", () => {
    it("should reorder slides", async () => {
      const response = await fetch("/api/admin/hero-slides/reorder", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orders: [
            { id: "slide_001", sortOrder: 1 },
            { id: "slide_002", sortOrder: 2 },
          ],
        }),
      });
      expect(response.status).toBe(200);
    });
  });
});
```
