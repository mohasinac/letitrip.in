"use client";

import React, { useEffect, useState } from "react";
import {
  UnifiedInput,
  UnifiedTextarea,
  UnifiedSelect,
  UnifiedAlert,
  UnifiedCard,
  CardContent,
  UnifiedBadge,
} from "@/components/ui/unified";
import { X } from "lucide-react";

interface SeoPublishingStepProps {
  data: any;
  onChange: (updates: any) => void;
}

export default function SeoPublishingStep({
  data,
  onChange,
}: SeoPublishingStepProps) {
  const [keywordInput, setKeywordInput] = useState("");

  // Auto-generate SEO data if not set
  useEffect(() => {
    if (!data.seo.title && data.name) {
      onChange({
        seo: {
          ...data.seo,
          title: data.name,
        },
      });
    }
    if (!data.seo.description && data.shortDescription) {
      onChange({
        seo: {
          ...data.seo,
          description: data.shortDescription,
        },
      });
    }
  }, [data.name, data.shortDescription]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug.startsWith("buy-")) {
      slug = `buy-${slug}`;
    }
    onChange({ seo: { ...data.seo, slug } });
  };

  const handleKeywordAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!data.seo.keywords.includes(keywordInput.trim())) {
        onChange({
          seo: {
            ...data.seo,
            keywords: [...data.seo.keywords, keywordInput.trim()],
          },
        });
      }
      setKeywordInput("");
    }
  };

  const handleKeywordRemove = (keywordToRemove: string) => {
    onChange({
      seo: {
        ...data.seo,
        keywords: data.seo.keywords.filter(
          (keyword: string) => keyword !== keywordToRemove
        ),
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">SEO & Publishing</h2>
        <p className="text-sm text-muted-foreground">
          Optimize your product for search engines and set publishing options
        </p>
      </div>

      <UnifiedAlert variant="info">
        SEO settings help your product rank better in search results
      </UnifiedAlert>

      <UnifiedInput
        label="SEO Title"
        value={data.seo.title}
        onChange={(e) =>
          onChange({ seo: { ...data.seo, title: e.target.value } })
        }
        helperText={`Optimal length: 50-60 characters (${
          data.seo.title?.length || 0
        }/60)`}
        maxLength={60}
        required
      />

      <UnifiedTextarea
        label="SEO Description"
        rows={3}
        value={data.seo.description}
        onChange={(e) =>
          onChange({ seo: { ...data.seo, description: e.target.value } })
        }
        helperText={`Optimal length: 150-160 characters (${
          data.seo.description?.length || 0
        }/160)`}
        maxLength={160}
        required
      />

      {/* SEO Keywords */}
      <div>
        <label className="block text-sm font-medium mb-2">SEO Keywords</label>
        <div className="space-y-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordAdd}
            placeholder="Type and press Enter to add keywords"
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {data.seo.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.seo.keywords.map((keyword: string, index: number) => (
                <UnifiedBadge
                  key={index}
                  variant="secondary"
                  onRemove={() => handleKeywordRemove(keyword)}
                >
                  {keyword}
                </UnifiedBadge>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Add keywords that customers might search for
        </p>
      </div>

      <UnifiedInput
        label="Product Slug"
        value={data.seo.slug}
        onChange={handleSlugChange}
        helperText="URL-friendly slug (must start with 'buy-')"
        placeholder="buy-product-name"
        required
      />

      {/* Search Preview */}
      <UnifiedCard variant="outlined" className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Search Preview:</p>
          <h3 className="text-sm font-medium text-primary mb-1">
            {data.seo.title || "Product Title"}
          </h3>
          <p className="text-xs text-green-600 mb-2">
            hobbiesspot.com/{data.seo.slug || "buy-product"}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.seo.description || "Product description appears here..."}
          </p>
        </CardContent>
      </UnifiedCard>

      {/* Publishing Options */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Publishing Options</h3>

        <div className="space-y-4">
          <UnifiedInput
            label="Start Date"
            type="datetime-local"
            value={
              data.startDate
                ? new Date(data.startDate).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) => onChange({ startDate: new Date(e.target.value) })}
            helperText="When product goes live"
          />

          <UnifiedInput
            label="Expiration Date (Optional)"
            type="datetime-local"
            value={
              data.expirationDate
                ? new Date(data.expirationDate).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              onChange({
                expirationDate: e.target.value
                  ? new Date(e.target.value)
                  : undefined,
              })
            }
            helperText="Leave empty for permanent listing"
          />

          <UnifiedSelect
            label="Status"
            value={data.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="draft">Draft (Hidden)</option>
            <option value="active">Active (Visible to customers)</option>
          </UnifiedSelect>
        </div>
      </div>
    </div>
  );
}
