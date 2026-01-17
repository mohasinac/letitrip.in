import React, { ComponentType } from "react";

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
  featured?: boolean;
  readTime?: number; // in minutes
  compact?: boolean;
  onLike?: (id: string) => void;
  isLiked?: boolean;

  // Component Injection
  LinkComponent?: ComponentType<any>;
  ImageComponent?: ComponentType<any>;
  CalendarIcon?: ComponentType<{ className?: string }>;
  UserIcon?: ComponentType<{ className?: string }>;
  ClockIcon?: ComponentType<{ className?: string }>;
  EyeIcon?: ComponentType<{ className?: string }>;
  HeartIcon?: ComponentType<{ className?: string; fill?: string }>;
  TagIcon?: ComponentType<{ className?: string }>;

  // Date formatting
  formatDate?: (date: Date | string) => string;
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
  featured = false,
  readTime,
  compact = false,
  onLike,
  isLiked = false,
  LinkComponent = "a",
  ImageComponent,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  TagIcon,
  formatDate,
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

  const linkProps = {
    href: `/blog/${slug}`,
    className: "group block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
  };

  return (
    <LinkComponent {...linkProps}>
      {/* Image Container */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {featuredImage && ImageComponent ? (
          <ImageComponent
            src={featuredImage}
            alt={title}
            fill={true}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            {TagIcon ? (
              <TagIcon className="w-16 h-16 text-gray-400" />
            ) : (
              <svg 
                className="w-16 h-16 text-gray-400" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {featured && (
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
            className="absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            {HeartIcon ? (
              <HeartIcon
                className={`w-5 h-5 ${
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
            ) : (
              <svg
                className={`w-5 h-5 ${
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            )}
          </button>
        )}

        {/* Stats Overlay */}
        {!compact && (views > 0 || likes > 0) && (
          <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded">
            {views > 0 && (
              <div className="flex items-center gap-1">
                {EyeIcon ? (
                  <EyeIcon className="w-3 h-3" />
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
                <span>{views}</span>
              </div>
            )}
            {likes > 0 && (
              <div className="flex items-center gap-1">
                {HeartIcon ? (
                  <HeartIcon className="w-3 h-3" />
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                )}
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
            {author.avatar && ImageComponent ? (
              <ImageComponent
                src={author.avatar}
                alt={author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                {UserIcon ? (
                  <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </div>
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {author.name}
            </span>
          </div>

          {publishDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              {CalendarIcon ? (
                <CalendarIcon className="w-3 h-3" />
              ) : (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              )}
              <time dateTime={publishDate.toISOString()}>
                {formatDate ? formatDate(publishDate) : publishDate.toLocaleDateString()}
              </time>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-semibold text-gray-900 dark:text-white ${
            compact ? "text-sm line-clamp-2" : "text-lg line-clamp-2"
          } mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}
        >
          {title}
        </h3>

        {/* Excerpt */}
        {!compact && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
            {excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            {ClockIcon ? (
              <ClockIcon className="w-3 h-3" />
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            )}
            <span>{estimatedReadTime} min read</span>
          </div>

          {/* Tags */}
          {!compact && tags.length > 0 && (
            <div className="flex items-center gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </LinkComponent>
  );
};