import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

const MATERIAL_CHOICES = ["Cotton", "Polyester", "Silk", "Wool", "Denim"];
const CONDITION_CHOICES = [
    "New Surplus", "Lightly Used", "Worn", "Damaged", "Contaminated",
];

// Maps the dashboard's inventory condition labels to the simple
// keywords the backend's scoring/categorization logic understands.
const CONDITION_TO_BACKEND = {
    "New Surplus": "excellent",
    "Lightly Used": "good",
    "Worn": "fair",
    "Damaged": "damaged",
    "Contaminated": "damaged",
};
const STATUS_CHOICES = [
    "Registered", "Collected", "In Processing", "Processed",
];

function Dashboard() {
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [predictCondition, setPredictCondition] = useState("Good");
    const [batchFiles, setBatchFiles] = useState([]);
    const [batchProcessing, setBatchProcessing] = useState(false);
    const [batchResults, setBatchResults] = useState([]);
    const [textiles, setTextiles] = useState([]);
    const [summary, setSummary] = useState(null);
    const [role, setRole] = useState(null);
    const [form, setForm] = useState({
        material_type: MATERIAL_CHOICES[0],
        quantity: "",
        color: "",
        source: "",
        condition: "Worn",
        status: "Registered",
        collection_date: "",
    });
    const [filters, setFilters] = useState({
        material: "",
        source: "",
        status: "",
    });
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadTextiles = (activeFilters = filters) => {
        const params = {};
        if (activeFilters.material) params.material = activeFilters.material;
        if (activeFilters.source) params.source = activeFilters.source;
        if (activeFilters.status) params.status = activeFilters.status;

        API.get("textiles/", { params })
            .then((response) => setTextiles(response.data))
            .catch((error) => console.error("Error fetching data:", error));
    };

    const loadSummary = () => {
        API.get("inventory-summary/")
            .then((response) => setSummary(response.data))
            .catch((error) => console.error("Error fetching summary:", error));
    };

    useEffect(() => {
        loadTextiles();
        loadSummary();
        API.get("me/")
            .then((response) => setRole(response.data.role))
            .catch((error) => console.error("Error fetching profile:", error));
    }, []);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImage(URL.createObjectURL(file));
        setPrediction(null);
    };

    const handlePredict = async () => {
        if (!imageFile) {
            alert("Please choose an image first.");
            return;
        }

        setPredicting(true);
        setPrediction(null);

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("condition", CONDITION_TO_BACKEND[predictCondition]);

        try {
            // waste-report/ runs all four engines together: image analysis,
            // material classification, waste categorization, and
            // recyclability assessment -- so Predict now shows everything
            // in one go, including the recycle/reuse recommendation.
            const response = await API.post("waste-report/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setPrediction({
                fabric_type: response.data.material_classification.predicted_fiber_type,
                confidence: response.data.material_classification.confidence,
                waste_category: response.data.waste_categorization.waste_category,
                waste_reason: response.data.waste_categorization.reason,
                circularity_score: response.data.recyclability_assessment.circularity_score,
                circularity_category: response.data.recyclability_assessment.circularity_category,
                image_analysis: response.data.image_analysis,
            });
        } catch (error) {
            console.error("Prediction failed:", error);
            alert(JSON.stringify(error.response?.data) || "Prediction failed.");
        } finally {
            setPredicting(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!imageFile) {
            alert("Please choose an image first.");
            return;
        }

        setDownloadingReport(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("condition", CONDITION_TO_BACKEND[predictCondition]);

        try {
            const response = await API.post("waste-report-pdf/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "waste_report.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Report download failed:", error);
            alert("Could not generate the report.");
        } finally {
            setDownloadingReport(false);
        }
    };

    const handleBatchFiles = (e) => {
        const files = Array.from(e.target.files);
        setBatchFiles(files);
    };

    const handleBatchDownload = async () => {
        if (batchFiles.length === 0) {
            alert("Please choose one or more images first.");
            return;
        }

        setBatchProcessing(true);
        setBatchResults([]);

        try {
            // Fetch per-item results so we can show a live table in the UI,
            // matching the same data the PDF download will contain.
            const perItemResults = await Promise.all(
                batchFiles.map(async (file) => {
                    const singleFormData = new FormData();
                    singleFormData.append("image", file);
                    singleFormData.append("condition", CONDITION_TO_BACKEND[predictCondition]);

                    const response = await API.post("waste-report/", singleFormData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });

                    return {
                        filename: file.name,
                        preview: URL.createObjectURL(file),
                        fabric_type: response.data.material_classification.predicted_fiber_type,
                        confidence: response.data.material_classification.confidence,
                        waste_category: response.data.waste_categorization.waste_category,
                        waste_reason: response.data.waste_categorization.reason,
                        circularity_score: response.data.recyclability_assessment.circularity_score,
                    };
                })
            );
            setBatchResults(perItemResults);

            // Now request the combined, downloadable PDF for all images.
            const pdfFormData = new FormData();
            batchFiles.forEach((file) => pdfFormData.append("images", file));
            pdfFormData.append("condition", CONDITION_TO_BACKEND[predictCondition]);

            const pdfResponse = await API.post("batch-waste-report-pdf/", pdfFormData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "batch_waste_report.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Batch report failed:", error);
            alert("Could not generate the batch report.");
        } finally {
            setBatchProcessing(false);
        }
    };

    const recommendationTone = (category) => {
        if (!category) return "neutral";
        const lower = category.toLowerCase();
        if (lower.includes("hazardous")) return "danger";
        if (lower.includes("reusable") || lower.includes("recyclable")) return "good";
        if (lower.includes("compostable") || lower.includes("upcyclable")) return "warn";
        return "neutral";
    };

    const canManageWaste =
        role === "Recycling Facility Operator" ||
        role === "Textile Manufacturer Administrator";

    const updateForm = (field) => (e) =>
        setForm({ ...form, [field]: e.target.value });

    const updateFilter = (field) => (e) => {
        const next = { ...filters, [field]: e.target.value };
        setFilters(next);
        loadTextiles(next);
    };

    const handleAddWaste = async (e) => {
        e.preventDefault();
        setFormError("");
        setSubmitting(true);
        try {
            await API.post("textiles/", {
                ...form,
                quantity: parseFloat(form.quantity),
                collection_date: form.collection_date || null,
            });
            setForm({
                material_type: MATERIAL_CHOICES[0],
                quantity: "",
                color: "",
                source: "",
                condition: "Worn",
                status: "Registered",
                collection_date: "",
            });
            loadTextiles();
            loadSummary();
        } catch (error) {
            setFormError(
                JSON.stringify(error.response?.data) || "Could not add waste batch."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.patch(`textiles/${id}/`, { status: newStatus });
            loadTextiles();
            loadSummary();
        } catch (error) {
            alert(JSON.stringify(error.response?.data) || "Could not update status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this waste batch? This cannot be undone.")) return;
        try {
            await API.delete(`textiles/${id}/`);
            loadTextiles();
            loadSummary();
        } catch (error) {
            alert(JSON.stringify(error.response?.data) || "Could not delete batch.");
        }
    };

    return (
        <div className="dash-page">
            <div className="dash-container">
                <div className="dash-header-row">
                    <div>
                        <h1 className="dash-title">Textile waste dashboard</h1>
                        <p className="dash-subtitle">
                            Classify incoming waste and manage your inventory.
                        </p>
                    </div>
                    <Link to="/sustainability" className="btn-primary">
                        View Sustainability Dashboard
                    </Link>
                </div>

                <div className="dash-card">
                    <h3>Image analysis</h3>
                    <div className="upload-row">
                        <label className="file-input-label">
                            Choose image
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                style={{ display: "none" }}
                            />
                        </label>
                        {image && (
                            <img src={image} alt="Preview" className="preview-img" />
                        )}
                        <select
                            className="condition-select"
                            value={predictCondition}
                            onChange={(e) => setPredictCondition(e.target.value)}
                        >
                            {CONDITION_CHOICES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <button
                            className="btn-primary"
                            onClick={handlePredict}
                            disabled={predicting}
                        >
                            {predicting ? "Analyzing…" : "Predict"}
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleDownloadReport}
                            disabled={downloadingReport}
                        >
                            {downloadingReport ? "Generating…" : "Download Report (PDF)"}
                        </button>
                    </div>

                    {prediction && (
                        <div className="report-panel">
                            <div className="report-panel-header">
                                <h4>AI Analysis Report</h4>
                                <span className="status-pill status-pill-done">Completed</span>
                            </div>

                            <div className="report-hero">
                                {image && (
                                    <img src={image} alt="Analyzed fabric" className="report-hero-img" />
                                )}
                                <div className="report-hero-info">
                                    <span className="report-hero-label">Detected Material</span>
                                    <span className="report-hero-value">
                                        {prediction.fabric_type}
                                    </span>
                                    <span className="report-hero-sub">
                                        Confidence {prediction.confidence}%
                                    </span>
                                </div>
                            </div>

                            <h4 className="report-section-title">Material Intelligence</h4>
                            <div className="report-card-grid">
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Fabric Type</span>
                                    <span className="report-mini-value">{prediction.fabric_type}</span>
                                </div>
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Confidence</span>
                                    <span className="report-mini-value">{prediction.confidence}%</span>
                                </div>
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Texture</span>
                                    <span className="report-mini-value">
                                        {prediction.image_analysis?.texture_analysis?.texture_complexity}
                                    </span>
                                </div>
                            </div>

                            <h4 className="report-section-title">Textile Condition Assessment</h4>
                            <div className="report-card-grid">
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Contamination</span>
                                    <span className="report-mini-value">
                                        {prediction.image_analysis?.damage_contamination_check?.contamination_suspected
                                            ? "Suspected"
                                            : "None Detected"}
                                    </span>
                                </div>
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Brightness</span>
                                    <span className="report-mini-value">
                                        {prediction.image_analysis?.brightness_analysis?.brightness_level}
                                    </span>
                                </div>
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Condition Used</span>
                                    <span className="report-mini-value">{predictCondition}</span>
                                </div>
                            </div>

                            <div className={`report-recommendation report-rec-${recommendationTone(prediction.waste_category)}`}>
                                <span className="report-hero-label">Circularity Recommendation</span>
                                <span className="report-recommendation-value">
                                    {prediction.waste_category}
                                </span>
                                <span className="report-hero-sub">{prediction.waste_reason}</span>
                            </div>

                            <h4 className="report-section-title">Recyclability</h4>
                            <div className="report-card-grid">
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Circularity Index</span>
                                    <span className="report-mini-value report-mini-value-accent">
                                        {prediction.circularity_score}%
                                    </span>
                                </div>
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Category</span>
                                    <span className="report-mini-value">{prediction.circularity_category}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="dash-card">
                    <h3>Batch analysis</h3>
                    <p className="batch-hint">
                        Select multiple images to analyze them all at once and
                        download one combined, shareable PDF report.
                    </p>
                    <div className="upload-row">
                        <label className="file-input-label">
                            Choose images
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleBatchFiles}
                                style={{ display: "none" }}
                            />
                        </label>
                        {batchFiles.length > 0 && (
                            <span className="batch-file-count">
                                {batchFiles.length} image{batchFiles.length > 1 ? "s" : ""} selected
                            </span>
                        )}
                        <button
                            className="btn-primary"
                            onClick={handleBatchDownload}
                            disabled={batchProcessing}
                        >
                            {batchProcessing
                                ? "Processing batch…"
                                : "Analyze Batch & Download PDF"}
                        </button>
                    </div>

                    {batchResults.length > 0 && (
                        <div className="batch-results">
                            <div className="batch-stats-row">
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Total Samples</span>
                                    <span className="report-mini-value">{batchResults.length}</span>
                                </div>
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Reusable Items</span>
                                    <span className="report-mini-value">
                                        {batchResults.filter((r) => r.waste_category === "Reusable").length}
                                    </span>
                                </div>
                                <div className="report-mini-card">
                                    <span className="report-mini-label">Recyclable Items</span>
                                    <span className="report-mini-value">
                                        {batchResults.filter((r) => r.waste_category === "Recyclable").length}
                                    </span>
                                </div>
                            </div>

                            <table className="batch-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Material</th>
                                        <th>Confidence</th>
                                        <th>Score</th>
                                        <th>Decision</th>
                                        <th>Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchResults.map((row, i) => (
                                        <tr key={i}>
                                            <td>
                                                <img src={row.preview} alt={row.filename} className="batch-table-thumb" />
                                            </td>
                                            <td style={{ textTransform: "capitalize" }}>{row.fabric_type}</td>
                                            <td>{row.confidence}%</td>
                                            <td>{row.circularity_score}</td>
                                            <td>
                                                <span className={`decision-pill decision-${recommendationTone(row.waste_category)}`}>
                                                    {row.waste_category}
                                                </span>
                                            </td>
                                            <td className="batch-table-reason">{row.waste_reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {summary && (
                    <div className="dash-card">
                        <h3>Inventory monitoring</h3>
                        <div className="summary-stats">
                            <div className="stat-box">
                                <span className="stat-number">{summary.total_batches}</span>
                                <span className="stat-label">Total batches</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-number">{summary.total_quantity} kg</span>
                                <span className="stat-label">Total quantity</span>
                            </div>
                        </div>
                        <div className="summary-breakdown">
                            <div>
                                <h4>By material</h4>
                                {summary.by_material.map((row) => (
                                    <div className="breakdown-row" key={row.material_type}>
                                        <span>{row.material_type}</span>
                                        <span>{row.quantity} kg ({row.count})</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h4>By status</h4>
                                {summary.by_status.map((row) => (
                                    <div className="breakdown-row" key={row.status}>
                                        <span>{row.status}</span>
                                        <span>{row.quantity} kg ({row.count})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {canManageWaste && (
                    <div className="dash-card">
                        <h3>Register new waste batch</h3>
                        {formError && <div className="form-error">{formError}</div>}
                        <form onSubmit={handleAddWaste}>
                            <div className="form-grid">
                                <select
                                    value={form.material_type}
                                    onChange={updateForm("material_type")}
                                >
                                    {MATERIAL_CHOICES.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="Quantity (kg)"
                                    value={form.quantity}
                                    onChange={updateForm("quantity")}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Color"
                                    value={form.color}
                                    onChange={updateForm("color")}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Source"
                                    value={form.source}
                                    onChange={updateForm("source")}
                                    required
                                />
                                <select
                                    value={form.condition}
                                    onChange={updateForm("condition")}
                                >
                                    {CONDITION_CHOICES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <select
                                    value={form.status}
                                    onChange={updateForm("status")}
                                >
                                    {STATUS_CHOICES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={form.collection_date}
                                    onChange={updateForm("collection_date")}
                                />
                            </div>
                            <button className="btn-primary" type="submit" disabled={submitting}>
                                {submitting ? "Saving…" : "Add waste batch"}
                            </button>
                        </form>
                    </div>
                )}

                <div className="dash-card">
                    <h3>Textile inventory</h3>

                    <div className="filter-row">
                        <select value={filters.material} onChange={updateFilter("material")}>
                            <option value="">All materials</option>
                            {MATERIAL_CHOICES.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select value={filters.status} onChange={updateFilter("status")}>
                            <option value="">All statuses</option>
                            {STATUS_CHOICES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Filter by source…"
                            value={filters.source}
                            onChange={updateFilter("source")}
                        />
                    </div>

                    {textiles.length === 0 && (
                        <div className="empty-note">No waste batches match your filters.</div>
                    )}
                    <ul className="batch-list">
                        {textiles.map((item) => (
                            <li key={item.id} className="batch-item">
                                <span className="batch-id-chip">{item.batch_id}</span>
                                <span>{item.material_type}</span>
                                <span>{item.quantity} kg</span>
                                <span>{item.color}</span>
                                <span>{item.source}</span>
                                <span>{item.condition}</span>
                                {item.collection_date && (
                                    <span>collected {item.collection_date}</span>
                                )}

                                {canManageWaste ? (
                                    <>
                                        <select
                                            className="status-select"
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                        >
                                            {STATUS_CHOICES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <span className="status-chip">{item.status}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;