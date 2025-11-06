export default function SettingsPage() {
  return (
    <main id="user-settings-page" className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Account Settings
      </h1>
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">
              Username
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium"
              placeholder="mohasin"
            />
          </div>
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium"
              placeholder="user@example.com"
            />
          </div>
          <button className="bg-yellow-500 text-gray-900 px-6 py-2 rounded hover:bg-yellow-600 font-bold">
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}
