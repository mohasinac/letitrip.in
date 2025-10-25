import { ReactNode } from "react";

interface DevLayoutProps {
  children: ReactNode;
}

export default function DevLayout({ children }: DevLayoutProps) {
  // Only render in development environment
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Development Route Not Available
          </h1>
          <p className="text-gray-600">
            This page is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dev-layout">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Development Mode:</strong> This page is for testing and
              debugging purposes only.
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
