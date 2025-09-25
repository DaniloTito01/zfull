import { useApi } from './hooks/useApi';
import MetricCard from './components/MetricCard';
import Chart from './components/Chart';
import ActivityFeed from './components/ActivityFeed';

function App() {
  const { data, loading, error } = useApi('/api/data');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error loading dashboard: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, chartData, recentActivity } = data || {};

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Demo</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              title="Active Users"
              value={metrics?.activeUsers?.value}
              change={metrics?.activeUsers?.change}
              period={metrics?.activeUsers?.period}
            />
            <MetricCard
              title="Total Sales"
              value={`$${metrics?.totalSales?.value?.toLocaleString()}`}
              change={metrics?.totalSales?.change}
              period={metrics?.totalSales?.period}
            />
            <MetricCard
              title="Open Tickets"
              value={metrics?.openTickets?.value}
              change={metrics?.openTickets?.change}
              period={metrics?.openTickets?.period}
            />
            <MetricCard
              title="Revenue"
              value={`$${metrics?.revenue?.value?.toLocaleString()}`}
              change={metrics?.revenue?.change}
              period={metrics?.revenue?.period}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <Chart
              data={chartData?.sales}
              type="bar"
              title="Monthly Sales"
              dataKey="value"
              color="#10B981"
            />
            <Chart
              data={chartData?.userGrowth}
              type="line"
              title="User Growth"
              dataKey="users"
              color="#3B82F6"
            />
          </div>

          {/* Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">API Status: Operational</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Database: Healthy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Cache: Warning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">CDN: Operational</span>
                  </div>
                </div>
              </div>
            </div>
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;