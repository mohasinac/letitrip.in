"use client";

import { WizardForm, type WizardFormStep } from "@/components/forms/WizardForm";
import BasicInfoStep from "@/components/seller/shop-wizard/BasicInfoStep";
import BrandingStep from "@/components/seller/shop-wizard/BrandingStep";
import ContactLegalStep from "@/components/seller/shop-wizard/ContactLegalStep";
import PoliciesStep from "@/components/seller/shop-wizard/PoliciesStep";
import SettingsStep from "@/components/seller/shop-wizard/SettingsStep";
import { logError } from "@/lib/firebase-error-logger";
import { shopsService } from "@/services/shops.service";
import {
  ArrowLeft,
  Check,
  FileText,
  Palette,
  Phone,
  Settings,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ShopFormData {
  name: string;
  slug: string;
  category: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string;
  accentColor: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  businessRegistration: string;
  taxId: string;
  shippingPolicy: string;
  returnPolicy: string;
  termsAndConditions: string;
  defaultShippingFee?: number;
  supportEmail: string;
  enableCOD: boolean;
  enableReturns: boolean;
  showContact: boolean;
  isActive: boolean;
  acceptsOrders: boolean;
}

export default function CreateShopWizardPage() {
  const router = useRouter();

  const initialData: Partial<ShopFormData> = {
    name: "",
    slug: "",
    category: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    themeColor: "#3B82F6",
    accentColor: "#10B981",
    email: "",
    phone: "",
    location: "",
    address: "",
    businessRegistration: "",
    taxId: "",
    shippingPolicy: "",
    returnPolicy: "7-days",
    termsAndConditions: "",
    supportEmail: "",
    enableCOD: false,
    enableReturns: true,
    showContact: true,
    isActive: false,
    acceptsOrders: true,
  };

  const handleSubmit = async (data: ShopFormData) => {
    try {
      const shopData: any = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        email: data.email,
        phone: data.phone,
        location: data.location,
        address: data.address,
        logoUrl: data.logoUrl || undefined,
        bannerUrl: data.bannerUrl || undefined,
        themeColor: data.themeColor,
        businessRegistration: data.businessRegistration || undefined,
        taxId: data.taxId || undefined,
        shippingPolicy: data.shippingPolicy || undefined,
        returnPolicy: data.returnPolicy,
        termsAndConditions: data.termsAndConditions || undefined,
        isActive: data.isActive,
      };

      await shopsService.create(shopData);
      toast.success("Shop created successfully!");
      router.push(`/seller/my-shops?created=true`);
    } catch (err) {
      logError(err as Error, {
        component: "ShopCreate.handleSubmit",
        metadata: { shopData: data },
      });
      toast.error((err as Error).message || "Failed to create shop");
      throw err;
    }
  };

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    // Step validation logic would go here
    // For now, return true to allow navigation
    return true;
  };

  const steps: WizardFormStep[] = [
    {
      label: "Basic Info",
      icon: <Store className="h-5 w-5" />,
      content: (
        <WizardForm>
          {({ formData, setFormData }) => (
            <BasicInfoStep
              formData={formData as any}
              onChange={(field: string, value: any) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
            />
          )}
        </WizardForm>
      ),
    },
    {
      label: "Branding",
      icon: <Palette className="h-5 w-5" />,
      content: (
        <WizardForm>
          {({ formData, setFormData }) => (
            <BrandingStep
              formData={formData as any}
              onChange={(field: string, value: any) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              errors={{}}
            />
          )}
        </WizardForm>
      ),
    },
    {
      label: "Contact & Legal",
      icon: <Phone className="h-5 w-5" />,
      content: (
        <WizardForm>
          {({ formData, setFormData }) => (
            <ContactLegalStep
              formData={formData as any}
              onChange={(field: string, value: any) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              errors={{}}
            />
          )}
        </WizardForm>
      ),
    },
    {
      label: "Policies",
      icon: <FileText className="h-5 w-5" />,
      content: (
        <WizardForm>
          {({ formData, setFormData }) => (
            <PoliciesStep
              formData={formData as any}
              onChange={(field: string, value: any) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              errors={{}}
            />
          )}
        </WizardForm>
      ),
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      content: (
        <WizardForm>
          {({ formData, setFormData }) => (
            <SettingsStep
              formData={formData as any}
              onChange={(field: string, value: any) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              errors={{}}
            />
          )}
        </WizardForm>
      ),
    },
    {
      label: "Review",
      icon: <Check className="h-5 w-5" />,
      content: <div className="p-6">Review step placeholder</div>,
      validate: validateStep,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/seller/my-shops"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Shops
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Create New Shop
          </h1>
        </div>
      </div>

      <WizardForm<ShopFormData>
        steps={steps}
        initialData={initialData}
        onSubmit={handleSubmit}
        onValidate={validateStep}
        submitLabel="Create Shop"
        showSaveDraftButton={false}
        showValidateButton={false}
        stepsVariant="numbered"
      />
    </div>
  );
}
