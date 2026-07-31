import { useState } from "react";
import api from "../services/api";

function WasteClassification() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please choose an image.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/waste/classify", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Waste classification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">♻️ Waste Classification</h1>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <input
          id="waste-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        <label
          htmlFor="waste-file"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700"
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
          onClick={handleAnalyze}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
        >
          Generate Waste Report
        </button>
      </div>

      {loading && (
        <p className="mt-6 text-blue-600 font-semibold">
          Generating Waste Classification Report...
        </p>
      )}

      {result && (
        <div className="mt-8 bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">
            Waste Classification Report
          </h2>

          {[
            ["Material", result.material],
            ["Surface", result.surface],
            ["Defect", result.defect],
            ["Condition", result.condition],
            ["Waste Category", result.waste_category],
            ["Recyclability", result.recyclability],
            ["Reuse Potential", result.reuse_potential],
            ["Processing Recommendation", result.processing_recommendation],
            ["Priority", result.priority],
            ["Confidence", Number(result.confidence).toFixed(2) + "%"],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between border-b py-2">
              <span className="font-semibold">{k}</span>
              <span>{v}</span>
            </div>
          ))}

          <button
            onClick={() => window.print()}
            className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
          >
            Print Report
          </button>
        </div>
      )}
    </div>
  );
}

export default WasteClassification;