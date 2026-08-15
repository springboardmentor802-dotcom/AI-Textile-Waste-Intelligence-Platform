import { useEffect, useState } from "react";
import { getReports } from "../utils/reportStorage";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

function Analytics() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(getReports());
  }, []);

  const getData = (report) => report?.data || report || {};

  const total = reports.length;

  // ---------------------------------------------------------
  // BASIC METRICS
  // ---------------------------------------------------------

  const avgScore =
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

  const avgCircularScore =
    total === 0
      ? 0
      : Math.round(
          reports.reduce((sum, report) => {
            const data = getData(report);

            return sum + Number(data.circular_score ?? 0);
          }, 0) / total
        );

  // ---------------------------------------------------------
  // REUSE / RECYCLING
  // ---------------------------------------------------------

  const reusable = reports.filter((report) => {
    const data = getData(report);

    return (
      data.reuse === "Yes" ||
      data.reuse_potential === "High"
    );
  }).length;

  const recyclable = reports.filter((report) => {
    const data = getData(report);

    return (
      data.recyclability === "High" ||
      Boolean(data.recycling_recommendation)
    );
  }).length;

  const highReuse = reports.filter((report) => {
    const data = getData(report);
    return data.reuse_potential === "High";
  }).length;

  const mediumReuse = reports.filter((report) => {
    const data = getData(report);
    return data.reuse_potential === "Medium";
  }).length;

  const lowReuse = reports.filter((report) => {
    const data = getData(report);
    return data.reuse_potential === "Low";
  }).length;

  // ---------------------------------------------------------
  // ENVIRONMENTAL IMPACT
  // ---------------------------------------------------------

  const lowImpact = reports.filter((report) => {
    return getData(report).environmental_impact === "Low";
  }).length;

  const mediumImpact = reports.filter((report) => {
    return getData(report).environmental_impact === "Medium";
  }).length;

  const highImpact = reports.filter((report) => {
    return getData(report).environmental_impact === "High";
  }).length;

  // ---------------------------------------------------------
  // MATERIAL DISTRIBUTION
  // ---------------------------------------------------------

  const materialCounts = {};

  reports.forEach((report) => {
    const data = getData(report);

    const material =
      data.material ||
      report.material ||
      "Unknown";

    materialCounts[material] =
      (materialCounts[material] || 0) + 1;
  });

  const materialData = Object.entries(materialCounts).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // ---------------------------------------------------------
  // ENVIRONMENT DATA
  // ---------------------------------------------------------

  const environmentalData = [
    {
      name: "Low",
      value: lowImpact,
    },
    {
      name: "Medium",
      value: mediumImpact,
    },
    {
      name: "High",
      value: highImpact,
    },
  ];

  // ---------------------------------------------------------
  // CIRCULAR DATA
  // ---------------------------------------------------------

  const circularData = [
    {
      name: "High Reuse",
      value: highReuse,
    },
    {
      name: "Medium Reuse",
      value: mediumReuse,
    },
    {
      name: "Low Reuse",
      value: lowReuse,
    },
  ];

  // ---------------------------------------------------------
  // SCORE COMPARISON DATA
  // ---------------------------------------------------------

  const scoreData = reports.map((report, index) => {
    const data = getData(report);

    return {
      name: `Analysis ${index + 1}`,
      sustainability: Number(
        data.sustainability_score ??
          report.sustainability ??
          0
      ),
      circular: Number(
        data.circular_score ?? 0
      ),
    };
  });

  // ---------------------------------------------------------
  // CIRCULAR PATHWAYS
  // ---------------------------------------------------------

  const pathwayCounts = {};

  reports.forEach((report) => {
    const data = getData(report);

    const pathway =
      data.circular_pathway ||
      data.circular_economy ||
      "Not Available";

    pathwayCounts[pathway] =
      (pathwayCounts[pathway] || 0) + 1;
  });

  const pathwayData = Object.entries(pathwayCounts).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // ---------------------------------------------------------
  // RADAR DATA
  // ---------------------------------------------------------

  const radarData = [
    {
      subject: "Sustainability",
      score: avgScore,
    },
    {
      subject: "Circularity",
      score: avgCircularScore,
    },
    {
      subject: "Reuse",
      score:
        total === 0
          ? 0
          : Math.round((reusable / total) * 100),
    },
    {
      subject: "Recyclability",
      score:
        total === 0
          ? 0
          : Math.round((recyclable / total) * 100),
    },
  ];

  // ---------------------------------------------------------
  // BEST PATHWAY
  // ---------------------------------------------------------

  const bestPathway =
    pathwayData.length > 0
      ? pathwayData.reduce((best, current) =>
          current.value > best.value
            ? current
            : best
        )
      : null;

  // ---------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------

  if (total === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-8">
        <div className="max-w-7xl mx-auto">

          <h1 className="text-4xl font-extrabold text-gray-900">
            📈 Analytics Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Circular Economy & Sustainability Intelligence
          </p>

          <div className="mt-10 bg-white rounded-3xl shadow-xl border p-12 text-center">

            <div className="text-7xl mb-6">
              📊
            </div>

            <h2 className="text-2xl font-bold">
              No Analytics Data Yet
            </h2>

            <p className="text-gray-500 mt-3">
              Analyze textile images to generate
              sustainability and circular economy insights.
            </p>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 mb-8">

          <div>

            <div className="flex items-center gap-3">

              <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg text-2xl">
                📊
              </div>

              <div>

                <h1 className="text-4xl font-extrabold text-gray-900">
                  Analytics Dashboard
                </h1>

                <p className="text-gray-500 mt-1">
                  Circular Economy & Sustainability Intelligence
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-2xl border shadow-sm px-5 py-3">

            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Analyses
            </p>

            <p className="text-2xl font-extrabold text-blue-600">
              {total}
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* KPI CARDS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <Card
            title="Images Analysed"
            value={total}
            icon="🖼️"
            color="bg-blue-600"
          />

          <Card
            title="High Reuse Potential"
            value={highReuse}
            icon="🔄"
            color="bg-green-600"
          />

          <Card
            title="Recyclable Materials"
            value={recyclable}
            icon="♻️"
            color="bg-amber-500"
          />

          <Card
            title="Avg Sustainability"
            value={`${avgScore}%`}
            icon="🌱"
            color="bg-purple-600"
          />

        </div>


        {/* ================================================= */}
        {/* SECONDARY METRICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

          <MetricCard
            title="Average Circular Score"
            value={`${avgCircularScore}%`}
            description="Average material circularity"
            icon="♻️"
          />

          <MetricCard
            title="Reuse Rate"
            value={`${Math.round(
              (reusable / total) * 100
            )}%`}
            description="Materials suitable for reuse"
            icon="🔄"
          />

          <MetricCard
            title="Recycling Rate"
            value={`${Math.round(
              (recyclable / total) * 100
            )}%`}
            description="Materials with recycling potential"
            icon="♻️"
          />

        </div>


        {/* ================================================= */}
        {/* CHART ROW 1 */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mt-8">

          {/* MATERIAL DISTRIBUTION */}

          <ChartCard
            title="🧵 Material Distribution"
            subtitle="AI-identified textile materials"
          >

            <ResponsiveContainer width="100%" height={320}>

              <BarChart data={materialData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={80}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Analyses"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </ChartCard>


          {/* ENVIRONMENTAL IMPACT */}

          <ChartCard
            title="🌍 Environmental Impact"
            subtitle="Impact distribution across analyses"
          >

            <ResponsiveContainer width="100%" height={320}>

              <PieChart>

                <Pie
                  data={environmentalData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >

                  <Cell fill="#16a34a" />
                  <Cell fill="#eab308" />
                  <Cell fill="#dc2626" />

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </ChartCard>

        </div>


        {/* ================================================= */}
        {/* CHART ROW 2 */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mt-8">

          {/* SCORE COMPARISON */}

          <ChartCard
            title="📈 Sustainability vs Circular Score"
            subtitle="Score comparison for each analysis"
          >

            <ResponsiveContainer width="100%" height={320}>

              <BarChart data={scoreData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis domain={[0, 100]} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="sustainability"
                  name="Sustainability"
                  fill="#16a34a"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="circular"
                  name="Circular Score"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </ChartCard>


          {/* CIRCULAR PERFORMANCE */}

          <ChartCard
            title="♻️ Circular Economy Potential"
            subtitle="Reuse potential across analysed textiles"
          >

            <ResponsiveContainer width="100%" height={320}>

              <PieChart>

                <Pie
                  data={circularData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >

                  <Cell fill="#16a34a" />
                  <Cell fill="#eab308" />
                  <Cell fill="#6b7280" />

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </ChartCard>

        </div>


        {/* ================================================= */}
        {/* RADAR */}
        {/* ================================================= */}

        <div className="mt-8">

          <ChartCard
            title="🌱 Sustainability Performance"
            subtitle="Overall circular economy performance"
          >

            <ResponsiveContainer width="100%" height={380}>

              <RadarChart data={radarData}>

                <PolarGrid />

                <PolarAngleAxis dataKey="subject" />

                <PolarRadiusAxis
                  domain={[0, 100]}
                />

                <Radar
                  name="Performance"
                  dataKey="score"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.45}
                />

                <Tooltip />

              </RadarChart>

            </ResponsiveContainer>

          </ChartCard>

        </div>


        {/* ================================================= */}
        {/* CIRCULAR PATHWAYS */}
        {/* ================================================= */}

        <div className="mt-8">

          <ChartCard
            title="🔄 Recommended Circular Pathways"
            subtitle="AI-generated recovery strategies"
          >

            <ResponsiveContainer width="100%" height={320}>

              <BarChart
                data={pathwayData}
                layout="vertical"
                margin={{
                  left: 30,
                  right: 30,
                }}
              >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  type="number"
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={260}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Cases"
                  fill="#059669"
                  radius={[0, 8, 8, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </ChartCard>

        </div>


        {/* ================================================= */}
        {/* AI RECOMMENDATION */}
        {/* ================================================= */}

        <div className="mt-8 bg-gradient-to-r from-green-700 to-emerald-600 rounded-3xl shadow-xl text-white p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-7">

            <div>

              <p className="text-green-100 text-sm uppercase tracking-wider">
                AI Circular Economy Intelligence
              </p>

              <h2 className="text-3xl font-extrabold mt-2">
                🤖 Best Circular Strategy
              </h2>

              <p className="text-green-50 mt-4 max-w-3xl leading-7">

                {bestPathway
                  ? `The most frequently recommended pathway is "${bestPathway.name}". It currently represents ${bestPathway.value} of ${total} analysed textile cases.`
                  : "Analyse additional textile samples to generate a recommendation."}

              </p>

            </div>

            <div className="bg-white/15 backdrop-blur rounded-2xl p-6 text-center min-w-[190px]">

              <p className="text-green-100 text-sm">
                Avg Circular Score
              </p>

              <p className="text-5xl font-extrabold mt-1">
                {avgCircularScore}%
              </p>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* RECENT ANALYSES */}
        {/* ================================================= */}

        <div className="bg-white rounded-3xl shadow-xl border mt-8 overflow-hidden mb-10">

          <div className="p-7 border-b">

            <h2 className="text-2xl font-bold">
              📋 Recent Analyses
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest AI textile intelligence results
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-green-700 text-white">

                <tr>

                  <th className="p-4 text-left">
                    Image
                  </th>

                  <th className="p-4 text-left">
                    Material
                  </th>

                  <th className="p-4 text-left">
                    Defect
                  </th>

                  <th className="p-4 text-left">
                    Sustainability
                  </th>

                  <th className="p-4 text-left">
                    Circular
                  </th>

                  <th className="p-4 text-left">
                    Reuse
                  </th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {reports.map((report) => {

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
                    data.circular_score ?? 0;

                  const reuse =
                    data.reuse_potential ||
                    "N/A";

                  return (

                    <tr
                      key={report.id}
                      className="border-b hover:bg-green-50 transition"
                    >

                      <td className="p-3">

                        {report.image ? (

                          <img
                            src={report.image}
                            alt="Textile"
                            className="w-16 h-16 rounded-xl object-cover"
                          />

                        ) : (

                          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                            🧵
                          </div>

                        )}

                      </td>

                      <td className="p-4 font-semibold">
                        {material}
                      </td>

                      <td className="p-4">
                        {defect}
                      </td>

                      <td className="p-4">

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                          {sustainability}%
                        </span>

                      </td>

                      <td className="p-4">

                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                          {circular}%
                        </span>

                      </td>

                      <td className="p-4">

                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold">
                          {reuse}
                        </span>

                      </td>

                      <td className="p-4 text-gray-500">
                        {report.date || "N/A"}
                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* COMPONENTS */
/* ========================================================= */

function Card({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div
      className={`${color} text-white rounded-2xl shadow-lg p-6`}
    >

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm opacity-90">
            {title}
          </p>

          <h2 className="text-3xl font-extrabold mt-3">
            {value}
          </h2>

        </div>

        <div className="text-3xl">
          {icon}
        </div>

      </div>

    </div>
  );
}


function MetricCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md border p-5">

      <div className="flex items-center gap-3">

        <div className="bg-gray-100 p-3 rounded-xl text-xl">
          {icon}
        </div>

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-extrabold">
            {value}
          </p>

        </div>

      </div>

      <p className="text-xs text-gray-400 mt-3">
        {description}
      </p>

    </div>
  );
}


function ChartCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border p-6">

      <div className="mb-5">

        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>

      </div>

      {children}

    </div>
  );
}


export default Analytics;