import { useCallback, useEffect, useRef, useState } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  confirmTextileMaterial,
  getPredictionHistory,
  predictTextile,
} from "../../services/predictionService";

import "./UploadWaste.css";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const HISTORY_LIMIT = 5;

const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MATERIAL_OPTIONS = [
  ["cotton", "Cotton"],
  ["polyester", "Polyester"],
  ["denim", "Denim"],
  ["silk", "Silk"],
  ["wool", "Wool"],
  ["linen", "Linen"],
  ["nylon", "Nylon"],
  ["viscose", "Viscose"],
  ["rayon", "Rayon"],
  ["acrylic", "Acrylic"],
  ["hemp", "Hemp"],
  ["jute", "Jute"],
  ["mixed fabric", "Mixed Fabric"],
];

const firstAvailable = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeConfidence = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const percentage =
    numericValue >= 0 && numericValue <= 1 ? numericValue * 100 : numericValue;

  return Number(percentage.toFixed(2));
};

const formatScore = (value) =>
  value === undefined || value === null ? "Not assessed" : `${value}/100`;

const normalizeStatus = (value) =>
  String(value || "pending")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "-");

const friendlyPendingText = (value) => {
  const text = String(value || "").trim();
  const normalized = text.toLowerCase();

  if (
    normalized ===
    "manual material verification required"
  ) {
    return "Material-Specific Recommendation Pending";
  }

  if (
    normalized ===
    "awaiting material verification"
  ) {
    return "Awaiting Optional Material Confirmation";
  }

  if (
    normalized ===
    "material verification pending"
  ) {
    return "Material confirmation pending";
  }

  return text;
};

const extractHistory = (data) => {
  const possibleArrays = [
    data,
    data?.uploads,
    data?.history,
    data?.predictions,
    data?.data,
  ];

  return possibleArrays.find(Array.isArray) || [];
};

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ");
  }

  if (status === 413) {
    return "This image exceeds the 10 MB upload limit.";
  }

  if (status === 422) {
    return "Please check the image and weight, then try again.";
  }

  if (status >= 500) {
    return "The analysis service is temporarily unavailable. Please try again.";
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to analyse this textile. Please try again."
  );
};

const toBackendUrl = (path) => {
  if (!path || typeof path !== "string") {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const cleanPath = path.replaceAll("\\", "/").replace(/^\/+/, "");

  return `${BACKEND_URL}/${cleanPath}`;
};

const parsePrediction = (data, selectedMaterial, submittedWeight) => {
  const fabric = data?.fabric_prediction || {};
  const verification = data?.material_verification || {};
  const condition = data?.condition_analysis || {};
  const decisionWrapper = data?.decision_analysis || {};
  const decision = decisionWrapper?.decision || decisionWrapper || {};
  const materialData = decisionWrapper?.material_data || {};
  const sustainability = data?.sustainability_analysis || {};
  const stored = data?.stored_assessment || {};

  const materialVerified = Boolean(verification?.verified);
  const materialSource = firstAvailable(
    verification?.source,
    decisionWrapper?.material_source,
    sustainability?.material_source,
    stored?.material_source,
    null,
  );
  const materialAssigned =
    !materialVerified &&
    (verification?.status === "application_assigned" ||
      materialSource === "application_class_mapping");
  const hasMaterialAssessment =
    materialVerified || materialAssigned;

  const fabricClass = firstAvailable(
    fabric?.class_id,
    fabric?.class,
    stored?.fabric_class_id,
    data?.fabric_class,
    "Unknown",
  );

  const fabricCategory = firstAvailable(
    fabric?.category,
    fabric?.fabric_name,
    stored?.fabric_category,
    fabricClass !== "Unknown"
      ? `Fabric Category ${fabricClass}`
      : "Unknown Fabric Category",
  );

  const fabricConstruction = firstAvailable(
    fabric?.construction,
    stored?.fabric_construction,
    data?.fabric_construction,
    "Unknown",
  );

  const visualFamily = firstAvailable(
    fabric?.visual_family,
    stored?.visual_family,
    data?.visual_family,
    "Unknown",
  );

  return {
    uploadId: data?.upload_id,
    fabricClass,
    fabricCategory,
    fabricConstruction,
    visualFamily,
    likelyFibres: Array.isArray(fabric?.likely_fibres)
      ? fabric.likely_fibres
      : [],
    classificationScope: firstAvailable(
      fabric?.classification_scope,
      "visual_fabric_category",
    ),
    confidence: normalizeConfidence(
      firstAvailable(fabric?.confidence, data?.confidence, 0),
    ),
    weight: firstAvailable(data?.weight_kg, submittedWeight),
    materialVerified,
    materialAssigned,
    hasMaterialAssessment,
    materialSource,
    material: hasMaterialAssessment
      ? firstAvailable(
          verification?.material,
          fabric?.assigned_material,
          stored?.material,
          materialData?.material,
          materialData?.name,
          selectedMaterial,
        )
      : "Unverified",
    materialStatus: firstAvailable(
      verification?.status,
      materialVerified
        ? "verified"
        : materialAssigned
          ? "application_assigned"
          : "awaiting_verification",
    ),
    materialMessage: firstAvailable(
      verification?.message,
      materialVerified
        ? "Material confirmed and used for the recovery assessment."
        : materialAssigned
          ? "This representative material is assigned by the academic prototype and can be corrected using care-label information."
          : "Confirm the fibre composition to unlock material-dependent scoring.",
    ),
    materialType: firstAvailable(
      stored?.material_type,
      materialData?.type,
      materialData?.material_type,
      materialVerified
        ? "Verified textile material"
        : materialAssigned
          ? "Application-assigned material"
          : "Unverified",
    ),
    environmentalImpact: firstAvailable(
      materialData?.environmental_impact,
      materialData?.impact,
      data?.environmental_impact,
      hasMaterialAssessment ? "Not available" : "Pending verification",
    ),
    biodegradable: Boolean(
      firstAvailable(materialData?.biodegradable, data?.biodegradable, false),
    ),
    reusable: Boolean(
      firstAvailable(materialData?.reusable, data?.reusable, false),
    ),
    condition: firstAvailable(
      condition?.condition,
      stored?.condition,
      data?.condition,
      "Unknown",
    ),
    defect: firstAvailable(
      condition?.defect,
      condition?.defect_status,
      stored?.defect_status,
      data?.defect,
      "Not detected",
    ),
    severity: firstAvailable(
      condition?.severity,
      condition?.damage_level,
      stored?.defect_severity,
      data?.severity,
      "Unknown",
    ),
    contamination: firstAvailable(
      condition?.contamination,
      condition?.contamination_level,
      stored?.contamination_status,
      data?.contamination,
      "Not assessed",
    ),
    affectedArea: Number(
      firstAvailable(condition?.affected_area, data?.affected_area, 0),
    ).toFixed(2),
    visualization: firstAvailable(
      condition?.visualization,
      data?.visualization,
      null,
    ),
    recommendation: friendlyPendingText(
      firstAvailable(
        decision?.recommendation,
        decision?.final_decision,
        stored?.final_decision,
        data?.final_decision,
      hasMaterialAssessment
        ? "Manual Review"
        : "Material-Specific Recommendation Pending",
      ),
    ),
    recoveryPath: friendlyPendingText(
      firstAvailable(
        decision?.recovery_path,
        stored?.recovery_path,
        data?.recovery_path,
        hasMaterialAssessment
          ? "Not available"
          : "Awaiting Optional Material Confirmation",
      ),
    ),
    recoveryCategory: firstAvailable(
      decision?.recovery_category,
      stored?.recovery_category,
      "Not assessed",
    ),
    decisionRule: friendlyPendingText(
      firstAvailable(
        decision?.rule_name,
        sustainability?.decision?.rule_name,
        "Not available",
      ),
    ),
    reason: firstAvailable(
      decision?.reason,
      sustainability?.decision?.reason,
      hasMaterialAssessment
        ? "The recovery path is based on the verified material and condition."
        : "Material-dependent guidance is waiting for verification.",
    ),
    sustainabilityScore: firstAvailable(
      sustainability?.sustainability_score,
      stored?.sustainability_score,
      null,
    ),
    reuseScore: firstAvailable(
      sustainability?.reuse_score,
      stored?.reuse_score,
      null,
    ),
    recoveryScore: firstAvailable(
      sustainability?.recovery_score,
      stored?.recovery_score,
      null,
    ),
    circularityLevel: firstAvailable(
      sustainability?.circularity_level,
      stored?.circularity_level,
      hasMaterialAssessment ? "Insufficient Data" : "Not Assessed",
    ),
    assessmentStatus: friendlyPendingText(
      firstAvailable(
        sustainability?.assessment_status,
        stored?.assessment_status,
        hasMaterialAssessment
          ? "Manual Review Required"
          : "Visual Analysis Completed",
      ),
    ),
    requiresManualReview: Boolean(
      firstAvailable(
        sustainability?.requires_manual_review,
        stored?.requires_manual_review,
        !materialVerified,
      ),
    ),
  };
};

function UploadWaste() {
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [weight, setWeight] = useState("");
  const [confirmationMaterial, setConfirmationMaterial] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmingMaterial, setConfirmingMaterial] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const response = await getPredictionHistory();

      const latest = [...extractHistory(response)]
        .sort(
          (a, b) =>
            Number(b?.upload_id || b?.id || 0) -
            Number(a?.upload_id || a?.id || 0),
        )
        .slice(0, HISTORY_LIMIT);

      setHistory(latest);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(
    () => () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview],
  );

  const selectImage = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();

    const allowedExtension = ["jpg", "jpeg", "png", "webp"].includes(extension);

    if (!ALLOWED_FILE_TYPES.has(selectedFile.type) || !allowedExtension) {
      setErrorMessage("Choose a JPG, JPEG, PNG or WebP textile image.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage("This image exceeds the 10 MB upload limit.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setConfirmationMaterial("");
    setResult(null);
    setErrorMessage("");
  };

  const handleFileChange = (event) => {
    selectImage(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    selectImage(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
    setResult(null);
    setErrorMessage("");
  };

  const resetForm = () => {
    removeImage();
    setWeight("");
    setConfirmationMaterial("");
  };

  const analyzeWaste = async () => {
    if (!image) {
      setErrorMessage("Upload a textile image before starting the analysis.");
      return;
    }

    const numericWeight = Number(weight);

    if (
      weight.trim() === "" ||
      !Number.isFinite(numericWeight) ||
      numericWeight <= 0
    ) {
      setErrorMessage("Enter a textile weight greater than zero.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setResult(null);

      const response = await predictTextile(image, numericWeight);

      setResult(parsePrediction(response, "", numericWeight));

      await loadHistory();

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const confirmMaterial = async () => {
    if (!result?.uploadId) {
      setErrorMessage(
        "The analysis ID is missing. Run the image analysis again.",
      );
      return;
    }

    if (!confirmationMaterial) {
      setErrorMessage("Select the material shown on the garment care label.");
      return;
    }

    try {
      setConfirmingMaterial(true);
      setErrorMessage("");

      const response = await confirmTextileMaterial(
        result.uploadId,
        confirmationMaterial,
      );

      setResult(parsePrediction(response, confirmationMaterial, result.weight));

      await loadHistory();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setConfirmingMaterial(false);
    }
  };

  const downloadReport = () => {
    if (!result) {
      return;
    }

    try {
      const pdf = new jsPDF();

      pdf.setTextColor(19, 78, 74);
      pdf.setFontSize(20);
      pdf.text("AI Textile Waste Intelligence", 18, 20);

      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(10);
      pdf.text(`Assessment report · ${new Date().toLocaleString()}`, 18, 28);

      autoTable(pdf, {
        startY: 38,
        theme: "grid",
        headStyles: {
          fillColor: [19, 78, 74],
        },
        head: [["Assessment", "Result"]],
        body: [
          ["Fabric category", result.fabricCategory],
          ["CNN class", result.fabricClass],
          ["Construction", result.fabricConstruction],
          ["Visual family", result.visualFamily],
          ["Confidence", `${result.confidence}%`],
          ["Weight", `${result.weight} kg`],
          ["Material", result.material],
          ["Material type", result.materialType],
          [
            "Material source",
            result.materialVerified
              ? "User verified"
              : result.materialAssigned
                ? "Application class mapping"
                : "Not available",
          ],
          [
            "Likely fibre families",
            result.likelyFibres.length
              ? result.likelyFibres.join(", ")
              : "Not available",
          ],
          ["Condition", result.condition],
          ["Defect", result.defect],
          ["Severity", result.severity],
          ["Contamination", result.contamination],
          ["Recommendation", result.recommendation],
          ["Recovery path", result.recoveryPath],
          ["Rule", result.decisionRule],
          [
            "Sustainability score",
            result.sustainabilityScore ?? "Not assessed",
          ],
          ["Circularity level", result.circularityLevel],
          ["Assessment status", result.assessmentStatus],
        ],
      });

      pdf.save(`textile-assessment-${result.uploadId || "report"}.pdf`);
    } catch {
      setErrorMessage("The PDF report could not be generated.");
    }
  };

  const imageResultUrl = result?.visualization
    ? toBackendUrl(result.visualization)
    : preview;

  const canAnalyze =
    Boolean(image) && weight.trim() !== "" && Number(weight) > 0 && !loading;

  return (
    <main className="tw-page">
      <section className="tw-shell">
        <header className="tw-hero">
          <div className="tw-hero-copy">
            <span className="tw-kicker">Circular intelligence workspace</span>
            <h1>Turn textile waste into a responsible recovery decision.</h1>
            <p>
              Combine AI fabric recognition, visual condition inspection and
              explainable sustainability guidance in one focused assessment.
            </p>
          </div>

          <div className="tw-hero-proof">
            <div>
              <strong>10 MB</strong>
              <span>Protected uploads</span>
            </div>
            <div>
              <strong>21</strong>
              <span>Verified recovery rules</span>
            </div>
            <div>
              <strong>AI + CV</strong>
              <span>Dual-stage analysis</span>
            </div>
          </div>
        </header>

        <section className="tw-workspace">
          <div className="tw-card-heading">
            <div>
              <span className="tw-step">01</span>
              <div>
                <h2>Analyse a textile sample</h2>
                <p>Add one clear image and the measured textile weight.</p>
              </div>
            </div>

            <button
              type="button"
              className="tw-text-button"
              onClick={resetForm}
              disabled={!image && !weight}
            >
              Reset
            </button>
          </div>

          <div className="tw-upload-layout">
            <div className="tw-media-column">
              <input
                ref={fileInputRef}
                className="tw-file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
              />

              {preview ? (
                <div className="tw-preview">
                  <img src={preview} alt="Selected textile sample" />
                  <div className="tw-preview-overlay">
                    <div>
                      <strong>{image?.name}</strong>
                      <span>
                        {((image?.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button type="button" onClick={removeImage}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={`tw-dropzone ${dragActive ? "is-dragging" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <span className="tw-upload-icon">↑</span>
                  <strong>Drop your textile image here</strong>
                  <span>or click to browse your files</span>
                  <small>JPG, JPEG, PNG or WebP · up to 10 MB</small>
                </button>
              )}
            </div>

            <div className="tw-form-column">
              <div className="tw-field">
                <label htmlFor="textile-weight">
                  Textile weight
                  <span>Required</span>
                </label>
                <div className="tw-input-wrap">
                  <input
                    id="textile-weight"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="Example: 2.5"
                    value={weight}
                    onChange={(event) => {
                      setWeight(event.target.value);
                      setErrorMessage("");
                    }}
                  />
                  <span>kg</span>
                </div>
              </div>

              <aside className="tw-guidance">
                <span>i</span>
                <div>
                  <strong>Two-stage assessment</strong>
                  <p>
                    First, the AI analyses the visual fabric category and
                    condition. You can optionally confirm the fibre composition
                    from the care label after the report appears.
                  </p>
                </div>
              </aside>

              {errorMessage && (
                <div className="tw-alert" role="alert">
                  <span>!</span>
                  <p>{errorMessage}</p>
                </div>
              )}

              <button
                type="button"
                className="tw-primary-button"
                disabled={!canAnalyze}
                onClick={analyzeWaste}
              >
                {loading ? (
                  <>
                    <span className="tw-spinner" />
                    Analysing sample
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    Analyse textile sample
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {result && (
          <section className="tw-report" ref={resultRef}>
            <div className="tw-report-header">
              <div>
                <span className="tw-kicker">Assessment complete</span>
                <h2>Textile intelligence report</h2>
                <p>
                  Analysis #{result.uploadId || "—"} · {result.assessmentStatus}
                </p>
              </div>

              <div className="tw-report-actions">
                <span
                  className={`tw-badge ${
                    result.materialVerified
                      ? "is-verified"
                      : result.materialAssigned
                        ? "is-provisional"
                        : "is-pending"
                  }`}
                >
                  {result.materialVerified
                    ? "Material verified"
                    : result.materialAssigned
                      ? "Provisional assessment"
                      : "Optional material confirmation"}
                </span>
                <button
                  type="button"
                  className="tw-secondary-button"
                  onClick={downloadReport}
                >
                  Download PDF
                </button>
              </div>
            </div>

            <div className="tw-report-feature">
              <div className="tw-result-image">
                <img src={imageResultUrl} alt="Analysed textile sample" />
              </div>

              <div className="tw-prediction">
                <span>AI fabric prediction</span>
                <h3>{result.fabricCategory}</h3>
                <p className="tw-prediction-scope">
                  Visual fabric category detected by AI
                </p>
                {result.likelyFibres.length > 0 && (
                  <div className="tw-likely-fibres">
                    <span>Likely fibre families</span>
                    <p>{result.likelyFibres.join(" · ")}</p>
                  </div>
                )}
                <div className="tw-confidence">
                  <div>
                    <span
                      style={{
                        width: `${Math.min(result.confidence, 100)}%`,
                      }}
                    />
                  </div>
                  <strong>{result.confidence}% confidence</strong>
                </div>
                <dl>
                  <div>
                    <dt>CNN class</dt>
                    <dd>{result.fabricClass}</dd>
                  </div>
                  <div>
                    <dt>Sample weight</dt>
                    <dd>{result.weight} kg</dd>
                  </div>
                  <div>
                    <dt>Construction</dt>
                    <dd>{result.fabricConstruction}</dd>
                  </div>
                  <div>
                    <dt>Visual family</dt>
                    <dd>{result.visualFamily}</dd>
                  </div>
                </dl>
              </div>

              <div
                className={`tw-material-panel ${
                  result.materialVerified
                    ? "is-verified"
                    : result.materialAssigned
                      ? "is-provisional"
                      : "is-pending"
                }`}
              >
                <span>
                  {result.materialVerified
                    ? "Confirmed material"
                    : result.materialAssigned
                      ? "Application-assigned material"
                      : "Material status"}
                </span>
                <h3>{result.material}</h3>
                <strong>{result.materialType}</strong>
                <p>{result.materialMessage}</p>

                {!result.materialVerified && (
                  <div className="tw-confirm-material">
                    <label htmlFor="confirm-material">
                      {result.materialAssigned
                        ? "Correct or confirm this material"
                        : "Know the fibre composition?"}
                    </label>
                    <select
                      id="confirm-material"
                      value={confirmationMaterial}
                      onChange={(event) => {
                        setConfirmationMaterial(event.target.value);
                        setErrorMessage("");
                      }}
                    >
                      <option value="">Select from care label</option>
                      {MATERIAL_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={confirmMaterial}
                      disabled={!confirmationMaterial || confirmingMaterial}
                    >
                      {confirmingMaterial
                        ? "Confirming..."
                        : "Confirm material"}
                    </button>
                    <small>
                      {result.materialAssigned
                        ? "Optional—use the care label to replace the prototype assignment."
                        : "Optional—leave unverified if the care label is unavailable."}
                    </small>
                    {errorMessage && (
                      <p className="tw-inline-error" role="alert">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="tw-section-heading">
              <div>
                <span className="tw-step">02</span>
                <div>
                  <h3>Condition intelligence</h3>
                  <p>
                    Computer-vision inspection of visible condition and risk.
                  </p>
                </div>
              </div>
            </div>

            <div className="tw-metric-grid">
              <article>
                <span>Condition</span>
                <strong>{result.condition}</strong>
                <small>Overall visual state</small>
              </article>
              <article>
                <span>Detected defect</span>
                <strong>{result.defect}</strong>
                <small>Severity · {result.severity}</small>
              </article>
              <article>
                <span>Contamination</span>
                <strong>{result.contamination}</strong>
                <small>Affected area · {result.affectedArea}%</small>
              </article>
              <article>
                <span>Environmental impact</span>
                <strong>{result.environmentalImpact}</strong>
                <small>Material knowledge profile</small>
              </article>
            </div>

            {result.hasMaterialAssessment ? (
              <>
                <div className="tw-section-heading">
                  <div>
                    <span className="tw-step">03</span>
                    <div>
                      <h3>Sustainability assessment</h3>
                      <p>
                        Explainable scores derived from material, condition and
                        recovery feasibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="tw-score-grid">
                  {[
                    ["Sustainability", result.sustainabilityScore],
                    ["Reuse", result.reuseScore],
                    ["Recovery", result.recoveryScore],
                  ].map(([label, score]) => (
                    <article key={label}>
                      <div
                        className="tw-score-ring"
                        style={{
                          "--score": Number(score) || 0,
                        }}
                      >
                        <span>{score ?? "—"}</span>
                      </div>
                      <div>
                        <span>{label} score</span>
                        <strong>{formatScore(score)}</strong>
                      </div>
                    </article>
                  ))}

                  <article className="tw-level-card">
                    <span>Circularity level</span>
                    <strong>{result.circularityLevel}</strong>
                    <small>
  Material profile:{" "}
  {result.reusable
    ? "has reuse potential"
    : "limited reuse potential"}{" "}
  ·{" "}
  {result.biodegradable
    ? "biodegradable"
    : "not biodegradable"}
</small>
                  </article>
                </div>
              </>
            ) : (
              <div className="tw-verification-note">
                <span>i</span>
                <div>
                  <h3>Visual analysis complete</h3>
                  <p>
                    Material-specific sustainability scores become available
                    when the fibre composition is confirmed from a care label.
                  </p>
                </div>
              </div>
            )}

            <div
              className={`tw-decision ${
                result.requiresManualReview ? "needs-review" : ""
              }`}
            >
              <div>
                <span>Recommended circular pathway</span>
                <h2>{result.recommendation}</h2>
                <p>{result.reason}</p>
              </div>
              <dl>
                <div>
                  <dt>Recovery path</dt>
                  <dd>{result.recoveryPath}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{result.recoveryCategory}</dd>
                </div>
                <div>
                  <dt>Matched rule</dt>
                  <dd>{result.decisionRule}</dd>
                </div>
              </dl>
            </div>
          </section>
        )}

        <section className="tw-history">
          <div className="tw-card-heading">
            <div>
              <span className="tw-step">04</span>
              <div>
                <h2>Recent assessments</h2>
                <p>Your latest {HISTORY_LIMIT} textile intelligence records.</p>
              </div>
            </div>
            <span className="tw-record-count">{history.length} records</span>
          </div>

          {historyLoading ? (
            <div className="tw-empty">
              <span className="tw-spinner dark" />
              Loading recent assessments
            </div>
          ) : history.length === 0 ? (
            <div className="tw-empty">
              <strong>No assessments yet</strong>
              <span>Your completed analyses will appear here.</span>
            </div>
          ) : (
            <div className="tw-table-wrap">
              <table className="tw-table">
                <thead>
                  <tr>
                    <th>Sample</th>
                    <th>Fabric category</th>
                    <th>Material</th>
                    <th>Condition</th>
                    <th>Decision</th>
                    <th>Confidence</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => {
                    const path =
                      item?.image_url || item?.image_path || item?.file_path;
                    const classId = firstAvailable(
                      item?.fabric_prediction?.class_id,
                      item?.predicted_class,
                      "Unknown",
                    );
                    const category = firstAvailable(
                      item?.fabric_prediction?.category,
                      item?.fabric_name,
                      item?.fabric_category,
                      classId !== "Unknown"
                        ? `Fabric Category ${classId}`
                        : "Unknown category",
                    );
                    const construction = firstAvailable(
                      item?.fabric_prediction?.construction,
                      item?.fabric_construction,
                      "Unknown",
                    );
                    const verified = Boolean(
                      firstAvailable(
                        item?.material_verification?.verified,
                        item?.material_known,
                        false,
                      ),
                    );
                    const source = firstAvailable(
                      item?.material_verification?.source,
                      item?.material_source,
                      null,
                    );
                    const assigned =
                      !verified &&
                      (source === "application_class_mapping" ||
                        item?.material_status === "application_assigned");
                    const condition = firstAvailable(
                      item?.condition,
                      "Pending",
                    );
                    const decision = friendlyPendingText(
                      firstAvailable(
                        item?.final_decision,
                        item?.decision,
                        "Pending",
                      ),
                    );

                    return (
                      <tr key={item?.upload_id || item?.id || index}>
                        <td>
                          <div className="tw-thumb">
                            {path ? (
                              <img
                                src={toBackendUrl(path)}
                                alt=""
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong>{category}</strong>
                          <small>
                            Class {classId} · {construction}
                          </small>
                        </td>
                        <td>
                          <span
                            className={`tw-table-pill ${
                              verified
                                ? "verified"
                                : assigned
                                  ? "provisional"
                                  : "pending"
                            }`}
                          >
                            {verified
                              ? firstAvailable(
                                  item?.material_verification?.material,
                                  item?.material,
                                  "Verified",
                                )
                              : assigned
                                ? `Assigned · ${firstAvailable(
                                    item?.material_verification?.material,
                                    item?.material,
                                    "Unknown",
                                  )}`
                                : "Unverified"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`tw-condition ${normalizeStatus(
                              condition,
                            )}`}
                          >
                            {condition}
                          </span>
                        </td>
                        <td>
                          <span className="tw-table-decision">{decision}</span>
                        </td>
                        <td>
                          {normalizeConfidence(item?.confidence).toFixed(2)}%
                        </td>
                        <td>{item?.weight_kg ?? "—"} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default UploadWaste;