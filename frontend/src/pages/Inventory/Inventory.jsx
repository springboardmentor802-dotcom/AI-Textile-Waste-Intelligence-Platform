import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaBoxes,
  FaCheckCircle,
  FaFilter,
  FaPen,
  FaPlus,
  FaRecycle,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrashAlt,
  FaWeightHanging,
} from "react-icons/fa";

import {
  addInventory,
  deleteInventory,
  getInventory,
  updateInventory,
} from "../../services/inventoryService";

import "./Inventory.css";

const EMPTY_FORM = {
  batch_id: "",
  material_profile: "",
  waste_origin: "",
  condition_grade: "",
  recovery_potential: "",
  processing_status: "",
  waste_weight: "",
};

const MATERIAL_OPTIONS = [
  "Cotton",
  "Polyester",
  "Wool",
  "Silk",
  "Denim",
  "Nylon",
  "Linen",
  "Viscose",
  "Rayon",
  "Acrylic",
  "Hemp",
  "Jute",
  "Mixed Fabric",
];

const ORIGIN_OPTIONS = [
  "Factory Scrap",
  "Garment Unit",
  "Consumer Return",
  "Collection Centre",
  "Retail Surplus",
  "Post-Consumer Waste",
];

const CONDITION_OPTIONS = [
  "Grade A",
  "Grade B",
  "Grade C",
];

const RECOVERY_OPTIONS = [
  "Reuse",
  "Repair",
  "Upcycle",
  "Recycle",
  "Downcycle",
];

const STATUS_OPTIONS = [
  "Collected",
  "Sorting",
  "Processing",
  "Completed",
];

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.inventory)) return response.inventory;
  return [];
};

const normalizeItem = (item) => ({
  id: item?.textile_id ?? item?.id,
  batch_id: item?.batch_id || "Unlabelled",
  material_profile: item?.material_profile || "Unknown",
  waste_origin: item?.waste_origin || "Not specified",
  condition_grade: item?.condition_grade || "Not graded",
  recovery_potential: item?.recovery_potential || "Not assessed",
  processing_status: item?.processing_status || "Collected",
  waste_weight: Number(item?.waste_weight) || 0,
});

const getErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((entry) => entry?.msg)
      .filter(Boolean)
      .join(" ");
  }

  return fallback;
};

const statusClassName = (status) =>
  String(status || "Collected")
    .toLowerCase()
    .replaceAll(" ", "-");

function Inventory() {
  const [inventoryData, setInventoryData] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");

  const loadInventory = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPageError("");

    try {
      const response = await getInventory();

      setInventoryData(
        normalizeList(response)
          .map(normalizeItem)
          .filter((item) => item.id !== undefined && item.id !== null),
      );
    } catch (requestError) {
      setPageError(
        getErrorMessage(
          requestError,
          "Inventory records could not be loaded.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (!showModal) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        setShowModal(false);
        setEditId(null);
        setFormData(EMPTY_FORM);
        setModalError("");
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showModal, saving]);

  const resetModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData(EMPTY_FORM);
    setModalError("");
  };

  const openCreateModal = () => {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setModalError("");
    setMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetModal();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (modalError) {
      setModalError("");
    }
  };

  const validateForm = () => {
    const trimmedBatchId = formData.batch_id.trim();
    const weight = Number(formData.waste_weight);

    if (!trimmedBatchId) {
      return "Batch reference is required.";
    }

    if (
      !formData.material_profile ||
      !formData.waste_origin ||
      !formData.condition_grade ||
      !formData.recovery_potential ||
      !formData.processing_status
    ) {
      return "Complete all inventory fields before saving.";
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      return "Waste weight must be greater than zero.";
    }

    return "";
  };

  const submitForm = async (event) => {
    event.preventDefault();

    setModalError("");
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      setModalError(validationError);
      return;
    }

    const payload = {
      ...formData,
      batch_id: formData.batch_id.trim(),
      waste_weight: Number(formData.waste_weight),
    };

    setSaving(true);

    try {
      if (editId !== null) {
        await updateInventory(editId, payload);
        setMessage("Textile batch updated successfully.");
      } else {
        await addInventory(payload);
        setMessage("Textile batch registered successfully.");
      }

      resetModal();
      await loadInventory({ silent: true });
    } catch (requestError) {
      setModalError(
        getErrorMessage(
          requestError,
          editId !== null
            ? "The textile batch could not be updated."
            : "The textile batch could not be registered.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const editEntry = (item) => {
    setFormData({
      batch_id: item.batch_id,
      material_profile: item.material_profile,
      waste_origin: item.waste_origin,
      condition_grade: item.condition_grade,
      recovery_potential: item.recovery_potential,
      processing_status: item.processing_status,
      waste_weight: String(item.waste_weight),
    });

    setEditId(item.id);
    setModalError("");
    setMessage("");
    setShowModal(true);
  };

  const deleteEntry = async (item) => {
    const confirmed = window.confirm(
      `Delete batch ${item.batch_id}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setPageError("");
    setMessage("");

    try {
      await deleteInventory(item.id);
      setMessage(`Batch ${item.batch_id} was deleted.`);
      await loadInventory({ silent: true });
    } catch (requestError) {
      setPageError(
        getErrorMessage(
          requestError,
          "The textile batch could not be deleted.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const filteredData = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inventoryData.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.batch_id,
          item.material_profile,
          item.waste_origin,
          item.processing_status,
          item.recovery_potential,
          item.condition_grade,
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(normalizedSearch),
        );

      const matchesStatus =
        statusFilter === "All" ||
        item.processing_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventoryData, search, statusFilter]);

  const totalWeight = useMemo(
    () =>
      inventoryData.reduce(
        (sum, item) => sum + item.waste_weight,
        0,
      ),
    [inventoryData],
  );

  const recoveryCount = useMemo(
    () =>
      inventoryData.filter((item) =>
        ["reuse", "repair", "recycle", "downcycle"].includes(
          String(item.recovery_potential).toLowerCase(),
        ),
      ).length,
    [inventoryData],
  );

  const completedCount = useMemo(
    () =>
      inventoryData.filter(
        (item) =>
          String(item.processing_status).toLowerCase() === "completed",
      ).length,
    [inventoryData],
  );

  const hasActiveFilters =
    search.trim().length > 0 || statusFilter !== "All";

  return (
    <main className="inv-page">
      <section className="inv-hero">
        <div>
          <span className="inv-eyebrow">
            Textile operations workspace
          </span>

          <h1>Every batch has a recovery journey.</h1>

          <p>
            Organise textile waste by material profile, source, condition,
            recovery potential and processing stage.
          </p>
        </div>

        <button
          type="button"
          className="inv-add-button"
          onClick={openCreateModal}
        >
          <FaPlus />
          Register new batch
        </button>
      </section>

      {message && (
        <div className="inv-alert inv-alert-success">
          <FaCheckCircle />

          <p>{message}</p>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {pageError && (
        <div className="inv-alert inv-alert-error">
          <span>!</span>

          <p>{pageError}</p>

          <button
            type="button"
            onClick={() => setPageError("")}
            aria-label="Dismiss error"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <section className="inv-metrics">
        <article className="inv-metric inv-metric-dark">
          <div>
            <FaBoxes />
          </div>

          <span>Total batches</span>
          <strong>{inventoryData.length}</strong>
          <p>Registered textile-waste lots</p>
        </article>

        <article className="inv-metric">
          <div>
            <FaWeightHanging />
          </div>

          <span>Tracked weight</span>
          <strong>
            {totalWeight.toFixed(1)}
            <small> kg</small>
          </strong>
          <p>Combined recorded waste weight</p>
        </article>

        <article className="inv-metric">
          <div>
            <FaRecycle />
          </div>

          <span>Recovery pipeline</span>
          <strong>{recoveryCount}</strong>
          <p>Reuse, repair, recycle or downcycle</p>
        </article>

        <article className="inv-metric">
          <div>
            <FaCheckCircle />
          </div>

          <span>Completed batches</span>
          <strong>{completedCount}</strong>
          <p>Finished processing lifecycle</p>
        </article>
      </section>

      <section className="inv-panel">
        <div className="inv-panel-heading">
          <div>
            <span className="inv-section-label">
              Inventory registry
            </span>

            <h2>Textile waste batches</h2>

            <p>
              Showing {filteredData.length} of {inventoryData.length} records
            </p>
          </div>

          <div className="inv-tools">
            <label className="inv-search">
              <FaSearch />

              <input
                type="search"
                placeholder="Search batch, material or origin"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="inv-filter">
              <FaFilter />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by processing status"
              >
                <option value="All">All statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="inv-refresh-button"
              onClick={() => loadInventory({ silent: true })}
              disabled={refreshing}
              aria-label="Refresh inventory"
            >
              <FaSyncAlt className={refreshing ? "is-spinning" : ""} />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="inv-loading">
            <div className="inv-loader" />
            <p>Loading textile inventory</p>
          </div>
        ) : filteredData.length ? (
          <div className="inv-grid">
            {filteredData.map((item) => (
              <article
                className="inv-batch-card"
                key={item.id}
              >
                <div className="inv-card-top">
                  <div>
                    <span>Batch reference</span>
                    <h3>{item.batch_id}</h3>
                  </div>

                  <span
                    className={`inv-status inv-status-${statusClassName(
                      item.processing_status,
                    )}`}
                  >
                    {item.processing_status}
                  </span>
                </div>

                <div className="inv-material">
                  <div>
                    <span>Material profile</span>
                    <strong>{item.material_profile}</strong>
                  </div>

                  <div>
                    <span>Weight</span>
                    <strong>{item.waste_weight.toFixed(2)} kg</strong>
                  </div>
                </div>

                <div className="inv-card-details">
                  <div>
                    <span>Waste origin</span>
                    <strong>{item.waste_origin}</strong>
                  </div>

                  <div>
                    <span>Condition</span>
                    <strong>{item.condition_grade}</strong>
                  </div>

                  <div>
                    <span>Recovery pathway</span>
                    <strong className="inv-recovery">
                      {item.recovery_potential}
                    </strong>
                  </div>
                </div>

                <div className="inv-card-actions">
                  <button
                    type="button"
                    className="inv-edit"
                    onClick={() => editEntry(item)}
                  >
                    <FaPen />
                    Edit batch
                  </button>

                  <button
                    type="button"
                    className="inv-delete"
                    onClick={() => deleteEntry(item)}
                    disabled={deletingId === item.id}
                    aria-label={`Delete batch ${item.batch_id}`}
                  >
                    <FaTrashAlt />
                    {deletingId === item.id ? "Deleting" : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="inv-empty">
            <FaBoxes />

            <h3>
              {hasActiveFilters
                ? "No matching batches"
                : "No inventory batches yet"}
            </h3>

            <p>
              {hasActiveFilters
                ? "Adjust or clear the current filters to see other inventory records."
                : "Register the first textile-waste batch to begin tracking its recovery journey."}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
              >
                Register batch
              </button>
            )}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="inv-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className="inv-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-modal-title"
          >
            <div className="inv-modal-header">
              <div>
                <span className="inv-section-label">
                  {editId !== null
                    ? "Update registry"
                    : "New registry entry"}
                </span>

                <h2 id="inventory-modal-title">
                  {editId !== null
                    ? "Edit textile batch"
                    : "Register textile batch"}
                </h2>

                <p>
                  Record operational details for this textile-waste lot.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
              >
                <FaTimes />
              </button>
            </div>

            {modalError && (
              <div className="inv-modal-error">
                {modalError}
              </div>
            )}

            <form onSubmit={submitForm}>
              <div className="inv-form-grid">
                <label>
                  <span>Batch reference</span>

                  <input
                    name="batch_id"
                    placeholder="Example: TX-2026-001"
                    value={formData.batch_id}
                    onChange={handleChange}
                    maxLength={60}
                    autoComplete="off"
                    required
                  />
                </label>

                <label>
                  <span>Material profile</span>

                  <select
                    name="material_profile"
                    value={formData.material_profile}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select material</option>

                    {MATERIAL_OPTIONS.map((material) => (
                      <option
                        key={material}
                        value={material}
                      >
                        {material}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Waste origin</span>

                  <select
                    name="waste_origin"
                    value={formData.waste_origin}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select origin</option>

                    {ORIGIN_OPTIONS.map((origin) => (
                      <option
                        key={origin}
                        value={origin}
                      >
                        {origin}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Condition grade</span>

                  <select
                    name="condition_grade"
                    value={formData.condition_grade}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select grade</option>

                    {CONDITION_OPTIONS.map((grade) => (
                      <option
                        key={grade}
                        value={grade}
                      >
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Recovery potential</span>

                  <select
                    name="recovery_potential"
                    value={formData.recovery_potential}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select pathway</option>

                    {RECOVERY_OPTIONS.map((recovery) => (
                      <option
                        key={recovery}
                        value={recovery}
                      >
                        {recovery}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Processing status</span>

                  <select
                    name="processing_status"
                    value={formData.processing_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select status</option>

                    {STATUS_OPTIONS.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inv-weight-field">
                  <span>Waste weight (kg)</span>

                  <input
                    type="number"
                    name="waste_weight"
                    placeholder="Example: 25.5"
                    value={formData.waste_weight}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>
              </div>

              <div className="inv-modal-actions">
                <button
                  type="button"
                  className="inv-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inv-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving batch"
                    : editId !== null
                      ? "Update batch"
                      : "Register batch"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Inventory;