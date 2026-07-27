import { useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import SectionHeader from "@/components/dashboard/SectionHeader";

import ImageUploader from "@/components/analysis/ImageUploader";
import LoadingSpinner from "@/components/analysis/LoadingSpinner";
import AnalysisReport from "@/components/analysis/AnalysisReport";

import { predictFabric } from "@/services/predictionService";

function FabricAnalysis() {
const [selectedImages, setSelectedImages] = useState([]);
const [previews, setPreviews] = useState([]);

const [loading, setLoading] = useState(false);

const [results, setResults] = useState([]);

const [error, setError] = useState("");
  const handleImageChange = (event) => {
  const files = Array.from(event.target.files);

  if (files.length === 0) return;

  setSelectedImages(files);

  const imagePreviews = files.map((file) =>
    URL.createObjectURL(file)
  );

  setPreviews(imagePreviews);

  setResults([]);

  setError("");
};
const handleAnalyze = async () => {
  if (selectedImages.length === 0) {
    setError("Please upload at least one image.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const response = await predictFabric(selectedImages);

    setResults(response);

  } catch (err) {
    console.error(err);

    setError(
      err?.response?.data?.message ||
      "Failed to analyze images."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <DashboardLayout>
      <SectionHeader
        title="AI Fabric Analysis"
        subtitle="Upload a fabric image to classify the fabric and receive recycling recommendations."
      />

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left */}

        <div
          className="
            bg-[var(--surface)]
            rounded-xl
            shadow
            p-6
            border
          "
          style={{
            borderColor: "var(--border)"
          }}
        >
          <ImageUploader
              previews={previews}
              onChange={handleImageChange}
          />
          {error && (
            <p className="text-red-600 mt-5">
              {error}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="
              mt-6
              w-full
              py-3
              rounded-xl
              font-semibold
              text-white
              bg-green-600
              hover:bg-green-700
              transition
              disabled:opacity-60
            "
          >
            Analyze Fabric
          </button>
        </div>

        {/* Right */}

        <div
          className="
            bg-[var(--surface)]
            rounded-xl
            shadow
            p-6
            border
          "
          style={{
            borderColor: "var(--border)"
          }}
        >
          {loading ? (
    <LoadingSpinner />
) : results.length > 0 ? (
    <div className="space-y-6">
        {results.map((result, index) => (
            <AnalysisReport
                key={index}
                result={result}
                imageNumber={index + 1}
            />
        ))}
    </div>
) : (
    <div className="h-full flex items-center justify-center">
        <p
            className="text-lg"
            style={{
                color: "var(--text-secondary)",
            }}
        >
            Upload image(s) and click <strong>Analyze Fabric</strong> to generate AI reports.
        </p>
    </div>
)}
        </div>

      </div>

    </DashboardLayout>
  );
}

export default FabricAnalysis;