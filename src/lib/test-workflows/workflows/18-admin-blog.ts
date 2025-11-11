/**
 * Workflow #18: Admin Blog Management
 *
 * Complete blog management lifecycle:
 * 1. Navigate to blog management
 * 2. Create new blog post
 * 3. Add title, slug, and excerpt
 * 4. Write content (rich text)
 * 5. Set category and tags
 * 6. Set SEO meta data (featured image)
 * 7. Save as draft
 * 8. Publish post
 * 9. Feature on homepage
 * 10. Update published post
 * 11. View all blog posts
 * 12. Archive old post
 * 13. View statistics
 * 14. Cleanup test posts
 *
 * Expected time: 12-15 minutes
 * Success criteria: All blog operations successful
 */

import {
  blogService,
  BlogPost,
  CreateBlogPostData,
} from "@/services/blog.service";
import { BaseWorkflow, WorkflowResult } from "../helpers";

export class AdminBlogManagementWorkflow extends BaseWorkflow {
  private testPostIds: string[] = [];
  private testPostSlugs: string[] = [];

  async run(): Promise<WorkflowResult> {
    this.initialize();

    try {
      // Step 1: Navigate to blog management
      await this.executeStep("Navigate to Blog Management", async () => {
        console.log("Navigating to /admin/blog");

        // Get existing posts to verify access
        const posts = await blogService.list({
          limit: 5,
        });

        console.log(`Found ${posts.data?.length || 0} existing blog posts`);
      });

      // Step 2-3: Create new blog post with title and slug
      await this.executeStep("Create New Blog Post", async () => {
        const timestamp = Date.now();
        const slug = `test-blog-post-${timestamp}`;

        const postData: CreateBlogPostData = {
          title: `Test Blog Post ${timestamp}`,
          slug: slug,
          excerpt:
            "This is a test blog post created by the automated workflow system.",
          content: `
# Test Blog Post

This is a comprehensive test blog post created to verify the blog management system.

## Features Tested

- Post creation
- Rich text content
- Categories and tags
- SEO optimization
- Publishing workflow

## Content Section

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Subsection

More detailed content goes here with proper formatting.
          `,
          category: "Technology",
          tags: ["test", "automation", "workflow"],
          status: "draft",
          isFeatured: false,
          showOnHomepage: false,
        };

        const newPost = await blogService.create(postData);

        this.testPostIds.push(newPost.id);
        this.testPostSlugs.push(newPost.slug);

        console.log(`Created blog post: ${newPost.title}`);
        console.log(`  ID: ${newPost.id}`);
        console.log(`  Slug: ${newPost.slug}`);
        console.log(`  Status: ${newPost.status}`);
      });

      // Step 4: Write content (already done in Step 2)
      await this.executeStep("Verify Content Structure", async () => {
        if (this.testPostIds.length === 0) {
          throw new Error("No test posts available");
        }

        const post = await blogService.getById(this.testPostIds[0]);

        const hasTitle = post.title && post.title.length > 0;
        const hasContent = post.content && post.content.length > 100;
        const hasExcerpt = post.excerpt && post.excerpt.length > 0;

        if (!hasTitle || !hasContent || !hasExcerpt) {
          throw new Error("Post content structure is incomplete");
        }

        console.log("Content structure verified:");
        console.log(`  Title: ${post.title.length} chars`);
        console.log(`  Content: ${post.content.length} chars`);
        console.log(`  Excerpt: ${post.excerpt.length} chars`);
      });

      // Step 5: Set category and tags (already done)
      await this.executeStep("Verify Category and Tags", async () => {
        const post = await blogService.getById(this.testPostIds[0]);

        console.log(`Category: ${post.category}`);
        console.log(`Tags: ${post.tags.join(", ")}`);
        console.log(`Tag count: ${post.tags.length}`);
      });

      // Step 6: Set SEO meta data (featured image)
      await this.executeStep("Set SEO Meta Data", async () => {
        if (this.testPostIds.length === 0) {
          throw new Error("No test posts available");
        }

        const updatedPost = await blogService.update(this.testPostIds[0], {
          featuredImage:
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200",
        });

        console.log("SEO meta data updated:");
        console.log(
          `  Featured image: ${updatedPost.featuredImage ? "Set" : "Not set"}`
        );
      });

      // Step 7: Save as draft (already saved in Step 2)
      await this.executeStep("Verify Draft Status", async () => {
        const post = await blogService.getById(this.testPostIds[0]);

        if (post.status !== "draft") {
          throw new Error("Post is not in draft status");
        }

        console.log(`Post status: ${post.status} ✓`);
      });

      // Step 8: Publish post
      await this.executeStep("Publish Blog Post", async () => {
        if (this.testPostIds.length === 0) {
          throw new Error("No test posts available");
        }

        const publishedPost = await blogService.update(this.testPostIds[0], {
          status: "published",
          publishedAt: new Date(),
        });

        console.log(`Published post: ${publishedPost.title}`);
        console.log(`  Status: ${publishedPost.status}`);
        console.log(
          `  Published at: ${
            publishedPost.publishedAt
              ? new Date(publishedPost.publishedAt).toLocaleString()
              : "N/A"
          }`
        );
      });

      // Step 9: Feature on homepage
      await this.executeStep("Feature on Homepage", async () => {
        if (this.testPostIds.length === 0) {
          throw new Error("No test posts available");
        }

        const featuredPost = await blogService.update(this.testPostIds[0], {
          isFeatured: true,
          showOnHomepage: true,
        });

        console.log("Post featured:");
        console.log(`  Featured: ${featuredPost.isFeatured}`);
        console.log(`  Show on homepage: ${featuredPost.showOnHomepage}`);
      });

      // Step 10: Update published post
      await this.executeStep("Update Published Post", async () => {
        if (this.testPostIds.length === 0) {
          throw new Error("No test posts available");
        }

        const updatedPost = await blogService.update(this.testPostIds[0], {
          excerpt: "Updated excerpt - This post has been modified!",
          tags: ["test", "automation", "workflow", "updated"],
        });

        console.log("Post updated successfully");
        console.log(`  New excerpt length: ${updatedPost.excerpt.length}`);
        console.log(`  New tag count: ${updatedPost.tags.length}`);
      });

      // Step 11: View all blog posts
      await this.executeStep("View All Blog Posts", async () => {
        const allPosts = await blogService.list({
          limit: 20,
        });

        console.log(`Total blog posts: ${allPosts.data?.length || 0}`);

        if (allPosts.data && allPosts.data.length > 0) {
          const statusCounts = {
            draft: allPosts.data.filter((p) => p.status === "draft").length,
            published: allPosts.data.filter((p) => p.status === "published")
              .length,
            archived: allPosts.data.filter((p) => p.status === "archived")
              .length,
          };

          console.log("Posts by status:");
          console.log(`  Draft: ${statusCounts.draft}`);
          console.log(`  Published: ${statusCounts.published}`);
          console.log(`  Archived: ${statusCounts.archived}`);
        }
      });

      // Step 12: Archive old post
      await this.executeStep("Archive Old Post", async () => {
        if (this.testPostIds.length === 0) {
          throw new Error("No test posts available");
        }

        const archivedPost = await blogService.update(this.testPostIds[0], {
          status: "archived",
        });

        console.log(`Archived post: ${archivedPost.title}`);
        console.log(`  Status: ${archivedPost.status}`);
      });

      // Step 13: View statistics
      await this.executeStep("View Blog Statistics", async () => {
        const allPosts = await blogService.list({
          limit: 100,
        });

        const featuredPosts = await blogService.getFeatured();
        const homepagePosts = await blogService.getHomepage();

        console.log("Blog Statistics:");
        console.log(`  Total posts: ${allPosts.data?.length || 0}`);
        console.log(`  Featured posts: ${featuredPosts.length}`);
        console.log(`  Homepage posts: ${homepagePosts.length}`);

        if (allPosts.data && allPosts.data.length > 0) {
          const totalViews = allPosts.data.reduce(
            (sum, p) => sum + (p.views || 0),
            0
          );
          const totalLikes = allPosts.data.reduce(
            (sum, p) => sum + (p.likes || 0),
            0
          );

          console.log(`  Total views: ${totalViews}`);
          console.log(`  Total likes: ${totalLikes}`);
        }
      });

      // Step 14: Cleanup test posts
      await this.executeStep("Cleanup Test Posts", async () => {
        let deleted = 0;

        for (const postId of this.testPostIds) {
          try {
            await blogService.delete(postId);
            deleted++;
            console.log(`Deleted test post: ${postId}`);
          } catch (error) {
            console.log(`Could not delete post ${postId}: ${error}`);
          }
        }

        console.log(
          `Cleaned up ${deleted}/${this.testPostIds.length} test posts`
        );
      });
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }

    return this.printSummary();
  }
}
