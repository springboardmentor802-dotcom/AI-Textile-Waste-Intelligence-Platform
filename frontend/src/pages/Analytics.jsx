import { useEffect, useState } from "react";
import { getReports } from "../utils/reportStorage";

function Analytics() {

  const [reports, setReports] = useState([]);

  useEffect(() => {

    setReports(getReports());

  }, []);

  const total = reports.length;

  const reusable = reports.filter(
    r => r.data?.reuse === "Yes"
  ).length;

  const recyclable = reports.filter(
    r => r.data?.recyclability === "High"
  ).length;

  const avgScore =
    total === 0
      ? 0
      : Math.round(
          reports.reduce(
            (sum, r) =>
              sum +
              Number(
                r.data?.sustainability_score || 0
              ),
            0
          ) / total
        );

  const lowImpact = reports.filter(
    r =>
      r.data?.environmental_impact === "Low"
  ).length;

  const mediumImpact = reports.filter(
    r =>
      r.data?.environmental_impact === "Medium"
  ).length;

  const highImpact = reports.filter(
    r =>
      r.data?.environmental_impact === "High"
  ).length;

  return (

    <div className="max-w-7xl mx-auto p-8">

      <h1 className="text-4xl font-bold">

        📈 Analytics Dashboard

      </h1>

      <p className="text-gray-500 mt-2">

        Circular Economy & Sustainability Analytics

      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

        <Card
          title="Images Analysed"
          value={total}
          color="bg-blue-600"
        />

        <Card
          title="Reusable Waste"
          value={reusable}
          color="bg-green-600"
        />

        <Card
          title="Recyclable Waste"
          value={recyclable}
          color="bg-yellow-500"
        />

        <Card
          title="Avg Sustainability"
          value={avgScore + "%"}
          color="bg-purple-600"
        />

      </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-6">

            🌍 Environmental Impact

          </h2>

          <div className="space-y-5">

            <Progress

              title="Low Impact"

              value={total === 0 ? 0 : Math.round((lowImpact / total) * 100)}

              color="bg-green-600"

            />

            <Progress

              title="Medium Impact"

              value={total === 0 ? 0 : Math.round((mediumImpact / total) * 100)}

              color="bg-yellow-500"

            />

            <Progress

              title="High Impact"

              value={total === 0 ? 0 : Math.round((highImpact / total) * 100)}

              color="bg-red-600"

            />

          </div>

        </div>



        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-6">

            ♻ Circular Economy Analytics

          </h2>

          <div className="grid grid-cols-2 gap-5">

            <Info

              title="Reuse Rate"

              value={
                total === 0
                  ? "0%"
                  : Math.round((reusable / total) * 100) + "%"
              }

            />

            <Info

              title="Recycling Rate"

              value={
                total === 0
                  ? "0%"
                  : Math.round((recyclable / total) * 100) + "%"
              }

            />

            <Info

              title="Waste Reduction"

              value={
                total === 0
                  ? "0%"
                  : Math.round(((reusable + recyclable) / total) * 100) + "%"
              }

            />

            <Info

              title="Reports Generated"

              value={total}

            />

          </div>

        </div>

      </div>



      <div className="bg-white rounded-xl shadow-lg mt-10 p-6">

        <h2 className="text-2xl font-bold mb-6">

          🤖 AI Insights

        </h2>

        <ul className="space-y-4 text-lg">

          <li>

            📄 Total Analyses :

            <strong> {total}</strong>

          </li>

          <li>

            🌱 Average Sustainability :

            <strong> {avgScore}%</strong>

          </li>

          <li>

            ♻ Reusable Waste :

            <strong> {reusable}</strong>

          </li>

          <li>

            🔄 Recyclable Waste :

            <strong> {recyclable}</strong>

          </li>

          <li>

            🌍 Low Environmental Impact :

            <strong> {lowImpact}</strong>

          </li>

        </ul>

      </div>



      <div className="bg-white rounded-xl shadow-lg mt-10 overflow-hidden">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-bold">

            📋 Recent Analyses

          </h2>

        </div>

        <table className="min-w-full">

          <thead className="bg-green-700 text-white">

            <tr>

              <th className="p-4">Image</th>

              <th>Material</th>

              <th>Defect</th>

              <th>Score</th>

              <th>Date</th>

            </tr>

          </thead>

          <tbody>

            {reports.map((report) => (

              <tr
                key={report.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3">

                  <img

                    src={report.image}

                    alt=""

                    className="w-20 h-20 rounded-lg object-cover"

                  />

                </td>

                <td>

                  {report.material}

                </td>

                <td>

                  {report.defect}

                </td>

                <td>

                  {report.sustainability}%

                </td>

                <td>

                  {report.date}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
          </div>

  );

}

function Card({ title, value, color }) {

  return (

    <div className={`${color} text-white rounded-xl shadow-lg p-6`}>

      <p className="text-sm opacity-90">

        {title}

      </p>

      <h2 className="text-4xl font-bold mt-3">

        {value}

      </h2>

    </div>

  );

}

function Info({ title, value }) {

  return (

    <div className="bg-gray-100 rounded-xl p-5">

      <p className="text-gray-500">

        {title}

      </p>

      <p className="text-2xl font-bold mt-2">

        {value}

      </p>

    </div>

  );

}

function Progress({ title, value, color }) {

  return (

    <div className="mb-5">

      <div className="flex justify-between mb-2">

        <span className="font-medium">

          {title}

        </span>

        <span>

          {value}%

        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4">

        <div

          className={`${color} h-4 rounded-full transition-all duration-700`}

          style={{

            width: `${value}%`

          }}

        />

      </div>

    </div>

  );

}

export default Analytics;   
