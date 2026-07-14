import { useState, useEffect } from 'react';
import {
  createInventoryItem,
  getInventoryList,
  updateInventoryItem,
  deleteInventoryItem,
} from '../services/api';

const FABRIC_TYPES = ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Nylon', 'Rayon', 'Acrylic', 'Mixed Fabrics'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

function Inventory() {
  const [batchId, setBatchId] = useState('');
  const [fabricType, setFabricType] = useState(FABRIC_TYPES[0]);
  const [source, setSource] = useState('');
  const [quantity, setQuantity] = useState('');
  const [color, setColor] = useState('');
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [collectionDate, setCollectionDate] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [items, setItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editCondition, setEditCondition] = useState('');

  async function loadInventory() {
    try {
      const data = await getInventoryList();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await createInventoryItem({
        batch_id: batchId,
        fabric_type: fabricType,
        source,
        quantity: parseFloat(quantity),
        color,
        condition,
        collection_date: collectionDate || null,
      });

      setBatchId('');
      setSource('');
      setQuantity('');
      setColor('');
      setCollectionDate('');

      setSuccessMessage(`Batch "${batchId}" added successfully.`);
      loadInventory();
    } catch (err) {
      setError(err.message);
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
  }

  async function saveEdit(id) {
    try {
      await updateInventoryItem(id, {
        quantity: parseFloat(editQuantity),
        condition: editCondition,
      });
      setEditingId(null);
      setSuccessMessage('Batch updated successfully.');
      loadInventory();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id, label) {
    const confirmed = window.confirm(`Delete batch "${label}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteInventoryItem(id);
      setSuccessMessage(`Batch "${label}" deleted.`);
      loadInventory();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Textile Waste Inventory</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} required />

        <select value={fabricType} onChange={(e) => setFabricType(e.target.value)}>
          {FABRIC_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <input placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} />
        <input placeholder="Quantity" type="number" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <input placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} />

        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <input type="date" value={collectionDate} onChange={(e) => setCollectionDate(e.target.value)} />
        <button type="submit">Add Batch</button>
      </form>

      {successMessage && (
        <p style={{ color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '0.5rem', borderRadius: '4px' }}>
          {successMessage}
        </p>
      )}
      {error && (
        <p style={{ color: '#c62828', backgroundColor: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>
          {error}
        </p>
      )}

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Fabric Type</th>
            <th>Source</th>
            <th>Quantity</th>
            <th>Color</th>
            <th>Condition</th>
            <th>Collection Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.batch_id}</td>
              <td>{item.fabric_type}</td>
              <td>{item.source}</td>

              <td>
                {editingId === item.id ? (
                  <input
                    type="number" step="0.1"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    style={{ width: '70px' }}
                  />
                ) : (
                  item.quantity
                )}
              </td>

              <td>{item.color}</td>

              <td>
                {editingId === item.id ? (
                  <select value={editCondition} onChange={(e) => setEditCondition(e.target.value)}>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  item.condition
                )}
              </td>

              <td>{item.collection_date}</td>

              <td>
                {editingId === item.id ? (
                  <>
                    <button type="button" onClick={() => saveEdit(item.id)}>
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id, item.batch_id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;