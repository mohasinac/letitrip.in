"use client";

import React, { useEffect, useState } from "react";
import {
  UnifiedInput,
  UnifiedTextarea,
  UnifiedBadge,
} from "@/components/ui/unified";
import { X, Search } from "lucide-react";

interface ProductDetailsStepProps {
  data: any;
  categories: any[];
  onChange: (updates: any) => void;
}

export default function ProductDetailsStep({
  data,
  categories,
  onChange,
}: ProductDetailsStepProps) {
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Auto-generate slug from product name
  useEffect(() => {
    if (data.name && !data.seo.slug) {
      const slug = `buy-${data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;
      onChange({
        seo: {
          ...data.seo,
          slug,
          title: data.name,
          description: data.shortDescription || data.name,
        },
      });
    }
  }, [data.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value });
  };

  const handleShortDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ shortDescription: e.target.value });
  };

  const handleFullDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange({ fullDescription: e.target.value });
  };

  const handleCategorySelect = (categoryId: string) => {
    onChange({ categoryId });
    setShowCategoryDropdown(false);
    setCategorySearch("");
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!data.tags.includes(tagInput.trim())) {
        onChange({ tags: [...data.tags, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onChange({ tags: data.tags.filter((tag: string) => tag !== tagToRemove) });
  };

  const selectedCategory = categories.find((cat) => cat.id === data.categoryId);
  const filteredCategories = categories.filter((cat) =>
    cat.pathString?.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Product Details</h2>
        <p className="text-sm text-muted-foreground">
          Add the basic information about your product
        </p>
      </div>

      <UnifiedInput
        label="Product Name"
        value={data.name}
        onChange={handleNameChange}
        placeholder="e.g., Beyblade Metal Fusion Storm Pegasus"
        helperText="Enter a clear, descriptive name for your product"
        required
      />

      <UnifiedTextarea
        label="Short Description"
        rows={2}
        value={data.shortDescription}
        onChange={handleShortDescriptionChange}
        placeholder="Brief description that appears in listings"
        helperText={`A concise summary of your product (${
          data.shortDescription?.length || 0
        }/160 characters)`}
        maxLength={160}
      />

      <UnifiedTextarea
        label="Full Description"
        rows={6}
        value={data.fullDescription}
        onChange={handleFullDescriptionChange}
        placeholder="Detailed product description..."
        helperText="Provide comprehensive details about your product"
      />

      {/* Category Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Category (Leaf Categories Only){" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background cursor-pointer hover:border-primary transition-colors flex items-center justify-between"
          >
            <span
              className={
                selectedCategory ? "text-foreground" : "text-muted-foreground"
              }
            >
              {selectedCategory
                ? selectedCategory.pathString
                : "Search for a category..."}
            </span>
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>

          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-64 overflow-hidden">
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-medium">
                        {category.pathString}
                      </p>
                      {category.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No categories found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Only leaf categories (without sub-categories) can be selected for
          products
        </p>
      </div>

      {/* Tags Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="space-y-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagAdd}
            placeholder="Type and press Enter to add tags"
            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag: string, index: number) => (
                <UnifiedBadge
                  key={index}
                  variant="secondary"
                  onRemove={() => handleTagRemove(tag)}
                >
                  {tag}
                </UnifiedBadge>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Add tags to help customers find your product (e.g., beyblade, metal,
          attack)
        </p>
      </div>

      {selectedCategory && (
        <div className="p-3 bg-muted/50 rounded-lg border border-muted">
          <p className="text-sm text-muted-foreground">
            Selected Category:{" "}
            <span className="font-semibold text-foreground">
              {selectedCategory.pathString}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
