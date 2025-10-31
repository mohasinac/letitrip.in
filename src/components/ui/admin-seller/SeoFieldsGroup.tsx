"use client";

import React, { useState, useEffect } from "react";
import { UnifiedInput } from "@/components/ui/unified/Input";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { X, Search, TrendingUp } from "lucide-react";

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  keywords?: string[];
}

export interface SeoFieldsGroupProps {
  initialData?: SeoData;
  onChange: (data: SeoData) => void;
  autoGenerateFromTitle?: boolean;
  showPreview?: boolean;
  baseUrl?: string;
  titleSource?: string; // Source title for auto-generation
  className?: string;
}

export function SeoFieldsGroup({
  initialData = {},
  onChange,
  autoGenerateFromTitle = true,
  showPreview = true,
  baseUrl = "https://justforview.in",
  titleSource = "",
  className = "",
}: SeoFieldsGroupProps) {
  const [data, setData] = useState<SeoData>({
    metaTitle: initialData.metaTitle || "",
    metaDescription: initialData.metaDescription || "",
    slug: initialData.slug || "",
    keywords: initialData.keywords || [],
  });

  const [keywordInput, setKeywordInput] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (autoGenerateFromTitle && titleSource && !data.slug) {
      const slug = titleSource
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      handleChange("slug", slug);
    }
  }, [titleSource, autoGenerateFromTitle]);

  const handleChange = (field: keyof SeoData, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !data.keywords?.includes(keyword.trim())) {
      const newKeywords = [...(data.keywords || []), keyword.trim()];
      handleChange("keywords", newKeywords);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    const newKeywords = data.keywords?.filter((k) => k !== keyword) || [];
    handleChange("keywords", newKeywords);
  };

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(keywordInput);
    }
  };

  // Calculate SEO score
  const calculateScore = (): number => {
    let score = 0;
    const maxScore = 100;

    // Meta title (30 points)
    if (data.metaTitle) {
      if (data.metaTitle.length >= 50 && data.metaTitle.length <= 60) {
        score += 30;
      } else if (data.metaTitle.length >= 30) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Meta description (30 points)
    if (data.metaDescription) {
      if (
        data.metaDescription.length >= 150 &&
        data.metaDescription.length <= 160
      ) {
        score += 30;
      } else if (data.metaDescription.length >= 100) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Slug (20 points)
    if (data.slug) {
      if (data.slug.length >= 3 && data.slug.length <= 50) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Keywords (20 points)
    if (data.keywords && data.keywords.length > 0) {
      if (data.keywords.length >= 3 && data.keywords.length <= 10) {
        score += 20;
      } else {
        score += 10;
      }
    }

    return Math.round((score / maxScore) * 100);
  };

  const seoScore = calculateScore();
  const getScoreColor = () => {
    if (seoScore >= 80) return "success";
    if (seoScore >= 50) return "warning";
    return "error";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SEO Score */}
      <UnifiedCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-text font-medium">SEO Score</span>
          </div>
          <UnifiedBadge
            variant={getScoreColor()}
            className="text-lg px-4 py-1.5"
          >
            {seoScore}%
          </UnifiedBadge>
        </div>
        <div className="mt-3 h-2 bg-surface rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              seoScore >= 80
                ? "bg-success"
                : seoScore >= 50
                ? "bg-warning"
                : "bg-error"
            }`}
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </UnifiedCard>

      {/* Meta Title */}
      <div>
        <UnifiedInput
          label="Meta Title"
          value={data.metaTitle}
          onChange={(e) => handleChange("metaTitle", e.target.value)}
          maxLength={60}
          placeholder="Optimal: 50-60 characters"
          helperText={`${data.metaTitle?.length || 0}/60 characters ${
            data.metaTitle &&
            data.metaTitle.length >= 50 &&
            data.metaTitle.length <= 60
              ? "✓ Perfect length"
              : data.metaTitle && data.metaTitle.length > 60
              ? "⚠️ Too long"
              : "ℹ️ Aim for 50-60 characters"
          }`}
        />
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Meta Description
        </label>
        <textarea
          value={data.metaDescription}
          onChange={(e) => handleChange("metaDescription", e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="Optimal: 150-160 characters"
          className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
        />
        <p className="text-xs text-textSecondary mt-1">
          {data.metaDescription?.length || 0}/160 characters{" "}
          {data.metaDescription &&
          data.metaDescription.length >= 150 &&
          data.metaDescription.length <= 160
            ? "✓ Perfect length"
            : data.metaDescription && data.metaDescription.length > 160
            ? "⚠️ Too long"
            : "ℹ️ Aim for 150-160 characters"}
        </p>
      </div>

      {/* URL Slug */}
      <div>
        <UnifiedInput
          label="URL Slug"
          value={data.slug}
          onChange={(e) => {
            const slug = e.target.value
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-");
            handleChange("slug", slug);
          }}
          placeholder="product-url-slug"
          helperText={
            data.slug
              ? `Preview: ${baseUrl}/${data.slug}`
              : "Auto-generated from title"
          }
        />
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          SEO Keywords
        </label>
        <div className="space-y-3">
          {/* Keyword input */}
          <div className="relative">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={handleKeywordInputKeyPress}
              placeholder="Type keyword and press Enter"
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {keywordInput && (
              <button
                onClick={() => addKeyword(keywordInput)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            )}
          </div>

          {/* Keywords list */}
          {data.keywords && data.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((keyword, index) => (
                <UnifiedBadge
                  key={index}
                  variant="primary"
                  className="flex items-center gap-1.5"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </UnifiedBadge>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-textSecondary mt-2">
          {data.keywords?.length || 0} keywords{" "}
          {data.keywords &&
          data.keywords.length >= 3 &&
          data.keywords.length <= 10
            ? "✓ Good coverage"
            : "ℹ️ Add 3-10 relevant keywords"}
        </p>
      </div>

      {/* Google Search Preview */}
      {showPreview && (data.metaTitle || data.metaDescription) && (
        <UnifiedCard className="bg-surfaceVariant/50">
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-primary mt-1" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-textSecondary mb-2">
                Google Search Preview
              </p>
              <h4 className="text-lg text-primary font-medium mb-1 truncate">
                {data.metaTitle || "Your page title here"}
              </h4>
              <p className="text-xs text-success mb-1">
                {baseUrl}/{data.slug || "page-url"}
              </p>
              <p className="text-sm text-textSecondary line-clamp-2">
                {data.metaDescription ||
                  "Your meta description will appear here"}
              </p>
            </div>
          </div>
        </UnifiedCard>
      )}
    </div>
  );
}
