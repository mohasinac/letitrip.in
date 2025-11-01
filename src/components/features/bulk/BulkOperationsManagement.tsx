"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Edit,
} from "lucide-react";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { StatusBadge } from "@/components/ui/unified/Badge";
import * as XLSX from "xlsx";
import Papa from "papaparse";

interface BulkJob {
  id: string;
  type: "import" | "export" | "update" | "delete";
  entity: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ itemId: string; error: string }>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  createdAt: string;
}

interface BulkOperationsManagementProps {
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export default function BulkOperationsManagement({
  title = "Bulk Operations",
  description = "Import, export, and perform batch operations on your data",
  breadcrumbs,
}: BulkOperationsManagementProps) {
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState("products");
  const [selectedOperation, setSelectedOperation] = useState<
    "import" | "export" | "update" | "delete"
  >("import");
  const [uploadedData, setUploadedData] = useState<any[] | null>(null);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "info" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchJobs();
    // Auto-refresh every 5 seconds if there are processing jobs
    const interval = setInterval(() => {
      if (jobs.some((job) => job.status === "processing")) {
        fetchJobs();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/admin/bulk");
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setAlert({
        show: true,
        message: error.message || "Failed to fetch jobs",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileExtension === "csv") {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setUploadedData(results.data);
          setAlert({
            show: true,
            message: `Parsed ${results.data.length} rows from CSV`,
            type: "success",
          });
        },
        error: (error) => {
          setAlert({
            show: true,
            message: `CSV parsing error: ${error.message}`,
            type: "error",
          });
        },
      });
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      // Parse Excel
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          setUploadedData(jsonData);
          setAlert({
            show: true,
            message: `Parsed ${jsonData.length} rows from Excel`,
            type: "success",
          });
        } catch (error: any) {
          setAlert({
            show: true,
            message: `Excel parsing error: ${error.message}`,
            type: "error",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setAlert({
        show: true,
        message: "Please upload a CSV or Excel file",
        type: "error",
      });
    }
  };

  const handleExport = async () => {
    try {
      setProcessing(true);

      const response = await fetch("/api/admin/bulk/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: selectedEntity,
          format: "excel",
          fields: [], // Export all fields
          filters: {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedEntity}_export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setAlert({
        show: true,
        message: "Export completed successfully",
        type: "success",
      });
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Export failed",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkOperation = async () => {
    if (!uploadedData || uploadedData.length === 0) {
      setAlert({
        show: true,
        message: "Please upload a file first",
        type: "warning",
      });
      return;
    }

    try {
      setProcessing(true);

      const response = await fetch("/api/admin/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: selectedOperation,
          entity: selectedEntity,
          data: uploadedData,
          options: {
            updateExisting: true,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAlert({
          show: true,
          message: `Operation started successfully. Job ID: ${result.data.jobId}`,
          type: "success",
        });
        setUploadedData(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchJobs(); // Refresh jobs list
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Operation failed",
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templates: { [key: string]: any[] } = {
      products: [
        {
          id: "sample-id",
          name: "Sample Product",
          price: 999,
          description: "Product description",
          category: "electronics",
          stock: 100,
          sku: "PROD-001",
        },
      ],
      inventory: [
        {
          productId: "product-id",
          quantity: 100,
          location: "warehouse-1",
        },
      ],
      categories: [
        {
          name: "Category Name",
          slug: "category-slug",
          description: "Category description",
        },
      ],
    };

    const templateData = templates[selectedEntity] || [];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    XLSX.writeFile(workbook, `${selectedEntity}_template.xlsx`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeStatus = (
    status: string
  ): "success" | "error" | "warning" | "pending" => {
    switch (status) {
      case "completed":
        return "success";
      case "failed":
        return "error";
      case "processing":
        return "warning";
      default:
        return "pending";
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <UnifiedButton
            onClick={fetchJobs}
            icon={<RefreshCw className="w-5 h-5" />}
            variant="outline"
          >
            Refresh
          </UnifiedButton>
        }
      />

      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          className="mb-6"
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Operation Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          New Operation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Entity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity Type
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="products">Products</option>
              <option value="inventory">Inventory</option>
              <option value="categories">Categories</option>
              <option value="orders">Orders</option>
            </select>
          </div>

          {/* Operation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Operation Type
            </label>
            <select
              value={selectedOperation}
              onChange={(e) =>
                setSelectedOperation(
                  e.target.value as "import" | "export" | "update" | "delete"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="import">Import (Create/Update)</option>
              <option value="update">Bulk Update</option>
              <option value="export">Export</option>
              <option value="delete">Bulk Delete</option>
            </select>
          </div>
        </div>

        {/* Actions based on operation */}
        {selectedOperation === "export" ? (
          <div className="flex gap-4">
            <UnifiedButton
              onClick={handleExport}
              loading={processing}
              icon={<Download className="w-5 h-5" />}
            >
              Export to Excel
            </UnifiedButton>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File (CSV or Excel)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploadedData && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✓ {uploadedData.length} rows loaded
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <UnifiedButton
                onClick={downloadTemplate}
                icon={<FileSpreadsheet className="w-5 h-5" />}
                variant="outline"
              >
                Download Template
              </UnifiedButton>

              <UnifiedButton
                onClick={handleBulkOperation}
                loading={processing}
                icon={
                  selectedOperation === "import" ? (
                    <Upload className="w-5 h-5" />
                  ) : selectedOperation === "update" ? (
                    <Edit className="w-5 h-5" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )
                }
                disabled={!uploadedData}
              >
                {selectedOperation === "import"
                  ? "Import Data"
                  : selectedOperation === "update"
                  ? "Update Records"
                  : "Delete Records"}
              </UnifiedButton>
            </div>
          </div>
        )}
      </div>

      {/* Jobs History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Operation History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Results
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Started
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No operations yet. Start by importing or exporting data.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <StatusBadge status={getStatusBadgeStatus(job.status)}>
                          {getStatusLabel(job.status)}
                        </StatusBadge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {job.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {job.entity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${
                                (job.processedItems / job.totalItems) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {job.processedItems}/{job.totalItems}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-green-600 dark:text-green-400">
                          ✓ {job.successCount}
                        </div>
                        {job.errorCount > 0 && (
                          <div className="text-red-600 dark:text-red-400">
                            ✗ {job.errorCount}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {job.duration ? `${job.duration}s` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(job.startedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-2">Tips for Bulk Operations:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Download the template to see the required column format</li>
              <li>
                For imports, include an "id" column to update existing records
              </li>
              <li>For updates, only include the columns you want to change</li>
              <li>For deletes, only the "id" column is required</li>
              <li>Operations process in batches of 500 items</li>
              <li>Check the history table for detailed error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
