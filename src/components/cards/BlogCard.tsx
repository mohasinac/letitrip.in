"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Clock, Eye, Heart, Tag } from "lucide-react";
import { formatDate } from "@/lib/formatters";

export interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags?: string[];
  publishedAt?: Date | string;
  views?: number;
  likes?: number;
  isFeatured?: boolean;
  readTime?: number; // in minutes
  compact?: boolean;
  onLike?: (id: string) => void;
  isLiked?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  slug,
  excerpt,
  featuredImage,
  author,
  category,
  tags = [],
  publishedAt,
  views = 0,
  likes = 0,
  isFeatured = false,
  readTime,
  compact = false,
  onLike,
  isLiked = false,
}) => {
  const publishDate =
    typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(id);
    }
  };

  // Calculate read time if not provided (rough estimate: 200 words per minute)
  const estimatedReadTime =
    readTime || Math.max(1, Math.ceil(excerpt.split(" ").length / 50));

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100">
            <Tag className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isFeatured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {category && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
              {category}
            </span>
          )}
        </div>

        {/* Like Button */}
        {onLike && (
          <button
            onClick={handleLike}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        )}

        {/* Stats Overlay */}
        {!compact && (views > 0 || likes > 0) && (
          <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded">
            {views > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{views}</span>
              </div>
            )}
            {likes > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{likes}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-${compact ? "3" : "4"}`}>
        {/* Author & Date */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <span className="text-xs text-gray-600">{author.name}</span>
          </div>

          {publishDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <time
                dateTime={
                  publishDate instanceof Date
                    ? publishDate.toISOString()
                    : String(publishDate)
                }
              >
                {formatDate(publishDate)}
              </time>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-semibold text-gray-900 ${
            compact ? "text-sm line-clamp-2" : "text-lg line-clamp-2"
          } mb-2 group-hover:text-blue-600 transition-colors`}
        >
          {title}
        </h3>

        {/* Excerpt */}
        {!compact && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">{excerpt}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{estimatedReadTime} min read</span>
          </div>

          {/* Tags */}
          {!compact && tags.length > 0 && (
            <div className="flex items-center gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
