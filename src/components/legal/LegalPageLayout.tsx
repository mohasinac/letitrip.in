import { ReactNode } from "react";
import { FileText, Calendar, Shield } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  version: string;
  children: ReactNode;
  effectiveDate?: string;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  version,
  children,
  effectiveDate,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              {effectiveDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Effective Date: {effectiveDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Version {version}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="prose prose-gray max-w-none">{children}</div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Questions about this policy?
            </h3>
            <p className="text-gray-600 mb-4">
              If you have any questions or concerns about this policy, please
              contact us:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:legal@letitrip.com"
                  className="text-blue-600 hover:underline"
                >
                  legal@letitrip.com
                </a>
              </p>
              <p>
                <strong>Support:</strong>{" "}
                <a
                  href="/support/ticket"
                  className="text-blue-600 hover:underline"
                >
                  Create a Support Ticket
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
