export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Hello</h1>
      <p className="text-gray-600">
        Welcome to the app. This is the main content area.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="font-semibold mb-2">Card {i}</h3>
            <p className="text-gray-600 text-sm">Sample content card</p>
          </div>
        ))}
      </div>
    </div>
  );
}
