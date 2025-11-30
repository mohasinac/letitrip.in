"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { safeToISOString } from "@/lib/date-utils";
import {
  Calendar,
  User,
  Clock,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { blogService, type BlogPost } from "@/services/blog.service";
import { BlogCard } from "@/components/cards/BlogCard";
import { formatDate } from "@/lib/formatters";

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const postData = await blogService.getBySlug(slug);
      setPost(postData);

      // Fetch related posts
      if (postData.id) {
        const related = await blogService.getRelated(postData.id, 3);
        setRelatedPosts(related);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load blog post");
      console.error("Error fetching blog post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      await blogService.toggleLike(post.id);
      setLiked(!liked);
      setPost({
        ...post,
        likes: liked ? post.likes - 1 : post.likes + 1,
      });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "This post doesn't exist"}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const publishDate = post.publishedAt
    ? new Date(post.publishedAt)
    : new Date();
  const readTime = Math.max(1, Math.ceil(post.content.split(" ").length / 200));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          {post.category && (
            <Link
              href={`/blog?category=${post.category}`}
              className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded mb-4 hover:bg-blue-200"
            >
              {post.category}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <span className="font-medium">{post.author.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time
                dateTime={
                  safeToISOString(publishDate) || new Date().toISOString()
                }
              >
                {formatDate(publishDate)}
              </time>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{readTime} min read</span>
            </div>

            {post.views > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.views} views</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                liked
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span>{post.likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-8 border-t">
            <Tag className="w-5 h-5 text-gray-500" />
            {post.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/blog?tag=${tag}`}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard
                  key={relatedPost.id}
                  id={relatedPost.id}
                  title={relatedPost.title}
                  slug={relatedPost.slug}
                  excerpt={relatedPost.excerpt}
                  featuredImage={relatedPost.featuredImage}
                  author={relatedPost.author}
                  category={relatedPost.category}
                  publishedAt={relatedPost.publishedAt}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
