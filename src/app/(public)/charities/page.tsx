export default function CharitiesPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Featured Charities
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500"></div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Charity {i + 1}
                </h2>
                <p className="text-gray-600 mb-4">
                  Making a positive impact in the community
                </p>
                <button className="text-green-600 font-semibold hover:text-green-700">
                  Learn More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
