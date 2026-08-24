import { useCallback, useRef, useState } from "react";
import {
  Upload,
  ImageIcon,
  Loader2,
  AlertCircle,
  RotateCcw,
  Clock,
  FileDown,
} from "lucide-react";
import { predictFabric } from "../services/api";
import { getMaterialTypeInfo } from "../data/materialInfo";
import { downloadPredictionPdf } from "../utils/pdfReport";
import BatchPrediction from "./BatchPrediction";
import PredictionResultCard from "../components/prediction/PredictionResultCard";
import TopPredictionCard from "../components/prediction/TopPredictionCard";
import OverallSummaryCard from "../components/prediction/OverallSummaryCard";
import EnvironmentalImpactCard from "../components/prediction/EnvironmentalImpactCard";
import CircularityScoreCard from "../components/prediction/CircularityScoreCard";
import MaterialInformationCard from "../components/prediction/MaterialInformationCard";
import RecommendationCard from "../components/prediction/RecommendationCard";
import Topbar from "../components/Topbar";
import "./Predictions.css";

function Predictions() {
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("single");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [processingTime, setProcessingTime] = useState(null);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setProcessingTime(null);
    setError(null);
  }, []);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePredict = useCallback(async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    const startTime = performance.now();

    try {
      const prediction = await predictFabric(selectedFile);
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      setProcessingTime(elapsedSeconds);
      setResult(prediction);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setProcessingTime(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!result || !selectedFile) return;

    await downloadPredictionPdf({
      imageFile: selectedFile,
      material: result.material,
      confidence: result.confidence,
      defect: result.defect,
      defectConfidence: result.defect_confidence,
      wasteCategory: result.waste_category,
      recyclability: result.recyclability,
      recommendation: result.recommendation,
      top3Predictions: result.top_3_predictions,
      materialTypeInfo: getMaterialTypeInfo(result.material),
      processingTimeSeconds: processingTime,
      sustainability: result.sustainability,
    });
  }, [result, selectedFile, processingTime]);

  return (
    <div className="dash-shell">
      <Topbar />

      <main className="predictions-page">
      <div className="predictions-header">
        <h1>AI Fabric Prediction</h1>
        <p>Upload a fabric image to identify material type, detect defects, and receive sustainability recommendations.</p>
      </div>

      <div className="pred-tabs">
        <button
          type="button"
          className={`pred-tab ${activeTab === "single" ? "pred-tab-active" : ""}`}
          onClick={() => setActiveTab("single")}
        >
          Single Image
        </button>
        <button
          type="button"
          className={`pred-tab ${activeTab === "batch" ? "pred-tab-active" : ""}`}
          onClick={() => setActiveTab("batch")}
        >
          Batch Analysis
        </button>
      </div>

      {activeTab === "single" && (
        <div className="pred-report-flow">
          {/* ROW 1: Upload Image + Prediction Result */}
          <section className="pred-section">
            <div className="pred-result-row pred-result-row--split">
              <div className="pred-card pred-upload-card">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="pred-file-input"
                />

                {!previewUrl ? (
                  <button type="button" className="pred-dropzone" onClick={handleBrowseClick}>
                    <div className="pred-icon-circle">
                      <Upload size={20} />
                    </div>
                    <p className="pred-dropzone-title">Upload Fabric Image</p>
                    <p className="pred-dropzone-subtitle">JPG, PNG — up to 10MB</p>
                  </button>
                ) : (
                  <div className="pred-preview">
                    <img src={previewUrl} alt="Selected fabric" className="pred-preview-image" />
                    <button type="button" className="pred-change-btn" onClick={handleBrowseClick}>
                      <ImageIcon size={14} />
                      Change image
                    </button>
                  </div>
                )}

                {error && (
                  <div className="pred-error">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pred-actions">
                  <button
                    type="button"
                    className="pred-btn-primary"
                    onClick={handlePredict}
                    disabled={!selectedFile || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="pred-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Fabric"
                    )}
                  </button>

                  {(selectedFile || result) && (
                    <button type="button" className="pred-btn-secondary" onClick={handleReset}>
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {result ? (
                <div className="pred-result-col">
                  <PredictionResultCard result={result} />

                  {processingTime !== null && (
                    <div className="pred-processing-badge">
                      <Clock size={12} />
                      <span>AI Processing Time <strong>{processingTime.toFixed(2)} sec</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pred-card pred-empty-state">
                  <div className="pred-icon-circle pred-icon-circle-muted">
                    <ImageIcon size={20} />
                  </div>
                  <p className="pred-empty-title">Upload an image to begin AI analysis.</p>
                </div>
              )}
            </div>
          </section>

          {result && (
            <>
              {/* ROW 2: Material Information */}
              <section className="pred-section">
                <MaterialInformationCard
                  materialInformation={result?.sustainability?.material_information}
                />
              </section>

              {/* ROW 3: Top 3 Predictions */}
              <section className="pred-section">
                <TopPredictionCard predictions={result?.top_3_predictions} />
              </section>

              {/* ROW 4: Sustainability Overview */}
              <section className="pred-section">
                <OverallSummaryCard sustainability={result?.sustainability} />
              </section>

              {/* ROW 5: Environmental Impact */}
              <section className="pred-section">
                <EnvironmentalImpactCard
                  environmentalImpact={result?.sustainability?.environmental_impact}
                />
              </section>

              {/* ROW 6: Circular Economy Score */}
              <section className="pred-section">
                <CircularityScoreCard wasteScoring={result?.sustainability?.waste_scoring} />
              </section>

              {/* ROW 7: Recycling Recommendation */}
              <section className="pred-section">
                <RecommendationCard recommendations={result?.sustainability?.recommendations} />
              </section>

              {/* ROW 8: Download PDF Report */}
              <section className="pred-section">
                <div className="pred-card pred-report-cta-card">
                  <div className="pred-report-cta-copy">
                    <p className="pred-report-cta-title">Report & Download</p>
                    <p className="pred-report-cta-subtitle">
                      Export a detailed report including prediction result, material information,
                      sustainability overview, environmental impact, circular economy score,
                      and recycling recommendations.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="pred-btn-primary pred-download-btn"
                    onClick={handleDownloadPdf}
                  >
                    <FileDown size={16} />
                    Download PDF Report
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {activeTab === "batch" && <BatchPrediction />}
    </main>
  </div>
  );
}

export default Predictions;