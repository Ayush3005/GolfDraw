export default function LandingPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            Welcome to <span className="text-green-600">GolfDraw</span>
          </h1>
          <p className="text-xl text-gray-600">
            Win. Give. Play. - The Premium Golf Subscription Platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-2">🏌️ Play</h2>
              <p className="text-gray-600">
                Showcase your skills and compete with golfers worldwide
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-2">🎁 Win</h2>
              <p className="text-gray-600">
                Compete in monthly draws for exclusive prizes
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-2">❤️ Give</h2>
              <p className="text-gray-600">
                Support your favorite charities with every subscription
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
