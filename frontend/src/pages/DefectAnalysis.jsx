import { useState } from "react";
import api from "../services/api";

function DefectAnalysis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportId = `REP-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,"0")}${String(new Date().getDate()).padStart(2,"0")}-${String(new Date().getHours()).padStart(2,"0")}${String(new Date().getMinutes()).padStart(2,"0")}`;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await api.post("/defect/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (e) {
      console.error(e);
      alert("Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const isDefect = result?.prediction === "Defect";

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">🔍 Defect Analysis</h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-5">
          Upload Fabric Image for Defect Detection
        </h2>

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <label
          htmlFor="file-upload"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer"
        >
          Choose Image
        </label>

        {file ? (
          <p className="mt-4 text-green-600 font-medium">
            Selected: {file.name}
          </p>
        ) : (
          <p className="mt-4 text-gray-500">No image selected</p>
        )}

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-6 w-80 rounded-xl border shadow"
          />
        )}

        <button
          onClick={handleUpload}
          className="mt-6 block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
        >
          Analyze Defect
        </button>
      </div>

      {loading && (
        <p className="mt-6 text-lg font-semibold text-blue-600">
          Analyzing Image...
        </p>
      )}

      {result && (
        <div className="mt-8 bg-white rounded-xl shadow-xl p-8">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">
              Defect Analysis Report
            </h2>

            <span
              className={`px-4 py-2 rounded-full text-white font-semibold ${
                isDefect ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {result.prediction}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Report ID</p>
              <p className="font-semibold">{reportId}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Generated</p>
              <p className="font-semibold">
                {new Date().toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Material Condition</p>
              <p className="font-semibold">
                {isDefect ? "Damaged" : "Good"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Quality Status</p>
              <p className="font-semibold">
                {isDefect ? "Rejected" : "Accepted"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Reuse Possibility</p>
              <p className="font-semibold">
                {isDefect ? "Low" : "High"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Recyclability</p>
              <p className="font-semibold">High</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Suggested Action</p>
              <p className="font-semibold">
                {isDefect
                  ? "Send to Recycling Unit"
                  : "Reuse in Production"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Priority</p>
              <p className={`font-bold ${isDefect ? "text-red-600":"text-green-600"}`}>
                {isDefect ? "High" : "Low"}
              </p>
            </div>

          </div>

          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">AI Confidence</span>
              <span>{Number(result.confidence).toFixed(2)}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`${isDefect ? "bg-red-600":"bg-green-600"} h-4 rounded-full`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>

          <button
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
            onClick={() => window.print()}
          >
            Generate Report
          </button>

        </div>
      )}
    </div>
  );
}

export default DefectAnalysis;
