import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TestAuthPage() {
  return (
    <ProtectedRoute requireRole="user">
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto h-24 w-24 text-green-500">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="h-full w-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Authentication Successful!
            </h1>

            <p className="text-gray-600 mb-8">
              You have successfully accessed this protected page. The
              authentication and redirect system is working correctly.
            </p>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  Test Results:
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Protected route access</li>
                  <li>✅ Authentication check passed</li>
                  <li>✅ Redirect from login worked</li>
                  <li>✅ User session active</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
