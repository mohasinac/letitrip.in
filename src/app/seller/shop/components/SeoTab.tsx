import React from "react";
import { SeoFieldsGroup, SeoData } from "@/components/ui/admin-seller";

interface SeoTabProps {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  onChange: (field: string, value: string) => void;
  loading: boolean;
}

export default function SeoTab({
  seoTitle,
  seoDescription,
  seoKeywords,
  onChange,
  loading,
}: SeoTabProps) {
  const handleSeoChange = (data: SeoData) => {
    if (data.metaTitle !== undefined) onChange("seoTitle", data.metaTitle);
    if (data.metaDescription !== undefined)
      onChange("seoDescription", data.metaDescription);
    if (data.keywords !== undefined)
      onChange("seoKeywords", data.keywords.join(", "));
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text mb-2">
          Search Engine Optimization
        </h3>
        <p className="text-sm text-textSecondary">
          Optimize your shop's visibility in search results. Good SEO helps
          customers find your store.
        </p>
      </div>

      <SeoFieldsGroup
        initialData={{
          metaTitle: seoTitle,
          metaDescription: seoDescription,
          keywords: seoKeywords
            ? seoKeywords.split(",").map((k) => k.trim())
            : [],
        }}
        onChange={handleSeoChange}
        autoGenerateFromTitle={false}
        showPreview={true}
      />
    </div>
  );
}
