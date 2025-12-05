/**
 * @fileoverview React Component
 * @module src/components/common/DocumentSelectorWithUpload
 * @description This file contains the DocumentSelectorWithUpload component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Loader2,
  Check,
  Upload,
  Eye,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/forms/FormField";
import { FormSelect } from "@/components/forms/FormSelect";
import { mediaService } from "@/services/media.service";
import { DateDisplay } from "@/components/common/values/DateDisplay";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@/hooks/useLoadingState";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Document Interface
/**
 * Document interface
 * 
 * @interface
 * @description Defines the structure and contract for Document
 */
export interface Document {
  /** Id */
  id: string;
  /** Type */
  type: "pan" | "aadhaar" | "gstin" | "driving_license" | "passport" | "other";
  /** Document Number */
  documentNumber: string;
  /** File Name */
  fileName: string;
  /** File Url */
  fileUrl: string;
  /** File Size */
  fileSize: number;
  /** Uploaded At */
  uploadedAt: Date;
  /** Verification Status */
  verificationStatus: "pending" | "verified" | "rejected";
  /** Verified At */
  verifiedAt?: Date;
  /** Rejection Reason */
  rejectionReason?: string;
}

/**
 * DOCUMENT_TYPES constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for document types
 */
const DOCUMENT_TYPES = [
  { value: "pan", label: "PAN Card" },
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "gstin", label: "GSTIN Certificate" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "other", label: "Other" },
];

const DocumentSchema = z.object({
  /** Type */
  type: z.enum([
    "pan",
    "aadhaar",
    "gstin",
    "driving_license",
    "passport",
    "other",
  ]),
  /** Document Number */
  documentNumber: z.string().min(5, "Document number is required"),
  /** File */
  file: z.any(),
});

/**
 * DocumentFormData type
 * 
 * @typedef {Object} DocumentFormData
 * @description Type definition for DocumentFormData
 */
type DocumentFormData = z.infer<typeof DocumentSchema>;

/**
 * DocumentSelectorWithUploadProps interface
 * 
 * @interface
 * @description Defines the structure and contract for DocumentSelectorWithUploadProps
 */
export interface DocumentSelectorWithUploadProps {
  /** Value */
  value?: string | null;
  /** On Change */
  onChange: (documentId: string, document: Document) => void;
  /** Document Type */
  documentType?:
    | "pan"
    | "aadhaar"
    | "gstin"
    | "driving_license"
    | "passport"
    | "other"
    | "all";
  /** Required */
  required?: boolean;
  /** Error */
  error?: string;
  /** Label */
  label?: string;
  /** Class Name */
  className?: string;
}

/**
 * Function: Document Selector With Upload
 */
/**
 * Performs document selector with upload operation
 *
 * @returns {any} The documentselectorwithupload result
 *
 * @example
 * DocumentSelectorWithUpload();
 */

/**
 * Performs document selector with upload operation
 *
 * @returns {any} The documentselectorwithupload result
 *
 * @example
 * DocumentSelectorWithUpload();
 */

export function DocumentSelectorWithUpload({
  value,
  onChange,
  documentType = "all",
  required = false,
  error,
  label = "Select Document",
  className = "",
}: DocumentSelectorWithUploadProps) {
  const {
    /** Is Loading */
    isLoading: loading,
    /** Data */
    data: documents,
    /** Set Data */
    setData: setDocuments,
    execute,
  } = useLoadingState<Document[]>({
    /** Initial Data */
    initialData: [],
    /** On Load Error */
    onLoadError: (error) => {
      logError(error as Error, {
        /** Component */
        component: "DocumentSelectorWithUpload.loadDocuments",
      });
      toast.error("Failed to load documents");
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    /** Form State */
    formState: { errors },
  } = useForm<DocumentFormData>({
    /** Resolver */
    resolver: zodResolver(DocumentSchema),
    /** Default Values */
    defaultValues: {
      /** Type */
      type: documentType === "all" ? "pan" : documentType,
    },
  });

  useEffect(() => {
    loadDocuments();
  }, [documentType]);

  /**
   * Fetches documents from server
   *
   * @returns {Promise<any>} Promise resolving to documents result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Fetches documents from server
   *
   * @returns {Promise<any>} Promise resolving to documents result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadDocuments = () =>
    execute(async () => {
      // TODO: Implement actual API
      return [];
    });

  /**
   * Handles document select event
   *
   * @param {Document} document - The document
   *
   * @returns {any} The handledocumentselect result
   */

  /**
   * Handles document select event
   *
   * @param {Document} document - The document
   *
   * @returns {any} The handledocumentselect result
   */

  const handleDocumentSelect = (document: Document) => {
    setSelectedId(document.id);
    onChange(document.id, document);
  };

  /**
   * Handles file change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlefilechange result
   */

  /**
   * Handles file change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlefilechange result
   */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and PDF files are allowed");
        return;
      }

      setSelectedFile(file);
    }
  };

  /**
   * Performs async operation
   *
   * @param {DocumentFormData} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {DocumentFormData} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const onSubmit = async (data: DocumentFormData) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload file to Firebase Storage
      const uploadResult = await mediaService.upload({
        /** File */
        file: selectedFile,
        /** Context */
        context: "product",
      });

      // TODO: Add progress tracking when mediaService supports it

      // TODO: Implement actual API to save document metadata
      const newDocument: Document = {
        /** Id */
        id: `doc_${Date.now()}`,
        /** Type */
        type: data.type,
        /** Document Number */
        documentNumber: data.documentNumber,
        /** File Name */
        fileName: selectedFile.name,
        /** File Url */
        fileUrl: uploadResult.url,
        /** File Size */
        fileSize: selectedFile.size,
        /** Uploaded At */
        uploadedAt: new Date(),
        /** Verification Status */
        verificationStatus: "pending",
      };

      setDocuments([...(documents || []), newDocument]);
      setSelectedId(newDocument.id);
      onChange(newDocument.id, newDocument);
      setShowForm(false);
      setSelectedFile(null);
      toast.success("Document uploaded successfully");
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "DocumentSelectorWithUpload.uploadDocument",
      });
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Retrieves verification badge
   *
   * @param {Document["verificationStatus"]} status - The status
   *
   * @returns {any} The verificationbadge result
   */

  /**
   * Retrieves verification badge
   *
   * @param {Document["verificationStatus"]} status - The status
   *
   * @returns {any} The verificationbadge result
   */

  const getVerificationBadge = (status: Document["verificationStatus"]) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <Shield className="w-3 h-3" />
            Verified
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      /** Default */
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Pending
          </span>
        );
    }
  };

  /**
   * Formats file size
   *
   * @param {number} bytes - The bytes
   *
   * @returns {string} The formatfilesize result
   */

  /**
   * Formats file size
   *
   * @param {number} bytes - The bytes
   *
   * @returns {string} The formatfilesize result
   */

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading && (documents || []).length === 0) {
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
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {(documents || []).length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No documents uploaded
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        ) : (
          <>
            {(documents || []).map((document) => (
              <button
                key={document.id}
                type="button"
                onClick={() => handleDocumentSelect(document)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedId === document.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === document.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {
                          DOCUMENT_TYPES.find((t) => t.value === document.type)
                            ?.label
                        }
                      </span>
                      {getVerificationBadge(document.verificationStatus)}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {document.documentNumber}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                      <span>{document.fileName}</span>
                      <span>{formatFileSize(document.fileSize)}</span>
                      <DateDisplay date={document.uploadedAt} />
                    </div>

                    {document.verificationStatus === "rejected" &&
                      document.rejectionReason && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                          /** Reason */
                          Reason: {document.rejectionReason}
                        </p>
                      )}

                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="w-3 h-3" />
                      View Document
                    </a>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Upload Another Document</span>
              </div>
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Upload Document
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <FormField
                label="Document Type"
                required
                error={errors.type?.message}
              >
                <select {...register("type")} className="input w-full">
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Document Number"
                required
                error={errors.documentNumber?.message}
              >
                <input
                  {...register("documentNumber")}
                  className="input w-full"
                  placeholder="Enter document number"
                />
              </FormField>

              <FormField label="Upload File" required>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="document-file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="document-file"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    {selectedFile ? (
                      <>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload
                        </span>
                        <span className="text-xs text-gray-500">
                          JPG, PNG or PDF (max 5MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </FormField>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Your document will be verified within 1-2 business days
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Document"
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

export default DocumentSelectorWithUpload;
