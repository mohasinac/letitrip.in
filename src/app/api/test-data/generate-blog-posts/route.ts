import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { faker } from "@faker-js/faker";
import { NextRequest, NextResponse } from "next/server";

const PREFIX = "TEST_";

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
      const sections = faker.helpers.multiple(
        () => ({
          heading: faker.lorem.sentence({ min: 2, max: 5 }).replace(/\.$/, ""),
          content: faker.lorem.paragraphs(2, "\n\n"),
        }),
        { count: { min: 3, max: 5 } },
      );

      const content = `
# ${title}

${faker.lorem.paragraphs(2, "\n\n")}

${sections
  .map(
    (section) => `
## ${section.heading}

${section.content}
`,
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
        faker.number.int({ min: 2, max: 5 }),
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
        id: `${PREFIX}blog_post_${timestamp}_${i + 1}`,
        title: title,
        slug: slug,
        excerpt: faker.lorem.paragraph(),
        content: content,
        featuredImage: `https://source.unsplash.com/800x450/?${category.toLowerCase()},blog&sig=${timestamp}${i}`,
        author: {
          id: `${PREFIX}admin_001`,
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
        },
        category: category,
        tags: tags,
        status: status,
        featured: Math.random() < 0.3, // 30% featured (consolidated from featured + showOnHomepage)
        publishedAt: status === "published" ? publishedAt.toISOString() : null,
        createdAt: publishedAt.toISOString(),
        updatedAt: new Date().toISOString(),
        views: faker.number.int({ min: 0, max: 5000 }),
        likes: faker.number.int({ min: 0, max: 500 }),
      };

      await db.collection(COLLECTIONS.BLOG_POSTS).add(blogPostData);
      blogPosts.push(blogPostData);
    }

    return NextResponse.json({
      success: true,
      count: blogPosts.length,
      posts: blogPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        category: post.category,
        status: post.status,
        featured: post.featured,
      })),
    });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.testData.generateBlogPosts",
      count,
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate blog posts",
      },
      { status: 500 },
    );
  }
}
