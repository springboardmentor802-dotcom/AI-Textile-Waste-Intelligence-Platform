import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Inbox,
  AlertCircle,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";
import { getPredictionHistory, deletePredictionHistory } from "../services/api";
import { exportHistoryToCsv, exportHistoryToExcel, exportHistoryToPdf } from "../utils/historyExport";
import Topbar from "../components/Topbar";

import "./History.css";

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function recyclabilityBadgeClass(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "high") return "hist-badge hist-badge-high";
  if (normalized === "medium") return "hist-badge hist-badge-medium";
  if (normalized === "low") return "hist-badge hist-badge-low";
  return "hist-badge hist-badge-neutral";
}

function History() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- Export dropdown ---
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef(null);

  // --- Delete flow ---
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  // Close the export dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictionHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message || "Something went wrong while loading your history.");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = (item.material || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const itemDate = new Date(item.created_at);

      const matchesFrom = !fromDate || itemDate >= new Date(fromDate);
      const matchesTo = !toDate || itemDate <= new Date(`${toDate}T23:59:59`);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [history, searchTerm, fromDate, toDate]);

  const handleView = (item) => {
    setSelectedPrediction(item);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // --- Export ---
  const handleExport = async (format) => {
    setIsExportOpen(false);
    try {
      if (format === "csv") exportHistoryToCsv(filteredHistory);
      else if (format === "excel") await exportHistoryToExcel(filteredHistory);
      else if (format === "pdf") await exportHistoryToPdf(filteredHistory);
      alert(`Exported ${filteredHistory.length} record${filteredHistory.length === 1 ? "" : "s"} as ${format.toUpperCase()}.`);
    } catch (err) {
      alert(err.message || "Export failed. Please try again.");
    }
  };

  // --- Delete ---
  const handleDeleteClick = (item) => {
    setConfirmDeleteItem(item);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    const item = confirmDeleteItem;

    setDeletingId(item.id);
    try {
      await deletePredictionHistory(item.id);
      setHistory((prev) => prev.filter((h) => h.id !== item.id));
      alert("Prediction deleted successfully.");
    } catch (err) {
      alert(err.message || "Failed to delete this prediction.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteItem(null);
    }
  };

  const hasRecords = filteredHistory.length > 0;

  return (
    <div className="dash-shell">
      <Topbar />
      <div className="history-page">
        <div className="history-header">
        <h1>History</h1>
        <p>Review all your previous AI fabric predictions and recycling recommendations.</p>
      </div>

      {/* --- View details modal --- */}
      {showModal && selectedPrediction && (
        <div className="history-modal-overlay" onClick={closeModal}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Prediction Details</h2>

            <div className="history-modal-content">
              <div className="history-modal-left">
                {selectedPrediction.image_path ? (
                  <img
                    src={`http://localhost:8000/${selectedPrediction.image_path}`}
                    alt={selectedPrediction.material}
                    className="history-modal-image"
                  />
                ) : (
                  <div className="history-modal-image history-modal-image-placeholder">
                    <Eye size={24} />
                  </div>
                )}
              </div>

              <div className="history-modal-right">
                <div className="history-detail-row">
                  <strong>Material</strong>
                  <span>{selectedPrediction.material}</span>
                </div>
                <div className="history-detail-row">
                  <strong>Confidence</strong>
                  <span>{selectedPrediction.confidence}%</span>
                </div>
                <div className="history-detail-row">
                  <strong>Waste Category</strong>
                  <span>{selectedPrediction.waste_category}</span>
                </div>
                <div className="history-detail-row">
  <strong>Recyclability</strong>
  <span>{selectedPrediction.recyclability}</span>
</div>
                <div className="history-detail-row">
                  <strong>Date</strong>
                  <span>{formatDate(selectedPrediction.created_at)}</span>
                </div>
              </div>
            </div>

            <button type="button" className="history-modal-close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Delete confirmation dialog --- */}
      {confirmDeleteItem && (
        <div className="history-modal-overlay" onClick={handleCancelDelete}>
          <div
            className="history-confirm-modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="history-confirm-title"
          >
            <div className="history-confirm-icon">
              <Trash2 size={20} />
            </div>
            <p id="history-confirm-title" className="history-confirm-title">
              Delete this prediction?
            </p>
            <p className="history-confirm-subtitle">
              "{confirmDeleteItem.material}" from {formatDate(confirmDeleteItem.created_at)} will be
              permanently removed. This action cannot be undone.
            </p>
            <div className="history-confirm-actions">
              <button
                type="button"
                className="history-confirm-cancel-btn"
                onClick={handleCancelDelete}
                disabled={deletingId === confirmDeleteItem.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="history-confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={deletingId === confirmDeleteItem.id}
              >
                {deletingId === confirmDeleteItem.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Search + date filters + Export --- */}
      <div className="history-search-row">
        <input
          type="date"
          className="history-date-input"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          disabled={loading || !!error}
        />

        <input
          type="date"
          className="history-date-input"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          disabled={loading || !!error}
        />

        <div className="history-search-box">
          <Search size={16} className="history-search-icon" />
          <input
            type="text"
            placeholder="Search by material name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading || !!error}
          />
        </div>

        <div className="history-export-wrap" ref={exportMenuRef}>
          <button
            type="button"
            className="history-export-btn"
            onClick={() => setIsExportOpen((prev) => !prev)}
            disabled={loading || !!error || !hasRecords}
            aria-expanded={isExportOpen}
            aria-haspopup="menu"
          >
            <Download size={15} />
            Export
            <ChevronDown size={14} className={isExportOpen ? "history-export-chevron-open" : ""} />
          </button>

          {isExportOpen && (
            <div className="history-export-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => handleExport("csv")}>
                <FileText size={14} />
                CSV
              </button>
              <button type="button" role="menuitem" onClick={() => handleExport("excel")}>
                <FileSpreadsheet size={14} />
                Excel (.xlsx)
              </button>
              <button type="button" role="menuitem" onClick={() => handleExport("pdf")}>
                <FileDown size={14} />
                PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="history-table-card">
        {loading ? (
          <LoadingTable />
        ) : error ? (
          <div className="history-state">
            <div className="history-state-icon history-state-icon-error">
              <AlertCircle size={22} />
            </div>
            <p className="history-state-title">Couldn't load your history</p>
            <p className="history-state-subtitle">{error}</p>
            <button type="button" className="history-retry-btn" onClick={loadHistory}>
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="history-state">
            <div className="history-state-icon">
              <Inbox size={22} />
            </div>
            <p className="history-state-title">No predictions yet</p>
            <p className="history-state-subtitle">
              Run an AI Fabric Prediction and it will show up here.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="history-state">
            <div className="history-state-icon">
              <Search size={22} />
            </div>
            <p className="history-state-title">No matches found</p>
            <p className="history-state-subtitle">
              No predictions match your current filters. Try adjusting them.
            </p>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Confidence</th>
                  <th>Waste Category</th>
                  <th>Recyclability</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="history-material">{item.material}</span>
                    </td>
                    <td>
                      <div className="history-confidence-cell">
                        <div className="history-confidence-track">
                          <div
                            className="history-confidence-fill"
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span>{Number(item.confidence).toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="history-waste-category">{item.waste_category}</td>
                    <td>
                      <span className={recyclabilityBadgeClass(item.recyclability)}>
                        {item.recyclability}
                      </span>
                    </td>
                    <td className="history-date">{formatDate(item.created_at)}</td>
                    <td>
                      <div className="history-action-cell">
                        <button
                          type="button"
                          className="history-view-btn"
                          onClick={() => handleView(item)}
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          type="button"
                          className="history-delete-btn"
                          onClick={() => handleDeleteClick(item)}
                          disabled={deletingId === item.id}
                        >
                          <Trash2 size={14} />
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

function LoadingTable() {
  return (
    <div className="history-table-wrap">
      <table className="history-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Confidence</th>
            <th>Waste Category</th>
            <th>Recyclability</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 6 }).map((__, colIndex) => (
                <td key={colIndex}>
                  <div className="history-skeleton-cell" aria-hidden="true" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;