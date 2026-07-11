import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import DashboardCards from "../components/dashboard/DashboardCards";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">

        <Navbar />

        <div className="p-8">

          <DashboardCards />

          <div className="bg-white mt-8 rounded-lg shadow p-6">

            <h2 className="text-2xl font-semibold mb-4">
              Recent Activity
            </h2>

            <p className="text-gray-500">
              No activity available.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;