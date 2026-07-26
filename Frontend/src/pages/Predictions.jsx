import { useRef, useState } from "react";
import {
  Upload,
  ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Recycle,
  Leaf,
  Info,
  RotateCcw,
  Clock,
  FileDown,
} from "lucide-react";
import { predictFabric } from "../services/api";
import { getMaterialTypeInfo } from "../data/materialInfo";
import { downloadPredictionPdf } from "../utils/pdfReport";
import BatchPrediction from "./BatchPrediction";
import "./Predictions.css";

function Predictions() {
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("single"); // "single" | "batch"

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [processingTime, setProcessingTime] = useState(null); // seconds

  const handleFileChange = (event) => {
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
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handlePredict = async () => {
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
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setProcessingTime(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadPdf = async () => {
    if (!result || !selectedFile) return;

    await downloadPredictionPdf({
      imageFile: selectedFile,
      material: result.material,
      confidence: result.confidence,
      wasteCategory: result.waste_category,
      recyclability: result.recyclability,
      recommendation: result.recommendation,
      top3Predictions: result.top_3_predictions,
      materialTypeInfo: getMaterialTypeInfo(result.material),
      processingTimeSeconds: processingTime,
    });
  };

  const fabricInfo = result ? getMaterialTypeInfo(result.material) : null;

  return (
    <div className="predictions-page">
      <div className="predictions-header">
        <h1>AI Fabric Prediction</h1>
        <p>Upload a fabric image to identify the material type and get recycling guidance.</p>
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
          Batch Prediction
        </button>
      </div>

      {activeTab === "single" && (
        <div className="predictions-grid">
          {/* --- Upload card --- */}
          <div className="pred-card upload-card">
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
                  <Upload size={22} />
                </div>
                <p className="pred-dropzone-title">Click to upload a fabric image</p>
                <p className="pred-dropzone-subtitle">JPG, PNG, up to 10MB</p>
              </button>
            ) : (
              <div className="pred-preview">
                <img src={previewUrl} alt="Selected fabric" className="pred-preview-image" />
                <button type="button" className="pred-change-btn" onClick={handleBrowseClick}>
                  <ImageIcon size={16} />
                  Change image
                </button>
              </div>
            )}

            {error && (
              <div className="pred-error">
                <AlertCircle size={16} />
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
                  "Predict Fabric Type"
                )}
              </button>

              {(selectedFile || result) && (
                <button type="button" className="pred-btn-secondary" onClick={handleReset}>
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* --- Result card --- */}
          {result ? (
            <div className="pred-card result-card">
              <div className="pred-result-header">
                <div className="pred-icon-circle pred-icon-circle-success">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="pred-result-label">Predicted Material</p>
                  <h2 className="pred-result-material">{result.material}</h2>
                </div>
                <div className="pred-confidence-badge">{result.confidence}%</div>
              </div>

              {processingTime !== null && (
                <div className="pred-processing-time">
                  <Clock size={14} />
                  <span>AI Processing Time: {processingTime.toFixed(2)} sec</span>
                </div>
              )}

              <div className="pred-info-grid">
                <div className="pred-info-item">
                  <div className="pred-icon-circle pred-icon-circle-small">
                    <Recycle size={16} />
                  </div>
                  <div>
                    <p className="pred-info-label">Waste Category</p>
                    <p className="pred-info-value">{result.waste_category}</p>
                  </div>
                </div>

                <div className="pred-info-item">
                  <div className="pred-icon-circle pred-icon-circle-small">
                    <Leaf size={16} />
                  </div>
                  <div>
                    <p className="pred-info-label">Recyclability</p>
                    <p className="pred-info-value">{result.recyclability}</p>
                  </div>
                </div>

                <div className="pred-info-item pred-info-item-full">
                  <div className="pred-icon-circle pred-icon-circle-small">
                    <Info size={16} />
                  </div>
                  <div>
                    <p className="pred-info-label">Recommendation</p>
                    <p className="pred-info-value">{result.recommendation}</p>
                  </div>
                </div>
              </div>

              {result.top_3_predictions && (
                <div className="pred-top3">
                  <p className="pred-top3-title">Top 3 Predictions</p>
                  {result.top_3_predictions.map((item) => (
                    <div key={item.material} className="pred-top3-row">
                      <span className="pred-top3-name">{item.material}</span>
                      <div className="pred-top3-bar-track">
                        <div
                          className="pred-top3-bar-fill"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="pred-top3-value">{item.confidence}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* --- Fabric Information card --- */}
              {fabricInfo && (
                <div className="pred-fabric-info">
                  <p className="pred-fabric-info-title">Fabric Information</p>
                  <div className="pred-fabric-info-row">
                    <span className="pred-fabric-info-label">Material Type</span>
                    <span className="pred-fabric-info-value">{fabricInfo.type}</span>
                  </div>
                  <div className="pred-fabric-info-row">
                    <span className="pred-fabric-info-label">Common Uses</span>
                    <span className="pred-fabric-info-value">{fabricInfo.commonUses}</span>
                  </div>
                  <p className="pred-fabric-info-description">{fabricInfo.description}</p>
                </div>
              )}

              <button
                type="button"
                className="pred-btn-secondary pred-download-btn"
                onClick={handleDownloadPdf}
              >
                <FileDown size={16} />
                Download PDF Report
              </button>
            </div>
          ) : (
            <div className="pred-card result-card pred-empty-state">
              <div className="pred-icon-circle pred-icon-circle-muted">
                <ImageIcon size={22} />
              </div>
              <p className="pred-empty-title">No prediction yet</p>
              <p className="pred-empty-subtitle">
                Upload a fabric image and click "Predict Fabric Type" to see results here.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "batch" && <BatchPrediction />}
    </div>
  );
}

export default Predictions;