import { useState } from "react";
import api from "../services/api";

function Sustainability() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportId = `SUS-${Date.now()}`;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const analyze = async () => {
    if (!file) {
      alert("Please choose an image.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/sustainability/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Sustainability analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">🌱 Sustainability Intelligence</h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <input
          id="sus-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        <label
          htmlFor="sus-file"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg cursor-pointer"
        >
          Choose Image
        </label>

        <p className="mt-4 text-gray-600">
          {file ? file.name : "No image selected"}
        </p>

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-6 w-80 rounded-xl border shadow"
          />
        )}

        <button
          onClick={analyze}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          Analyze Sustainability
        </button>
      </div>

      {loading && (
        <p className="mt-6 text-blue-600 font-semibold">
          Generating Sustainability Report...
        </p>
      )}

      {result && (
        <div className="mt-8 bg-white rounded-xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Sustainability Report</h2>
            <span className="bg-green-600 text-white px-4 py-2 rounded-full">
              {result.eco_rating}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["Report ID", reportId],
              ["Generated", new Date().toLocaleString()],
              ["Material", result.material],
              ["Surface", result.surface],
              ["Defect Status", result.defect],
              ["Sustainability Score", result.sustainability_score + "%"],
              ["Environmental Impact", result.environmental_impact],
              ["Carbon Footprint", result.carbon_footprint],
              ["Water Consumption", result.water_consumption],
              ["Recycling Recommendation", result.recycling_recommendation],
              ["Circular Economy", result.circular_economy],
              ["AI Confidence", Number(result.confidence).toFixed(2) + "%"]
            ].map(([k,v])=>(
              <div key={k} className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500">{k}</p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Sustainability Score</span>
              <span>{result.sustainability_score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{width:`${result.sustainability_score}%`}}
              />
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
          >
            Print Sustainability Report
          </button>
        </div>
      )}
    </div>
  );
}

export default Sustainability;