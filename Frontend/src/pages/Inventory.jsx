import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Filter,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import Topbar from '../components/Topbar';
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryList,
  updateInventoryItem,
} from '../services/api';
import { paletteVars } from '../constants/palette';
import './Inventory.css';

const FABRIC_TYPES = [
  'Cotton',
  'Polyester',
  'Wool',
  'Silk',
  'Linen',
  'Denim',
  'Nylon',
  'Rayon',
  'Acrylic',
  'Mixed Fabrics',
];

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

const CONDITION_COLORS = {
  Excellent: '#3E7A80',
  Good: '#B79A25',
  Fair: '#8D7EB4',
  Poor: '#B85F8F',
  Damaged: '#75649D',
};

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function Inventory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [fabricFilter, setFabricFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const [fabricType, setFabricType] = useState(FABRIC_TYPES[0]);
  const [source, setSource] = useState('');
  const [quantity, setQuantity] = useState('');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [collectionDate, setCollectionDate] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editCondition, setEditCondition] = useState('');

  async function loadInventory() {
    try {
      setError('');
      const data = await getInventoryList();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory.');
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  function resetForm() {
    setFabricType(FABRIC_TYPES[0]);
    setSource('');
    setQuantity('');
    setColor('');
    setCondition(CONDITIONS[0]);
    setCollectionDate('');
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setSuccessMessage('');

  try {
    // Generate the next Batch ID automatically
    const nextBatchNumber =
      items.reduce((max, item) => {
        const number = parseInt(
          String(item.batch_id || '').replace(/\D/g, ''),
          10
        );

        return Number.isNaN(number) ? max : Math.max(max, number);
      }, 0) + 1;

    const generatedBatchId = String(nextBatchNumber).padStart(3, '0');

    await createInventoryItem({
      batch_id: generatedBatchId,
      fabric_type: fabricType,
      source,
      quantity: parseFloat(quantity),
      color,
      condition,
      collection_date: collectionDate || null,
    });

    

    resetForm();
    setShowAddModal(false);
    await loadInventory();
  } catch (err) {
    console.error('Add Material error:', err);
    setError(err.message || 'Failed to create inventory item.');
  }
}

  function startEdit(item) {
    setEditingId(item.id);
    setEditQuantity(item.quantity);
    setEditCondition(item.condition || CONDITIONS[0]);
    setSuccessMessage('');
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditQuantity('');
    setEditCondition('');
  }

  async function saveEdit(id) {
    try {
      setError('');
      await updateInventoryItem(id, {
        quantity: parseFloat(editQuantity),
        condition: editCondition,
      });

      setEditingId(null);
      setSuccessMessage('Batch updated successfully.');
      await loadInventory();
    } catch (err) {
      setError(err.message || 'Failed to update inventory item.');
    }
  }

  async function handleDelete(id, label) {
    const confirmed = window.confirm(
      `Delete batch "${label}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError('');
      await deleteInventoryItem(id);
      setSuccessMessage(`Batch "${label}" deleted.`);
      await loadInventory();
    } catch (err) {
      setError(err.message || 'Failed to delete inventory item.');
    }
  }

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.batch_id || '').toLowerCase().includes(query) ||
        String(item.fabric_type || '').toLowerCase().includes(query) ||
        String(item.source || '').toLowerCase().includes(query);

      const matchesFabric =
        fabricFilter === 'All' || item.fabric_type === fabricFilter;

      const matchesCondition =
        conditionFilter === 'All' || item.condition === conditionFilter;

      return matchesSearch && matchesFabric && matchesCondition;
    });
  }, [items, search, fabricFilter, conditionFilter]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items]
  );

  const goodQuantity = useMemo(
    () =>
      items
        .filter((item) => item.condition === 'Good')
        .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    [items]
  );

  const fabricDistribution = useMemo(() => {
    const counts = {};

    items.forEach((item) => {
      const key = item.fabric_type || 'Unknown';
      counts[key] = (counts[key] || 0) + (Number(item.quantity) || 0);
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const conditionDistribution = useMemo(() => {
    const counts = {};

    items.forEach((item) => {
      const key = item.condition || 'Unknown';
      counts[key] = (counts[key] || 0) + (Number(item.quantity) || 0);
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const uniqueFabricTypes = new Set(
    items.map((item) => item.fabric_type).filter(Boolean)
  ).size;

  const goodPercentage =
    totalQuantity > 0 ? Math.round((goodQuantity / totalQuantity) * 100) : 0;

  const fabricTotal =
    fabricDistribution.reduce((sum, entry) => sum + entry.value, 0) || 1;

  const conditionTotal =
    conditionDistribution.reduce((sum, entry) => sum + entry.value, 0) || 1;

  function buildDonutGradient(distribution, total, colors) {
    if (!distribution.length) return '#E8F2F0';

    let current = 0;
    const stops = distribution.map((entry, index) => {
      const start = current;
      current += (entry.value / total) * 100;
      return `${colors[index % colors.length]} ${start}% ${current}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  const fabricColors = ['#3E7A80', '#B85F8F', '#B79A25', '#75649D'];
  const conditionColors = ['#B79A25', '#75649D', '#3E7A80', '#B85F8F'];

  const clearFilters = () => {
    setSearch('');
    setFabricFilter('All');
    setConditionFilter('All');
  };

  return (
    <div className="dash-shell inventory-shell">
      <Topbar />

      <main className="dash-page inventory-page" style={paletteVars('teal')}>
        

        <div className="inventory-actions">
          <div>
            <h2>Inventory Overview</h2>
            <p>View, understand and manage the textile materials recorded in your inventory.</p>
          </div>

          <button
            type="button"
            className="inventory-add-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={17} />
            Add Material
          </button>
        </div>

        <section className="inventory-kpi-grid">
          <article className="inventory-kpi inventory-kpi-teal">
            <span className="inventory-kpi-icon">
              <Package size={22} />
            </span>
            <div>
              <h3>Total Batches</h3>
              <strong>{items.length}</strong>
              <p>All recorded batches</p>
            </div>
          </article>

          <article className="inventory-kpi inventory-kpi-magenta">
            <span className="inventory-kpi-icon">
              <Package size={22} />
            </span>
            <div>
              <h3>Total Quantity</h3>
              <strong>{totalQuantity.toFixed(1)} kg</strong>
              <p>Across all batches</p>
            </div>
          </article>

          <article className="inventory-kpi inventory-kpi-golden">
            <span className="inventory-kpi-icon">
              <Package size={22} />
            </span>
            <div>
              <h3>Good Condition</h3>
              <strong>{goodQuantity.toFixed(1)} kg</strong>
              <p>{goodPercentage}% of total quantity</p>
            </div>
          </article>

          <article className="inventory-kpi inventory-kpi-lavender">
            <span className="inventory-kpi-icon">
              <Package size={22} />
            </span>
            <div>
              <h3>Fabric Types</h3>
              <strong>{uniqueFabricTypes}</strong>
              <p>Unique fabric types</p>
            </div>
          </article>
        </section>

        <section className="inventory-overview-card">
          <div className="inventory-section-heading">
            <div>
              <h2>Inventory Overview</h2>
              <p>A summary of the materials currently recorded in your inventory.</p>
            </div>
          </div>

          <div className="inventory-chart-grid">
            <article className="inventory-chart-card">
              <h3>Material Distribution <span>(by quantity)</span></h3>

              <div className="inventory-chart-content">
                <div
                  className="inventory-donut"
                  style={{
                    background: buildDonutGradient(
                      fabricDistribution,
                      fabricTotal,
                      fabricColors
                    ),
                  }}
                >
                  <div className="inventory-donut-hole">
                    <strong>{totalQuantity.toFixed(1)}</strong>
                    <span>kg</span>
                  </div>
                </div>

                <div className="inventory-legend">
                  {fabricDistribution.slice(0, 5).map((entry, index) => {
                    const percentage = Math.round((entry.value / fabricTotal) * 100);

                    return (
                      <div className="inventory-legend-row" key={entry.name}>
                        <span
                          className="inventory-legend-dot"
                          style={{ background: fabricColors[index % fabricColors.length] }}
                        />
                        <div>
                          <strong>{entry.name}</strong>
                          <span>
                            {entry.value.toFixed(1)} kg&nbsp;&nbsp; ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>

            <article className="inventory-chart-card">
              <h3>Condition Overview <span>(by quantity)</span></h3>

              <div className="inventory-chart-content">
                <div
                  className="inventory-donut"
                  style={{
                    background: buildDonutGradient(
                      conditionDistribution,
                      conditionTotal,
                      conditionColors
                    ),
                  }}
                >
                  <div className="inventory-donut-hole">
                    <strong>{totalQuantity.toFixed(1)}</strong>
                    <span>kg</span>
                  </div>
                </div>

                <div className="inventory-legend">
                  {conditionDistribution.slice(0, 5).map((entry, index) => {
                    const percentage = Math.round((entry.value / conditionTotal) * 100);

                    return (
                      <div className="inventory-legend-row" key={entry.name}>
                        <span
                          className="inventory-legend-dot"
                          style={{
                            background:
                              CONDITION_COLORS[entry.name] ||
                              conditionColors[index % conditionColors.length],
                          }}
                        />
                        <div>
                          <strong>{entry.name}</strong>
                          <span>
                            {entry.value.toFixed(1)} kg&nbsp;&nbsp; ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="inventory-records-card">
          <div className="inventory-records-heading">
            <div>
              <h2>Inventory Records</h2>
              <p>Detailed list of all recorded inventory batches.</p>
            </div>

            <div className="inventory-record-tools">
              <div className="inventory-search">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search batch, fabric or source..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className={`inventory-filter-btn ${showFilters ? 'is-active' : ''}`}
                onClick={() => setShowFilters((value) => !value)}
              >
                <Filter size={16} />
                Filters
                <ChevronDown
                  size={15}
                  className={showFilters ? 'rotate' : ''}
                />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="inventory-filters">
              <label>
                <span>Fabric Type</span>
                <select
                  value={fabricFilter}
                  onChange={(e) => setFabricFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {FABRIC_TYPES.map((fabric) => (
                    <option key={fabric} value={fabric}>
                      {fabric}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Condition</span>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {CONDITIONS.map((itemCondition) => (
                    <option key={itemCondition} value={itemCondition}>
                      {itemCondition}
                    </option>
                  ))}
                </select>
              </label>

              <button type="button" className="inventory-clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Material</th>
                  <th>Source</th>
                  <th>Quantity</th>
                  <th>Condition</th>
                  <th>Collection Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="inventory-batch-id">#{item.batch_id}</td>

                      <td>
                        <div className="inventory-material-cell">
                          <strong>{item.fabric_type || '—'}</strong>
                          {item.color && (
                            <span>
                              <i
                                className="inventory-color-dot"
                                style={{
                                  background:
                                    String(item.color).toLowerCase() === 'black'
                                      ? '#111827'
                                      : '#E7E7E7',
                                }}
                              />
                              {item.color}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>{item.source || '—'}</td>

                      <td>
                        {editingId === item.id ? (
                          <input
                            className="inventory-inline-input"
                            type="number"
                            step="0.1"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                          />
                        ) : (
                          `${Number(item.quantity || 0).toFixed(1)} kg`
                        )}
                      </td>

                      <td>
                        {editingId === item.id ? (
                          <select
                            className="inventory-inline-select"
                            value={editCondition}
                            onChange={(e) => setEditCondition(e.target.value)}
                          >
                            {CONDITIONS.map((itemCondition) => (
                              <option key={itemCondition} value={itemCondition}>
                                {itemCondition}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="inventory-condition-badge"
                            style={{
                              color: CONDITION_COLORS[item.condition] || '#3E7A80',
                              background: `${CONDITION_COLORS[item.condition] || '#3E7A80'}18`,
                            }}
                          >
                            {item.condition || 'Unknown'}
                          </span>
                        )}
                      </td>

                      <td>{formatDate(item.collection_date)}</td>

                      <td>
                        <div className="inventory-row-actions">
                          {editingId === item.id ? (
                            <>
                              <button
                                type="button"
                                className="inventory-save-action"
                                onClick={() => saveEdit(item.id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="inventory-cancel-action"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                title="Edit"
                                aria-label={`Edit ${item.batch_id}`}
                                className="inventory-icon-action"
                                onClick={() => startEdit(item)}
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                type="button"
                                title="Delete"
                                aria-label={`Delete ${item.batch_id}`}
                                className="inventory-icon-action inventory-delete-action"
                                onClick={() => handleDelete(item.id, item.batch_id)}
                              >
                                <Trash2 size={17} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="inventory-empty">
                      No inventory records match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="inventory-record-footer">
            Showing {filteredItems.length} of {items.length} records
          </div>
        </section>
      </main>

      {showAddModal && (
        <div className="inventory-modal-backdrop" onMouseDown={() => setShowAddModal(false)}>
          <div
            className="inventory-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="inventory-modal-header">
              <div>
                <h2>Add Material</h2>
                <p>Record a new textile inventory batch.</p>
              </div>
              <button
                type="button"
                className="inventory-modal-close"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="inventory-form">
              <label>
                <span>Fabric Type</span>
                <select
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                >
                  {FABRIC_TYPES.map((fabric) => (
                    <option key={fabric} value={fabric}>
                      {fabric}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Source</span>
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Textile"
                />
              </label>

              <label>
                <span>Quantity (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.0"
                  required
                />
              </label>

              <label>
                <span>Color</span>
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. White"
                />
              </label>

              <label>
                <span>Condition</span>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {CONDITIONS.map((itemCondition) => (
                    <option key={itemCondition} value={itemCondition}>
                      {itemCondition}
                    </option>
                  ))}
                </select>
              </label>

              <label className="inventory-form-full">
                <span>Collection Date</span>
                <div className="inventory-date-input">
                  <CalendarDays size={16} />
                  <input
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                  />
                </div>
              </label>

              <div className="inventory-form-actions">
                <button
                  type="button"
                  className="inventory-cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="inventory-submit-btn">
                  <Plus size={16} />
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;