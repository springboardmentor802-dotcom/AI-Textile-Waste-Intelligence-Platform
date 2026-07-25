import { useState, useEffect } from "react";
import API from "../services/api";
import "./Dashboard.css";

const MATERIAL_CHOICES = ["Cotton", "Polyester", "Silk", "Wool", "Denim"];
const CONDITION_CHOICES = [
    "New Surplus", "Lightly Used", "Worn", "Damaged", "Contaminated",
];
const STATUS_CHOICES = [
    "Registered", "Collected", "In Processing", "Processed",
];

function Dashboard() {
    const [image, setImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [batchFiles, setBatchFiles] = useState([]);
    const [batchProcessing, setBatchProcessing] = useState(false);
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

        try {
            const analysisFormData = new FormData();
            analysisFormData.append("image", imageFile);

            const materialFormData = new FormData();
            materialFormData.append("image", imageFile);

            // Run both endpoints together so we get the fabric name
            // AND the visual analysis in one Predict click.
            const [analysisResponse, materialResponse] = await Promise.all([
                API.post("analyze-image/", analysisFormData, {
                    headers: { "Content-Type": "multipart/form-data" },
                }),
                API.post("classify-material/", materialFormData, {
                    headers: { "Content-Type": "multipart/form-data" },
                }),
            ]);

            setPrediction({
                fabric_type: materialResponse.data.predicted_fiber_type,
                confidence: materialResponse.data.confidence,
                ...analysisResponse.data,
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
        const condition = prompt(
            "Enter condition (e.g. good, fair, damaged):",
            "good"
        );
        if (!condition) return;

        setDownloadingReport(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("condition", condition);

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
        const condition = prompt(
            "Enter condition to apply to ALL images (e.g. good, fair, damaged):",
            "good"
        );
        if (!condition) return;

        setBatchProcessing(true);
        const formData = new FormData();
        batchFiles.forEach((file) => formData.append("images", file));
        formData.append("condition", condition);

        try {
            const response = await API.post("batch-waste-report-pdf/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
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
                <h1 className="dash-title">Textile waste dashboard</h1>
                <p className="dash-subtitle">
                    Classify incoming waste and manage your inventory.
                </p>

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
                        <div className="prediction-result">
                            <div className="fabric-name-banner">
                                <span className="fabric-name-label">Predicted Fabric</span>
                                <span className="fabric-name-value">
                                    {prediction.fabric_type}
                                </span>
                                <span className="fabric-name-confidence">
                                    {prediction.confidence}% confidence
                                </span>
                            </div>

                            {Object.entries(prediction)
                                .filter(([key]) => key !== "fabric_type" && key !== "confidence")
                                .map(([key, value]) => (
                                    <div key={key} style={{ marginBottom: "0.75rem" }}>
                                        <h4 style={{ marginBottom: "0.25rem" }}>{key}</h4>
                                        {typeof value === "object" && value !== null ? (
                                            Object.entries(value).map(([subKey, subValue]) => (
                                                <div className="breakdown-row" key={subKey}>
                                                    <span>{subKey}</span>
                                                    <span>{String(subValue)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="breakdown-row">
                                                <span>{String(value)}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
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