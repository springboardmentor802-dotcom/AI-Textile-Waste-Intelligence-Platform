
import { useState } from "react";
import api from "../services/api";

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportId = `MAT-${Date.now()}`;

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
      const response = await api.post("/material/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">🧵 Material Analysis</h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-5">
          Upload Fabric Image for Material Classification
        </h2>

        <input
          id="upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <label
          htmlFor="upload"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
        >
          Choose Image
        </label>

        <p className="mt-4">
          {file ? (
            <span className="text-green-600 font-medium">{file.name}</span>
          ) : (
            <span className="text-gray-500">No image selected</span>
          )}
        </p>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-6 w-80 rounded-xl border shadow"
          />
        )}

        <button
          onClick={handleUpload}
          className="mt-6 block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Analyze Material
        </button>
      </div>

      {loading && (
        <div className="mt-6 text-blue-600 font-semibold text-lg">
          🤖 AI is analyzing the material...
        </div>
      )}

      {result && (
        <div className="mt-8 bg-white rounded-xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Material Analysis Report</h2>

            <span className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold">
              {result.material}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Report ID</p>
              <p className="font-semibold">{reportId}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Generated</p>
              <p className="font-semibold">{new Date().toLocaleString()}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Material</p>
              <p className="font-semibold">{result.material}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Surface</p>
              <p className="font-semibold">{result.surface}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Recyclability</p>
              <p className="font-semibold">{result.recyclability}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500">Reuse Recommendation</p>
              <p className="font-semibold">{result.reuse}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">AI Confidence</span>
              <span>{Number(result.confidence).toFixed(2)}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>
          </div>

          <button
            className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            onClick={() => window.print()}
          >
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;
