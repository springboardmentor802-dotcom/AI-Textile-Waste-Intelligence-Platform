import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  predictTextile,
} from "../../services/predictionService";

import "./UploadBatch.css";


const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_BATCH_SIZE = 10;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);


const firstAvailable = (
  ...values
) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );


const normalizeConfidence = (
  value
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  const percentage =
    number >= 0 && number <= 1
      ? number * 100
      : number;

  return Number(
    percentage.toFixed(2)
  );
};


const createSafeFileName = (
  value
) =>
  String(value || "textile-report")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "textile-report";


const getErrorMessage = (
  error
) => {
  const detail =
    error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ");
  }

  if (
    error?.response?.status === 413
  ) {
    return (
      "This image exceeds the "
      + "10 MB limit."
    );
  }

  return (
    error?.message
    || "Analysis failed for this sample."
  );
};


const createSample = (
  file
) => ({
  id: (
    globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random()}`
  ),
  file,
  preview: URL.createObjectURL(
    file
  ),
  weight: "",
  status: "ready",
  result: null,
  error: "",
});


const parseResult = (
  data,
  sample
) => {
  const fabric =
    data?.fabric_prediction || {};

  const verification =
    data?.material_verification || {};

  const condition =
    data?.condition_analysis || {};

  const decisionWrapper =
    data?.decision_analysis || {};

  const decision =
    decisionWrapper?.decision
    || decisionWrapper
    || {};

  const materialData =
    decisionWrapper?.material_data
    || {};

  const sustainability =
    data?.sustainability_analysis
    || {};

  const stored =
    data?.stored_assessment || {};

  const materialSource =
    firstAvailable(
      verification?.source,
      decisionWrapper?.material_source,
      sustainability?.material_source,
      stored?.material_source,
      "unknown",
    );

  const verified = Boolean(
    verification?.verified
  );

  const provisional =
    !verified
    && materialSource
      === "application_class_mapping";

  return {
    uploadId: data?.upload_id,
    name: sample.file.name,
    preview: sample.preview,
    weight: firstAvailable(
      data?.weight_kg,
      sample.weight,
    ),
    classId: firstAvailable(
      fabric?.class_id,
      fabric?.class,
      "Unknown",
    ),
    category: firstAvailable(
      fabric?.category,
      fabric?.fabric_name,
      "Unknown visual category",
    ),
    construction: firstAvailable(
      fabric?.construction,
      "Unknown",
    ),
    visualFamily: firstAvailable(
      fabric?.visual_family,
      "Unknown",
    ),
    confidence: normalizeConfidence(
      fabric?.confidence
    ),
    likelyFibres: Array.isArray(
      fabric?.likely_fibres
    )
      ? fabric.likely_fibres
      : [],
    material: firstAvailable(
      verification?.material,
      fabric?.assigned_material,
      stored?.material,
      materialData?.material,
      "Unknown",
    ),
    materialType: firstAvailable(
      stored?.material_type,
      materialData?.type,
      "Unknown",
    ),
    materialSource,
    verified,
    provisional,
    condition: firstAvailable(
      condition?.condition,
      "Unknown",
    ),
    defect: firstAvailable(
      condition?.defect,
      condition?.defect_status,
      "None detected",
    ),
    severity: firstAvailable(
      condition?.severity,
      condition?.damage_level,
      "Unknown",
    ),
    contamination: firstAvailable(
      condition?.contamination,
      "Not assessed",
    ),
    affectedArea: Number(
      firstAvailable(
        condition?.affected_area,
        0,
      )
    ).toFixed(2),
    recommendation: firstAvailable(
      decision?.recommendation,
      decision?.final_decision,
      stored?.final_decision,
      "Pending",
    ),
    recoveryPath: firstAvailable(
      decision?.recovery_path,
      stored?.recovery_path,
      "Not assessed",
    ),
    recoveryCategory: firstAvailable(
      decision?.recovery_category,
      stored?.recovery_category,
      "Not assessed",
    ),
    ruleName: firstAvailable(
      decision?.rule_name,
      sustainability
        ?.decision
        ?.rule_name,
      "Not available",
    ),
    reason: firstAvailable(
      decision?.reason,
      sustainability
        ?.decision
        ?.reason,
      "No explanation available.",
    ),
    sustainabilityScore:
      sustainability
        ?.sustainability_score
      ?? stored
        ?.sustainability_score
      ?? null,
    circularityLevel:
      firstAvailable(
        sustainability
          ?.circularity_level,
        stored?.circularity_level,
        "Not assessed",
      ),
    assessmentStatus:
      firstAvailable(
        sustainability
          ?.assessment_status,
        stored?.assessment_status,
        provisional
          ? "Provisional"
          : "Completed",
      ),
  };
};


function UploadBatch() {
  const inputRef = useRef(null);
  const samplesRef = useRef([]);

  const [samples, setSamples] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState({
      completed: 0,
      total: 0,
    });

  const [message, setMessage] =
    useState("");

  const [
    selectedReport,
    setSelectedReport,
  ] = useState(null);


  useEffect(() => {
    samplesRef.current = samples;
  }, [samples]);


  useEffect(
    () => () => {
      samplesRef.current.forEach(
        (sample) => {
          URL.revokeObjectURL(
            sample.preview
          );
        }
      );
    },
    [],
  );


  useEffect(() => {
    if (!selectedReport) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event
    ) => {
      if (event.key === "Escape") {
        setSelectedReport(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [selectedReport]);


  const completedResults = useMemo(
    () =>
      samples
        .filter(
          (sample) =>
            sample.status
            === "success"
        )
        .map(
          (sample) =>
            sample.result
        ),
    [samples],
  );


  const failedCount = useMemo(
    () =>
      samples.filter(
        (sample) =>
          sample.status === "error"
      ).length,
    [samples],
  );


  const reuseCount = useMemo(
    () =>
      completedResults.filter(
        (item) =>
          String(
            item.recoveryCategory
          ).toLowerCase()
            === "reuse"
      ).length,
    [completedResults],
  );


  const recyclingCount = useMemo(
    () =>
      completedResults.filter(
        (item) =>
          String(
            item.recoveryCategory
          )
            .toLowerCase()
            .includes("recycl")
          || String(
            item.recommendation
          )
            .toLowerCase()
            .includes("recycl")
          || String(
            item.recommendation
          )
            .toLowerCase()
            .includes("fiber recovery")
      ).length,
    [completedResults],
  );


  const handleFiles = (
    event
  ) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    event.target.value = "";

    if (!selectedFiles.length) {
      return;
    }

    const remainingSlots =
      MAX_BATCH_SIZE
      - samples.length;

    if (remainingSlots <= 0) {
      setMessage(
        `A batch can contain up to ${MAX_BATCH_SIZE} samples.`
      );
      return;
    }

    const validFiles = [];
    const errors = [];

    selectedFiles
      .slice(0, remainingSlots)
      .forEach((file) => {
        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase();

        const validExtension = [
          "jpg",
          "jpeg",
          "png",
          "webp",
        ].includes(extension);

        if (
          !ALLOWED_TYPES.has(
            file.type
          )
          || !validExtension
        ) {
          errors.push(
            `${file.name}: unsupported format`
          );
          return;
        }

        if (
          file.size
          > MAX_FILE_SIZE
        ) {
          errors.push(
            `${file.name}: exceeds 10 MB`
          );
          return;
        }

        validFiles.push(
          createSample(file)
        );
      });

    setSamples(
      (current) => [
        ...current,
        ...validFiles,
      ]
    );

    setMessage(
      errors.length
        ? errors.join(" · ")
        : ""
    );
  };


  const updateWeight = (
    id,
    value
  ) => {
    setSamples(
      (current) =>
        current.map(
          (sample) =>
            sample.id === id
              ? {
                  ...sample,
                  weight: value,
                  status:
                    sample.status
                    === "success"
                      ? "ready"
                      : sample.status,
                  result:
                    sample.status
                    === "success"
                      ? null
                      : sample.result,
                }
              : sample
        )
    );
  };


  const removeSample = (
    id
  ) => {
    setSamples(
      (current) => {
        const target =
          current.find(
            (sample) =>
              sample.id === id
          );

        if (target) {
          URL.revokeObjectURL(
            target.preview
          );
        }

        return current.filter(
          (sample) =>
            sample.id !== id
        );
      }
    );
  };


  const clearBatch = () => {
    samples.forEach(
      (sample) => {
        URL.revokeObjectURL(
          sample.preview
        );
      }
    );

    setSamples([]);
    setSelectedReport(null);
    setMessage("");
    setProgress({
      completed: 0,
      total: 0,
    });
  };


  const analyzeBatch = async () => {
    if (!samples.length) {
      setMessage(
        "Add at least one textile sample."
      );
      return;
    }

    const invalidSample =
      samples.find(
        (sample) => {
          const weight = Number(
            sample.weight
          );

          return (
            sample.weight === ""
            || !Number.isFinite(weight)
            || weight <= 0
          );
        }
      );

    if (invalidSample) {
      setMessage(
        `Enter a valid weight for ${invalidSample.file.name}.`
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setProgress({
      completed: 0,
      total: samples.length,
    });

    setSamples(
      (current) =>
        current.map(
          (sample) => ({
            ...sample,
            status: "queued",
            result: null,
            error: "",
          })
        )
    );

    for (
      let index = 0;
      index < samples.length;
      index += 1
    ) {
      const sample =
        samples[index];

      setSamples(
        (current) =>
          current.map(
            (item) =>
              item.id
                === sample.id
                ? {
                    ...item,
                    status:
                      "processing",
                  }
                : item
          )
      );

      try {
        const response =
          await predictTextile(
            sample.file,
            Number(sample.weight),
          );

        const result =
          parseResult(
            response,
            sample,
          );

        setSamples(
          (current) =>
            current.map(
              (item) =>
                item.id
                  === sample.id
                  ? {
                      ...item,
                      status:
                        "success",
                      result,
                      error: "",
                    }
                  : item
            )
        );
      } catch (error) {
        setSamples(
          (current) =>
            current.map(
              (item) =>
                item.id
                  === sample.id
                  ? {
                      ...item,
                      status:
                        "error",
                      result: null,
                      error:
                        getErrorMessage(
                          error
                        ),
                    }
                  : item
            )
        );
      }

      setProgress({
        completed: index + 1,
        total: samples.length,
      });
    }

    setLoading(false);
  };


  const downloadIndividualReport =
    (item) => {
      if (!item) {
        return;
      }

      try {
        const pdf = new jsPDF({
          unit: "mm",
          format: "a4",
        });

        const pageWidth =
          pdf.internal.pageSize.getWidth();

        pdf.setFillColor(
          15,
          78,
          74,
        );
        pdf.rect(
          0,
          0,
          pageWidth,
          38,
          "F",
        );

        pdf.setTextColor(
          255,
          255,
          255,
        );
        pdf.setFontSize(20);
        pdf.text(
          "AI Textile Assessment Report",
          16,
          17,
        );

        pdf.setFontSize(9);
        pdf.text(
          `Assessment ID: ${item.uploadId ?? "Not available"}`,
          16,
          25,
        );
        pdf.text(
          `Generated: ${new Date().toLocaleString()}`,
          16,
          31,
        );

        pdf.setTextColor(
          15,
          58,
          57,
        );
        pdf.setFontSize(15);
        pdf.text(
          item.name,
          16,
          49,
        );

        pdf.setFontSize(9);
        pdf.setTextColor(
          84,
          105,
          103,
        );
        pdf.text(
          `${item.weight} kg · ${item.assessmentStatus}`,
          16,
          56,
        );

        autoTable(pdf, {
          startY: 64,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: "middle",
          },
          headStyles: {
            fillColor: [
              20,
              96,
              91,
            ],
          },
          columnStyles: {
            0: {
              cellWidth: 46,
              fontStyle: "bold",
            },
          },
          head: [[
            "Classification field",
            "Assessment result",
          ]],
          body: [
            [
              "Visual category",
              item.category,
            ],
            [
              "Class",
              item.classId,
            ],
            [
              "Construction",
              item.construction,
            ],
            [
              "Visual family",
              item.visualFamily,
            ],
            [
              "Confidence",
              `${item.confidence}%`,
            ],
            [
              "Likely fibre families",
              item.likelyFibres.length
                ? item.likelyFibres.join(", ")
                : "Not available",
            ],
            [
              "Assigned material",
              item.material,
            ],
            [
              "Material type",
              item.materialType,
            ],
            [
              "Material source",
              item.materialSource,
            ],
            [
              "Verification",
              item.verified
                ? "Verified"
                : item.provisional
                  ? "Provisional mapping"
                  : "Not verified",
            ],
          ],
        });

        autoTable(pdf, {
          startY:
            pdf.lastAutoTable.finalY
            + 8,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: "middle",
          },
          headStyles: {
            fillColor: [
              30,
              64,
              175,
            ],
          },
          columnStyles: {
            0: {
              cellWidth: 46,
              fontStyle: "bold",
            },
          },
          head: [[
            "Condition field",
            "Assessment result",
          ]],
          body: [
            [
              "Condition",
              item.condition,
            ],
            [
              "Defect",
              item.defect,
            ],
            [
              "Severity",
              item.severity,
            ],
            [
              "Contamination",
              item.contamination,
            ],
            [
              "Affected area",
              `${item.affectedArea}%`,
            ],
          ],
        });

        const decisionStart =
          pdf.lastAutoTable.finalY
          + 8;

        autoTable(pdf, {
          startY: decisionStart,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: "middle",
          },
          headStyles: {
            fillColor: [
              138,
              90,
              10,
            ],
          },
          columnStyles: {
            0: {
              cellWidth: 46,
              fontStyle: "bold",
            },
          },
          head: [[
            "Circular decision field",
            "Assessment result",
          ]],
          body: [
            [
              "Recommendation",
              item.recommendation,
            ],
            [
              "Recovery path",
              item.recoveryPath,
            ],
            [
              "Recovery category",
              item.recoveryCategory,
            ],
            [
              "Matched rule",
              item.ruleName,
            ],
            [
              "Sustainability score",
              item.sustainabilityScore
                ?? "Not available",
            ],
            [
              "Circularity level",
              item.circularityLevel,
            ],
            [
              "Assessment status",
              item.assessmentStatus,
            ],
          ],
        });

        let reasonY =
          pdf.lastAutoTable.finalY
          + 10;

        if (reasonY > 258) {
          pdf.addPage();
          reasonY = 20;
        }

        pdf.setTextColor(
          15,
          58,
          57,
        );
        pdf.setFontSize(12);
        pdf.text(
          "Decision explanation",
          16,
          reasonY,
        );

        pdf.setTextColor(
          84,
          105,
          103,
        );
        pdf.setFontSize(9);

        const reasonLines =
          pdf.splitTextToSize(
            item.reason,
            pageWidth - 32,
          );

        pdf.text(
          reasonLines,
          16,
          reasonY + 7,
        );

        const disclaimerY =
          reasonY
          + 12
          + reasonLines.length * 4;

        if (disclaimerY < 280) {
          pdf.setFontSize(7.5);
          pdf.setTextColor(
            100,
            116,
            114,
          );
          pdf.text(
            "Prototype notice: assigned materials may be application-level mappings and are not laboratory fibre-composition results.",
            16,
            disclaimerY,
            {
              maxWidth:
                pageWidth - 32,
            },
          );
        }

        pdf.save(
          `${createSafeFileName(item.name)}_Textile_Report.pdf`
        );
      } catch {
        setMessage(
          `The report for ${item.name} could not be generated.`
        );
      }
    };


  const downloadBatchReport =
    () => {
      if (
        !completedResults.length
      ) {
        setMessage(
          "Analyse the batch before downloading a report."
        );
        return;
      }

      try {
        const pdf = new jsPDF({
          orientation: "landscape",
        });

        pdf.setTextColor(
          15,
          58,
          57,
        );
        pdf.setFontSize(20);
        pdf.text(
          "AI Textile Intelligence — Batch Report",
          16,
          18,
        );

        pdf.setTextColor(
          84,
          105,
          103,
        );
        pdf.setFontSize(9);
        pdf.text(
          `Generated ${new Date().toLocaleString()} · ${completedResults.length} successful · ${failedCount} failed`,
          16,
          26,
        );

        autoTable(pdf, {
          startY: 34,
          theme: "grid",
          styles: {
            fontSize: 7,
            cellPadding: 2.4,
          },
          headStyles: {
            fillColor: [
              20,
              96,
              91,
            ],
          },
          head: [[
            "Sample",
            "Visual category",
            "Class",
            "Assigned material",
            "Source",
            "Condition",
            "Defect",
            "Recommendation",
            "Score",
            "Status",
          ]],
          body:
            completedResults.map(
              (item) => [
                item.name,
                item.category,
                item.classId,
                item.material,
                item.materialSource,
                item.condition,
                `${item.defect} (${item.severity})`,
                item.recommendation,
                item
                  .sustainabilityScore
                  ?? "N/A",
                item.assessmentStatus,
              ]
            ),
        });

        const detailY =
          pdf.lastAutoTable.finalY
          + 10;

        autoTable(pdf, {
          startY: detailY,
          theme: "striped",
          styles: {
            fontSize: 7,
            cellPadding: 2.4,
          },
          headStyles: {
            fillColor: [
              30,
              64,
              175,
            ],
          },
          head: [[
            "Sample",
            "Construction",
            "Likely fibre families",
            "Contamination",
            "Affected area",
            "Recovery path",
            "Matched rule",
          ]],
          body:
            completedResults.map(
              (item) => [
                item.name,
                item.construction,
                item.likelyFibres
                  .join(", "),
                item.contamination,
                `${item.affectedArea}%`,
                item.recoveryPath,
                item.ruleName,
              ]
            ),
        });

        pdf.save(
          "AI_Textile_Batch_Report.pdf"
        );
      } catch {
        setMessage(
          "The batch PDF could not be generated."
        );
      }
    };


  const canAnalyze =
    samples.length > 0
    && !loading
    && samples.every(
      (sample) => {
        const value =
          Number(sample.weight);

        return (
          sample.weight !== ""
          && Number.isFinite(value)
          && value > 0
        );
      }
    );


  return (
    <main className="tb-page">
      <section className="tb-shell">
        <header className="tb-hero">
          <div>
            <span className="tb-kicker">
              Multi-sample intelligence
            </span>
            <h1>
              Analyse a textile batch with one consistent workflow.
            </h1>
            <p>
              Process up to {MAX_BATCH_SIZE} samples with visual classification,
              application-assigned materials and explainable provisional
              recovery guidance.
            </p>
          </div>

          <div className="tb-hero-stats">
            <article>
              <strong>{MAX_BATCH_SIZE}</strong>
              <span>Samples per batch</span>
            </article>
            <article>
              <strong>10 MB</strong>
              <span>Limit per image</span>
            </article>
            <article>
              <strong>21</strong>
              <span>Recovery rules</span>
            </article>
          </div>
        </header>

        <section className="tb-workspace">
          <div className="tb-section-heading">
            <div className="tb-step">
              01
            </div>
            <div>
              <h2>
                Prepare batch samples
              </h2>
              <p>
                Add a measured weight for every textile before analysis.
              </p>
            </div>

            {samples.length > 0 && (
              <button
                type="button"
                className="tb-text-button"
                onClick={clearBatch}
                disabled={loading}
              >
                Clear batch
              </button>
            )}
          </div>

          <button
            type="button"
            className="tb-dropzone"
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={
              loading
              || samples.length
                >= MAX_BATCH_SIZE
            }
          >
            <span className="tb-upload-icon">
              ↑
            </span>
            <strong>
              Add textile images
            </strong>
            <span>
              JPG, JPEG, PNG or WebP · up to 10 MB each
            </span>
            <small>
              {samples.length}/{MAX_BATCH_SIZE} selected
            </small>
          </button>

          <input
            ref={inputRef}
            className="tb-file-input"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFiles}
          />

          {message && (
            <div
              className="tb-alert"
              role="alert"
            >
              <span>!</span>
              <p>{message}</p>
            </div>
          )}

          {samples.length > 0 && (
            <div className="tb-sample-grid">
              {samples.map(
                (sample) => (
                  <article
                    className={`tb-sample-card is-${sample.status}`}
                    key={sample.id}
                  >
                    <div className="tb-sample-image">
                      <img
                        src={sample.preview}
                        alt=""
                      />
                      <span className="tb-file-size">
                        {(sample.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>

                    <div className="tb-sample-content">
                      <div className="tb-sample-title">
                        <div>
                          <strong title={sample.file.name}>
                            {sample.file.name}
                          </strong>
                          <span>
                            {sample.status === "processing"
                              ? "Analysing"
                              : sample.status === "success"
                                ? "Assessment ready"
                                : sample.status === "error"
                                  ? "Analysis failed"
                                  : sample.status === "queued"
                                    ? "Queued"
                                    : "Ready"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeSample(
                              sample.id
                            )
                          }
                          disabled={loading}
                          aria-label={`Remove ${sample.file.name}`}
                        >
                          ×
                        </button>
                      </div>

                      <label>
                        Textile weight
                        <div className="tb-weight-input">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Example: 2.5"
                            value={sample.weight}
                            disabled={loading}
                            onChange={(event) =>
                              updateWeight(
                                sample.id,
                                event.target.value,
                              )
                            }
                          />
                          <span>kg</span>
                        </div>
                      </label>

                      {sample.error && (
                        <p className="tb-sample-error">
                          {sample.error}
                        </p>
                      )}

                      {sample.status === "success" && sample.result && (
                        <div className="tb-sample-report-actions">
                          <button
                            type="button"
                            className="tb-sample-view-report"
                            onClick={() =>
                              setSelectedReport(
                                sample.result
                              )
                            }
                          >
                            View image report
                          </button>

                          <button
                            type="button"
                            className="tb-sample-download-report"
                            onClick={() =>
                              downloadIndividualReport(
                                sample.result
                              )
                            }
                          >
                            Download report
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}

          <div className="tb-action-row">
            {loading && (
              <div className="tb-progress">
                <div>
                  <span
                    style={{
                      width: `${
                        progress.total
                          ? (
                              progress.completed
                              / progress.total
                            ) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p>
                  Processing {progress.completed} of {progress.total}
                </p>
              </div>
            )}

            <button
              type="button"
              className="tb-primary-button"
              disabled={!canAnalyze}
              onClick={analyzeBatch}
            >
              {loading
                ? "Processing batch"
                : "Analyse batch"}
            </button>
          </div>
        </section>

        {(completedResults.length > 0 || failedCount > 0) && (
          <section className="tb-results">
            <div className="tb-section-heading">
              <div className="tb-step">
                02
              </div>
              <div>
                <h2>
                  Overall batch intelligence report
                </h2>
                <p>
                  Combined summary for every successfully analysed image in this batch.
                </p>
              </div>

              <button
                type="button"
                className="tb-secondary-button"
                onClick={downloadBatchReport}
              >
                Download overall batch report
              </button>
            </div>

            <div className="tb-summary">
              <article>
                <span>Successful</span>
                <strong>
                  {completedResults.length}
                </strong>
              </article>
              <article>
                <span>Reuse pathways</span>
                <strong>
                  {reuseCount}
                </strong>
              </article>
              <article>
                <span>Recycling pathways</span>
                <strong>
                  {recyclingCount}
                </strong>
              </article>
              <article>
                <span>Failed</span>
                <strong>
                  {failedCount}
                </strong>
              </article>
            </div>

            <div className="tb-table-wrap">
              <table className="tb-table">
                <thead>
                  <tr>
                    <th>Sample</th>
                    <th>Visual category</th>
                    <th>Assigned material</th>
                    <th>Condition</th>
                    <th>Recommendation</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Report</th>
                  </tr>
                </thead>

                <tbody>
                  {completedResults.map(
                    (item) => (
                      <tr key={item.uploadId}>
                        <td>
                          <div className="tb-table-sample">
                            <img
                              src={item.preview}
                              alt=""
                            />
                            <div>
                              <strong>
                                {item.name}
                              </strong>
                              <span>
                                {item.weight} kg
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {item.category}
                          </strong>
                          <small>
                            Class {item.classId} · {item.construction}
                          </small>
                        </td>

                        <td>
                          <span className="tb-material-pill">
                            Assigned · {item.material}
                          </span>
                          <small>
                            Application mapping
                          </small>
                        </td>

                        <td>
                          <strong>
                            {item.condition}
                          </strong>
                          <small>
                            {item.defect} · {item.severity}
                          </small>
                        </td>

                        <td>
                          <strong className="tb-recommendation">
                            {item.recommendation}
                          </strong>
                          <small>
                            {item.ruleName}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {item.sustainabilityScore ?? "—"}
                          </strong>
                          <small>
                            {item.circularityLevel}
                          </small>
                        </td>

                        <td>
                          <span className="tb-status-pill">
                            {item.assessmentStatus}
                          </span>
                        </td>

                        <td>
                          <div className="tb-report-actions">
                            <button
                              type="button"
                              className="tb-view-report"
                              onClick={() =>
                                setSelectedReport(
                                  item
                                )
                              }
                            >
                              View report
                            </button>

                            <button
                              type="button"
                              className="tb-download-report"
                              onClick={() =>
                                downloadIndividualReport(
                                  item
                                )
                              }
                            >
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <p className="tb-disclaimer">
              Assigned materials are fixed application-level assumptions for
              this academic prototype and are not fibre-composition labels
              supplied by TFD.
            </p>
          </section>
        )}
      </section>

      {selectedReport && (
        <div
          className="tb-report-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target
              === event.currentTarget
            ) {
              setSelectedReport(null);
            }
          }}
        >
          <section
            className="tb-report-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tb-report-title"
          >
            <header className="tb-report-header">
              <div>
                <span className="tb-report-kicker">
                  Individual assessment
                </span>
                <h2 id="tb-report-title">
                  Textile intelligence report
                </h2>
                <p>
                  Complete analysis for one sample from the current batch.
                </p>
              </div>

              <button
                type="button"
                className="tb-report-close"
                onClick={() =>
                  setSelectedReport(null)
                }
                aria-label="Close report"
              >
                ×
              </button>
            </header>

            <div className="tb-report-body">
              <section className="tb-report-profile">
                <img
                  src={selectedReport.preview}
                  alt={selectedReport.name}
                />

                <div>
                  <span className="tb-status-pill">
                    {selectedReport.assessmentStatus}
                  </span>

                  <h3>
                    {selectedReport.name}
                  </h3>

                  <p>
                    Assessment ID:{" "}
                    {selectedReport.uploadId
                      ?? "Not available"}
                  </p>

                  <div className="tb-report-highlights">
                    <article>
                      <span>Weight</span>
                      <strong>
                        {selectedReport.weight} kg
                      </strong>
                    </article>

                    <article>
                      <span>Confidence</span>
                      <strong>
                        {selectedReport.confidence}%
                      </strong>
                    </article>

                    <article>
                      <span>Score</span>
                      <strong>
                        {selectedReport.sustainabilityScore
                          ?? "—"}
                      </strong>
                    </article>
                  </div>
                </div>
              </section>

              <section className="tb-report-section">
                <div className="tb-report-section-title">
                  <span>01</span>
                  <div>
                    <h3>
                      Textile classification
                    </h3>
                    <p>
                      Visual model output and assigned material metadata.
                    </p>
                  </div>
                </div>

                <dl className="tb-report-grid">
                  <div>
                    <dt>Visual category</dt>
                    <dd>
                      {selectedReport.category}
                    </dd>
                  </div>

                  <div>
                    <dt>Class</dt>
                    <dd>
                      {selectedReport.classId}
                    </dd>
                  </div>

                  <div>
                    <dt>Construction</dt>
                    <dd>
                      {selectedReport.construction}
                    </dd>
                  </div>

                  <div>
                    <dt>Visual family</dt>
                    <dd>
                      {selectedReport.visualFamily}
                    </dd>
                  </div>

                  <div>
                    <dt>Assigned material</dt>
                    <dd>
                      {selectedReport.material}
                    </dd>
                  </div>

                  <div>
                    <dt>Material type</dt>
                    <dd>
                      {selectedReport.materialType}
                    </dd>
                  </div>

                  <div>
                    <dt>Material source</dt>
                    <dd>
                      {selectedReport.materialSource}
                    </dd>
                  </div>

                  <div>
                    <dt>Verification</dt>
                    <dd>
                      {selectedReport.verified
                        ? "Verified"
                        : selectedReport.provisional
                          ? "Provisional mapping"
                          : "Not verified"}
                    </dd>
                  </div>

                  <div className="tb-report-grid-wide">
                    <dt>
                      Likely fibre families
                    </dt>
                    <dd>
                      {selectedReport.likelyFibres.length
                        ? selectedReport.likelyFibres.join(
                            ", "
                          )
                        : "Not available"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="tb-report-section">
                <div className="tb-report-section-title">
                  <span>02</span>
                  <div>
                    <h3>
                      Condition assessment
                    </h3>
                    <p>
                      Defect, severity and contamination intelligence.
                    </p>
                  </div>
                </div>

                <dl className="tb-report-grid">
                  <div>
                    <dt>Condition</dt>
                    <dd>
                      {selectedReport.condition}
                    </dd>
                  </div>

                  <div>
                    <dt>Defect</dt>
                    <dd>
                      {selectedReport.defect}
                    </dd>
                  </div>

                  <div>
                    <dt>Severity</dt>
                    <dd>
                      {selectedReport.severity}
                    </dd>
                  </div>

                  <div>
                    <dt>Contamination</dt>
                    <dd>
                      {selectedReport.contamination}
                    </dd>
                  </div>

                  <div>
                    <dt>Affected area</dt>
                    <dd>
                      {selectedReport.affectedArea}%
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="tb-report-section">
                <div className="tb-report-section-title">
                  <span>03</span>
                  <div>
                    <h3>
                      Circular recovery decision
                    </h3>
                    <p>
                      Explainable recommendation generated by the decision engine.
                    </p>
                  </div>
                </div>

                <div className="tb-report-decision">
                  <span>
                    Recommended pathway
                  </span>
                  <strong>
                    {selectedReport.recommendation}
                  </strong>
                  <p>
                    {selectedReport.reason}
                  </p>
                </div>

                <dl className="tb-report-grid">
                  <div>
                    <dt>Recovery path</dt>
                    <dd>
                      {selectedReport.recoveryPath}
                    </dd>
                  </div>

                  <div>
                    <dt>Recovery category</dt>
                    <dd>
                      {selectedReport.recoveryCategory}
                    </dd>
                  </div>

                  <div>
                    <dt>Matched rule</dt>
                    <dd>
                      {selectedReport.ruleName}
                    </dd>
                  </div>

                  <div>
                    <dt>Circularity level</dt>
                    <dd>
                      {selectedReport.circularityLevel}
                    </dd>
                  </div>
                </dl>
              </section>

              <p className="tb-report-notice">
                Assigned materials are application-level assumptions for this
                academic prototype and are not laboratory fibre-composition
                labels supplied by TFD.
              </p>
            </div>

            <footer className="tb-report-footer">
              <button
                type="button"
                className="tb-report-cancel"
                onClick={() =>
                  setSelectedReport(null)
                }
              >
                Close
              </button>

              <button
                type="button"
                className="tb-report-download-main"
                onClick={() =>
                  downloadIndividualReport(
                    selectedReport
                  )
                }
              >
                Download this report
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}


export default UploadBatch;