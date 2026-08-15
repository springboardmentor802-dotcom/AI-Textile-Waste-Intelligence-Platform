import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import DashboardCards from "../components/dashboard/DashboardCards";
import { getReports } from "../utils/reportStorage";

function Dashboard() {
  const [reports, setReports] = useState([]);

useEffect(() => {
  const loadReports = () => {
    setReports(getReports());
  };

  loadReports();

  window.addEventListener("reportsUpdated", loadReports);

  return () => {
    window.removeEventListener("reportsUpdated", loadReports);
  };
}, []);

  const getData = (report) => {
    return report?.data || report || {};
  };

  const total = reports.length;

  const avgSustainability =
    total === 0
      ? 0
      : Math.round(
          reports.reduce((sum, report) => {
            const data = getData(report);

            return (
              sum +
              Number(
                data.sustainability_score ??
                  report.sustainability ??
                  0
              )
            );
          }, 0) / total
        );

  const avgCircular =
    total === 0
      ? 0
      : Math.round(
          reports.reduce((sum, report) => {
            const data = getData(report);

            return (
              sum +
              Number(data.circular_score ?? 0)
            );
          }, 0) / total
        );

  const highReuse = reports.filter((report) => {
    const data = getData(report);

    return data.reuse_potential === "High";
  }).length;

  const recyclable = reports.filter((report) => {
    const data = getData(report);

    return data.recyclability === "High";
  }).length;

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex-1 min-w-0">

        <Navbar />

        <div className="p-6 md:p-8 space-y-8">

          {/* ================================================= */}
          {/* HERO */}
          {/* ================================================= */}

          <div className="relative overflow-hidden bg-gradient-to-r from-green-800 via-green-700 to-emerald-500 rounded-3xl shadow-xl p-8 md:p-10 text-white">

            <div className="relative z-10 flex justify-between items-center">

              <div className="max-w-3xl">

                <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm mb-5">

                  <span>🤖</span>

                  AI-Powered Textile Intelligence

                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">

                  Transform Textile Data
                  <br />

                  Into Intelligent Decisions

                </h1>

                <p className="mt-5 text-green-50 text-base md:text-lg max-w-2xl leading-7">

                  Analyze textile materials, detect defects, classify
                  waste and generate sustainability and circular economy
                  recommendations from a single image.

                </p>

                <div className="flex flex-wrap gap-4 mt-8">

                  <Link
                    to="/textile-intelligence"
                    className="bg-white text-green-700 font-bold px-7 py-3 rounded-xl shadow-lg hover:scale-105 transition"
                  >
                    🚀 Start AI Analysis
                  </Link>

                  <Link
                    to="/analytics"
                    className="bg-white/15 border border-white/30 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/25 transition"
                  >
                    📊 View Analytics
                  </Link>

                </div>

              </div>

              <div className="hidden lg:flex w-40 h-40 bg-white/10 rounded-full items-center justify-center text-8xl">
                🤖
              </div>

            </div>

            <div className="absolute -right-20 -bottom-32 w-80 h-80 bg-white/10 rounded-full" />

          </div>


          {/* ================================================= */}
          {/* LIVE KPI CARDS */}
          {/* ================================================= */}

          <div>

            <div className="flex justify-between items-end mb-5">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Platform Overview
                </h2>

                <p className="text-gray-500 mt-1">
                  Live intelligence from your textile analyses
                </p>

              </div>

              <span className="text-xs text-gray-400">
                Updated from recent analyses
              </span>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

              <KpiCard
                icon="🖼️"
                title="Images Analysed"
                value={total}
                description="Total textile analyses"
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />

              <KpiCard
                icon="🌱"
                title="Avg Sustainability"
                value={`${avgSustainability}%`}
                description="Overall sustainability score"
                iconBg="bg-green-100"
                iconColor="text-green-600"
              />

              <KpiCard
                icon="♻️"
                title="Avg Circular Score"
                value={`${avgCircular}%`}
                description="Circular economy performance"
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
              />

              <KpiCard
                icon="🔄"
                title="High Reuse Potential"
                value={highReuse}
                description={`${recyclable} highly recyclable`}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
              />

            </div>

          </div>


          {/* ================================================= */}
          {/* QUICK MODULES */}
          {/* ================================================= */}

          <DashboardCards />


          {/* ================================================= */}
          {/* INTELLIGENCE SUMMARY */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sustainability */}

            <SummaryCard
              icon="🌱"
              title="Sustainability"
              score={avgSustainability}
              description="Average sustainability performance across analysed textiles."
              color="green"
            />

            {/* Circular */}

            <SummaryCard
              icon="♻️"
              title="Circular Economy"
              score={avgCircular}
              description="Average circularity based on reuse and recovery potential."
              color="emerald"
            />

            {/* Recyclability */}

            <SummaryCard
              icon="🔄"
              title="Recyclability"
              score={
                total === 0
                  ? 0
                  : Math.round((recyclable / total) * 100)
              }
              description="Percentage of analysed textiles with high recyclability."
              color="blue"
            />

          </div>


          {/* ================================================= */}
          {/* RECENT ACTIVITY */}
          {/* ================================================= */}

          <div className="bg-white rounded-3xl shadow-lg border overflow-hidden">

            <div className="p-6 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Recent AI Activity
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Latest textile intelligence results
                </p>

              </div>

              <Link
                to="/analytics"
                className="text-green-700 font-semibold hover:underline"
              >
                View All Analytics →
              </Link>

            </div>

            {reports.length === 0 ? (

              <div className="p-12 text-center">

                <div className="text-6xl mb-4">
                  🧵
                </div>

                <h3 className="text-xl font-bold text-gray-800">
                  No analyses yet
                </h3>

                <p className="text-gray-500 mt-2">
                  Upload your first textile image to start generating
                  AI insights.
                </p>

                <Link
                  to="/textile-intelligence"
                  className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  Start First Analysis
                </Link>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr className="border-b">

                      <th className="text-left p-4 text-sm text-gray-500">
                        Material
                      </th>

                      <th className="text-left p-4 text-sm text-gray-500">
                        Defect
                      </th>

                      <th className="text-left p-4 text-sm text-gray-500">
                        Sustainability
                      </th>

                      <th className="text-left p-4 text-sm text-gray-500">
                        Circular
                      </th>

                      <th className="text-left p-4 text-sm text-gray-500">
                        Reuse
                      </th>

                      <th className="text-left p-4 text-sm text-gray-500">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {reports.slice(0, 5).map((report) => {

                      const data = getData(report);

                      const material =
                        data.material ||
                        report.material ||
                        "Unknown";

                      const defect =
                        data.defect ||
                        report.defect ||
                        "N/A";

                      const sustainability =
                        data.sustainability_score ??
                        report.sustainability ??
                        0;

                      const circular =
                        data.circular_score ??
                        0;

                      const reuse =
                        data.reuse_potential ||
                        "N/A";

                      return (

                        <tr
                          key={report.id}
                          className="border-b last:border-0 hover:bg-green-50 transition"
                        >

                          <td className="p-4">

                            <div className="flex items-center gap-3">

                              {report.image ? (

                                <img
                                  src={report.image}
                                  alt="Textile"
                                  className="w-12 h-12 rounded-xl object-cover"
                                />

                              ) : (

                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                  🧵
                                </div>

                              )}

                              <span className="font-semibold text-gray-800">
                                {material}
                              </span>

                            </div>

                          </td>

                          <td className="p-4 text-gray-600">
                            {defect}
                          </td>

                          <td className="p-4">

                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                              {sustainability}%
                            </span>

                          </td>

                          <td className="p-4">

                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                              {circular}%
                            </span>

                          </td>

                          <td className="p-4">

                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                reuse === "High"
                                  ? "bg-green-100 text-green-700"
                                  : reuse === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {reuse}
                            </span>

                          </td>

                          <td className="p-4">

                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                              ✓ Analysed
                            </span>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* ================================================= */}
          {/* FOOTER ACTIONS */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6">

            <ActionCard
              icon="🤖"
              title="AI Textile Intelligence"
              description="Analyze a new textile image."
              link="/textile-intelligence"
              button="Analyze Now"
            />

            <ActionCard
              icon="📊"
              title="Analytics"
              description="Explore sustainability and circular economy charts."
              link="/analytics"
              button="View Analytics"
            />

            <ActionCard
              icon="📄"
              title="Reports"
              description="Review generated textile intelligence reports."
              link="/reports"
              button="View Reports"
            />

          </div>

        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* KPI CARD */
/* ========================================================= */

function KpiCard({
  icon,
  title,
  value,
  description,
  iconBg,
  iconColor,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border p-6 hover:shadow-xl transition">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
            {value}
          </h2>

        </div>

        <div
          className={`${iconBg} ${iconColor} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>

      </div>

      <p className="text-xs text-gray-400 mt-4">
        {description}
      </p>

    </div>
  );
}


/* ========================================================= */
/* SUMMARY CARD */
/* ========================================================= */

function SummaryCard({
  icon,
  title,
  score,
  description,
  color,
}) {

  const colors = {
    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      bar: "bg-green-600",
    },

    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      bar: "bg-emerald-600",
    },

    blue: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      bar: "bg-blue-600",
    },
  };

  const theme = colors[color];

  return (
    <div className="bg-white rounded-3xl shadow-md border p-6">

      <div className="flex items-center gap-3">

        <div
          className={`${theme.bg} ${theme.text} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>

        <h2 className="text-xl font-bold">
          {title}
        </h2>

      </div>

      <div className="flex items-end justify-between mt-6">

        <div>

          <p className="text-4xl font-extrabold">
            {score}%
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Performance
          </p>

        </div>

        <div className={`${theme.text} text-2xl font-bold`}>
          {score >= 80
            ? "Excellent"
            : score >= 60
            ? "Good"
            : "Needs Attention"}
        </div>

      </div>

      <div className="mt-5">

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className={`${theme.bar} h-3 rounded-full transition-all duration-700`}
            style={{
              width: `${Math.min(100, score)}%`,
            }}
          />

        </div>

      </div>

      <p className="text-sm text-gray-500 mt-4 leading-6">
        {description}
      </p>

    </div>
  );
}


/* ========================================================= */
/* ACTION CARD */
/* ========================================================= */

function ActionCard({
  icon,
  title,
  description,
  link,
  button,
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-md p-6 hover:shadow-xl transition">

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="text-xl font-bold mt-4">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-2 leading-6">
        {description}
      </p>

      <Link
        to={link}
        className="inline-block mt-5 text-green-700 font-semibold hover:underline"
      >
        {button} →
      </Link>

    </div>
  );
}


export default Dashboard;