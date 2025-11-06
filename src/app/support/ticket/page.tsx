export default function SupportTicketPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Customer Support
      </h1>
      <div className="bg-white rounded-lg border p-6">
        <form className="space-y-4">
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">Subject</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium"
              placeholder="Brief description of your issue"
            />
          </div>
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">Message</label>
            <textarea
              className="w-full border border-gray-300 rounded px-4 py-2 h-32 text-gray-900 font-medium"
              placeholder="Describe your issue in detail"
            />
          </div>
          <button className="bg-yellow-500 text-gray-900 px-6 py-2 rounded hover:bg-yellow-600 font-bold">
            Submit Ticket
          </button>
        </form>
      </div>
    </main>
  );
}
