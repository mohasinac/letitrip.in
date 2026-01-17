/**
 * UserProfileSkeleton Component
 *
 * Loading skeleton for user profile page
 * Matches the layout of actual UserProfile component
 */

export function UserProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 bg-gray-200 rounded-full flex-shrink-0" />

          {/* User Info */}
          <div className="flex-1 space-y-4">
            {/* Name */}
            <div className="h-8 bg-gray-200 rounded w-48" />

            {/* Email */}
            <div className="h-5 bg-gray-200 rounded w-64" />

            {/* Role Badge */}
            <div className="h-6 bg-gray-200 rounded w-20" />

            {/* Stats */}
            <div className="flex gap-6 pt-2">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-12" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-12" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-12" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded"
            >
              <div className="w-10 h-10 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
