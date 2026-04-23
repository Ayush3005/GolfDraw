export default async function AdminUsersPage(): Promise<React.ReactElement> {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Manage Users</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              User Management
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500">
              User management interface coming soon
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
