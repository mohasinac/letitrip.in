"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Loader2,
  Check,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormInput } from "@/components/forms";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  isValidGST,
  isValidPAN,
} from "@/constants/validation-messages";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@/hooks/useLoadingState";

// Tax Details Interface
export interface TaxDetails {
  id: string;
  businessName: string;
  gstin: string;
  pan: string;
  cin?: string;
  registeredAddress: string;
  stateCode: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Validation Schema
const TaxDetailsSchema = z.object({
  businessName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  gstin: z
    .string()
    .length(15, "GSTIN must be 15 characters")
    .refine((val) => isValidGST(val), VALIDATION_MESSAGES.TAX.GST_INVALID),
  pan: z
    .string()
    .length(VALIDATION_RULES.PAN.LENGTH, "PAN must be 10 characters")
    .refine((val) => isValidPAN(val), VALIDATION_MESSAGES.TAX.PAN_INVALID),
  cin: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(val),
      "Invalid CIN format",
    ),
  registeredAddress: z
    .string()
    .min(10, "Address must be at least 10 characters"),
  stateCode: z.string().length(2, "State code must be 2 digits"),
  isDefault: z.boolean(),
});

type TaxDetailsFormData = z.infer<typeof TaxDetailsSchema>;

export interface TaxDetailsSelectorWithCreateProps {
  value?: string | null;
  onChange: (taxDetailsId: string, taxDetails: TaxDetails) => void;
  required?: boolean;
  error?: string;
  label?: string;
  autoSelectDefault?: boolean;
  className?: string;
}

export function TaxDetailsSelectorWithCreate({
  value,
  onChange,
  required = false,
  error,
  label = "Select Tax Details",
  autoSelectDefault = true,
  className = "",
}: TaxDetailsSelectorWithCreateProps) {
  const {
    isLoading: loading,
    data: taxDetailsList,
    setData: setTaxDetailsList,
    execute,
  } = useLoadingState<TaxDetails[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error, {
        component: "TaxDetailsSelectorWithCreate.loadTaxDetails",
      });
      toast.error("Failed to load tax details");
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(value || null);
  const [gstinLoading, setGstinLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaxDetailsFormData>({
    resolver: zodResolver(TaxDetailsSchema),
    defaultValues: {
      isDefault: false,
    },
  });

  const gstin = watch("gstin");

  // Load tax details (mock for now - implement actual API later)
  useEffect(() => {
    loadTaxDetails();
  }, []);

  // Auto-select default tax details
  useEffect(() => {
    if (autoSelectDefault && (taxDetailsList || []).length > 0 && !selectedId) {
      const defaultTaxDetails = (taxDetailsList || []).find(
        (tax) => tax.isDefault,
      );
      if (defaultTaxDetails) {
        setSelectedId(defaultTaxDetails.id);
        onChange(defaultTaxDetails.id, defaultTaxDetails);
      }
    }
  }, [taxDetailsList, autoSelectDefault, selectedId, onChange]);

  // GSTIN lookup - extract PAN and state code
  useEffect(() => {
    if (gstin && isValidGST(gstin)) {
      extractFromGSTIN(gstin);
    }
  }, [gstin]);

  const loadTaxDetails = () =>
    execute(async () => {
      // TODO: Implement actual API call
      // const data = await taxDetailsService.getAll();
      // return data;

      // Mock data for now
      return [];
    });

  const extractFromGSTIN = async (gstinValue: string) => {
    try {
      setGstinLoading(true);

      // Extract PAN (characters 3-12 of GSTIN)
      const extractedPAN = gstinValue.substring(2, 12);
      setValue("pan", extractedPAN);

      // Extract state code (first 2 digits of GSTIN)
      const stateCode = gstinValue.substring(0, 2);
      setValue("stateCode", stateCode);

      // TODO: Implement GSTIN API lookup for business details
      // const businessDetails = await gstinService.lookup(gstinValue);
      // setValue("businessName", businessDetails.legalName);
      // setValue("registeredAddress", businessDetails.address);

      toast.success("PAN and state code auto-filled from GSTIN");
    } catch (error) {
      logError(error as Error, {
        component: "TaxDetailsSelectorWithCreate.extractFromGSTIN",
      });
    } finally {
      setGstinLoading(false);
    }
  };

  const handleTaxDetailsSelect = (taxDetails: TaxDetails) => {
    setSelectedId(taxDetails.id);
    onChange(taxDetails.id, taxDetails);
  };

  const onSubmit = async (data: TaxDetailsFormData) => {
    try {
      setSubmitting(true);

      // TODO: Implement actual API call
      // const newTaxDetails = await taxDetailsService.create(data);

      // Mock data for now
      const newTaxDetails: TaxDetails = {
        id: `tax_${Date.now()}`,
        businessName: data.businessName,
        gstin: data.gstin,
        pan: data.pan,
        cin: data.cin,
        registeredAddress: data.registeredAddress,
        stateCode: data.stateCode,
        isVerified: false,
        isDefault: data.isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTaxDetailsList([...(taxDetailsList || []), newTaxDetails]);
      setSelectedId(newTaxDetails.id);
      onChange(newTaxDetails.id, newTaxDetails);
      setShowForm(false);
      toast.success("Tax details added successfully");
    } catch (error) {
      logError(error as Error, {
        component: "TaxDetailsSelectorWithCreate.addTaxDetails",
      });
      toast.error("Failed to add tax details");
    } finally {
      setSubmitting(false);
    }
  };

  const getVerificationBadge = (isVerified: boolean) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <Shield className="w-3 h-3" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
        <AlertCircle className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const getStateFromCode = (code: string): string => {
    const stateCodes: Record<string, string> = {
      "01": "Jammu & Kashmir",
      "02": "Himachal Pradesh",
      "03": "Punjab",
      "04": "Chandigarh",
      "05": "Uttarakhand",
      "06": "Haryana",
      "07": "Delhi",
      "08": "Rajasthan",
      "09": "Uttar Pradesh",
      "10": "Bihar",
      "11": "Sikkim",
      "12": "Arunachal Pradesh",
      "13": "Nagaland",
      "14": "Manipur",
      "15": "Mizoram",
      "16": "Tripura",
      "17": "Meghalaya",
      "18": "Assam",
      "19": "West Bengal",
      "20": "Jharkhand",
      "21": "Odisha",
      "22": "Chhattisgarh",
      "23": "Madhya Pradesh",
      "24": "Gujarat",
      "26": "Dadra & Nagar Haveli",
      "27": "Maharashtra",
      "29": "Karnataka",
      "30": "Goa",
      "31": "Lakshadweep",
      "32": "Kerala",
      "33": "Tamil Nadu",
      "34": "Puducherry",
      "35": "Andaman & Nicobar",
      "36": "Telangana",
      "37": "Andhra Pradesh",
    };
    return stateCodes[code] || `State ${code}`;
  };

  if (loading && (taxDetailsList || []).length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Loading tax details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Tax Details Cards */}
      <div className="space-y-3">
        {(taxDetailsList || []).length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No tax details found
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Tax Details
            </button>
          </div>
        ) : (
          <>
            {(taxDetailsList || []).map((taxDetails) => (
              <button
                key={taxDetails.id}
                type="button"
                onClick={() => handleTaxDetailsSelect(taxDetails)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedId === taxDetails.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Checkmark */}
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === taxDetails.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {taxDetails.businessName}
                      </span>
                      {getVerificationBadge(taxDetails.isVerified)}
                      {taxDetails.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          Primary
                        </span>
                      )}
                    </div>

                    {/* Tax IDs */}
                    <div className="space-y-1 mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">GSTIN:</span>{" "}
                        {taxDetails.gstin}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">PAN:</span>{" "}
                        {taxDetails.pan}
                      </p>
                      {taxDetails.cin && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">CIN:</span>{" "}
                          {taxDetails.cin}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {taxDetails.registeredAddress}
                    </p>

                    {/* State */}
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {getStateFromCode(taxDetails.stateCode)}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {/* Add New Button */}
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Tax Details</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Add Tax Details Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Tax Details
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* GSTIN */}
              <FormField
                label="GSTIN"
                required
                error={errors.gstin?.message}
                hint="Business details will be auto-filled"
              >
                <div className="relative">
                  <FormInput
                    {...register("gstin")}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                    className="uppercase"
                  />
                  {gstinLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
              </FormField>

              {/* PAN (auto-filled from GSTIN) */}
              <FormField
                label="PAN"
                required
                error={errors.pan?.message}
                hint="Auto-filled from GSTIN"
              >
                <FormInput
                  {...register("pan")}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="uppercase"
                  readOnly
                />
              </FormField>

              {/* State Code (auto-filled from GSTIN) */}
              <FormField
                label="State Code"
                required
                error={errors.stateCode?.message}
                hint="Auto-filled from GSTIN"
              >
                <FormInput
                  {...register("stateCode")}
                  placeholder="29"
                  maxLength={2}
                  readOnly
                />
              </FormField>

              {/* Business Name */}
              <FormField
                label="Business/Legal Name"
                required
                error={errors.businessName?.message}
              >
                <FormInput
                  {...register("businessName")}
                  placeholder="As per GST registration"
                />
              </FormField>

              {/* CIN (Optional) */}
              <FormField
                label="CIN (Optional)"
                error={errors.cin?.message}
                hint="Corporate Identification Number for companies"
              >
                <FormInput
                  {...register("cin")}
                  placeholder="U12345KA2020PTC123456"
                  className="uppercase"
                />
              </FormField>

              {/* Registered Address */}
              <FormField
                label="Registered Address"
                required
                error={errors.registeredAddress?.message}
              >
                <FormInput
                  {...register("registeredAddress")}
                  placeholder="As per GST registration"
                />
              </FormField>

              {/* Set as Default */}
              <div className="flex items-center gap-3 py-2">
                <input
                  {...register("isDefault")}
                  type="checkbox"
                  id="isDefault"
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Set as primary tax details
                </label>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Your tax details will be verified with government databases.
                  This may take 1-2 business days.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Tax Details"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaxDetailsSelectorWithCreate;
