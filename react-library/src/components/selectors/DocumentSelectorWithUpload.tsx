
/**
 * DocumentSelectorWithUpload Component
 *
 * Framework-agnostic document selector with upload functionality.
 * Displays saved documents with verification status and allows new uploads.
 *
 * @example
 * ```tsx
 * <DocumentSelectorWithUpload
 *   value={selectedDocId}
 *   onChange={(id, doc) => handleSelect(id, doc)}
 *   documents={documents}
 *   onUpload={(file, type, number) => uploadDocument(file, type, number)}
 * />
 * ```
 */

import React, { useState } from "react";

export interface Document {
  id: string;
  type: "pan" | "aadhaar" | "gstin" | "driving_license" | "passport" | "other";
  documentNumber: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
  verificationStatus: "pending" | "verified" | "rejected";
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface DocumentType {
  value: string;
  label: string;
}

export interface DocumentSelectorWithUploadProps {
  /** Currently selected document ID */
  value?: string | null;
  /** Callback when document changes */
  onChange: (documentId: string, document: Document) => void;
  /** Available documents */
  documents: Document[];
  /** Loading state */
  loading?: boolean;
  /** Filter by document type */
  documentType?:
    | "pan"
    | "aadhaar"
    | "gstin"
    | "driving_license"
    | "passport"
    | "other"
    | "all";
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Additional CSS classes */
  className?: string;
  /** Available document types */
  documentTypes?: DocumentType[];
  /** Callback to upload new document */
  onUpload?: (
    file: File,
    type: string,
    documentNumber: string
  ) => Promise<Document>;
  /** Max file size in MB */
  maxFileSizeMB?: number;
  /** Custom file icon */
  FileIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom upload icon */
  UploadIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom check icon */
  CheckIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom shield icon */
  ShieldIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom alert icon */
  AlertIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom eye icon */
  EyeIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom X icon */
  XIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom loader icon */
  LoaderIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default document types
const DEFAULT_DOCUMENT_TYPES: DocumentType[] = [
  { value: "pan", label: "PAN Card" },
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "gstin", label: "GSTIN Certificate" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "other", label: "Other" },
];

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Default icons (simplified inline SVGs)
const DefaultFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const DefaultUploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const DefaultCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const DefaultShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const DefaultAlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const DefaultEyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DefaultXIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const DefaultLoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function DocumentSelectorWithUpload({
  value,
  onChange,
  documents,
  loading = false,
  documentType = "all",
  required = false,
  error,
  label = "Select Document",
  className = "",
  documentTypes = DEFAULT_DOCUMENT_TYPES,
  onUpload,
  maxFileSizeMB = 5,
  FileIcon = DefaultFileIcon,
  UploadIcon = DefaultUploadIcon,
  CheckIcon = DefaultCheckIcon,
  ShieldIcon = DefaultShieldIcon,
  AlertIcon = DefaultAlertIcon,
  EyeIcon = DefaultEyeIcon,
  XIcon = DefaultXIcon,
  LoaderIcon = DefaultLoaderIcon,
}: DocumentSelectorWithUploadProps) {
  const [selectedId, setSelectedId] = useState<string | null>(value || null);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState(
    documentType === "all" ? "pan" : documentType
  );
  const [documentNumber, setDocumentNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Filter documents
  const filteredDocuments =
    documentType === "all"
      ? documents
      : documents.filter((d) => d.type === documentType);

  const handleSelect = (document: Document) => {
    setSelectedId(document.id);
    onChange(document.id, document);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxFileSizeMB}MB`);
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
      alert("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload || !documentNumber.trim()) return;

    try {
      setUploading(true);
      const newDoc = await onUpload(
        selectedFile,
        selectedType,
        documentNumber.trim()
      );
      handleSelect(newDoc);
      setShowForm(false);
      setSelectedFile(null);
      setDocumentNumber("");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: Document["verificationStatus"]) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <ShieldIcon />
            Verified
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            <AlertIcon />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <LoaderIcon className="w-6 h-6 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No documents uploaded
            </p>
            {onUpload && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <UploadIcon />
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <>
            {filteredDocuments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleSelect(doc)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  selectedId === doc.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === doc.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckIcon className="text-white" />
                      </div>
                    ) : (
                      <FileIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {documentTypes.find((t) => t.value === doc.type)
                          ?.label || doc.type}
                      </span>
                      {getStatusBadge(doc.verificationStatus)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doc.documentNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {doc.fileName} • {formatFileSize(doc.fileSize)}
                    </p>
                    {doc.verificationStatus === "rejected" &&
                      doc.rejectionReason && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {doc.rejectionReason}
                        </p>
                      )}
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <EyeIcon />
                  </a>
                </div>
              </button>
            ))}

            {onUpload && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <UploadIcon />
                  <span className="font-medium">Upload New Document</span>
                </div>
              </button>
            )}
          </>
        )}
      </div>

      {/* Upload Form */}
      {showForm && onUpload && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Upload Document
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedFile(null);
                setDocumentNumber("");
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XIcon />
            </button>
          </div>

          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as typeof selectedType)
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="Document number"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500"
          />

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />

          {selectedFile && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)}
              )
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || !documentNumber.trim() || uploading}
            className={cn(
              "w-full px-4 py-2 rounded-lg font-medium transition-colors",
              !selectedFile || !documentNumber.trim() || uploading
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default DocumentSelectorWithUpload;
