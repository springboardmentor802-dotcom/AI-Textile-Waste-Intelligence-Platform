import { useState } from "react";
import api from "../services/api";

function Sustainability() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportId =
    "SUS-" +
    new Date().getFullYear() +
    Math.floor(Math.random() * 100000);

  const handleFile = (e) => {
    if (!e.target.files.length) return;

    const selected = e.target.files[0];

    setFile(selected);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(selected);

    setResult(null);
  };

  const analyze = async () => {
    if (!file) {
      alert("Please choose an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await api.post(
        "/sustainability/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      console.log(err);
      alert("Analysis Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6 md:p-8">

      {/* HEADER */}

      <div className="max-w-7xl mx-auto mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white p-3 rounded-2xl shadow-lg text-2xl">
                🌱
              </div>

              <div>
                <h1 className="text-4xl font-extrabold text-gray-900">
                  Sustainability Intelligence
                </h1>

                <p className="text-gray-500 mt-1">
                  AI-powered textile sustainability and circular economy analysis
                </p>
              </div>
            </div>
          </div>

          {result && (
            <div className="bg-white rounded-2xl shadow-md border px-5 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Report ID
              </p>

              <p className="font-bold text-green-700">
                {reportId}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* TOP SUMMARY CARDS */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <DashboardCard
          title="Overall Score"
          value={result ? `${result.sustainability_score}%` : "--"}
          icon="🌱"
          color="bg-green-600"
        />

        <DashboardCard
          title="Environmental Impact"
          value={result ? result.environmental_impact : "--"}
          icon="🌍"
          color="bg-blue-600"
        />

        <DashboardCard
          title="Carbon Footprint"
          value={result ? result.carbon_footprint : "--"}
          icon="☁️"
          color="bg-amber-500"
        />

        <DashboardCard
          title="Eco Rating"
          value={result ? result.eco_rating : "--"}
          icon="⭐"
          color="bg-purple-600"
        />

      </div>

      {/* UPLOAD SECTION */}

      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          <div className="p-8">

            <div className="flex items-center gap-3 mb-6">

              <div className="bg-green-100 text-green-700 p-3 rounded-xl text-xl">
                🔍
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Textile Sustainability Analysis
                </h2>

                <p className="text-gray-500">
                  Upload a textile image to generate sustainability intelligence.
                </p>
              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">

              {/* UPLOAD */}

              <div>

                <input
                  id="upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />

                <label
                  htmlFor="upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 bg-green-50 hover:bg-green-100 rounded-2xl p-10 cursor-pointer transition"
                >

                  <div className="text-5xl mb-4">
                    📤
                  </div>

                  <p className="text-lg font-bold text-green-800">
                    Choose Textile Image
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or other image formats
                  </p>

                </label>

                <p className="mt-4 text-sm text-gray-500">
                  {file ? `Selected: ${file.name}` : "No image selected"}
                </p>

                <button
                  onClick={analyze}
                  disabled={loading}
                  className={`mt-5 w-full px-6 py-3 rounded-xl text-white font-semibold transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 shadow-lg"
                  }`}
                >
                  {loading
                    ? "🤖 Analyzing Textile..."
                    : "🚀 Analyze Sustainability"}
                </button>

              </div>

              {/* PREVIEW */}

              <div className="flex justify-center">

                {preview ? (

                  <div className="relative">

                    <img
                      src={preview}
                      alt="Textile Preview"
                      className="w-full max-w-md h-72 object-cover rounded-2xl shadow-lg border"
                    />

                    <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      Textile Preview
                    </div>

                  </div>

                ) : (

                  <div className="w-full max-w-md h-72 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center">

                    <div className="text-center text-gray-400">

                      <div className="text-6xl mb-3">
                        🧵
                      </div>

                      <p>
                        Image preview will appear here
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* LOADING */}

      {loading && (

        <div className="max-w-7xl mx-auto mt-8">

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-center gap-4">

            <div className="text-3xl animate-pulse">
              🤖
            </div>

            <div>

              <h3 className="font-bold text-blue-800">
                AI is analyzing the textile...
              </h3>

              <p className="text-blue-600 text-sm">
                Evaluating material, sustainability and circular economy potential.
              </p>

            </div>

          </div>

        </div>

      )}

      {/* RESULTS */}

      {result && (

        <div className="max-w-7xl mx-auto mt-10">

          {/* REPORT HEADER */}

          <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">

            <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-8">

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">

                <div>

                  <p className="text-green-100 text-sm uppercase tracking-wider">
                    AI Generated Report
                  </p>

                  <h2 className="text-3xl font-extrabold mt-2">
                    Sustainability Assessment
                  </h2>

                  <p className="text-green-100 mt-2">
                    Generated: {new Date().toLocaleString()}
                  </p>

                </div>

                <div className="bg-white/20 backdrop-blur px-6 py-4 rounded-2xl text-center">

                  <p className="text-sm text-green-100">
                    Eco Rating
                  </p>

                  <p className="text-2xl font-bold">
                    {result.eco_rating}
                  </p>

                </div>

              </div>

            </div>

            {/* BASIC ANALYSIS */}

            <div className="p-8">

              <h2 className="text-2xl font-bold mb-5">
                Textile Analysis
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                <Info
                  icon="🧵"
                  title="Material"
                  value={result.material}
                />

                <Info
                  icon="🔬"
                  title="Surface"
                  value={result.surface}
                />

                <Info
                  icon="⚠️"
                  title="Defect Status"
                  value={result.defect}
                />

                <Info
                  icon="🌱"
                  title="Sustainability Score"
                  value={`${result.sustainability_score}%`}
                />

                <Info
                  icon="🌍"
                  title="Environmental Impact"
                  value={result.environmental_impact}
                />

                <Info
                  icon="☁️"
                  title="Carbon Footprint"
                  value={result.carbon_footprint}
                />

                <Info
                  icon="💧"
                  title="Water Consumption"
                  value={result.water_consumption}
                />

                <Info
                  icon="♻️"
                  title="Recycling Recommendation"
                  value={result.recycling_recommendation}
                />

                <Info
                  icon="🤖"
                  title="AI Confidence"
                  value={
                    result.confidence !== undefined
                      ? `${Number(result.confidence).toFixed(2)}%`
                      : "N/A"
                  }
                />

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* CIRCULAR ECONOMY INTELLIGENCE */}
          {/* ================================================= */}

          <div className="mt-8 bg-white rounded-3xl shadow-xl border overflow-hidden">

            {/* HEADER */}

            <div className="bg-gradient-to-r from-emerald-700 to-green-600 text-white p-8">

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-5">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="bg-white/20 p-3 rounded-xl text-2xl">
                      ♻️
                    </div>

                    <div>

                      <h2 className="text-3xl font-extrabold">
                        Circular Economy Intelligence
                      </h2>

                      <p className="text-green-100 mt-1">
                        AI-recommended pathway for extending textile material life
                      </p>

                    </div>

                  </div>

                </div>

                {/* SCORE */}

                <div className="bg-white/15 backdrop-blur rounded-2xl p-5 min-w-[170px]">

                  <p className="text-sm text-green-100">
                    Circular Economy Score
                  </p>

                  <div className="flex items-end gap-1">

                    <span className="text-4xl font-extrabold">
                      {result.circular_score ?? "--"}
                    </span>

                    <span className="text-xl mb-1">
                      %
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <div className="p-8">

              {/* PATHWAY */}

              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">

                <div className="flex items-start gap-4">

                  <div className="bg-green-600 text-white rounded-xl p-3 text-xl">
                    🔄
                  </div>

                  <div className="flex-1">

                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
                      Recommended Circular Pathway
                    </p>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">
                      {result.circular_pathway ||
                        result.circular_economy ||
                        "Reuse whenever possible"}
                    </h3>

                  </div>

                </div>

              </div>

              {/* CIRCULAR METRICS */}

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

                <CircularCard
                  icon="🧵"
                  title="Reuse Potential"
                  value={result.reuse_potential || "Medium"}
                />

                <CircularCard
                  icon="🏭"
                  title="Processing Method"
                  value={
                    result.processing_method ||
                    result.recycling_recommendation
                  }
                />

                <CircularCard
                  icon="🌱"
                  title="Environmental Benefit"
                  value={result.environmental_benefit || "Medium"}
                />

                <CircularCard
                  icon="♻️"
                  title="Circular Strategy"
                  value={
                    result.circular_economy ||
                    "Reuse whenever possible"
                  }
                />

              </div>

              {/* SCORE BAR */}

              <div className="mt-10">

                <div className="flex justify-between mb-3">

                  <div>

                    <h3 className="font-bold text-lg">
                      Circular Economy Performance
                    </h3>

                    <p className="text-sm text-gray-500">
                      Higher scores indicate stronger material circularity potential.
                    </p>

                  </div>

                  <span className="font-bold text-green-700">
                    {result.circular_score ?? 0}%
                  </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">

                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-5 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, result.circular_score ?? 0)
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* AI REASON */}

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">

                <div className="flex items-start gap-4">

                  <div className="bg-blue-600 text-white rounded-xl p-3 text-xl">
                    🤖
                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-blue-900">
                      Why AI recommends this pathway
                    </h3>

                    <p className="text-gray-700 mt-3 leading-7">

                      {result.circular_reason ||
                        `Based on the identified ${result.material} material and its current condition, the recommended circular pathway is ${result.circular_economy}.`}

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* SUSTAINABILITY ANALYTICS */}
          {/* ================================================= */}

          <div className="mt-8 bg-white rounded-3xl shadow-xl border p-8">

            <h2 className="text-2xl font-bold">
              Sustainability Analytics
            </h2>

            <p className="text-gray-500 mt-1 mb-7">
              Key sustainability performance indicators
            </p>

            <Progress
              title="Overall Sustainability"
              value={result.sustainability_score}
              color="bg-green-600"
            />

            <Progress
              title="Carbon Reduction Potential"
              value={85}
              color="bg-blue-600"
            />

            <Progress
              title="Water Saving Potential"
              value={78}
              color="bg-cyan-600"
            />

            <Progress
              title="Circular Economy"
              value={result.circular_score ?? 0}
              color="bg-purple-600"
            />

          </div>

          {/* ================================================= */}
          {/* AI RECOMMENDATION */}
          {/* ================================================= */}

          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8">

            <div className="flex items-start gap-4">

              <div className="bg-green-600 text-white p-4 rounded-2xl text-2xl">
                🤖
              </div>

              <div className="flex-1">

                <h2 className="text-2xl font-bold text-gray-900">
                  AI Sustainability Recommendation
                </h2>

                <p className="text-gray-700 mt-4 leading-8">

                  The analyzed textile is identified as{" "}
                  <strong>{result.material}</strong>.

                  Its environmental impact is{" "}
                  <strong>{result.environmental_impact}</strong>.

                  The recommended recycling approach is{" "}
                  <strong>{result.recycling_recommendation}</strong>.

                  For circular economy integration, AI recommends{" "}
                  <strong>
                    {result.circular_economy}
                  </strong>
                  .

                </p>

              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-4 mt-8 mb-10">

            <button
              onClick={() => window.print()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition"
            >
              🖨 Print Report
            </button>

            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setPreview(null);
              }}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition"
            >
              🔄 New Analysis
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


/* ========================================================= */
/* DASHBOARD CARD */
/* ========================================================= */

function DashboardCard({ title, value, icon, color }) {

  return (
    <div
      className={`${color} text-white rounded-2xl shadow-lg p-6 relative overflow-hidden`}
    >

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm opacity-90">
            {title}
          </p>

          <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
            {value}
          </h2>

        </div>

        <div className="text-3xl opacity-90">
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ========================================================= */
/* INFO CARD */
/* ========================================================= */

function Info({ title, value, icon }) {

  return (
    <div className="bg-gray-50 rounded-2xl border p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-center gap-3">

        <div className="bg-white rounded-xl p-2 shadow-sm text-lg">
          {icon}
        </div>

        <p className="text-gray-500 text-sm">
          {title}
        </p>

      </div>

      <p className="text-lg font-bold mt-3 break-words text-gray-900">
        {value ?? "N/A"}
      </p>

    </div>
  );
}


/* ========================================================= */
/* CIRCULAR ECONOMY CARD */
/* ========================================================= */

function CircularCard({ icon, title, value }) {

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition">

      <div className="text-2xl mb-3">
        {icon}
      </div>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="font-bold text-gray-900 mt-2 break-words">
        {value}
      </p>

    </div>
  );
}


/* ========================================================= */
/* PROGRESS BAR */
/* ========================================================= */

function Progress({ title, value, color }) {

  const safeValue = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  return (
    <div className="mb-7">

      <div className="flex justify-between mb-2">

        <span className="font-semibold text-gray-800">
          {title}
        </span>

        <span className="font-bold text-gray-700">
          {safeValue}%
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

        <div
          className={`${color} h-4 rounded-full transition-all duration-1000`}
          style={{
            width: `${safeValue}%`,
          }}
        />

      </div>

    </div>
  );
}

export default Sustainability;