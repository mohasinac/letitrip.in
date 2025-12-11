/**
 * Tests for SEO Schema.org Structured Data
 */

import { siteConfig } from "../metadata";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateItemListSchema,
  generateJSONLD,
  generateLocalBusinessSchema,
  generateOfferSchema,
  generateOrganizationSchema,
  generateProductSchema,
  generateReviewSchema,
  generateWebSiteSchema,
} from "../schema";

describe("SEO Schema", () => {
  describe("generateOrganizationSchema", () => {
    it("should generate organization schema", () => {
      const schema = generateOrganizationSchema();

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Organization");
      expect(schema.name).toBe(siteConfig.name);
      expect(schema.url).toBe(siteConfig.url);
    });

    it("should include logo", () => {
      const schema = generateOrganizationSchema();

      expect(schema.logo).toContain("/logo.png");
    });

    it("should include description", () => {
      const schema = generateOrganizationSchema();

      expect(schema.description).toBe(siteConfig.description);
    });

    it("should include address", () => {
      const schema = generateOrganizationSchema();

      expect(schema.address).toBeDefined();
      expect(schema.address["@type"]).toBe("PostalAddress");
      expect(schema.address.addressCountry).toBe("IN");
    });

    it("should include contact point", () => {
      const schema = generateOrganizationSchema();

      expect(schema.contactPoint).toBeDefined();
      expect(Array.isArray(schema.contactPoint)).toBe(true);
      expect(schema.contactPoint[0]["@type"]).toBe("ContactPoint");
      expect(schema.contactPoint[0].contactType).toBe("customer service");
      expect(schema.contactPoint[0].areaServed).toBe("IN");
    });

    it("should include social media links", () => {
      const schema = generateOrganizationSchema();

      expect(schema.sameAs).toBeDefined();
      expect(Array.isArray(schema.sameAs)).toBe(true);
      expect(schema.sameAs).toContain(siteConfig.links.twitter);
      expect(schema.sameAs).toContain(siteConfig.links.facebook);
      expect(schema.sameAs).toContain(siteConfig.links.instagram);
    });

    it("should include available languages", () => {
      const schema = generateOrganizationSchema();

      expect(schema.contactPoint[0].availableLanguage).toContain("English");
      expect(schema.contactPoint[0].availableLanguage).toContain("Hindi");
    });
  });

  describe("generateWebSiteSchema", () => {
    it("should generate website schema", () => {
      const schema = generateWebSiteSchema();

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("WebSite");
      expect(schema.name).toBe(siteConfig.name);
      expect(schema.url).toBe(siteConfig.url);
    });

    it("should include search action", () => {
      const schema = generateWebSiteSchema();

      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction["@type"]).toBe("SearchAction");
    });

    it("should have search URL template", () => {
      const schema = generateWebSiteSchema();

      expect(schema.potentialAction.target.urlTemplate).toContain("/search?q=");
      expect(schema.potentialAction.target.urlTemplate).toContain(
        "{search_term_string}"
      );
    });

    it("should specify query input", () => {
      const schema = generateWebSiteSchema();

      expect(schema.potentialAction["query-input"]).toBe(
        "required name=search_term_string"
      );
    });
  });

  describe("generateProductSchema", () => {
    const productData = {
      name: "Beyblade X Starter",
      description: "Authentic Japanese Beyblade",
      image: "https://example.com/beyblade.jpg",
      sku: "BEY-X-001",
      brand: "Takara Tomy",
      price: 1500,
      url: "https://letitrip.in/products/beyblade-x",
    };

    it("should generate product schema", () => {
      const schema = generateProductSchema(productData);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Product");
      expect(schema.name).toBe(productData.name);
      expect(schema.description).toBe(productData.description);
    });

    it("should include product image", () => {
      const schema = generateProductSchema(productData);

      expect(schema.image).toBe(productData.image);
    });

    it("should include SKU", () => {
      const schema = generateProductSchema(productData);

      expect(schema.sku).toBe(productData.sku);
    });

    it("should include brand", () => {
      const schema = generateProductSchema(productData);

      expect(schema.brand).toBeDefined();
      expect(schema.brand["@type"]).toBe("Brand");
      expect(schema.brand.name).toBe(productData.brand);
    });

    it("should handle missing brand", () => {
      const { brand, ...dataWithoutBrand } = productData;
      const schema = generateProductSchema(dataWithoutBrand);

      expect(schema.brand).toBeUndefined();
    });

    it("should include offer details", () => {
      const schema = generateProductSchema(productData);

      expect(schema.offers).toBeDefined();
      expect(schema.offers["@type"]).toBe("Offer");
      expect(schema.offers.price).toBe("1500");
      expect(schema.offers.priceCurrency).toBe("INR");
    });

    it("should support custom currency", () => {
      const schema = generateProductSchema({
        ...productData,
        currency: "USD",
      });

      expect(schema.offers.priceCurrency).toBe("USD");
    });

    it("should include availability", () => {
      const schema = generateProductSchema(productData);

      expect(schema.offers.availability).toBe("https://schema.org/InStock");
    });

    it("should support different availability states", () => {
      const outOfStockSchema = generateProductSchema({
        ...productData,
        availability: "OutOfStock",
      });

      expect(outOfStockSchema.offers.availability).toBe(
        "https://schema.org/OutOfStock"
      );

      const preOrderSchema = generateProductSchema({
        ...productData,
        availability: "PreOrder",
      });

      expect(preOrderSchema.offers.availability).toBe(
        "https://schema.org/PreOrder"
      );
    });

    it("should include condition", () => {
      const schema = generateProductSchema(productData);

      expect(schema.offers.itemCondition).toBe(
        "https://schema.org/NewCondition"
      );
    });

    it("should support different conditions", () => {
      const usedSchema = generateProductSchema({
        ...productData,
        condition: "UsedCondition",
      });

      expect(usedSchema.offers.itemCondition).toBe(
        "https://schema.org/UsedCondition"
      );
    });

    it("should include seller information", () => {
      const schema = generateProductSchema(productData);

      expect(schema.offers.seller).toBeDefined();
      expect(schema.offers.seller["@type"]).toBe("Organization");
      expect(schema.offers.seller.name).toBe(siteConfig.name);
    });

    it("should include shipping details", () => {
      const schema = generateProductSchema(productData);

      expect(schema.offers.shippingDetails).toBeDefined();
      expect(schema.offers.shippingDetails["@type"]).toBe(
        "OfferShippingDetails"
      );
      expect(
        schema.offers.shippingDetails.shippingDestination.addressCountry
      ).toBe("IN");
    });

    it("should include delivery time estimates", () => {
      const schema = generateProductSchema(productData);

      const deliveryTime = schema.offers.shippingDetails.deliveryTime;
      expect(deliveryTime).toBeDefined();
      expect(deliveryTime.handlingTime.minValue).toBe(1);
      expect(deliveryTime.handlingTime.maxValue).toBe(2);
      expect(deliveryTime.transitTime.minValue).toBe(2);
      expect(deliveryTime.transitTime.maxValue).toBe(7);
    });

    it("should include aggregate rating if provided", () => {
      const schema = generateProductSchema({
        ...productData,
        rating: 4.5,
        reviewCount: 25,
      });

      expect(schema.aggregateRating).toBeDefined();
      expect(schema.aggregateRating["@type"]).toBe("AggregateRating");
      expect(schema.aggregateRating.ratingValue).toBe("4.5");
      expect(schema.aggregateRating.reviewCount).toBe("25");
      expect(schema.aggregateRating.bestRating).toBe("5");
      expect(schema.aggregateRating.worstRating).toBe("1");
    });

    it("should not include rating if not provided", () => {
      const schema = generateProductSchema(productData);

      expect(schema.aggregateRating).toBeUndefined();
    });

    it("should not include rating if only rating without count", () => {
      const schema = generateProductSchema({
        ...productData,
        rating: 4.5,
      });

      expect(schema.aggregateRating).toBeUndefined();
    });
  });

  describe("generateFAQSchema", () => {
    const faqs = [
      {
        question: "What is the shipping time?",
        answer: "We ship within 3-7 business days.",
      },
      {
        question: "Do you charge customs fees?",
        answer: "No, we handle all customs fees.",
      },
    ];

    it("should generate FAQ schema", () => {
      const schema = generateFAQSchema(faqs);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("FAQPage");
      expect(schema.mainEntity).toHaveLength(2);
    });

    it("should include questions", () => {
      const schema = generateFAQSchema(faqs);

      expect(schema.mainEntity[0]["@type"]).toBe("Question");
      expect(schema.mainEntity[0].name).toBe(faqs[0].question);
    });

    it("should include answers", () => {
      const schema = generateFAQSchema(faqs);

      expect(schema.mainEntity[0].acceptedAnswer).toBeDefined();
      expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
      expect(schema.mainEntity[0].acceptedAnswer.text).toBe(faqs[0].answer);
    });

    it("should throw error for empty FAQ list", () => {
      expect(() => generateFAQSchema([])).toThrow("FAQs array cannot be empty");
    });

    it("should handle single FAQ", () => {
      const schema = generateFAQSchema([faqs[0]]);

      expect(schema.mainEntity).toHaveLength(1);
    });
  });

  describe("generateBreadcrumbSchema", () => {
    it("should generate breadcrumb schema", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];

      const schema = generateBreadcrumbSchema(items);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("BreadcrumbList");
      expect(schema.itemListElement).toHaveLength(2);
    });

    it("should set correct positions", () => {
      const items = [
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
      ];

      const schema = generateBreadcrumbSchema(items);

      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
    });

    it("should handle relative URLs", () => {
      const items = [{ name: "Home", url: "/home" }];

      const schema = generateBreadcrumbSchema(items);

      expect(schema.itemListElement[0].item).toBe(`${siteConfig.url}/home`);
    });

    it("should handle absolute URLs", () => {
      const absoluteUrl = "https://external.com/page";
      const items = [{ name: "External", url: absoluteUrl }];

      const schema = generateBreadcrumbSchema(items);

      expect(schema.itemListElement[0].item).toBe(absoluteUrl);
    });
  });

  describe("generateLocalBusinessSchema", () => {
    it("should generate local business schema", () => {
      const schema = generateLocalBusinessSchema();

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("LocalBusiness");
      expect(schema.name).toBe(siteConfig.name);
    });

    it("should include contact information", () => {
      const schema = generateLocalBusinessSchema();

      expect(schema.telephone).toBeDefined();
      expect(schema.email).toBe("support@letitrip.com");
    });

    it("should include opening hours", () => {
      const schema = generateLocalBusinessSchema();

      expect(schema.openingHoursSpecification).toBeDefined();
      expect(Array.isArray(schema.openingHoursSpecification)).toBe(true);
      expect(schema.openingHoursSpecification[0].opens).toBe("10:00");
      expect(schema.openingHoursSpecification[0].closes).toBe("19:00");
    });

    it("should include payment methods", () => {
      const schema = generateLocalBusinessSchema();

      expect(schema.paymentAccepted).toContain("UPI");
      expect(schema.paymentAccepted).toContain("COD");
    });

    it("should include price range", () => {
      const schema = generateLocalBusinessSchema();

      expect(schema.priceRange).toBe("₹₹");
    });

    it("should include currency", () => {
      const schema = generateLocalBusinessSchema();

      expect(schema.currenciesAccepted).toBe("INR");
    });
  });

  describe("generateItemListSchema", () => {
    const items = [
      {
        name: "Product 1",
        url: "https://example.com/product1",
        image: "https://example.com/image1.jpg",
        price: 1000,
      },
      {
        name: "Product 2",
        url: "https://example.com/product2",
        image: "https://example.com/image2.jpg",
        price: 1500,
      },
    ];

    it("should generate item list schema", () => {
      const schema = generateItemListSchema(items);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("ItemList");
      expect(schema.itemListElement).toHaveLength(2);
    });

    it("should set correct positions", () => {
      const schema = generateItemListSchema(items);

      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[1].position).toBe(2);
    });

    it("should include product details", () => {
      const schema = generateItemListSchema(items);

      const firstItem = schema.itemListElement[0].item;
      expect(firstItem["@type"]).toBe("Product");
      expect(firstItem.name).toBe(items[0].name);
      expect(firstItem.url).toBe(items[0].url);
      expect(firstItem.image).toBe(items[0].image);
    });

    it("should include offer with price", () => {
      const schema = generateItemListSchema(items);

      const firstItem = schema.itemListElement[0].item;
      expect(firstItem.offers).toBeDefined();
      expect(firstItem.offers.price).toBe("1000");
      expect(firstItem.offers.priceCurrency).toBe("INR");
    });
  });

  describe("generateReviewSchema", () => {
    const reviewData = {
      productName: "Beyblade X",
      reviewBody: "Great product!",
      rating: 5,
      authorName: "John Doe",
      datePublished: "2024-12-08",
    };

    it("should generate review schema", () => {
      const schema = generateReviewSchema(reviewData);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Review");
    });

    it("should include product reference", () => {
      const schema = generateReviewSchema(reviewData);

      expect(schema.itemReviewed).toBeDefined();
      expect(schema.itemReviewed["@type"]).toBe("Product");
      expect(schema.itemReviewed.name).toBe(reviewData.productName);
    });

    it("should include rating", () => {
      const schema = generateReviewSchema(reviewData);

      expect(schema.reviewRating).toBeDefined();
      expect(schema.reviewRating["@type"]).toBe("Rating");
      expect(schema.reviewRating.ratingValue).toBe("5");
      expect(schema.reviewRating.bestRating).toBe("5");
      expect(schema.reviewRating.worstRating).toBe("1");
    });

    it("should include review body", () => {
      const schema = generateReviewSchema(reviewData);

      expect(schema.reviewBody).toBe(reviewData.reviewBody);
    });

    it("should include author", () => {
      const schema = generateReviewSchema(reviewData);

      expect(schema.author).toBeDefined();
      expect(schema.author["@type"]).toBe("Person");
      expect(schema.author.name).toBe(reviewData.authorName);
    });

    it("should include publication date", () => {
      const schema = generateReviewSchema(reviewData);

      expect(schema.datePublished).toBe(reviewData.datePublished);
    });
  });

  describe("generateOfferSchema", () => {
    const offerData = {
      name: "Black Friday Sale",
      description: "Get 20% off",
      code: "BLACKFRIDAY20",
      discountType: "percentage" as const,
      discountValue: 20,
      validFrom: "2024-11-25",
      validThrough: "2024-11-30",
    };

    it("should generate offer schema", () => {
      const schema = generateOfferSchema(offerData);

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Offer");
      expect(schema.name).toBe(offerData.name);
    });

    it("should include description", () => {
      const schema = generateOfferSchema(offerData);

      expect(schema.description).toBe(offerData.description);
    });

    it("should handle percentage discount", () => {
      const schema = generateOfferSchema(offerData);

      expect(schema.priceSpecification).toBeDefined();
      expect(schema.priceSpecification.price).toBe("-20");
      expect(schema.priceSpecification.priceCurrency).toBe("PERCENT");
    });

    it("should handle fixed discount", () => {
      const fixedOffer = {
        ...offerData,
        discountType: "fixed" as const,
        discountValue: 500,
      };

      const schema = generateOfferSchema(fixedOffer);

      expect(schema.priceSpecification.price).toBe("-500");
      expect(schema.priceSpecification.priceCurrency).toBe("INR");
    });

    it("should include validity dates", () => {
      const schema = generateOfferSchema(offerData);

      expect(schema.validFrom).toBe(offerData.validFrom);
      expect(schema.validThrough).toBe(offerData.validThrough);
    });

    it("should include seller", () => {
      const schema = generateOfferSchema(offerData);

      expect(schema.seller).toBeDefined();
      expect(schema.seller["@type"]).toBe("Organization");
      expect(schema.seller.name).toBe(siteConfig.name);
    });
  });

  describe("generateJSONLD", () => {
    it("should generate JSON-LD object", () => {
      const schema = { "@type": "Test", name: "Test Schema" };
      const jsonld = generateJSONLD(schema);

      expect(jsonld).toHaveProperty("__html");
      expect(typeof jsonld.__html).toBe("string");
    });

    it("should stringify schema correctly", () => {
      const schema = { "@type": "Test", name: "Test Schema" };
      const jsonld = generateJSONLD(schema);

      expect(jsonld.__html).toContain('"@type"');
      expect(jsonld.__html).toContain("Test Schema");
    });

    it("should handle complex nested objects", () => {
      const schema = {
        "@type": "Product",
        offers: {
          "@type": "Offer",
          price: "100",
        },
      };

      const jsonld = generateJSONLD(schema);

      expect(jsonld.__html).toContain("Offer");
      expect(jsonld.__html).toContain("100");
    });

    it("should handle arrays", () => {
      const schema = {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Q1" },
          { "@type": "Question", name: "Q2" },
        ],
      };

      const jsonld = generateJSONLD(schema);

      expect(jsonld.__html).toContain("Q1");
      expect(jsonld.__html).toContain("Q2");
    });
  });

  describe("BUG FIX #34: Input Validation Edge Cases", () => {
    describe("generateProductSchema validation", () => {
      it("should throw error for missing name", () => {
        expect(() =>
          generateProductSchema({
            name: "",
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: 100,
            url: "https://example.com",
          })
        ).toThrow("Product name is required and must be a string");
      });

      it("should throw error for non-string name", () => {
        expect(() =>
          generateProductSchema({
            name: 123 as any,
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: 100,
            url: "https://example.com",
          })
        ).toThrow("Product name is required and must be a string");
      });

      it("should throw error for missing description", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "",
            image: "image.jpg",
            sku: "SKU123",
            price: 100,
            url: "https://example.com",
          })
        ).toThrow("Product description is required and must be a string");
      });

      it("should throw error for missing image", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "",
            sku: "SKU123",
            price: 100,
            url: "https://example.com",
          })
        ).toThrow("Product image is required and must be a string");
      });

      it("should throw error for missing SKU", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "image.jpg",
            sku: "",
            price: 100,
            url: "https://example.com",
          })
        ).toThrow("Product SKU is required and must be a string");
      });

      it("should throw error for negative price", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: -10,
            url: "https://example.com",
          })
        ).toThrow("Product price must be a non-negative number");
      });

      it("should throw error for non-number price", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: "100" as any,
            url: "https://example.com",
          })
        ).toThrow("Product price must be a non-negative number");
      });

      it("should throw error for missing URL", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: 100,
            url: "",
          })
        ).toThrow("Product URL is required and must be a string");
      });

      it("should throw error for invalid rating", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: 100,
            url: "https://example.com",
            rating: 6,
            reviewCount: 10,
          })
        ).toThrow("Rating must be a number between 0 and 5");
      });

      it("should throw error for negative rating", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: 100,
            url: "https://example.com",
            rating: -1,
            reviewCount: 10,
          })
        ).toThrow("Rating must be a number between 0 and 5");
      });

      it("should throw error for negative review count", () => {
        expect(() =>
          generateProductSchema({
            name: "Test Product",
            description: "Test",
            image: "image.jpg",
            sku: "SKU123",
            price: 100,
            url: "https://example.com",
            rating: 4.5,
            reviewCount: -5,
          })
        ).toThrow("Review count must be a non-negative number");
      });
    });

    describe("generateFAQSchema validation", () => {
      it("should throw error for null faqs", () => {
        expect(() => generateFAQSchema(null as any)).toThrow(
          "FAQs must be an array"
        );
      });

      it("should throw error for undefined faqs", () => {
        expect(() => generateFAQSchema(undefined as any)).toThrow(
          "FAQs must be an array"
        );
      });

      it("should throw error for non-array faqs", () => {
        expect(() => generateFAQSchema({} as any)).toThrow(
          "FAQs must be an array"
        );
      });

      it("should throw error for empty faqs array", () => {
        expect(() => generateFAQSchema([])).toThrow(
          "FAQs array cannot be empty"
        );
      });

      it("should throw error for non-object FAQ item", () => {
        expect(() =>
          generateFAQSchema([
            { question: "Q1", answer: "A1" },
            "invalid" as any,
          ])
        ).toThrow("FAQ at index 1 must be an object");
      });

      it("should throw error for missing question", () => {
        expect(() =>
          generateFAQSchema([
            { question: "Q1", answer: "A1" },
            { question: "", answer: "A2" },
          ])
        ).toThrow("FAQ at index 1 must have a question string");
      });

      it("should throw error for missing answer", () => {
        expect(() =>
          generateFAQSchema([
            { question: "Q1", answer: "A1" },
            { question: "Q2", answer: "" },
          ])
        ).toThrow("FAQ at index 1 must have an answer string");
      });

      it("should throw error for non-string question", () => {
        expect(() =>
          generateFAQSchema([{ question: 123 as any, answer: "A1" }])
        ).toThrow("FAQ at index 0 must have a question string");
      });
    });

    describe("generateBreadcrumbSchema validation", () => {
      it("should throw error for null items", () => {
        expect(() => generateBreadcrumbSchema(null as any)).toThrow(
          "Breadcrumb items must be an array"
        );
      });

      it("should throw error for undefined items", () => {
        expect(() => generateBreadcrumbSchema(undefined as any)).toThrow(
          "Breadcrumb items must be an array"
        );
      });

      it("should throw error for non-array items", () => {
        expect(() => generateBreadcrumbSchema({} as any)).toThrow(
          "Breadcrumb items must be an array"
        );
      });

      it("should throw error for empty items array", () => {
        expect(() => generateBreadcrumbSchema([])).toThrow(
          "Breadcrumb items array cannot be empty"
        );
      });

      it("should throw error for non-object item", () => {
        expect(() =>
          generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            "invalid" as any,
          ])
        ).toThrow("Breadcrumb item at index 1 must be an object");
      });

      it("should throw error for missing name", () => {
        expect(() =>
          generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "", url: "/products" },
          ])
        ).toThrow("Breadcrumb item at index 1 must have a name string");
      });

      it("should throw error for missing url", () => {
        expect(() =>
          generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Products", url: "" },
          ])
        ).toThrow("Breadcrumb item at index 1 must have a url string");
      });
    });

    describe("generateItemListSchema validation", () => {
      it("should throw error for null items", () => {
        expect(() => generateItemListSchema(null as any)).toThrow(
          "Items must be an array"
        );
      });

      it("should throw error for undefined items", () => {
        expect(() => generateItemListSchema(undefined as any)).toThrow(
          "Items must be an array"
        );
      });

      it("should throw error for empty items array", () => {
        expect(() => generateItemListSchema([])).toThrow(
          "Items array cannot be empty"
        );
      });

      it("should throw error for non-object item", () => {
        expect(() =>
          generateItemListSchema([
            {
              name: "Product 1",
              url: "/product1",
              image: "image1.jpg",
              price: 100,
            },
            "invalid" as any,
          ])
        ).toThrow("Item at index 1 must be an object");
      });

      it("should throw error for missing name", () => {
        expect(() =>
          generateItemListSchema([
            {
              name: "",
              url: "/product1",
              image: "image1.jpg",
              price: 100,
            },
          ])
        ).toThrow("Item at index 0 must have a name string");
      });

      it("should throw error for missing url", () => {
        expect(() =>
          generateItemListSchema([
            {
              name: "Product 1",
              url: "",
              image: "image1.jpg",
              price: 100,
            },
          ])
        ).toThrow("Item at index 0 must have a url string");
      });

      it("should throw error for missing image", () => {
        expect(() =>
          generateItemListSchema([
            {
              name: "Product 1",
              url: "/product1",
              image: "",
              price: 100,
            },
          ])
        ).toThrow("Item at index 0 must have an image string");
      });

      it("should throw error for negative price", () => {
        expect(() =>
          generateItemListSchema([
            {
              name: "Product 1",
              url: "/product1",
              image: "image1.jpg",
              price: -10,
            },
          ])
        ).toThrow("Item at index 0 must have a non-negative price number");
      });

      it("should throw error for non-number price", () => {
        expect(() =>
          generateItemListSchema([
            {
              name: "Product 1",
              url: "/product1",
              image: "image1.jpg",
              price: "100" as any,
            },
          ])
        ).toThrow("Item at index 0 must have a non-negative price number");
      });
    });

    describe("generateReviewSchema validation", () => {
      it("should throw error for missing product name", () => {
        expect(() =>
          generateReviewSchema({
            productName: "",
            reviewBody: "Great product",
            rating: 5,
            authorName: "John Doe",
            datePublished: "2024-01-01",
          })
        ).toThrow("Product name is required and must be a string");
      });

      it("should throw error for missing review body", () => {
        expect(() =>
          generateReviewSchema({
            productName: "Test Product",
            reviewBody: "",
            rating: 5,
            authorName: "John Doe",
            datePublished: "2024-01-01",
          })
        ).toThrow("Review body is required and must be a string");
      });

      it("should throw error for rating below 1", () => {
        expect(() =>
          generateReviewSchema({
            productName: "Test Product",
            reviewBody: "Great product",
            rating: 0,
            authorName: "John Doe",
            datePublished: "2024-01-01",
          })
        ).toThrow("Rating must be a number between 1 and 5");
      });

      it("should throw error for rating above 5", () => {
        expect(() =>
          generateReviewSchema({
            productName: "Test Product",
            reviewBody: "Great product",
            rating: 6,
            authorName: "John Doe",
            datePublished: "2024-01-01",
          })
        ).toThrow("Rating must be a number between 1 and 5");
      });

      it("should throw error for non-number rating", () => {
        expect(() =>
          generateReviewSchema({
            productName: "Test Product",
            reviewBody: "Great product",
            rating: "5" as any,
            authorName: "John Doe",
            datePublished: "2024-01-01",
          })
        ).toThrow("Rating must be a number between 1 and 5");
      });

      it("should throw error for missing author name", () => {
        expect(() =>
          generateReviewSchema({
            productName: "Test Product",
            reviewBody: "Great product",
            rating: 5,
            authorName: "",
            datePublished: "2024-01-01",
          })
        ).toThrow("Author name is required and must be a string");
      });

      it("should throw error for missing date published", () => {
        expect(() =>
          generateReviewSchema({
            productName: "Test Product",
            reviewBody: "Great product",
            rating: 5,
            authorName: "John Doe",
            datePublished: "",
          })
        ).toThrow("Date published is required and must be a string");
      });
    });

    describe("generateOfferSchema validation", () => {
      it("should throw error for missing name", () => {
        expect(() =>
          generateOfferSchema({
            name: "",
            description: "10% off",
            code: "SAVE10",
            discountType: "percentage",
            discountValue: 10,
            validFrom: "2024-01-01",
            validThrough: "2024-12-31",
          })
        ).toThrow("Offer name is required and must be a string");
      });

      it("should throw error for missing description", () => {
        expect(() =>
          generateOfferSchema({
            name: "Sale",
            description: "",
            code: "SAVE10",
            discountType: "percentage",
            discountValue: 10,
            validFrom: "2024-01-01",
            validThrough: "2024-12-31",
          })
        ).toThrow("Offer description is required and must be a string");
      });

      it("should throw error for missing code", () => {
        expect(() =>
          generateOfferSchema({
            name: "Sale",
            description: "10% off",
            code: "",
            discountType: "percentage",
            discountValue: 10,
            validFrom: "2024-01-01",
            validThrough: "2024-12-31",
          })
        ).toThrow("Offer code is required and must be a string");
      });

      it("should throw error for invalid discount type", () => {
        expect(() =>
          generateOfferSchema({
            name: "Sale",
            description: "10% off",
            code: "SAVE10",
            discountType: "invalid" as any,
            discountValue: 10,
            validFrom: "2024-01-01",
            validThrough: "2024-12-31",
          })
        ).toThrow("Discount type must be 'percentage' or 'fixed'");
      });

      it("should throw error for zero discount value", () => {
        expect(() =>
          generateOfferSchema({
            name: "Sale",
            description: "10% off",
            code: "SAVE10",
            discountType: "percentage",
            discountValue: 0,
            validFrom: "2024-01-01",
            validThrough: "2024-12-31",
          })
        ).toThrow("Discount value must be a positive number");
      });

      it("should throw error for negative discount value", () => {
        expect(() =>
          generateOfferSchema({
            name: "Sale",
            description: "10% off",
            code: "SAVE10",
            discountType: "percentage",
            discountValue: -10,
            validFrom: "2024-01-01",
            validThrough: "2024-12-31",
          })
        ).toThrow("Discount value must be a positive number");
      });

      it("should throw error for missing validFrom", () => {
        expect(() =>
          generateOfferSchema({
            name: "Sale",
            description: "10% off",
            code: "SAVE10",
            discountType: "percentage",
            discountValue: 10,
            validFrom: "",
            validThrough: "2024-12-31",
          })
        ).toThrow("Valid from date is required and must be a string");
      });

      it("should throw error for missing validThrough", () => {
        expect(() =>
          generateOfferSchema({
            name: "Sale",
            description: "10% off",
            code: "SAVE10",
            discountType: "percentage",
            discountValue: 10,
            validFrom: "2024-01-01",
            validThrough: "",
          })
        ).toThrow("Valid through date is required and must be a string");
      });
    });

    describe("generateJSONLD validation", () => {
      it("should throw error for null schema", () => {
        expect(() => generateJSONLD(null as any)).toThrow(
          "Schema must be a valid object"
        );
      });

      it("should throw error for undefined schema", () => {
        expect(() => generateJSONLD(undefined as any)).toThrow(
          "Schema must be a valid object"
        );
      });

      it("should throw error for array schema", () => {
        expect(() => generateJSONLD([] as any)).toThrow(
          "Schema must be a valid object"
        );
      });

      it("should throw error for non-object schema", () => {
        expect(() => generateJSONLD("schema" as any)).toThrow(
          "Schema must be a valid object"
        );
      });

      it("should accept valid schema object", () => {
        const schema = { "@context": "https://schema.org", "@type": "Thing" };
        const result = generateJSONLD(schema);
        expect(result.__html).toBe(JSON.stringify(schema));
      });
    });
  });
});
