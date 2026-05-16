"use client";
import {
  SellerCreateProductView,
  SellerEditProductView,
  CategoryInlineSelect,
  BrandInlineSelect,
} from "@mohasinac/appkit";
import type {
  SellerCreateProductViewProps,
  SellerEditProductViewProps,
} from "@mohasinac/appkit";

const renderCategorySelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <CategoryInlineSelect value={value} onChange={onChange} />;

const renderBrandSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <BrandInlineSelect value={value} onChange={onChange} />;

export function StoreCreateProductShell(props: SellerCreateProductViewProps) {
  return (
    <SellerCreateProductView
      {...props}
      renderCategorySelector={renderCategorySelector}
      renderBrandSelector={renderBrandSelector}
    />
  );
}

export function StoreEditProductShell(props: SellerEditProductViewProps) {
  return (
    <SellerEditProductView
      {...props}
      renderCategorySelector={renderCategorySelector}
      renderBrandSelector={renderBrandSelector}
    />
  );
}
