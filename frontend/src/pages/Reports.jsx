import { useState, useEffect } from "react";
import { getReports, deleteReport } from "../utils/reportStorage";

function Reports() {

  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setReports(getReports());
  };

  const removeReport = (id) => {

    if (window.confirm("Delete this report?")) {

      deleteReport(id);

      loadReports();

    }

  };

  const downloadReport = (report) => {

    const text = `

AI TEXTILE INTELLIGENCE REPORT

Date : ${report.date}

Material : ${report.data.material}

Surface : ${report.data.surface}

Material Confidence :

${report.data.material_confidence}%

Defect :

${report.data.defect}

Defect Confidence :

${report.data.defect_confidence}%

Waste Category :

${report.data.waste_category}

Condition :

${report.data.condition}

Reuse Potential :

${report.data.reuse_potential}

Recyclability :

${report.data.recyclability}

Reuse :

${report.data.reuse}

Sustainability Score :

${report.data.sustainability_score}

Environmental Impact :

${report.data.environmental_impact}

Carbon Footprint :

${report.data.carbon_footprint}

Water Consumption :

${report.data.water_consumption}

Recommendation :

${report.data.recycling_recommendation}

Circular Economy :

${report.data.circular_economy}

Eco Rating :

${report.data.eco_rating}

-------------------------------------

AI SUMMARY

${report.data.report.summary}

`;

    const blob = new Blob([text], {
      type: "text/plain",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = `Report_${report.id}.txt`;

    link.click();

  };

  return (

    <div className="min-h-screen bg-gray-100 p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">

            AI Reports

          </h1>

          <p className="text-gray-500 mt-2">

            All generated AI textile reports.

          </p>

        </div>

        <div>

          <span className="bg-green-600 text-white px-5 py-3 rounded-xl">

            Total Reports : {reports.length}

          </span>

        </div>

      </div>

      {reports.length === 0 ? (

        <div className="bg-white rounded-xl shadow-lg p-10 text-center">

          <h2 className="text-2xl font-bold">

            No Reports Available

          </h2>

          <p className="text-gray-500 mt-4">

            Analyze a textile image to generate your first report.

          </p>

        </div>

      ) : (

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          <table className="w-full">

            <thead className="bg-green-700 text-white">
              <tr>

                <th className="p-4">Image</th>
                <th>Date</th>

                <th>Material</th>

                <th>Defect</th>

                <th>Sustainability</th>

                <th>Status</th>

                <th>Download</th>

                <th>Delete</th>

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
                      className="w-20 h-20 rounded-xl object-cover border"
                    />

                  </td>

                  <td>

                    {report.date}

                  </td>

                  <td>

                    {report.material}

                  </td>

                  <td>

                    {report.defect}

                  </td>

                  <td>

                    {report.sustainability}

                  </td>

                  <td>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">

                      Completed

                    </span>

                  </td>

                  <td>

                    <button
                      onClick={() => downloadReport(report)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >

                      Download

                    </button>

                  </td>

                  <td>

                    <button
                      onClick={() => removeReport(report.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >

                      Delete

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

export default Reports;