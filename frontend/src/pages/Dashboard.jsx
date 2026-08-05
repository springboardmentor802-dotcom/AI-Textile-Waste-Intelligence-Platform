import { Link } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import DashboardCards from "../components/dashboard/DashboardCards";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <div className="p-8 space-y-8">

          {/* Hero Section */}

          <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 rounded-3xl shadow-xl p-10 text-white">

            <div className="flex justify-between items-center">

              <div>

                <h1 className="text-5xl font-bold">
                  AI Textile Intelligence Platform
                </h1>

                <p className="mt-4 text-green-100 text-lg max-w-2xl">

                  Analyze textile materials using Artificial Intelligence,
                  detect defects, classify textile waste and generate
                  sustainability recommendations from a single uploaded image.

                </p>

                <Link
                  to="/textile-intelligence"
                  className="inline-block mt-8 bg-white text-green-700 font-semibold px-8 py-3 rounded-xl shadow hover:scale-105 transition"
                >
                  🚀 Start AI Analysis
                </Link>

              </div>

              <div className="hidden lg:block text-8xl">
                🤖
              </div>

            </div>

          </div>

          {/* KPI Cards

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">

              <p className="text-gray-500">
                Images Analysed
              </p>

              <h2 className="text-4xl font-bold mt-2">
                156
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">

              <p className="text-gray-500">
                Materials Identified
              </p>

              <h2 className="text-4xl font-bold mt-2">
                10
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">

              <p className="text-gray-500">
                Recyclable Waste
              </p>

              <h2 className="text-4xl font-bold mt-2">
                91%
              </h2>

            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">

              <p className="text-gray-500">
                Sustainability Score
              </p>

              <h2 className="text-4xl font-bold mt-2">
                88%
              </h2>

            </div>

          </div> */}

          {/* Quick Modules */}

          <DashboardCards />

          {/* Recent Activity */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <div className="flex justify-between items-center mb-5">

              <h2 className="text-2xl font-bold">

                Recent Activity

              </h2>

              <span className="text-sm text-gray-500">

                Last 24 Hours

              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-4">
                      Time
                    </th>

                    <th className="text-left">
                      Module
                    </th>

                    <th className="text-left">
                      Result
                    </th>

                    <th className="text-left">
                      Confidence
                    </th>

                    <th className="text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr className="border-b">

                    <td className="py-4">
                      10:30 AM
                    </td>

                    <td>
                      Material Recognition
                    </td>

                    <td>
                      Cotton Poplin
                    </td>

                    <td>
                      98.72%
                    </td>

                    <td>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                        Success

                      </span>

                    </td>

                  </tr>

                  <tr className="border-b">

                    <td className="py-4">
                      10:45 AM
                    </td>

                    <td>
                      Defect Detection
                    </td>

                    <td>
                      Non-Defect
                    </td>

                    <td>
                      99.94%
                    </td>

                    <td>

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                        Success

                      </span>

                    </td>

                  </tr>

                  <tr>

                    <td className="py-4">
                      11:00 AM
                    </td>

                    <td>
                      Sustainability
                    </td>

                    <td>
                      Score 91
                    </td>

                    <td>
                      —

                    </td>

                    <td>

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

                        Generated

                      </span>

                    </td>

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