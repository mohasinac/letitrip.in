"use client";

import React, { useState } from "react";
import {
  SmartCategorySelector,
  ModernDataTable,
  SeoFieldsGroup,
  PageHeader,
  type TableColumn,
  type SelectedCategory,
  type SeoData,
} from "@/components/ui/admin-seller";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { SimpleTabs } from "@/components/ui/unified/Tabs";
import { Plus, Download } from "lucide-react";

// Demo data
interface DemoProduct {
  id: string;
  name: string;
  price: number;
  status: "active" | "inactive" | "pending";
  stock: number;
  createdAt: string;
}

const demoProducts: DemoProduct[] = [
  {
    id: "1",
    name: "Product 1",
    price: 1299,
    status: "active",
    stock: 45,
    createdAt: "2025-10-15",
  },
  {
    id: "2",
    name: "Product 2",
    price: 2499,
    status: "pending",
    stock: 12,
    createdAt: "2025-10-20",
  },
  {
    id: "3",
    name: "Product 3",
    price: 999,
    status: "active",
    stock: 89,
    createdAt: "2025-10-25",
  },
  {
    id: "4",
    name: "Product 4",
    price: 3499,
    status: "inactive",
    stock: 0,
    createdAt: "2025-10-28",
  },
];

export default function ComponentShowcasePage() {
  const [activeTab, setActiveTab] = useState("category-selector");
  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategory[]
  >([]);
  const [seoData, setSeoData] = useState<SeoData>({});
  const [page, setPage] = useState(1);

  // Table columns
  const columns: TableColumn<DemoProduct>[] = [
    {
      key: "name",
      label: "Product Name",
      sortable: true,
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      sortable: true,
      render: (value) => `₹${value.toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <UnifiedBadge
          variant={
            value === "active"
              ? "success"
              : value === "pending"
              ? "warning"
              : "error"
          }
        >
          {value}
        </UnifiedBadge>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      align: "right",
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
    },
  ];

  const tabs = [
    { id: "category-selector", label: "Category Selector" },
    { id: "data-table", label: "Data Table" },
    { id: "seo-fields", label: "SEO Fields" },
    { id: "page-header", label: "Page Header" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Demo Page Header */}
        <PageHeader
          title="Component Showcase"
          description="Demo of all Phase 0 admin-seller components"
          breadcrumbs={[
            { label: "Docs", href: "/docs" },
            { label: "Components" },
          ]}
          badge={{ text: "Phase 0 Complete", variant: "success" }}
          actions={
            <>
              <UnifiedButton variant="outline" size="sm" icon={<Download />}>
                Export Demo
              </UnifiedButton>
              <UnifiedButton variant="primary" size="sm" icon={<Plus />}>
                Add Item
              </UnifiedButton>
            </>
          }
        />

        {/* Tabs */}
        <SimpleTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />

        {/* Content */}
        <div className="space-y-6 animate-fadeIn">
          {/* SmartCategorySelector Demo */}
          {activeTab === "category-selector" && (
            <div className="space-y-4">
              <UnifiedCard>
                <h3 className="text-lg font-semibold text-text mb-4">
                  SmartCategorySelector Demo
                </h3>
                <p className="text-textSecondary mb-6">
                  Advanced category selector with tree view, search, leaf node
                  filtering, and auto-parent selection.
                </p>

                <SmartCategorySelector
                  mode="single"
                  showOnlyLeafNodes={false}
                  showAllCategories={true}
                  autoIncludeSeo={true}
                  autoSelectParents={true}
                  onSelect={(categories) => {
                    setSelectedCategories(categories);
                    console.log("Selected categories:", categories);
                  }}
                  initialSelected={selectedCategories}
                  placeholder="Search categories..."
                />
              </UnifiedCard>

              {/* Selected output */}
              {selectedCategories.length > 0 && (
                <UnifiedCard className="bg-surfaceVariant/50">
                  <h4 className="text-md font-semibold text-text mb-3">
                    Selection Output
                  </h4>
                  <pre className="text-xs text-textSecondary overflow-auto">
                    {JSON.stringify(selectedCategories, null, 2)}
                  </pre>
                </UnifiedCard>
              )}
            </div>
          )}

          {/* ModernDataTable Demo */}
          {activeTab === "data-table" && (
            <div className="space-y-4">
              <UnifiedCard>
                <h3 className="text-lg font-semibold text-text mb-4">
                  ModernDataTable Demo
                </h3>
                <p className="text-textSecondary mb-6">
                  Feature-rich data table with sorting, pagination, selection,
                  and bulk actions.
                </p>
              </UnifiedCard>

              <ModernDataTable
                data={demoProducts}
                columns={columns}
                loading={false}
                selectable
                searchable
                bulkActions={[
                  {
                    label: "Delete Selected",
                    onClick: (ids) => alert(`Deleting: ${ids.join(", ")}`),
                    variant: "destructive",
                  },
                  {
                    label: "Activate",
                    onClick: (ids) => alert(`Activating: ${ids.join(", ")}`),
                    variant: "success",
                  },
                ]}
                rowActions={[
                  {
                    label: "Edit",
                    onClick: (row) => alert(`Editing: ${row.name}`),
                  },
                  {
                    label: "Duplicate",
                    onClick: (row) => alert(`Duplicating: ${row.name}`),
                  },
                  {
                    label: "Delete",
                    onClick: (row) => alert(`Deleting: ${row.name}`),
                  },
                ]}
                currentPage={page}
                pageSize={10}
                totalItems={demoProducts.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => console.log("Page size:", size)}
                onSearch={(query) => console.log("Searching:", query)}
                emptyMessage="No products found"
              />
            </div>
          )}

          {/* SeoFieldsGroup Demo */}
          {activeTab === "seo-fields" && (
            <div className="space-y-4">
              <UnifiedCard>
                <h3 className="text-lg font-semibold text-text mb-4">
                  SeoFieldsGroup Demo
                </h3>
                <p className="text-textSecondary mb-6">
                  Complete SEO fields with character counters, preview, and
                  score indicator.
                </p>

                <SeoFieldsGroup
                  initialData={seoData}
                  onChange={(data) => {
                    setSeoData(data);
                    console.log("SEO data:", data);
                  }}
                  autoGenerateFromTitle={true}
                  showPreview={true}
                  baseUrl="https://justforview.in/products"
                  titleSource="Amazing Product Name"
                />
              </UnifiedCard>

              {/* SEO output */}
              <UnifiedCard className="bg-surfaceVariant/50">
                <h4 className="text-md font-semibold text-text mb-3">
                  SEO Data Output
                </h4>
                <pre className="text-xs text-textSecondary overflow-auto">
                  {JSON.stringify(seoData, null, 2)}
                </pre>
              </UnifiedCard>
            </div>
          )}

          {/* PageHeader Demo */}
          {activeTab === "page-header" && (
            <div className="space-y-6">
              <UnifiedCard>
                <h3 className="text-lg font-semibold text-text mb-4">
                  PageHeader Demo
                </h3>
                <p className="text-textSecondary mb-6">
                  Various PageHeader configurations and use cases.
                </p>
              </UnifiedCard>

              {/* Example 1: Basic */}
              <div className="space-y-2">
                <p className="text-sm text-textSecondary font-medium">
                  Basic Header
                </p>
                <UnifiedCard className="bg-surfaceVariant/30">
                  <PageHeader title="Products" />
                </UnifiedCard>
              </div>

              {/* Example 2: With description and actions */}
              <div className="space-y-2">
                <p className="text-sm text-textSecondary font-medium">
                  With Description & Actions
                </p>
                <UnifiedCard className="bg-surfaceVariant/30">
                  <PageHeader
                    title="Products"
                    description="Manage all your products in one place"
                    actions={
                      <UnifiedButton variant="primary" icon={<Plus />}>
                        Add Product
                      </UnifiedButton>
                    }
                  />
                </UnifiedCard>
              </div>

              {/* Example 3: Full featured */}
              <div className="space-y-2">
                <p className="text-sm text-textSecondary font-medium">
                  Full Featured (Breadcrumbs, Badge, Actions)
                </p>
                <UnifiedCard className="bg-surfaceVariant/30">
                  <PageHeader
                    title="Order Management"
                    description="Track and manage all customer orders"
                    breadcrumbs={[
                      { label: "Admin", href: "/admin" },
                      { label: "Orders", href: "/admin/orders" },
                      { label: "Details" },
                    ]}
                    badge={{ text: "127 Active", variant: "success" }}
                    actions={
                      <>
                        <UnifiedButton variant="outline" size="sm">
                          Export
                        </UnifiedButton>
                        <UnifiedButton variant="primary" size="sm">
                          Create Order
                        </UnifiedButton>
                      </>
                    }
                  />
                </UnifiedCard>
              </div>
            </div>
          )}
        </div>

        {/* Component info footer */}
        <UnifiedCard className="bg-success/10 border-success/30">
          <div className="space-y-2">
            <h4 className="text-md font-semibold text-text">
              ✅ Phase 0 Complete!
            </h4>
            <p className="text-sm text-textSecondary">
              All 4 core components are ready to use. Check the{" "}
              <code className="px-2 py-1 bg-surface rounded text-primary">
                docs/ADMIN_SELLER_COMPONENTS_DOCS.md
              </code>{" "}
              for complete usage documentation.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <UnifiedBadge variant="success">
                SmartCategorySelector
              </UnifiedBadge>
              <UnifiedBadge variant="success">ModernDataTable</UnifiedBadge>
              <UnifiedBadge variant="success">SeoFieldsGroup</UnifiedBadge>
              <UnifiedBadge variant="success">PageHeader</UnifiedBadge>
            </div>
          </div>
        </UnifiedCard>
      </div>
    </div>
  );
}
