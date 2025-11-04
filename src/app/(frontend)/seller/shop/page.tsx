"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useAuth } from '@/lib/contexts/AuthContext";
import { apiGet, apiPost } from "@/lib/api/seller";
import { PageHeader } from "@/components/ui/admin-seller";
import { SimpleTabs } from "@/components/ui/unified/Tabs";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { UnifiedCard } from "@/components/ui/unified/Card";

// Tab Components
import BasicInfoTab from "./components/BasicInfoTab";
import AddressesTab from "./components/AddressesTab";
import BusinessTab from "./components/BusinessTab";
import SeoTab from "./components/SeoTab";
import SettingsTab from "./components/SettingsTab";

interface ShopData {
  storeName: string;
  storeSlug: string;
  description: string;
  logo: string;
  coverImage: string;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  businessName: string;
  businessType: "individual" | "company" | "partnership";
  gstNumber: string;
  panNumber: string;
  enableCOD: boolean;
  freeShippingThreshold: number;
  processingTime: number;
  returnPolicy: string;
  shippingPolicy: string;
}

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

function ShopSetupContent() {
  const { user, loading: authLoading } = useAuth();

  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Shop Setup",
      href: SELLER_ROUTES.SHOP_SETUP,
      active: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const [shopData, setShopData] = useState<ShopData>({
    storeName: "",
    storeSlug: "",
    description: "",
    logo: "",
    coverImage: "",
    isActive: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    businessName: "",
    businessType: "individual",
    gstNumber: "",
    panNumber: "",
    enableCOD: true,
    freeShippingThreshold: 0,
    processingTime: 2,
    returnPolicy: "",
    shippingPolicy: "",
  });

  const [pickupAddresses, setPickupAddresses] = useState<Address[]>([
    {
      id: "1",
      label: "",
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: true,
    },
  ]);
  // Fetch shop data on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (user && !authLoading && isMounted) {
        await fetchShopData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]); // Re-run when user or auth state changes

  const fetchShopData = async () => {
    try {
      setLoading(true);

      const response: any = await apiGet("/api/seller/shop");

      if (response.success && response.data.exists !== false) {
        const data = response.data;

        setShopData({
          storeName: data.shopName || "",
          storeSlug: data.storeSlug || "",
          description: data.description || "",
          logo: data.logo || "",
          coverImage: data.coverImage || "",
          isActive: data.isActive ?? true,
          seoTitle: data.seo?.title || "",
          seoDescription: data.seo?.description || "",
          seoKeywords: data.seo?.keywords || [],
          businessName: data.businessDetails?.businessName || "",
          businessType: data.businessDetails?.businessType || "individual",
          gstNumber: data.businessDetails?.gstNumber || "",
          panNumber: data.businessDetails?.panNumber || "",
          enableCOD: data.settings?.enableCOD ?? true,
          freeShippingThreshold: data.settings?.freeShippingThreshold || 0,
          processingTime: data.settings?.processingTime || 2,
          returnPolicy: data.policies?.returnPolicy || "",
          shippingPolicy: data.policies?.shippingPolicy || "",
        });

        if (data.pickupAddresses && data.pickupAddresses.length > 0) {
          setPickupAddresses(data.pickupAddresses);
        }
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load shop data",
        type: "error",
      });
      console.error("Failed to fetch shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!shopData.storeName.trim()) {
        setAlert({
          show: true,
          message: "Store name is required",
          type: "error",
        });
        return;
      }

      const payload = {
        shopName: shopData.storeName,
        storeSlug: shopData.storeSlug,
        description: shopData.description,
        logo: shopData.logo,
        coverImage: shopData.coverImage,
        isActive: shopData.isActive,
        seo: {
          title: shopData.seoTitle,
          description: shopData.seoDescription,
          keywords: shopData.seoKeywords,
        },
        businessDetails: {
          businessName: shopData.businessName,
          businessType: shopData.businessType,
          gstNumber: shopData.gstNumber,
          panNumber: shopData.panNumber,
        },
        settings: {
          enableCOD: shopData.enableCOD,
          freeShippingThreshold: shopData.freeShippingThreshold,
          processingTime: shopData.processingTime,
        },
        policies: {
          returnPolicy: shopData.returnPolicy,
          shippingPolicy: shopData.shippingPolicy,
        },
        pickupAddresses,
      };

      const response: any = await apiPost("/api/seller/shop", payload);

      if (response.success) {
        setAlert({
          show: true,
          message: "Shop settings saved successfully!",
          type: "success",
        });
        fetchShopData(); // Refresh data
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to save shop settings",
        type: "error",
      });
      console.error("Failed to save shop:", error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "addresses", label: "Pickup Addresses" },
    { id: "business", label: "Business Details" },
    { id: "seo", label: "SEO" },
    { id: "settings", label: "Settings" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alert */}
      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Page Header */}
      <PageHeader
        title="Shop Setup"
        description="Configure your shop details, addresses, and policies"
        breadcrumbs={[
          { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
          { label: "Shop Setup" },
        ]}
        actions={
          <UnifiedButton
            onClick={handleSave}
            loading={saving}
            icon={<Save />}
            disabled={loading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </UnifiedButton>
        }
      />

      {/* Tabs */}
      <UnifiedCard className="p-0 overflow-hidden">
        <SimpleTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="underline"
        />
      </UnifiedCard>

      {/* Tab Content */}
      <div className="animate-slideUp">
        {activeTab === "basic" && (
          <BasicInfoTab
            shopData={shopData}
            onChange={(updates) => setShopData({ ...shopData, ...updates })}
            loading={loading}
          />
        )}

        {activeTab === "addresses" && (
          <AddressesTab
            addresses={pickupAddresses}
            onChange={setPickupAddresses}
            loading={loading}
          />
        )}

        {activeTab === "business" && (
          <BusinessTab
            businessName={shopData.businessName}
            businessType={shopData.businessType}
            gstNumber={shopData.gstNumber}
            panNumber={shopData.panNumber}
            onChange={(field, value) =>
              setShopData({ ...shopData, [field]: value })
            }
            loading={loading}
          />
        )}

        {activeTab === "seo" && (
          <SeoTab
            seoTitle={shopData.seoTitle}
            seoDescription={shopData.seoDescription}
            seoKeywords={
              Array.isArray(shopData.seoKeywords)
                ? shopData.seoKeywords.join(", ")
                : shopData.seoKeywords || ""
            }
            onChange={(field, value) =>
              setShopData({ ...shopData, [field]: value })
            }
            loading={loading}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            enableCOD={shopData.enableCOD}
            freeShippingThreshold={shopData.freeShippingThreshold}
            processingTime={shopData.processingTime}
            returnPolicy={shopData.returnPolicy}
            shippingPolicy={shopData.shippingPolicy}
            onChange={(field, value) =>
              setShopData({ ...shopData, [field]: value })
            }
            loading={loading}
          />
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <UnifiedButton
          onClick={handleSave}
          loading={saving}
          icon={<Save />}
          size="lg"
          disabled={loading}
        >
          {saving ? "Saving..." : "Save All Changes"}
        </UnifiedButton>
      </div>
    </div>
  );
}

export default function ShopSetup() {
  return (
    <RoleGuard requiredRole="seller">
      <ShopSetupContent />
    </RoleGuard>
  );
}
