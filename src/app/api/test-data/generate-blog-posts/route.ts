/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-blog-posts/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { faker } from "@faker-js/faker";
import { NextRequest, NextResponse } from "next/server";

/**
 * PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for prefix
 */
const PREFIX = "TEST_";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const { count = 10 } = await req.json();
    const db = getFirestoreAdmin();

    const categories = [
      "Technology",
      "Fashion",
      "Lifestyle",
      "Business",
      "Shopping Tips",
      "Product Reviews",
      "Industry News",
      "Tutorials",
      "Trends",
      "Auctions",
    ];

    const tagPool = [
      "tips",
      "guide",
      "review",
      "trending",
      "featured",
      "new",
      "popular",
      "tutorial",
      "shopping",
      "deals",
      "auction",
      "seller",
      "buyer",
      "platform",
      "ecommerce",
    ];

    const blogPosts = [];

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now();
      const title = faker.lorem.sentence({ min: 3, max: 8 }).replace(/\.$/, "");
      const slug = `${PREFIX.toLowerCase()}${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${timestamp}-${i + 1}`;

      // Generate rich content with multiple sections
      /**
 * Performs sections operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The sections result
 *
 */
const sections = faker.helpers.multiple(
        () => ({
          /** Heading */
          heading: faker.lorem.sentence({ min: 2, max: 5 }).replace(/\.$/, ""),
          /** Content */
          con/**
 * Performs content operation
 *
 * @param {any} 2 - The 2
 * @param {any} "\n\n" - The "\n\n"
 *
 * @returns {any} The content result
 *
 */
tent: faker.lorem.paragraphs(2, "\n\n"),
        }),
        { count: { min: 3, max: 5 } }
      );

      const content = `
# ${title}

${faker.lorem.paragraphs(2, "\n\n")}

${sections
  .map(
    (section) => `
## ${section.heading}

${section.content}
`
  )
  .join("\n")}

## Key Takeaways

${faker.helpers
  .multiple(() => `- ${faker.lorem.sentence()}`, { count: { min: 3, max: 5 } })
  .join("\n")}

## Conclusion

${faker.lorem.paragraph()}
      `.trim();

      // Random category and tags
      const category = faker.helpers.arrayElement(categories);
      const tags = faker.helpers.arrayElements(
        tagPool,
        faker.number.int({ min: 2, max: 5 })
      );

      // Random dates (published within last 90 days)
      const daysAgo = faker.number.int({ min: 0, max: 90 });
      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - daysAgo);

      // 70% published, 20% draft, 10% archived
      const statusRand = Math.random();
      const status =
        statusRand < 0.7
          ? "published"
          : statusRand < 0.9
          ? "draft"
          : "archived";

      const blogPostData = {
        /** Id */
        id: `${PREFIX}blog_post_${timestamp}_${i + 1}`,
        /** Title */
        title: title,
        /** Slug */
        slug: slug,
        /** Excerpt */
        excerpt: faker.lorem.paragraph(),
        /** Content */
        content: content,
        featuredImage: `https://source.unsplash.com/800x450/?${category.toLowerCase()},blog&sig=${timestamp}${i}`,
        /** Author */
        author: {
          /** Id */
          id: `${PREFIX}admin_001`,
          /** Name */
          name: faker.person.fullName(),
          /** Avatar */
          avatar: faker.image.avatar(),
        },
        /** Category */
        category: category,
        /** Tags */
        tags: tags,
        /** Status */
        status: status,
        featured: Math.random() < 0.3, // 30% featured (consolidated from featured + showOnHomepage)
        /** Published At */
        publishedAt: status === "published" ? publishedAt.toISOString() : null,
        /** Created At */
        createdAt: publishedAt.toISOString(),
        /** Updated At */
        updatedAt: new Date().toISOString(),
        /** Views */
        views: faker.number.int({ min: 0, max: 5000 }),
        /** Likes */
        likes: faker.number.int({ min: 0, max: 500 }),
      };

      await db.collection(COLLECTIONS.BLOG_POSTS).add(blogPostData);
      blogPosts.push(blogPostData);
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Count */
      count: blogPosts.length,
      /** Posts */
      posts: blogPosts.map((post) => ({
        /** Id */
        id: post.id,
        /** Title */
        title: post.title,
        /** Slug */
        slug: post.slug,
        /** Category */
        category: post.category,
        /** Status */
        status: post.status,
        /** Featured */
        featured: post.featured,
      })),
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.testData.generateBlogPosts",
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to generate blog posts",
      },
      { status: 500 }
    );
  }
}
