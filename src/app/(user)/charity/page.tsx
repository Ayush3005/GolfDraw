export default async function CharityPage(): Promise<React.ReactElement> {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          My Charity Selection
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-6">
            Select your favorite charity to support with your subscription fees
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Charity {i + 1}
                </h3>
                <p className="text-sm text-gray-600">
                  Making a difference every day
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
