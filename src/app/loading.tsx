export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        <h2 className="mt-6 text-xl font-semibold text-gray-700">Loading...</h2>
        <p className="mt-2 text-gray-500">
          Please wait while we load your content
        </p>

        {/* Progress dots animation */}
        <div className="mt-4 flex justify-center space-x-1">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
