
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import DashboardCards from "../components/dashboard/DashboardCards";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-8">

          <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-2xl shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold">
              AI Textile Waste Intelligence Platform
            </h1>
            <p className="mt-2 text-green-100">
              Monitor material classification, defect detection and sustainability insights.
            </p>
          </div>

          <DashboardCards />

          <div className="bg-white mt-8 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Recent Activity
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b">
                  <tr>
                    <th className="py-3">Time</th>
                    <th>Module</th>
                    <th>Result</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">10:30 AM</td>
                    <td>Material</td>
                    <td>Cotton</td>
                    <td>98.72%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">10:45 AM</td>
                    <td>Defect</td>
                    <td>Non-Defect</td>
                    <td>99.94%</td>
                  </tr>
                  <tr>
                    <td className="py-3">11:00 AM</td>
                    <td>Material</td>
                    <td>Denim</td>
                    <td>97.51%</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
